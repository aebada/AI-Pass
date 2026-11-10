"""Workspace API coverage: CRUD + archive, slug rules, and the full
authn / authz / cross-organization (IDOR) matrix.
"""
from __future__ import annotations

import uuid


def _url(org, *parts: str) -> str:
    base = f"/api/v1/organizations/{org.id}/workspaces"
    return "/".join([base, *parts]) if parts else base


def _create(client, auth, org, user, **body):
    return client.post(_url(org), json=body, headers=auth(user))


# --- creation -------------------------------------------------------------

def test_create_workspace_autogenerates_slug(client, auth, world):
    resp = _create(client, auth, world["org_a"], world["member_a"], name="Growth Team")

    assert resp.status_code == 201
    data = resp.json()
    assert data["slug"] == "growth-team"
    assert data["organization_id"] == str(world["org_a"].id)
    assert data["is_archived"] is False
    assert data["archived_at"] is None
    assert uuid.UUID(data["id"])  # valid uuid


def test_create_workspace_accepts_explicit_slug(client, auth, world):
    resp = _create(
        client, auth, world["org_a"], world["member_a"], name="Growth Team", slug="growth"
    )
    assert resp.status_code == 201
    assert resp.json()["slug"] == "growth"


def test_create_workspace_rejects_malformed_slug(client, auth, world):
    resp = _create(
        client, auth, world["org_a"], world["member_a"], name="X", slug="Not A Slug!"
    )
    assert resp.status_code == 422


def test_create_workspace_rejects_unsluggable_name(client, auth, world):
    resp = _create(client, auth, world["org_a"], world["member_a"], name="???")
    assert resp.status_code == 422


# --- slug uniqueness ----------------------------------------------------------

def test_slug_must_be_unique_within_organization(client, auth, world):
    first = _create(client, auth, world["org_a"], world["member_a"], name="Ops", slug="ops")
    assert first.status_code == 201

    dup = _create(client, auth, world["org_a"], world["member_a"], name="Ops 2", slug="ops")
    assert dup.status_code == 409


def test_same_slug_allowed_in_different_organizations(client, auth, world):
    a = _create(client, auth, world["org_a"], world["member_a"], name="Ops", slug="ops")
    b = _create(client, auth, world["org_b"], world["member_b"], name="Ops", slug="ops")
    assert a.status_code == 201
    assert b.status_code == 201


# --- retrieval / listing ----------------------------------------------------

def test_get_workspace(client, auth, world):
    created = _create(client, auth, world["org_a"], world["member_a"], name="Ops").json()

    resp = client.get(_url(world["org_a"], created["id"]), headers=auth(world["viewer_a"]))

    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_get_missing_workspace_returns_404(client, auth, world):
    resp = client.get(
        _url(world["org_a"], str(uuid.uuid4())), headers=auth(world["member_a"])
    )
    assert resp.status_code == 404


def test_list_workspaces_by_organization(client, auth, world):
    _create(client, auth, world["org_a"], world["member_a"], name="Alpha", slug="alpha")
    _create(client, auth, world["org_a"], world["member_a"], name="Bravo", slug="bravo")
    _create(client, auth, world["org_b"], world["member_b"], name="Charlie", slug="charlie")

    resp = client.get(_url(world["org_a"]), headers=auth(world["member_a"]))

    assert resp.status_code == 200
    assert {w["slug"] for w in resp.json()} == {"alpha", "bravo"}


# --- update ---------------------------------------------------------------

def test_update_workspace_name_and_slug(client, auth, world):
    created = _create(
        client, auth, world["org_a"], world["member_a"], name="Ops", slug="ops"
    ).json()

    resp = client.patch(
        _url(world["org_a"], created["id"]),
        json={"name": "Operations", "slug": "operations"},
        headers=auth(world["member_a"]),
    )

    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Operations"
    assert body["slug"] == "operations"


def test_update_workspace_slug_conflict(client, auth, world):
    _create(client, auth, world["org_a"], world["member_a"], name="Ops", slug="ops")
    other = _create(
        client, auth, world["org_a"], world["member_a"], name="Growth", slug="growth"
    ).json()

    resp = client.patch(
        _url(world["org_a"], other["id"]),
        json={"slug": "ops"},
        headers=auth(world["member_a"]),
    )
    assert resp.status_code == 409


# --- archive (soft delete) ------------------------------------------------

def test_archive_workspace_is_soft_delete(client, auth, world):
    created = _create(client, auth, world["org_a"], world["member_a"], name="Ops").json()
    org = world["org_a"]

    resp = client.post(_url(org, created["id"], "archive"), headers=auth(world["member_a"]))
    assert resp.status_code == 200
    body = resp.json()
    assert body["is_archived"] is True
    assert body["archived_at"] is not None

    # still retrievable — the row is not hard-deleted
    assert (
        client.get(_url(org, created["id"]), headers=auth(world["member_a"])).status_code
        == 200
    )

    # excluded from the default listing, present when explicitly requested
    assert client.get(_url(org), headers=auth(world["member_a"])).json() == []
    with_archived = client.get(
        _url(org) + "?include_archived=true", headers=auth(world["member_a"])
    ).json()
    assert len(with_archived) == 1


def test_archive_is_idempotent(client, auth, world):
    created = _create(client, auth, world["org_a"], world["member_a"], name="Ops").json()
    org = world["org_a"]

    first = client.post(
        _url(org, created["id"], "archive"), headers=auth(world["member_a"])
    ).json()
    second = client.post(
        _url(org, created["id"], "archive"), headers=auth(world["member_a"])
    ).json()

    assert first["archived_at"] == second["archived_at"]


# --- authentication ------------------------------------------------------

def test_unauthenticated_requests_are_rejected(client, world):
    org = world["org_a"]
    assert client.get(_url(org)).status_code == 401
    assert client.post(_url(org), json={"name": "X"}).status_code == 401


def test_malformed_token_is_rejected(client, world):
    resp = client.get(_url(world["org_a"]), headers={"Authorization": "Bearer not-a-uuid"})
    assert resp.status_code == 401


def test_unknown_user_token_is_rejected(client, world):
    resp = client.get(
        _url(world["org_a"]), headers={"Authorization": f"Bearer {uuid.uuid4()}"}
    )
    assert resp.status_code == 401


# --- authorization (RBAC) ----------------------------------------------------

def test_viewer_can_read_but_not_write(client, auth, world):
    org = world["org_a"]
    created = _create(client, auth, org, world["member_a"], name="Ops").json()

    assert client.get(_url(org), headers=auth(world["viewer_a"])).status_code == 200

    assert _create(client, auth, org, world["viewer_a"], name="Nope").status_code == 403
    assert (
        client.patch(
            _url(org, created["id"]),
            json={"name": "Renamed"},
            headers=auth(world["viewer_a"]),
        ).status_code
        == 403
    )
    assert (
        client.post(
            _url(org, created["id"], "archive"), headers=auth(world["viewer_a"])
        ).status_code
        == 403
    )


# --- organization membership / cross-organization (IDOR) --------------------

def test_non_member_cannot_see_organization(client, auth, world):
    org_a = world["org_a"]
    for user in (world["member_b"], world["stranger"]):
        assert client.get(_url(org_a), headers=auth(user)).status_code == 404
        assert (
            client.post(_url(org_a), json={"name": "X"}, headers=auth(user)).status_code
            == 404
        )


def test_idor_cannot_read_workspace_through_wrong_org_in_path(client, auth, world):
    # Workspace lives in org_b; owner_a has full rights in org_a but none in org_b.
    ws_b = _create(client, auth, world["org_b"], world["member_b"], name="Secret").json()

    via_org_b = client.get(
        _url(world["org_b"], ws_b["id"]), headers=auth(world["owner_a"])
    )
    assert via_org_b.status_code == 404  # not a member of org_b

    via_org_a = client.get(
        _url(world["org_a"], ws_b["id"]), headers=auth(world["owner_a"])
    )
    assert via_org_a.status_code == 404  # workspace does not belong to org_a


def test_idor_cannot_mutate_workspace_from_another_org(client, auth, world):
    ws_b = _create(client, auth, world["org_b"], world["member_b"], name="Secret").json()
    org_a = world["org_a"]

    assert (
        client.patch(
            _url(org_a, ws_b["id"]),
            json={"name": "Hijacked"},
            headers=auth(world["owner_a"]),
        ).status_code
        == 404
    )
    assert (
        client.post(
            _url(org_a, ws_b["id"], "archive"), headers=auth(world["owner_a"])
        ).status_code
        == 404
    )

    # the workspace in org_b is untouched
    still_there = client.get(
        _url(world["org_b"], ws_b["id"]), headers=auth(world["member_b"])
    ).json()
    assert still_there["name"] == "Secret"
    assert still_there["is_archived"] is False
