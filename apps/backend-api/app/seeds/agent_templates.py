"""Reusable agent templates and an idempotent workspace bootstrap.

Templates are seeded as complete, publishable *drafts* so a workspace owner can
review them, swap the placeholder knowledge bases for real ones, and publish.
Re-running the bootstrap never duplicates or overwrites an agent: a template is
skipped when its slug already exists in the workspace (archived agents included).

CLI:
    python -m app.seeds.agent_templates \\
        --organization-id <uuid> --workspace-id <uuid> --created-by <user uuid>
"""
from __future__ import annotations

import argparse
import uuid
from dataclasses import dataclass
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.models.organization import OrganizationMembership
from app.schemas.agent import AgentCreate
from app.services.agent_service import AgentService


@dataclass(frozen=True)
class AgentTemplate:
    slug: str
    name: str
    description: str
    system_prompt: str
    provider_id: str
    model_id: str
    generation_settings: dict[str, Any]
    knowledge_base_bindings: tuple[dict[str, Any], ...]

    def to_create_payload(self) -> AgentCreate:
        # Going through the public schema guarantees templates obey the same rules as user input.
        return AgentCreate(
            name=self.name,
            slug=self.slug,
            description=self.description,
            system_prompt=self.system_prompt,
            provider_id=self.provider_id,
            model_id=self.model_id,
            generation_settings=self.generation_settings,
            tool_bindings=[],
            knowledge_base_bindings=list(self.knowledge_base_bindings),
        )


TEMPLATES: tuple[AgentTemplate, ...] = (
    AgentTemplate(
        slug="customer-support-agent",
        name="Customer Support Agent",
        description="Answers customer questions from the help center and escalates what it cannot resolve.",
        system_prompt=(
            "You are a friendly, professional customer support agent.\n\n"
            "- Answer using only the connected help-center knowledge base. If the answer "
            "is not there, say so and offer to escalate to a human agent.\n"
            "- Keep replies short and clear; use numbered steps for instructions.\n"
            "- Never ask for or repeat passwords, full card numbers or other credentials.\n"
            "- Do not promise refunds, credits or policy exceptions; escalate those requests.\n"
            "- Match the customer's language and stay polite, even when they are frustrated."
        ),
        provider_id="openai",
        model_id="gpt-4o-mini",
        generation_settings={"temperature": 0.3, "max_tokens": 1024},
        knowledge_base_bindings=(
            {
                "knowledge_base_id": "placeholder-help-center",
                "name": "Help center articles",
                "is_placeholder": True,
            },
        ),
    ),
    AgentTemplate(
        slug="document-analyst",
        name="Document Analyst",
        description="Summarizes, compares and extracts structured facts from uploaded documents.",
        system_prompt=(
            "You are a meticulous document analyst.\n\n"
            "- Base every statement on the provided documents and cite the section or page "
            "it comes from.\n"
            "- When asked to extract data, return it in the exact structure requested and "
            "mark missing values as \"not found\" rather than guessing.\n"
            "- Point out contradictions, ambiguous clauses and unusual terms.\n"
            "- Separate facts from your interpretation, and label interpretation clearly.\n"
            "- If a document is unreadable or incomplete, say which part and stop there."
        ),
        provider_id="anthropic",
        model_id="claude-sonnet-4",
        generation_settings={"temperature": 0.2, "max_tokens": 4096},
        knowledge_base_bindings=(
            {
                "knowledge_base_id": "placeholder-document-library",
                "name": "Document library",
                "is_placeholder": True,
            },
        ),
    ),
    AgentTemplate(
        slug="enterprise-knowledge-agent",
        name="Enterprise Knowledge Agent",
        description="Answers employee questions from internal policies, handbooks and wikis.",
        system_prompt=(
            "You are the internal knowledge assistant for employees.\n\n"
            "- Answer from the connected internal knowledge bases only, and name the "
            "source document for each answer.\n"
            "- If sources disagree, show both and recommend who to contact to confirm.\n"
            "- If nothing relevant is found, say so plainly; do not fill gaps with general "
            "knowledge presented as company policy.\n"
            "- Treat all content as confidential: do not reproduce whole documents, and "
            "decline requests for personal data about colleagues.\n"
            "- Be concise and use bullet points for multi-part answers."
        ),
        provider_id="openai",
        model_id="gpt-4o",
        generation_settings={"temperature": 0.2, "max_tokens": 2048},
        knowledge_base_bindings=(
            {
                "knowledge_base_id": "placeholder-company-policies",
                "name": "Company policies",
                "is_placeholder": True,
            },
            {
                "knowledge_base_id": "placeholder-internal-wiki",
                "name": "Internal wiki",
                "is_placeholder": True,
            },
        ),
    ),
)


@dataclass(frozen=True)
class BootstrapResult:
    agent: Agent
    created: bool


def bootstrap_agent_templates(
    db: Session,
    *,
    organization_id: uuid.UUID,
    workspace_id: uuid.UUID,
    created_by: uuid.UUID,
) -> list[BootstrapResult]:
    is_member = db.scalar(
        select(OrganizationMembership.id).where(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.user_id == created_by,
        )
    )
    if is_member is None:
        raise ValueError("created_by must be a member of the organization")

    service = AgentService(db)
    results: list[BootstrapResult] = []
    for template in TEMPLATES:
        existing = db.scalar(
            select(Agent).where(
                Agent.organization_id == organization_id,
                Agent.workspace_id == workspace_id,
                Agent.slug == template.slug,
            )
        )
        if existing is not None:
            results.append(BootstrapResult(existing, created=False))
            continue
        agent = service.create(
            organization_id=organization_id,
            workspace_id=workspace_id,
            payload=template.to_create_payload(),
            created_by=created_by,
        )
        results.append(BootstrapResult(agent, created=True))
    return results


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Seed the agent templates into a workspace.")
    parser.add_argument("--organization-id", type=uuid.UUID, required=True)
    parser.add_argument("--workspace-id", type=uuid.UUID, required=True)
    parser.add_argument("--created-by", type=uuid.UUID, required=True)
    args = parser.parse_args(argv)

    import app.db.base  # noqa: F401  (register every model before querying)
    from app.db.session import SessionLocal

    with SessionLocal() as db:
        results = bootstrap_agent_templates(
            db,
            organization_id=args.organization_id,
            workspace_id=args.workspace_id,
            created_by=args.created_by,
        )
    for result in results:
        state = "created" if result.created else "exists "
        print(f"{state}  {result.agent.slug}  ({result.agent.id})")


if __name__ == "__main__":
    main()
