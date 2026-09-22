"""Test fixtures: an isolated in-memory database, a TestClient wired to it, and
factories for the placeholder User / Organization / membership rows.
"""
from __future__ import annotations

import uuid
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.models.organization import Organization, OrganizationMembership, OrgRole
from app.models.user import User


@pytest.fixture()
def engine():
    # One shared connection (StaticPool) so every session sees the same in-memory DB.
    eng = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        future=True,
    )
    Base.metadata.create_all(eng)
    try:
        yield eng
    finally:
        Base.metadata.drop_all(eng)
        eng.dispose()


@pytest.fixture()
def session_local(engine):
    return sessionmaker(
        bind=engine,
        class_=Session,
        autoflush=False,
        autocommit=False,
        expire_on_commit=False,
    )


@pytest.fixture()
def db(session_local) -> Iterator[Session]:
    session = session_local()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client(engine, session_local) -> Iterator[TestClient]:
    from app.main import app

    def _override_get_db() -> Iterator[Session]:
        session = session_local()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture()
def auth():
    """Authorization header for the placeholder bearer scheme (token == user id)."""

    def _auth(user: User) -> dict[str, str]:
        return {"Authorization": f"Bearer {user.id}"}

    return _auth


@pytest.fixture()
def org_factory(db):
    def _make(slug: str, name: str | None = None) -> Organization:
        org = Organization(name=name or slug.replace("-", " ").title(), slug=slug)
        db.add(org)
        db.commit()
        db.refresh(org)
        return org

    return _make


@pytest.fixture()
def user_factory(db):
    def _make(email: str | None = None) -> User:
        user = User(email=email or f"{uuid.uuid4().hex}@example.test")
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    return _make


@pytest.fixture()
def member_factory(db):
    def _make(org: Organization, user: User, role: OrgRole) -> OrganizationMembership:
        membership = OrganizationMembership(
            organization_id=org.id, user_id=user.id, role=role
        )
        db.add(membership)
        db.commit()
        db.refresh(membership)
        return membership

    return _make


@pytest.fixture()
def world(org_factory, user_factory, member_factory):
    """Two organizations and a spread of roles, shared by the RBAC / IDOR tests."""
    org_a = org_factory("org-a")
    org_b = org_factory("org-b")

    owner_a = user_factory("owner-a@example.test")
    member_a = user_factory("member-a@example.test")
    viewer_a = user_factory("viewer-a@example.test")
    member_b = user_factory("member-b@example.test")
    stranger = user_factory("stranger@example.test")  # no memberships anywhere

    member_factory(org_a, owner_a, OrgRole.owner)
    member_factory(org_a, member_a, OrgRole.member)
    member_factory(org_a, viewer_a, OrgRole.viewer)
    member_factory(org_b, member_b, OrgRole.member)

    return {
        "org_a": org_a,
        "org_b": org_b,
        "owner_a": owner_a,
        "member_a": member_a,
        "viewer_a": viewer_a,
        "member_b": member_b,
        "stranger": stranger,
    }
