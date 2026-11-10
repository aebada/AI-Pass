"""Agent API coverage (S2-01 / S2-02): model integrity, workspace-scoped CRUD +
archive, slug rules, and the authn / authz / cross-tenant (IDOR) matrix.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.models.agent import Agent, AgentVersion, PublishedVersionImmutableError


def _url(org, workspace, *parts) -> str:
    base = f"/api/v1/organizations/{org.id}/workspaces/{workspace.id}/agents"
    return "/".join([base, *map(str, parts)]) if parts else base


def _create(client, auth, org, workspace, user, **body):
    body.setdefault("name", "Support Bot")
    return client.post(_url(org, workspace), json=body, headers=auth(user))


@pytest.fixture()
def agent_a(client, auth, world, spaces):
    resp = _create(client, auth, world["org_a"], spaces["ws_a"], world["member_a"])
    assert resp.status_code == 201
    return resp.json()


# --- creation -------------------------------------------------------------

def test_create_agent(client, auth, db, world, spaces):
    resp = _create(
        client, auth, world["org_a"], spaces["ws_a"], world["member_a"],
        name="  Support Bot ", description="  Answers tickets  ",
    )

    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Support Bot"
    assert data["slug"] == "support-bot"
    assert data["description"] == "Answers tickets"
    assert data["status"] == "draft"
    assert data["organization_id"] == str(world["org_a"].id)
    assert data["workspace_id"] == str(spaces["ws_a"].id)
    assert data["created_by"] == str(world["member_a"].id)
    assert data["current_version_id"] is None
    assert data["archived_at"] is None


def test_create_agent_starts_with_single_empty_draft(client, auth, db, agent_a):
    versions = db.scalars(
        select(AgentVersion).where(AgentVersion.agent_id == uuid.UUID(agent_a["id"]))
    ).all()

    assert len(versions) == 1
    draft = versions[0]
    assert draft.published_at is None
    assert draft.version_number is None
    assert draft.system_prompt is None
    assert draft.generation_settings == {}
    assert draft.tool_bindings == []
    assert draft.knowledge_base_bindings == []


def test_create_agent_accepts_explicit_slug(client, auth, world, spaces):
    resp = _create(client, auth, world["org_a"], spaces["ws_a"], world["member_a"], slug="helpdesk")
    assert resp.status_code == 201
    assert resp.json()["slug"] == "helpdesk"


@pytest.mark.parametrize(
    "body",
    [
        {"name": "X", "slug": "Not A Slug!"},
        {"name": "???"},
        {"name": "   "},
        {"name": "X", "description": "d" * 2001},
    ],
)
def test_create_agent_rejects_invalid_input(client, auth, world, spaces, body):
    resp = _create(client, auth, world["org_a"], spaces["ws_a"], world["member_a"], **body)
    assert resp.status_code == 422


def test_create_agent_in_archived_workspace_is_rejected(
    client, auth, world, workspace_factory
):
    archived = workspace_factory(world["org_a"], "old", archived=True)
    resp = _create(client, auth, world["org_a"], archived, world["member_a"])
    assert resp.status_code == 409


# --- slug uniqueness ----------------------------------------------------------

def test_slug_unique_within_workspace(client, auth, world, spaces, agent_a):
    dup = _create(client, auth, world["org_a"], spaces["ws_a"], world["member_a"])
    assert dup.status_code == 409


def test_same_slug_allowed_in_other_workspace(client, auth, world, spaces, agent_a):
    other = _create(client, auth, world["org_a"], spaces["ws_a2"], world["member_a"])
    assert other.status_code == 201
    assert other.json()["slug"] == agent_a["slug"]


# --- retrieval / listing ----------------------------------------------------

def test_viewer_can_get_and_list(client, auth, world, spaces, agent_a):
    org, ws, viewer = world["org_a"], spaces["ws_a"], world["viewer_a"]

    got = client.get(_url(org, ws, agent_a["id"]), headers=auth(viewer))
    listed = client.get(_url(org, ws), headers=auth(viewer))

    assert got.status_code == 200
    assert got.json()["id"] == agent_a["id"]
    assert listed.status_code == 200
    assert [a["id"] for a in listed.json()] == [agent_a["id"]]


def test_list_is_scoped_to_workspace(client, auth, world, spaces, agent_a):
    resp = client.get(_url(world["org_a"], spaces["ws_a2"]), headers=auth(world["member_a"]))
    assert resp.status_code == 200
    assert resp.json() == []


def test_list_hides_archived_unless_requested(client, auth, world, spaces, agent_a):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]
    other = _create(client, auth, org, ws, user, name="Second").json()
    client.post(_url(org, ws, agent_a["id"], "archive"), headers=auth(user))

    default = client.get(_url(org, ws), headers=auth(user)).json()
    everything = client.get(_url(org, ws), params={"include_archived": True}, headers=auth(user)).json()
    archived_only = client.get(_url(org, ws), params={"status": "archived"}, headers=auth(user)).json()

    assert [a["id"] for a in default] == [other["id"]]
    assert {a["id"] for a in everything} == {agent_a["id"], other["id"]}
    assert [a["id"] for a in archived_only] == [agent_a["id"]]


def test_get_unknown_agent_returns_404(client, auth, world, spaces):
    resp = client.get(
        _url(world["org_a"], spaces["ws_a"], uuid.uuid4()), headers=auth(world["member_a"])
    )
    assert resp.status_code == 404


# --- update -------------------------------------------------------------------

def test_update_agent_metadata(client, auth, world, spaces, agent_a):
    resp = client.patch(
        _url(world["org_a"], spaces["ws_a"], agent_a["id"]),
        json={"name": "Helpdesk", "slug": "helpdesk", "description": "Tier 1"},
        headers=auth(world["member_a"]),
    )

    assert resp.status_code == 200
    data = resp.json()
    assert (data["name"], data["slug"], data["description"]) == ("Helpdesk", "helpdesk", "Tier 1")


def test_update_partial_keeps_unsent_fields(client, auth, world, spaces):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]
    agent = _create(client, auth, org, ws, user, description="Keep me").json()

    resp = client.patch(_url(org, ws, agent["id"]), json={"name": "Renamed"}, headers=auth(user))

    assert resp.json()["description"] == "Keep me"
    assert resp.json()["slug"] == agent["slug"]


def test_update_explicit_null_clears_description(client, auth, world, spaces):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]
    agent = _create(client, auth, org, ws, user, description="Old").json()

    resp = client.patch(_url(org, ws, agent["id"]), json={"description": None}, headers=auth(user))

    assert resp.status_code == 200
    assert resp.json()["description"] is None


def test_update_slug_conflict_returns_409(client, auth, world, spaces, agent_a):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]
    other = _create(client, auth, org, ws, user, name="Other").json()

    resp = client.patch(_url(org, ws, other["id"]), json={"slug": agent_a["slug"]}, headers=auth(user))
    assert resp.status_code == 409


def test_archived_agent_cannot_be_updated(client, auth, world, spaces, agent_a):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]
    client.post(_url(org, ws, agent_a["id"], "archive"), headers=auth(user))

    resp = client.patch(_url(org, ws, agent_a["id"]), json={"name": "Zombie"}, headers=auth(user))
    assert resp.status_code == 409


# --- archive ------------------------------------------------------------------

def test_archive_is_soft_and_idempotent(client, auth, db, world, spaces, agent_a):
    org, ws, user = world["org_a"], spaces["ws_a"], world["member_a"]

    first = client.post(_url(org, ws, agent_a["id"], "archive"), headers=auth(user))
    second = client.post(_url(org, ws, agent_a["id"], "archive"), headers=auth(user))

    assert first.status_code == 200
    assert first.json()["status"] == "archived"
    assert first.json()["archived_at"] is not None
    assert second.json()["archived_at"] == first.json()["archived_at"]
    # Still readable, and the row (with its versions) is retained.
    assert client.get(_url(org, ws, agent_a["id"]), headers=auth(user)).status_code == 200
    assert db.get(Agent, uuid.UUID(agent_a["id"])) is not None


# --- authentication (401) -----------------------------------------------------

def _all_routes(org, ws, agent_id):
    return [
        ("post", _url(org, ws), {"name": "X"}),
        ("get", _url(org, ws), None),
        ("get", _url(org, ws, agent_id), None),
        ("patch", _url(org, ws, agent_id), {"name": "X"}),
        ("post", _url(org, ws, agent_id, "archive"), None),
    ]


@pytest.mark.parametrize("headers", [{}, {"Authorization": "Bearer not-a-uuid"}, {"Authorization": f"Bearer {uuid.uuid4()}"}])
def test_unauthenticated_requests_return_401(client, world, spaces, agent_a, headers):
    for method, url, body in _all_routes(world["org_a"], spaces["ws_a"], agent_a["id"]):
        resp = client.request(method, url, json=body, headers=headers)
        assert resp.status_code == 401, (method, url)


# --- authorization (403) ------------------------------------------------------

@pytest.mark.parametrize("route_index", [0, 3, 4], ids=["create", "update", "archive"])
def test_viewer_cannot_write(client, auth, db, world, spaces, agent_a, route_index):
    method, url, body = _all_routes(world["org_a"], spaces["ws_a"], agent_a["id"])[route_index]

    resp = client.request(method, url, json=body, headers=auth(world["viewer_a"]))

    assert resp.status_code == 403
    db.expire_all()
    stored = db.get(Agent, uuid.UUID(agent_a["id"]))
    assert (stored.name, stored.status.value) == ("Support Bot", "draft")


# --- cross-tenant isolation (404) ---------------------------------------------

def test_non_member_gets_404(client, auth, world, spaces, agent_a):
    for method, url, body in _all_routes(world["org_a"], spaces["ws_a"], agent_a["id"]):
        resp = client.request(method, url, json=body, headers=auth(world["stranger"]))
        assert resp.status_code == 404, (method, url)


def test_other_org_member_cannot_reach_agent_through_own_org(
    client, auth, db, world, spaces, agent_a
):
    # org_b member with their own org in the path but org_a's workspace + agent ids.
    org_b, ws_a, intruder = world["org_b"], spaces["ws_a"], world["member_b"]
    for method, url, body in _all_routes(org_b, ws_a, agent_a["id"]):
        resp = client.request(method, url, json=body, headers=auth(intruder))
        assert resp.status_code == 404, (method, url)

    # Nothing was created in or changed on org_a's workspace.
    assert db.scalars(select(Agent).where(Agent.workspace_id == ws_a.id)).all()[0].name == "Support Bot"
    assert len(db.scalars(select(Agent)).all()) == 1


def test_other_org_agent_id_through_own_workspace_is_404(
    client, auth, world, spaces, agent_a
):
    # org_b member, fully valid org_b path, but an agent id that belongs to org_a.
    org_b, ws_b, intruder = world["org_b"], spaces["ws_b"], world["member_b"]
    for method, url, body in _all_routes(org_b, ws_b, agent_a["id"])[2:]:
        resp = client.request(method, url, json=body, headers=auth(intruder))
        assert resp.status_code == 404, (method, url)
        assert resp.json()["detail"] == "agent not found"


def test_agent_not_reachable_through_sibling_workspace(
    client, auth, db, world, spaces, agent_a
):
    # Same org, same caller, but the agent lives in a different workspace.
    org, ws_other, user = world["org_a"], spaces["ws_a2"], world["owner_a"]
    for method, url, body in _all_routes(org, ws_other, agent_a["id"])[2:]:
        resp = client.request(method, url, json=body, headers=auth(user))
        assert resp.status_code == 404, (method, url)

    db.expire_all()
    stored = db.get(Agent, uuid.UUID(agent_a["id"]))
    assert (stored.name, stored.status.value) == ("Support Bot", "draft")


def test_foreign_workspace_id_in_own_org_path_is_404(client, auth, world, spaces):
    # org_a member using org_a's path with org_b's workspace id.
    url = _url(world["org_a"], spaces["ws_b"])
    for method, body in [("get", None), ("post", {"name": "X"})]:
        resp = client.request(method, url, json=body, headers=auth(world["owner_a"]))
        assert resp.status_code == 404
        assert resp.json()["detail"] == "workspace not found"


# --- model integrity ------------------------------------------------------------

def _published_version(db, agent_id: str, number: int = 1) -> AgentVersion:
    version = AgentVersion(
        agent_id=uuid.UUID(agent_id),
        version_number=number,
        system_prompt="You are helpful.",
        provider_id="openai",
        model_id="gpt-4o-mini",
        published_at=datetime.now(timezone.utc),
    )
    db.add(version)
    db.commit()
    return version


def test_published_version_rejects_updates(db, agent_a):
    version = _published_version(db, agent_a["id"])

    version.system_prompt = "Tampered"
    with pytest.raises(PublishedVersionImmutableError):
        db.commit()
    db.rollback()

    db.expire_all()
    assert db.get(AgentVersion, version.id).system_prompt == "You are helpful."


def test_draft_version_is_editable(db, agent_a):
    draft = db.scalar(
        select(AgentVersion).where(AgentVersion.agent_id == uuid.UUID(agent_a["id"]))
    )
    draft.system_prompt = "Draft prompt"
    db.commit()

    db.expire_all()
    assert db.get(AgentVersion, draft.id).system_prompt == "Draft prompt"


def test_published_version_requires_complete_config(db, agent_a):
    db.add(
        AgentVersion(
            agent_id=uuid.UUID(agent_a["id"]),
            version_number=1,
            published_at=datetime.now(timezone.utc),
        )
    )
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()


def test_version_numbers_unique_per_agent(db, agent_a):
    _published_version(db, agent_a["id"], number=1)
    with pytest.raises(IntegrityError):
        _published_version(db, agent_a["id"], number=1)
    db.rollback()


def test_only_one_draft_per_agent(db, agent_a):
    db.add(AgentVersion(agent_id=uuid.UUID(agent_a["id"])))
    with pytest.raises(IntegrityError):
        db.commit()
    db.rollback()
