"""Single import surface that pulls every model onto ``Base.metadata``.

Alembic's ``env.py`` and the test bootstrap import this module so that
``Base.metadata`` is fully populated regardless of import order.
"""
from app.db.base_class import Base  # noqa: F401
from app.models.organization import Organization, OrganizationMembership  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.workspace import Workspace  # noqa: F401
