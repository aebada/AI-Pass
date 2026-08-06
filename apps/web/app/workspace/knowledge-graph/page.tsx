'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  countByType,
  getKnowledgeGraph,
  type EntityType,
  type GraphEdge,
  type GraphNode,
  type NeighborResult,
} from '@ai-pass/knowledge-graph';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './knowledge-graph.module.css';

const ENTITY_TYPES: Array<EntityType | 'all'> = [
  'all',
  'company',
  'person',
  'invoice',
  'product',
  'document',
  'policy',
  'other',
];

const TYPE_COLORS: Record<EntityType, string> = {
  company: '#818cf8',
  person: '#34d399',
  invoice: '#fbbf24',
  product: '#60a5fa',
  document: '#a78bfa',
  policy: '#f472b6',
  other: '#94a3b8',
};

/** Deterministic layout positions for demo visualization */
function layoutPositions(nodes: GraphNode[]): Record<string, { x: number; y: number }> {
  const cx = 320;
  const cy = 180;
  const r = 140;
  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(nodes.length, 1) - Math.PI / 2;
    positions[n.id] = {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
  return positions;
}

export default function KnowledgeGraphPage() {
  const store = useMemo(() => getKnowledgeGraph(), []);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [typeFilter, setTypeFilter] = useState<EntityType | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [neighbors, setNeighbors] = useState<NeighborResult[]>([]);
  const [toast, setToast] = useState('');

  const refresh = useCallback(() => {
    const snapshot = store.load();
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
  }, [store]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selectedId) {
      setNeighbors([]);
      return;
    }
    setNeighbors(store.neighbors(selectedId));
  }, [selectedId, store, nodes]);

  const filteredNodes = useMemo(
    () => (typeFilter === 'all' ? nodes : nodes.filter((n) => n.type === typeFilter)),
    [nodes, typeFilter],
  );

  const typeCounts = useMemo(() => countByType({ version: 1, nodes, edges, updatedAt: '' }), [nodes, edges]);

  const vizNodes = useMemo(() => {
    if (typeFilter === 'all') return nodes;
    const ids = new Set(filteredNodes.map((n) => n.id));
    return nodes.filter((n) => ids.has(n.id));
  }, [nodes, filteredNodes, typeFilter]);

  const vizEdges = useMemo(() => {
    const ids = new Set(vizNodes.map((n) => n.id));
    return edges.filter((e) => ids.has(e.sourceId) && ids.has(e.targetId));
  }, [edges, vizNodes]);

  const positions = useMemo(() => layoutPositions(vizNodes), [vizNodes]);

  const selected = nodes.find((n) => n.id === selectedId) ?? null;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2400);
  };

  const resetDemo = () => {
    store.resetToDemo();
    setSelectedId(null);
    refresh();
    showToast('Restored demo knowledge graph');
  };

  return (
    <WorkspaceLayoutClient
      title="Knowledge Graph"
      subtitle="Entity-relationship visualization and graph queries over knowledge"
    >
      <div className={styles.shell}>
        <div className={styles.banner}>
          Sits between{' '}
          <Link href="/workspace/knowledge">Knowledge Pipeline</Link> and{' '}
          <Link href="/workspace/semantic">Semantic Layer</Link> — structure entities &amp; relationships
          for RAG grounding and metrics. Demo data persists in localStorage.
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{nodes.length}</span>
            <span className={styles.statLabel}>Nodes</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{edges.length}</span>
            <span className={styles.statLabel}>Edges</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{typeCounts.company ?? 0}</span>
            <span className={styles.statLabel}>Companies</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{(typeCounts.invoice ?? 0) + (typeCounts.product ?? 0)}</span>
            <span className={styles.statLabel}>Invoices + Products</span>
          </div>
        </div>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Graph</h2>
              <button type="button" className={styles.ghostBtn} onClick={resetDemo}>
                Reset demo
              </button>
            </div>
            <div className={styles.vizWrap}>
              <svg
                className={styles.viz}
                viewBox="0 0 640 360"
                role="img"
                aria-label="Knowledge graph visualization"
              >
                {vizEdges.map((e) => {
                  const a = positions[e.sourceId];
                  const b = positions[e.targetId];
                  if (!a || !b) return null;
                  return (
                    <g key={e.id}>
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        className={styles.edge}
                      />
                      <text
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 - 4}
                        className={styles.edgeLabel}
                      >
                        {e.label ?? e.predicate}
                      </text>
                    </g>
                  );
                })}
                {vizNodes.map((n) => {
                  const p = positions[n.id];
                  if (!p) return null;
                  const active = selectedId === n.id;
                  return (
                    <g
                      key={n.id}
                      className={styles.nodeGroup}
                      onClick={() => setSelectedId(n.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={active ? 18 : 14}
                        fill={TYPE_COLORS[n.type]}
                        className={active ? styles.nodeActive : styles.node}
                      />
                      <text x={p.x} y={p.y + 28} className={styles.nodeLabel}>
                        {n.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className={styles.legend}>
              {(Object.keys(TYPE_COLORS) as EntityType[]).map((t) => (
                <span key={t} className={styles.legendItem}>
                  <i style={{ background: TYPE_COLORS[t] }} />
                  {t}
                </span>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Entities</h2>
              <select
                className={styles.filter}
                value={typeFilter}
                onChange={(ev) => setTypeFilter(ev.target.value as EntityType | 'all')}
                aria-label="Filter by type"
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === 'all' ? 'All types' : t}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.list}>
              {filteredNodes.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`${styles.entityCard} ${selectedId === n.id ? styles.entityCardActive : ''}`}
                  onClick={() => setSelectedId(n.id)}
                >
                  <div className={styles.cardTop}>
                    <strong>{n.label}</strong>
                    <span
                      className={styles.typeBadge}
                      style={{ color: TYPE_COLORS[n.type], background: `${TYPE_COLORS[n.type]}22` }}
                    >
                      {n.type}
                    </span>
                  </div>
                  {n.description ? <p className={styles.cardDesc}>{n.description}</p> : null}
                </button>
              ))}
              {filteredNodes.length === 0 ? (
                <p className={styles.empty}>No entities for this filter.</p>
              ) : null}
            </div>
          </section>
        </div>

        {selected ? (
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                Neighbors of {selected.label}
              </h2>
              <button type="button" className={styles.ghostBtn} onClick={() => setSelectedId(null)}>
                Clear
              </button>
            </div>
            <p className={styles.cardDesc}>{selected.description}</p>
            <div className={styles.neighborList}>
              {neighbors.map(({ node, edge, direction }) => (
                <button
                  key={`${edge.id}-${node.id}`}
                  type="button"
                  className={styles.neighborRow}
                  onClick={() => setSelectedId(node.id)}
                >
                  <span className={styles.dir}>{direction === 'out' ? '→' : '←'}</span>
                  <span className={styles.pred}>{edge.label ?? edge.predicate}</span>
                  <strong>{node.label}</strong>
                  <span
                    className={styles.typeBadge}
                    style={{ color: TYPE_COLORS[node.type], background: `${TYPE_COLORS[node.type]}22` }}
                  >
                    {node.type}
                  </span>
                </button>
              ))}
              {neighbors.length === 0 ? (
                <p className={styles.empty}>No connected neighbors.</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {toast ? <div className={styles.toast}>{toast}</div> : null}
      </div>
    </WorkspaceLayoutClient>
  );
}
