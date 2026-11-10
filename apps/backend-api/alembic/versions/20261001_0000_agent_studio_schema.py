"""agent studio schema

Creates ``agents`` and ``agent_versions``. The two tables reference each other
(``agents.current_version_id`` -> latest published version), so that foreign key
is added once both tables exist.

Revision ID: 20261001_0000
Revises: 20260908_0000
Create Date: 2026-10-01
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20261001_0000"
down_revision: str | None = "20260908_0000"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

agent_status = sa.Enum("draft", "published", "archived", name="agent_status")


def upgrade() -> None:
    op.create_table(
        "agents",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("organization_id", sa.Uuid(), nullable=False),
        sa.Column("workspace_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("status", agent_status, server_default="draft", nullable=False),
        sa.Column("current_version_id", sa.Uuid(), nullable=True),
        sa.Column("created_by", sa.Uuid(), nullable=True),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["workspace_id"], ["workspaces.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("workspace_id", "slug", name="uq_agents_workspace_slug"),
    )
    op.create_index("ix_agents_organization_id", "agents", ["organization_id"])
    op.create_index("ix_agents_workspace_id", "agents", ["workspace_id"])
    op.create_index(
        "ix_agents_org_workspace_status",
        "agents",
        ["organization_id", "workspace_id", "status"],
    )

    op.create_table(
        "agent_versions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("agent_id", sa.Uuid(), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=True),
        sa.Column("system_prompt", sa.Text(), nullable=True),
        sa.Column("provider_id", sa.String(length=64), nullable=True),
        sa.Column("model_id", sa.String(length=128), nullable=True),
        sa.Column("generation_settings", sa.JSON(), nullable=False),
        sa.Column("tool_bindings", sa.JSON(), nullable=False),
        sa.Column("knowledge_base_bindings", sa.JSON(), nullable=False),
        sa.Column("change_note", sa.String(length=500), nullable=True),
        sa.Column("created_by", sa.Uuid(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "agent_id", "version_number", name="uq_agent_versions_agent_number"
        ),
        sa.CheckConstraint(
            "(published_at IS NULL AND version_number IS NULL) OR "
            "(published_at IS NOT NULL AND version_number IS NOT NULL "
            "AND system_prompt IS NOT NULL AND provider_id IS NOT NULL "
            "AND model_id IS NOT NULL)",
            name="ck_agent_versions_published_complete",
        ),
        sa.CheckConstraint(
            "version_number IS NULL OR version_number > 0",
            name="ck_agent_versions_number_positive",
        ),
    )
    op.create_index("ix_agent_versions_agent_id", "agent_versions", ["agent_id"])
    op.create_index(
        "uq_agent_versions_one_draft",
        "agent_versions",
        ["agent_id"],
        unique=True,
        sqlite_where=sa.text("published_at IS NULL"),
        postgresql_where=sa.text("published_at IS NULL"),
    )

    with op.batch_alter_table("agents") as batch_op:
        batch_op.create_foreign_key(
            "fk_agents_current_version_id",
            "agent_versions",
            ["current_version_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    with op.batch_alter_table("agents") as batch_op:
        batch_op.drop_constraint("fk_agents_current_version_id", type_="foreignkey")

    op.drop_index("uq_agent_versions_one_draft", table_name="agent_versions")
    op.drop_index("ix_agent_versions_agent_id", table_name="agent_versions")
    op.drop_table("agent_versions")
    op.drop_index("ix_agents_org_workspace_status", table_name="agents")
    op.drop_index("ix_agents_workspace_id", table_name="agents")
    op.drop_index("ix_agents_organization_id", table_name="agents")
    op.drop_table("agents")
    agent_status.drop(op.get_bind(), checkfirst=True)
