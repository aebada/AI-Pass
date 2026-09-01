# Skill availability & permissions

Workspace controls for how skills are shared and managed.

## Skill availability

Each skill has one availability state. These control **visibility and discoverability**, not Space/Pod access.

| State | Label | Behavior |
|-------|--------|----------|
| `editors_only` | Editors only | Limited to skill editors while developing/testing. Still usable indirectly when attached to an agent or another skill. |
| `all_members` | All members | Visible to everyone in the workspace (skill library, input bar, agent builder). |
| `members_and_agents` | Members and Agents | Visible to members **and** automatically discoverable by agents. |

**Migration:** existing skills default to `all_members` so prior availability is unchanged.

**Admins** can see all skills, including Editors only.

## Skill permissions

Workspace-level policies (separate from availability):

| Policy | Options | Default |
|--------|---------|---------|
| Who can **create** skills | Admins · Admins and builders · All members | Admins and builders |
| Who can **change availability** | Admins · Admins and editors · Editors | Admins and skill editors |

## Surfaces

| Surface | Path |
|---------|------|
| Settings UI | `/workspace/settings/skills` |
| Skill Library (member-visible) | `/workspace/skills` |
| Agent Studio skills | `/workspace/agents/skills` |
| Agent builder picker | `/workspace/agents/new` (member-visible list) |
| Permissions API | `GET/PATCH /api/v1/workspace/skills/permissions` |
| Skills API | `GET/POST/PATCH /api/v1/agents/skills` (`?scope=member\|agents\|all`) |

## Packages

- `@ai-pass/shared` — `SkillAvailability`, permission helpers (`skill-governance.ts`)
- `@ai-pass/agent-studio` — `Skill.availability` / `editorIds`, `SkillGovernanceService`, filtered `SkillService` lists

## Agent discovery

`SkillService.listDiscoverableForAgents()` returns only skills with `members_and_agents`. Agents can attach those skills automatically when they match a task; member catalogs use `listForMember()`.
