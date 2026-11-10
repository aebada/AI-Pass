"""Draft / publish / version history / restore (S2-05, S2-06) and the
authorization matrix for those endpoints (S2-08).
"""
from __future__ import annotations

import uuid

import pytest
from sqlalchemy import select

from app.models.agent import Agent, AgentVersion
from app.models.organization import OrgRole

CONFIG_V1 = {
    "system_prompt": "You are version one.",
    "provider_id": "openai",
    "model_id": "gpt-4o-mini",
    "generation_settings": {"temperature": 0.2, "max_tokens": 256},
    "tool_bindings": [{"tool_id": "web-search"}],
    "knowledge_base_bindings": [{"knowledge_base_id": "kb-faq", "name": "FAQ"}],
}


class AgentClient:
    """Thin helper around one agent's URLs, acting as a given user."""

    def __init__(self, client, auth, org, ws, agent_id, user):
        self.client, self.auth = client, auth
        self.base = f"/api/v1/organizations/{org.id}/workspaces/{ws.id}/agents/{agent_id}"
        self.user = user

    def as_(self, user) -> "AgentClient":
        clone = object.__new__(AgentClient)
        clone.__dict__.update(self.__dict__, user=user)
        return clone

    def _req(self, method, path="", body=None):
        return self.client.request(method, self.base + path, json=body, headers=self.auth(self.user))

    def agent(self):
        return self._req("get")

    def draft(self):
        return self._req("get", "/draft")

    def edit(self, body):
        return self._req("patch", "/draft", body)

    def publish(self, note=None):
        return self._req("post", "/publish", {"change_note": note} if note else None)

    def versions(self):
        return self._req("get", "/versions")

    def version(self, version_id):
        return self._req("get", f"/versions/{version_id}")

    def restore(self, version_id):
        return self._req("post", f"/versions/{version_id}/restore")

    def archive(self):
        return self._req("post", "/archive")


def _new_agent(client, auth, org, ws, user, name="Bot", **config) -> str:
    resp = client.post(
        f"/api/v1/organizations/{org.id}/workspaces/{ws.id}/agents",
        json={"name": name, **config},
        headers=auth(user),
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


@pytest.fixture()
def bot(client, auth, world, spaces) -> AgentClient:
    """An agent in org_a/ws_a with a complete draft, driven by the manager."""
    org, ws = world["org_a"], spaces["ws_a"]
    agent_id = _new_agent(client, auth, org, ws, world["member_a"], **CONFIG_V1)
    return AgentClient(client, auth, org, ws, agent_id, world["manager_a"])


@pytest.fixture()
def published(bot):
    """``bot`` after publishing v1 then v2 (v2 has a different prompt and model)."""
    v1 = bot.publish("Initial release").json()
    bot.edit({"system_prompt": "You are version two.", "model_id": "gpt-4o"})
    v2 = bot.publish("Sharper prompt").json()
    return {"v1": v1, "v2": v2}


# --- publish (S2-05) -------------------------------------------------------------

def test_publish_creates_immutable_snapshot(bot, world):
    resp = bot.publish("Initial release")

    assert resp.status_code == 201
    v1 = resp.json()
    assert v1["version_number"] == 1
    assert v1["is_published"] is True
    assert v1["published_at"] is not None
    assert v1["change_note"] == "Initial release"
    assert v1["created_by"] == str(world["manager_a"].id)
    for field in ("system_prompt", "provider_id", "model_id"):
        assert v1[field] == CONFIG_V1[field]
    assert v1["generation_settings"] == CONFIG_V1["generation_settings"]
    assert v1["tool_bindings"] == [{"tool_id": "web-search", "enabled": True}]

    agent = bot.agent().json()
    assert agent["status"] == "published"
    assert agent["current_version_id"] == v1["id"]


def test_publish_without_body(bot):
    resp = bot.publish()
    assert resp.status_code == 201
    assert resp.json()["change_note"] is None


def test_version_numbers_are_sequential(bot):
    numbers = []
    for i in range(3):
        bot.edit({"system_prompt": f"Prompt {i}"})
        numbers.append(bot.publish().json()["version_number"])
    assert numbers == [1, 2, 3]


def test_publish_incomplete_draft_rejected(client, auth, world, spaces):
    org, ws = world["org_a"], spaces["ws_a"]
    agent_id = _new_agent(client, auth, org, ws, world["member_a"], system_prompt="Only a prompt")
    bot = AgentClient(client, auth, org, ws, agent_id, world["manager_a"])

    resp = bot.publish()

    assert resp.status_code == 422
    assert resp.json()["detail"]["invalid_fields"] == ["model_id", "provider_id"]
    assert bot.versions().json() == []
    assert bot.agent().json()["status"] == "draft"


def test_publish_revalidates_stored_draft(bot, db):
    # A draft written around the API (or before rules tightened) still can't be published.
    draft = db.scalar(
        select(AgentVersion).where(
            AgentVersion.agent_id == uuid.UUID(bot.base.rsplit("/", 1)[1]),
            AgentVersion.published_at.is_(None),
        )
    )
    draft.system_prompt = "   "
    draft.generation_settings = {"temperature": 9, "api_key": "x"}
    db.commit()

    resp = bot.publish()

    assert resp.status_code == 422
    assert resp.json()["detail"]["invalid_fields"] == ["generation_settings", "system_prompt"]


def test_draft_change_note_moves_to_version(bot):
    bot.edit({"change_note": "Tuned tone"})
    v1 = bot.publish().json()

    assert v1["change_note"] == "Tuned tone"
    assert bot.draft().json()["change_note"] is None


def test_publish_note_overrides_draft_note(bot):
    bot.edit({"change_note": "from draft"})
    assert bot.publish("from publish").json()["change_note"] == "from publish"


# --- post-publish edits / immutability (S2-05) -------------------------------------

def test_editing_after_publish_only_changes_draft(bot):
    v1 = bot.publish().json()

    edited = bot.edit({"system_prompt": "Edited after publish", "generation_settings": {"temperature": 1.5}})

    assert edited.status_code == 200
    assert edited.json()["id"] != v1["id"]
    assert edited.json()["is_published"] is False
    assert bot.version(v1["id"]).json() == v1
    agent = bot.agent().json()
    assert agent["current_version_id"] == v1["id"]
    assert agent["status"] == "published"


def test_published_versions_unchanged_across_lifecycle(bot, published):
    bot.edit({"system_prompt": "Draft three", "tool_bindings": []})
    bot.restore(published["v1"]["id"])
    bot.publish()

    assert bot.version(published["v1"]["id"]).json() == published["v1"]
    assert bot.version(published["v2"]["id"]).json() == published["v2"]


def test_draft_and_snapshot_do_not_share_json(bot, db):
    v1 = bot.publish().json()
    bot.edit({"knowledge_base_bindings": [{"knowledge_base_id": "kb-other"}]})

    db.expire_all()
    stored = db.get(AgentVersion, uuid.UUID(v1["id"]))
    assert stored.knowledge_base_bindings == [
        {"knowledge_base_id": "kb-faq", "name": "FAQ", "is_placeholder": False}
    ]


# --- history (S2-05) -------------------------------------------------------------

def test_version_history_newest_first_without_draft(bot, published):
    history = bot.versions().json()

    assert [v["version_number"] for v in history] == [2, 1]
    assert [v["id"] for v in history] == [published["v2"]["id"], published["v1"]["id"]]
    assert history[0]["change_note"] == "Sharper prompt"
    assert history[0]["model_id"] == "gpt-4o"
    assert "system_prompt" not in history[0]


def test_get_version_detail(bot, published):
    resp = bot.version(published["v1"]["id"])
    assert resp.status_code == 200
    assert resp.json()["system_prompt"] == "You are version one."


def test_draft_is_not_exposed_as_a_version(bot, published):
    draft_id = bot.draft().json()["id"]
    assert bot.version(draft_id).status_code == 404
    assert bot.restore(draft_id).status_code == 404


def test_unknown_version_returns_404(bot):
    assert bot.version(uuid.uuid4()).status_code == 404


def test_viewer_and_auditor_can_read_history(bot, published, world):
    for reader in (world["viewer_a"], world["auditor_a"]):
        as_reader = bot.as_(reader)
        assert as_reader.versions().status_code == 200
        assert as_reader.version(published["v1"]["id"]).status_code == 200
        assert as_reader.draft().status_code == 200


# --- restore (S2-06) -------------------------------------------------------------

def test_restore_copies_snapshot_into_draft(bot, published):
    resp = bot.restore(published["v1"]["id"])

    assert resp.status_code == 200
    draft = resp.json()
    assert draft["is_published"] is False
    assert draft["change_note"] == "Restored from version 1"
    for field in ("system_prompt", "provider_id", "model_id", "generation_settings",
                  "tool_bindings", "knowledge_base_bindings"):
        assert draft[field] == published["v1"][field], field


def test_restore_does_not_change_live_version(bot, published):
    bot.restore(published["v1"]["id"])

    agent = bot.agent().json()
    assert agent["current_version_id"] == published["v2"]["id"]
    assert [v["version_number"] for v in bot.versions().json()] == [2, 1]


def test_publishing_a_restore_creates_new_version(bot, published):
    bot.restore(published["v1"]["id"])
    v3 = bot.publish().json()

    assert v3["version_number"] == 3
    assert v3["change_note"] == "Restored from version 1"
    assert v3["system_prompt"] == published["v1"]["system_prompt"]
    assert v3["id"] != published["v1"]["id"]
    assert bot.agent().json()["current_version_id"] == v3["id"]


def test_member_can_restore_but_not_publish(bot, published, world):
    member = bot.as_(world["member_a"])
    assert member.restore(published["v1"]["id"]).status_code == 200
    assert member.publish().status_code == 403


def test_cannot_restore_version_of_another_agent(client, auth, world, spaces, bot, published):
    org, ws = world["org_a"], spaces["ws_a"]
    other_id = _new_agent(client, auth, org, ws, world["member_a"], name="Other", **CONFIG_V1)
    other = AgentClient(client, auth, org, ws, other_id, world["manager_a"])

    assert other.restore(published["v1"]["id"]).status_code == 404
    assert other.version(published["v1"]["id"]).status_code == 404
    assert other.draft().json()["change_note"] is None


# --- archived agents --------------------------------------------------------------

def test_archived_agent_is_read_only(bot, published):
    bot.archive()

    assert bot.edit({"system_prompt": "x"}).status_code == 409
    assert bot.publish().status_code == 409
    assert bot.restore(published["v1"]["id"]).status_code == 409
    # History stays readable for audit.
    assert bot.versions().status_code == 200
    assert bot.version(published["v1"]["id"]).status_code == 200


# --- authorization matrix (S2-08) ---------------------------------------------------

def _routes(bot, version_id):
    return [
        ("get", "/draft", None),
        ("patch", "/draft", {"system_prompt": "Hijacked"}),
        ("post", "/publish", None),
        ("get", "/versions", None),
        ("get", f"/versions/{version_id}", None),
        ("post", f"/versions/{version_id}/restore", None),
    ]


def _assert_untouched(db, bot, published):
    db.expire_all()
    agent = db.get(Agent, uuid.UUID(bot.base.rsplit("/", 1)[1]))
    assert agent.current_version_id == uuid.UUID(published["v2"]["id"])
    draft = bot.draft().json()
    assert draft["system_prompt"] == "You are version two."
    assert draft["change_note"] is None
    assert len(bot.versions().json()) == 2


@pytest.mark.parametrize(
    "headers",
    [{}, {"Authorization": "Bearer nope"}, {"Authorization": f"Bearer {uuid.uuid4()}"}],
    ids=["missing", "malformed", "unknown-user"],
)
def test_unauthenticated_returns_401(client, bot, published, headers):
    for method, path, body in _routes(bot, published["v1"]["id"]):
        resp = client.request(method, bot.base + path, json=body, headers=headers)
        assert resp.status_code == 401, (method, path)


@pytest.mark.parametrize(
    "role,allowed",
    [
        ("viewer_a", {"/draft:get", "/versions:get", "/versions/{v}:get"}),
        ("auditor_a", {"/draft:get", "/versions:get", "/versions/{v}:get"}),
        ("member_a", {"/draft:get", "/versions:get", "/versions/{v}:get", "/draft:patch",
                      "/versions/{v}/restore:post"}),
    ],
)
def test_role_permissions(bot, published, world, role, allowed):
    actor = bot.as_(world[role])
    v1 = published["v1"]["id"]
    for method, path, body in _routes(bot, v1):
        key = f"{path.replace(v1, '{v}')}:{method}"
        resp = actor._req(method, path, body)
        expected_ok = key in allowed
        assert (resp.status_code < 400) == expected_ok, (role, key, resp.status_code)
        if not expected_ok:
            assert resp.status_code == 403, (role, key)


def test_forbidden_writes_change_nothing(bot, published, world, db):
    v1 = published["v1"]["id"]
    viewer = bot.as_(world["viewer_a"])
    for method, path, body in _routes(bot, v1):
        if method != "get":
            viewer._req(method, path, body)
    bot.as_(world["member_a"])._req("post", "/publish")

    _assert_untouched(db, bot, published)


@pytest.mark.parametrize("publisher", ["owner_a", "manager_a"])
def test_owner_and_manager_can_publish(bot, world, publisher):
    assert bot.as_(world[publisher]).publish().status_code == 201


def test_non_member_gets_404(bot, published, world, db):
    stranger = bot.as_(world["stranger"])
    for method, path, body in _routes(bot, published["v1"]["id"]):
        assert stranger._req(method, path, body).status_code == 404, (method, path)
    _assert_untouched(db, bot, published)


def test_cross_org_access_returns_404(
    client, auth, bot, published, world, spaces, db, user_factory, member_factory
):
    """An org_b manager (holds every agent permission there) tries org_a's agent
    through every path combination, so each route reaches the scoped lookup."""
    v1 = published["v1"]["id"]
    agent_id = bot.base.rsplit("/", 1)[1]
    intruder = user_factory("manager-b@example.test")
    member_factory(world["org_b"], intruder, OrgRole.manager)
    combos = [
        (world["org_a"], spaces["ws_a"]),  # not a member of org_a
        (world["org_b"], spaces["ws_a"]),  # own org, foreign workspace
        (world["org_b"], spaces["ws_b"]),  # own org + workspace, foreign agent
    ]
    for org, ws in combos:
        attacker = AgentClient(client, auth, org, ws, agent_id, intruder)
        for method, path, body in _routes(bot, v1):
            assert attacker._req(method, path, body).status_code == 404, (org.slug, ws.slug, method, path)
    _assert_untouched(db, bot, published)


def test_cross_workspace_access_returns_404(client, auth, bot, published, world, spaces, db):
    # Owner of org_a, but addressing the agent through the sibling workspace.
    agent_id = bot.base.rsplit("/", 1)[1]
    wrong_ws = AgentClient(client, auth, world["org_a"], spaces["ws_a2"], agent_id, world["owner_a"])
    for method, path, body in _routes(bot, published["v1"]["id"]):
        assert wrong_ws._req(method, path, body).status_code == 404, (method, path)
    _assert_untouched(db, bot, published)
