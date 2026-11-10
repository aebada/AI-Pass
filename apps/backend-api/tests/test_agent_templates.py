"""Agent template seeding (S2-07): valid, secret-free templates and an
idempotent workspace bootstrap.
"""
from __future__ import annotations

import pytest
from sqlalchemy import func, select

from app.core.secrets import contains_secret
from app.models.agent import Agent, AgentVersion
from app.schemas.agent_config import PublishableConfig
from app.seeds import agent_templates
from app.seeds.agent_templates import TEMPLATES, bootstrap_agent_templates

EXPECTED_NAMES = {"Customer Support Agent", "Document Analyst", "Enterprise Knowledge Agent"}


def _bootstrap(db, world, spaces, ws="ws_a", user="owner_a"):
    return bootstrap_agent_templates(
        db,
        organization_id=world["org_a"].id,
        workspace_id=spaces[ws].id,
        created_by=world[user].id,
    )


def _count(db, model) -> int:
    return db.scalar(select(func.count()).select_from(model))


def test_catalog_has_the_three_templates():
    assert {t.name for t in TEMPLATES} == EXPECTED_NAMES
    assert len({t.slug for t in TEMPLATES}) == len(TEMPLATES)


@pytest.mark.parametrize("template", TEMPLATES, ids=lambda t: t.slug)
def test_template_is_valid_and_publishable(template):
    payload = template.to_create_payload()
    PublishableConfig.model_validate(
        payload.model_dump(include=set(PublishableConfig.model_fields))
    )
    temperature = template.generation_settings["temperature"]
    assert 0 <= temperature <= 0.5  # conservative defaults for business agents


@pytest.mark.parametrize("template", TEMPLATES, ids=lambda t: t.slug)
def test_template_has_placeholder_kbs_and_no_secrets(template):
    assert template.knowledge_base_bindings
    assert all(kb["is_placeholder"] for kb in template.knowledge_base_bindings)
    text = repr(template)
    assert not contains_secret(text)
    assert not any(word in text.lower() for word in ("api_key", "apikey", "password="))


def test_bootstrap_creates_draft_agents(db, world, spaces):
    results = _bootstrap(db, world, spaces)

    assert all(r.created for r in results)
    assert {r.agent.name for r in results} == EXPECTED_NAMES
    for result in results:
        agent = result.agent
        assert agent.status.value == "draft"
        assert agent.workspace_id == spaces["ws_a"].id
        assert agent.created_by == world["owner_a"].id
        draft = db.scalar(select(AgentVersion).where(AgentVersion.agent_id == agent.id))
        assert draft.published_at is None
        assert draft.system_prompt and draft.provider_id and draft.model_id


def test_bootstrap_is_idempotent(db, world, spaces):
    first = _bootstrap(db, world, spaces)
    second = _bootstrap(db, world, spaces)

    assert not any(r.created for r in second)
    assert [r.agent.id for r in second] == [r.agent.id for r in first]
    assert _count(db, Agent) == 3
    assert _count(db, AgentVersion) == 3


def test_bootstrap_never_overwrites_existing_agents(client, auth, db, world, spaces):
    results = _bootstrap(db, world, spaces)
    support = next(r.agent for r in results if r.agent.slug == "customer-support-agent")
    base = f"/api/v1/organizations/{world['org_a'].id}/workspaces/{spaces['ws_a'].id}/agents/{support.id}"
    client.patch(f"{base}/draft", json={"system_prompt": "Customized"}, headers=auth(world["member_a"]))
    client.post(f"{base}/archive", headers=auth(world["member_a"]))

    _bootstrap(db, world, spaces)

    draft = client.get(f"{base}/draft", headers=auth(world["member_a"])).json()
    assert draft["system_prompt"] == "Customized"
    assert _count(db, Agent) == 3  # archived slug is not re-seeded


def test_bootstrap_is_per_workspace(db, world, spaces):
    _bootstrap(db, world, spaces, ws="ws_a")
    results = _bootstrap(db, world, spaces, ws="ws_a2")

    assert all(r.created for r in results)
    assert _count(db, Agent) == 6


def test_bootstrap_rejects_non_member_creator(db, world, spaces):
    with pytest.raises(ValueError):
        _bootstrap(db, world, spaces, user="member_b")
    assert _count(db, Agent) == 0


def test_seeded_templates_publish_through_api(client, auth, db, world, spaces):
    org, ws = world["org_a"], spaces["ws_a"]
    for result in _bootstrap(db, world, spaces):
        url = f"/api/v1/organizations/{org.id}/workspaces/{ws.id}/agents/{result.agent.id}/publish"
        resp = client.post(url, headers=auth(world["manager_a"]))
        assert resp.status_code == 201, (result.agent.slug, resp.text)
        assert resp.json()["version_number"] == 1


def test_cli_seeds_and_reruns_cleanly(monkeypatch, capsys, db, session_local, world, spaces):
    monkeypatch.setattr("app.db.session.SessionLocal", session_local)
    argv = [
        "--organization-id", str(world["org_a"].id),
        "--workspace-id", str(spaces["ws_a"].id),
        "--created-by", str(world["owner_a"].id),
    ]

    agent_templates.main(argv)
    agent_templates.main(argv)

    out = capsys.readouterr().out.splitlines()
    assert sum(line.startswith("created") for line in out) == 3
    assert sum(line.startswith("exists") for line in out) == 3
    assert _count(db, Agent) == 3
