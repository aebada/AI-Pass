import type { DemoScenario, GraphEdge, GraphNode, OrgRole } from './demo-graph';

export interface CompiledRule {
  id: string;
  text: string;
  summary: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface RulePreview {
  entities: { id: string; label: string }[];
  roles: OrgRole[];
  actions: { action: string; predicate: string }[];
  threshold: { metric: string; operator: string; value: number } | null;
  ready: boolean;
}

const ALL_ROLES: OrgRole[] = ['quality_engineer', 'plant_manager', 'auditor', 'operator'];

const ROLE_NODES: Record<OrgRole, { id: string; label: string }> = {
  quality_engineer: { id: 'role-qe', label: 'Role · Quality engineer' },
  plant_manager: { id: 'role-pm', label: 'Role · Plant manager' },
  auditor: { id: 'role-auditor', label: 'Role · Auditor' },
  operator: { id: 'role-op', label: 'Role · Operator' },
};

const ENTITY_ALIASES: { match: RegExp; id: string; label: string; type: string }[] = [
  { match: /\bve[-\s]?991\b/i, id: 've-991', label: 'VE-991', type: 'VibrationEvent' },
  { match: /\bdu[-\s]?7\b|\bdrive unit\b/i, id: 'du-7', label: 'Drive Unit DU-7', type: 'Asset' },
  { match: /\bskf[-\s]?6205\b|\bbearing\b/i, id: 'skf-6205', label: 'Bearing SKF-6205', type: 'Part' },
  { match: /\bl[-\s]?19920\b|\blot\b/i, id: 'lot-l19920', label: 'Lot L-19920', type: 'Lot' },
  { match: /\bline\s*3\b|\bmunich line\b/i, id: 'line-3', label: 'Munich Line 3', type: 'ProductionLine' },
  { match: /\bplant\b|\bmunich\b/i, id: 'plant-munich', label: 'Plant Munich', type: 'Plant' },
  { match: /\bwo[-\s]?8841\b|\bwork order\b/i, id: 'wo-8841', label: 'WO-8841', type: 'WorkOrder' },
  { match: /\bmeridian\b|\bsupplier\b/i, id: 'meridian', label: 'Meridian GmbH', type: 'Supplier' },
];

const ROLE_ALIASES: { match: RegExp; id: OrgRole }[] = [
  { match: /\bquality\b|\bq\.?\s*e\.?\b/i, id: 'quality_engineer' },
  { match: /\bplant manager\b/i, id: 'plant_manager' },
  { match: /\bauditor\b|\baudit\b/i, id: 'auditor' },
  { match: /\boperator\b|\bshift\b/i, id: 'operator' },
];

const ACTION_ALIASES: { match: RegExp; action: string; predicate: string }[] = [
  { match: /\bstop( the)? line\b|\bhalt\b/i, action: 'stop_line', predicate: 'halts' },
  { match: /\bopen( a)? work order\b|\bopen wo\b/i, action: 'open_work_order', predicate: 'opens' },
  { match: /\bquarantine\b/i, action: 'quarantine_lot', predicate: 'quarantines' },
  { match: /\bdo not publish\b|\bwill not publish\b|\bblock publish\b/i, action: 'block_publish', predicate: 'blocks' },
  { match: /\brequire(s)? (a )?second source\b|\bcorroborat/i, action: 'require_second_source', predicate: 'requires_second_source' },
  { match: /\bsign[- ]off\b|\bquality sign/i, action: 'require_quality_signoff', predicate: 'requires_signoff' },
  { match: /\bnotify\b/i, action: 'notify_role', predicate: 'notifies' },
  { match: /\bcannot ship\b|\bdo not ship\b|\bblock ship/i, action: 'block_ship', predicate: 'blocks_ship' },
];

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28);
}

function mentionedEntities(text: string, existing: DemoScenario) {
  const hits: { id: string; label: string; type: string; exists: boolean }[] = [];
  for (const alias of ENTITY_ALIASES) {
    if (!alias.match.test(text)) continue;
    if (hits.some((hit) => hit.id === alias.id)) continue;
    hits.push({
      id: alias.id,
      label: alias.label,
      type: alias.type,
      exists: existing.nodes.some((node) => node.id === alias.id),
    });
  }

  for (const match of text.matchAll(/\b([A-Z]{1,8}[-\s]?\d{2,6})\b/g)) {
    const raw = match[1];
    const id = slug(raw);
    const rawLower = raw.toLowerCase();
    if (
      !id ||
      hits.some(
        (hit) =>
          hit.id === id ||
          hit.label.toLowerCase() === rawLower ||
          hit.label.toLowerCase().includes(rawLower) ||
          hit.id.includes(id),
      )
    ) {
      continue;
    }
    const exists = existing.nodes.some(
      (node) => node.id === id || node.label.toLowerCase() === raw.toLowerCase(),
    );
    hits.push({
      id: exists ? existing.nodes.find((node) => node.id === id || node.label.toLowerCase() === raw.toLowerCase())!.id : id,
      label: raw.replace(/\s+/g, '-'),
      type: 'BusinessEntity',
      exists,
    });
  }

  for (const match of text.matchAll(/["“]([^"”]{2,40})["”]/g)) {
    const label = match[1].trim();
    const id = `ent-${slug(label)}`;
    if (!label || hits.some((hit) => hit.id === id)) continue;
    hits.push({
      id,
      label,
      type: 'BusinessEntity',
      exists: existing.nodes.some((node) => node.id === id),
    });
  }

  return hits;
}

function mentionedRoles(text: string): OrgRole[] {
  return ROLE_ALIASES.filter((alias) => alias.match.test(text)).map((alias) => alias.id);
}

function mentionedActions(text: string) {
  return ACTION_ALIASES.filter((alias) => alias.match.test(text));
}

function threshold(text: string): { metric: string; operator: string; value: number } | null {
  const match =
    text.match(/(exceeds|above|greater than|>=|>|at least|over)\s+(\d+(?:\.\d+)?)/i) ||
    text.match(/(\d+(?:\.\d+)?)\s*(mm\/s|mm s|percent|%|hours?)/i);
  if (!match) return null;
  const value = Number(match[2] ?? match[1]);
  if (Number.isNaN(value)) return null;
  const metric = /vib|mm/i.test(text) ? 'amplitudeMmS' : /oe{2}|percent|%/i.test(text) ? 'oee' : 'value';
  return { metric, operator: '>=', value };
}

export function previewBusinessRule(text: string, existing: DemoScenario): RulePreview {
  const trimmed = text.trim();
  const entities = mentionedEntities(trimmed, existing).map((item) => ({
    id: item.id,
    label: item.label,
  }));
  const roles = mentionedRoles(trimmed);
  const actions = mentionedActions(trimmed);
  const limit = threshold(trimmed);
  return {
    entities,
    roles,
    actions,
    threshold: limit,
    ready:
      trimmed.length >= 6 ||
      entities.length > 0 ||
      roles.length > 0 ||
      actions.length > 0 ||
      Boolean(limit),
  };
}

export function compileBusinessRule(
  text: string,
  existing: DemoScenario,
  options: { draft?: boolean; index?: number } = {},
): CompiledRule | null {
  const trimmed = text.trim();
  const preview = previewBusinessRule(trimmed, existing);
  if (!preview.ready) return null;

  const index = options.index ?? 0;
  const prefix = options.draft ? 'draft' : `rule${index + 1}`;
  const id = `${prefix}-${slug(trimmed) || 'human'}`;
  const now = '2026-10-06T12:00:00Z';
  const entities = mentionedEntities(trimmed, existing);
  const roles = preview.roles;
  const actions = preview.actions;
  const limit = preview.threshold;
  const owner: OrgRole = roles[0] ?? 'quality_engineer';
  const column = index % 5;
  const row = Math.floor(index / 5);

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const ruleNode: GraphNode = {
    id,
    label: trimmed.length > 28 ? `${trimmed.slice(0, 26)}…` : trimmed,
    type: 'HumanBusinessRule',
    layer: 'policy',
    x: 80 + column * 180,
    y: 470 + row * 70,
    attributes: {
      text: trimmed.slice(0, 180),
      encodedBy: 'human',
      realtime: true,
      draft: Boolean(options.draft),
      action: actions[0]?.action ?? 'apply_policy',
      ...(limit ?? {}),
    },
    metadata: {
      source: 'human://business-rule',
      capturedAt: now,
      confidence: 1,
      classification: 'confidential',
      ownerRole: owner,
      version: '1.0',
    },
    visibleTo: ALL_ROLES,
  };
  nodes.push(ruleNode);

  if (limit) {
    const thId = `${id}-th`;
    nodes.push({
      id: thId,
      label: `${limit.metric} ${limit.operator} ${limit.value}`,
      type: 'ThresholdRule',
      layer: 'policy',
      x: Math.min(880, ruleNode.x + 180),
      y: ruleNode.y,
      attributes: { ...limit, fromHuman: true, draft: Boolean(options.draft) },
      metadata: {
        source: 'human://business-rule',
        capturedAt: now,
        confidence: 1,
        classification: 'confidential',
        ownerRole: owner,
        version: '1.0',
      },
      visibleTo: ALL_ROLES,
    });
    edges.push({
      id: `${id}-e-th`,
      from: id,
      to: thId,
      predicate: 'encodes_threshold',
      metadata: { source: 'human', confidence: 1 },
    });
  }

  for (const [entityIndex, entity] of entities.entries()) {
    const predicate = actions[0]?.predicate ?? (limit ? 'applies_to' : 'mentions');
    edges.push({
      id: `${id}-e-${entity.id}`,
      from: id,
      to: entity.id,
      predicate,
      metadata: { source: 'human', confidence: 1 },
    });
    if (!entity.exists) {
      nodes.push({
        id: entity.id,
        label: entity.label,
        type: entity.type,
        layer: 'assertional',
        x: 80 + entityIndex * 150,
        y: 540,
        attributes: { createdFromRule: true, draft: Boolean(options.draft) },
        metadata: {
          source: 'human://business-rule',
          capturedAt: now,
          confidence: 0.8,
          classification: 'internal',
          ownerRole: owner,
          version: '1.0',
        },
        visibleTo: ALL_ROLES,
      });
    }
  }

  for (const role of roles) {
    const roleMeta = ROLE_NODES[role];
    const existingRole = existing.nodes.some((node) => node.id === roleMeta.id);
    if (!existingRole) {
      nodes.push({
        id: roleMeta.id,
        label: roleMeta.label,
        type: 'HumanRole',
        layer: 'policy',
        x: ruleNode.x,
        y: 400,
        attributes: { humanRole: true },
        metadata: {
          source: 'human://business-rule',
          capturedAt: now,
          confidence: 1,
          classification: 'internal',
          ownerRole: role,
          version: '1.0',
        },
        visibleTo: ALL_ROLES,
      });
    }
    edges.push({
      id: `${id}-e-${role}`,
      from: roleMeta.id,
      to: id,
      predicate: /may not|cannot|must not|do not/i.test(trimmed) ? 'may_not_apply' : 'may_apply',
      metadata: { source: 'human', confidence: 1 },
    });
  }

  const parts = [
    roles.length ? `Role: ${roles.join(', ')}` : 'Role: quality engineer (default)',
    entities.length ? `Binds: ${entities.map((item) => item.label).join(', ')}` : 'New policy node',
    actions.length ? `Action: ${actions.map((item) => item.action).join(', ')}` : null,
    limit ? `Threshold: ${limit.metric} ${limit.operator} ${limit.value}` : null,
  ].filter(Boolean);

  return {
    id,
    text: trimmed,
    summary: parts.join(' · '),
    nodes,
    edges,
  };
}

export function mergeCompiledRules(base: DemoScenario, rules: CompiledRule[]): DemoScenario {
  const nodes = [...base.nodes];
  const edges = [...base.edges];
  const seenNodes = new Set(nodes.map((node) => node.id));
  const seenEdges = new Set(edges.map((edge) => edge.id));
  for (const rule of rules) {
    for (const node of rule.nodes) {
      if (seenNodes.has(node.id)) continue;
      seenNodes.add(node.id);
      nodes.push(node);
    }
    for (const edge of rule.edges) {
      if (seenEdges.has(edge.id)) continue;
      seenEdges.add(edge.id);
      edges.push(edge);
    }
  }
  return { ...base, nodes, edges };
}
