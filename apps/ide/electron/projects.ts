import { app } from 'electron';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export type ProjectNodeType = 'project' | 'folder';

export interface ProjectNode {
  id: string;
  name: string;
  type: ProjectNodeType;
  children: ProjectNode[];
  createdAt: string;
  /** External deployment URL for linked projects */
  url?: string;
}

export interface ProjectsData {
  projects: ProjectNode[];
  selectedProjectId?: string;
  expandedIds: string[];
}

const DEFAULT_EXTERNAL_PROJECTS: ProjectNode[] = [
  {
    id: 'proj-invoice-ai',
    name: 'Invoice AI',
    type: 'project',
    url: 'https://invoice.ehopn.com',
    children: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'proj-carbon',
    name: 'Carbon',
    type: 'project',
    url: 'https://carbon.ehopn.com',
    children: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'proj-sovraa-ai',
    name: 'Sovraa AI',
    type: 'project',
    url: 'https://sovraaai.de',
    children: [],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

function seedDefaultProjects(): ProjectsData {
  const data: ProjectsData = {
    projects: DEFAULT_EXTERNAL_PROJECTS.map((p) => ({ ...p, children: [] })),
    selectedProjectId: DEFAULT_EXTERNAL_PROJECTS[0]?.id,
    expandedIds: DEFAULT_EXTERNAL_PROJECTS.map((p) => p.id),
  };
  return saveProjects(data);
}

function storePath(): string {
  return join(app.getPath('userData'), 'ide-projects.json');
}

export function loadProjects(): ProjectsData {
  try {
    const path = storePath();
    if (!existsSync(path)) return seedDefaultProjects();
    const raw = readFileSync(path, 'utf-8');
    const parsed = JSON.parse(raw) as ProjectsData;
    const projects = Array.isArray(parsed.projects) ? parsed.projects : [];
    if (projects.length === 0) return seedDefaultProjects();
    return {
      projects,
      selectedProjectId: parsed.selectedProjectId,
      expandedIds: Array.isArray(parsed.expandedIds) ? parsed.expandedIds : [],
    };
  } catch {
    return seedDefaultProjects();
  }
}

function saveProjects(data: ProjectsData): ProjectsData {
  const dir = app.getPath('userData');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(storePath(), JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

function findNode(
  nodes: ProjectNode[],
  id: string,
): { node: ProjectNode; parent: ProjectNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    if (node.id === id) return { node, parent: nodes, index: i };
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

export function createProject(name: string): ProjectsData {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Project name is required');

  const data = loadProjects();
  const project: ProjectNode = {
    id: randomUUID(),
    name: trimmed,
    type: 'project',
    children: [],
    createdAt: new Date().toISOString(),
  };
  data.projects.push(project);
  data.selectedProjectId = project.id;
  if (!data.expandedIds.includes(project.id)) {
    data.expandedIds.push(project.id);
  }
  return saveProjects(data);
}

export function createFolder(projectId: string, parentFolderId: string | null, name: string): ProjectsData {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Folder name is required');

  const data = loadProjects();
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Project not found');

  const folder: ProjectNode = {
    id: randomUUID(),
    name: trimmed,
    type: 'folder',
    children: [],
    createdAt: new Date().toISOString(),
  };

  if (parentFolderId) {
    const parent = findNode(project.children, parentFolderId);
    if (!parent || parent.node.type !== 'folder') {
      throw new Error('Parent folder not found');
    }
    parent.node.children.push(folder);
  } else {
    project.children.push(folder);
  }

  if (!data.expandedIds.includes(projectId)) data.expandedIds.push(projectId);
  if (parentFolderId && !data.expandedIds.includes(parentFolderId)) {
    data.expandedIds.push(parentFolderId);
  }
  if (!data.expandedIds.includes(folder.id)) data.expandedIds.push(folder.id);

  return saveProjects(data);
}

export function selectProject(projectId: string | null): ProjectsData {
  const data = loadProjects();
  if (projectId && !data.projects.some((p) => p.id === projectId)) {
    throw new Error('Project not found');
  }
  data.selectedProjectId = projectId ?? undefined;
  return saveProjects(data);
}

export function setExpanded(expandedIds: string[]): ProjectsData {
  const data = loadProjects();
  data.expandedIds = expandedIds;
  return saveProjects(data);
}

export function deleteNode(nodeId: string): ProjectsData {
  const data = loadProjects();

  const topLevel = data.projects.findIndex((p) => p.id === nodeId);
  if (topLevel >= 0) {
    data.projects.splice(topLevel, 1);
    if (data.selectedProjectId === nodeId) {
      data.selectedProjectId = data.projects[0]?.id;
    }
    data.expandedIds = data.expandedIds.filter((id) => id !== nodeId);
    return saveProjects(data);
  }

  for (const project of data.projects) {
    const found = findNode(project.children, nodeId);
    if (found) {
      found.parent.splice(found.index, 1);
      data.expandedIds = data.expandedIds.filter((id) => id !== nodeId);
      return saveProjects(data);
    }
  }

  throw new Error('Node not found');
}
