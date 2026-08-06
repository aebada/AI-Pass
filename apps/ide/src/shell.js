/** @typedef {'work' | 'chat' | 'orchestrations'} IdeTab */

/** @typedef {{ id: string; name: string; type: 'project' | 'folder'; children: unknown[]; createdAt: string }} ProjectNode */

/** @typedef {{ projects: ProjectNode[]; selectedProjectId?: string; expandedIds: string[] }} ProjectsData */

(function () {
  const api = window.aiPassIde;
  if (!api) {
    console.error('aiPassIde bridge not available');
    return;
  }

  /** @type {IdeTab} */
  let activeTab = 'work';
  /** @type {ProjectsData} */
  let projectsData = { projects: [], expandedIds: [] };
  /** @type {Record<IdeTab, string>} */
  let tabPaths = {
    work: '/workspace',
    chat: '/workspace/playground',
    orchestrations: '/workspace/workflows/livesync',
  };

  /** @type {{ mode: 'project' | 'folder'; projectId?: string; parentFolderId?: string | null } | null} */
  let dialogState = null;

  const els = {
    tabbar: document.getElementById('tabbar'),
    tabs: /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('.tab')),
    sidebar: document.getElementById('sidebar'),
    projectTree: document.getElementById('projectTree'),
    panels: /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.panel')),
    webviews: /** @type {Record<IdeTab, Electron.WebviewTag>} */ ({
      work: /** @type {Electron.WebviewTag} */ (document.getElementById('webview-work')),
      chat: /** @type {Electron.WebviewTag} */ (document.getElementById('webview-chat')),
      orchestrations: /** @type {Electron.WebviewTag} */ (document.getElementById('webview-orchestrations')),
    }),
    dialogBackdrop: document.getElementById('dialogBackdrop'),
    dialogTitle: document.getElementById('dialogTitle'),
    dialogHint: document.getElementById('dialogHint'),
    dialogInput: /** @type {HTMLInputElement} */ (document.getElementById('dialogInput')),
    dialogConfirm: document.getElementById('dialogConfirm'),
    dialogCancel: document.getElementById('dialogCancel'),
    btnNewProject: document.getElementById('btnNewProject'),
    btnNewFolder: document.getElementById('btnNewFolder'),
  };

  function tabForPath(path) {
    const normalized = path.replace(/\/+$/, '') || '/workspace';
    if (normalized.startsWith('/workspace/playground') || normalized.startsWith('/workspace/ai')) {
      return 'chat';
    }
    if (
      normalized.startsWith('/workspace/workflows') ||
      normalized.startsWith('/workspace/agents') ||
      normalized.startsWith('/workspace/livesync')
    ) {
      return 'orchestrations';
    }
    return 'work';
  }

  function setActiveTab(tab, options = {}) {
    activeTab = tab;
    els.tabs.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    els.panels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.tab === tab);
    });
    els.sidebar.classList.toggle('hidden', tab !== 'work');

    if (options.path) {
      navigateWebview(tab, options.path);
    }
  }

  function navigateWebview(tab, path) {
    const webview = els.webviews[tab];
    if (!webview) return;
    const base = tabPaths[tab] ? '' : '';
    void api.getWebBaseUrl().then((origin) => {
      const normalized = path.startsWith('/') ? path : `/${path}`;
      const url = `${origin.replace(/\/$/, '')}${normalized}`;
      if (webview.getURL() !== url) {
        webview.src = url;
      }
    });
  }

  function renderTree() {
    const { projects, selectedProjectId, expandedIds } = projectsData;
    if (!projects.length) {
      els.projectTree.innerHTML =
        '<div class="tree-empty">No projects yet.<br />Create one to organize your work.</div>';
      return;
    }

    /** @param {ProjectNode[]} nodes @param {number} depth */
    function renderNodes(nodes, depth) {
      return nodes
        .map((node) => {
          const isProject = node.type === 'project';
          const hasChildren = node.children && node.children.length > 0;
          const expanded = expandedIds.includes(node.id);
          const selected = selectedProjectId === node.id && isProject;
          const toggle = hasChildren
            ? `<button type="button" class="tree-toggle" data-toggle="${node.id}" aria-label="Toggle">${expanded ? '▼' : '▶'}</button>`
            : '<span class="tree-toggle placeholder"></span>';
          const icon = isProject ? '📁' : '📂';
          const children =
            hasChildren && node.children
              ? `<div class="tree-children ${expanded ? '' : 'collapsed'}">${renderNodes(node.children, depth + 1)}</div>`
              : '';
          return `<div class="tree-node" data-id="${node.id}" data-type="${node.type}">
            <div class="tree-row ${selected ? 'selected' : ''}" data-select="${node.id}" data-project="${isProject ? node.id : ''}">
              ${toggle}
              <span class="tree-icon">${icon}</span>
              <span class="tree-label">${escapeHtml(node.name)}</span>
            </div>
            ${children}
          </div>`;
        })
        .join('');
    }

    els.projectTree.innerHTML = renderNodes(projects, 0);

    els.projectTree.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-toggle');
        if (!id) return;
        const expanded = new Set(projectsData.expandedIds);
        if (expanded.has(id)) expanded.delete(id);
        else expanded.add(id);
        void api.setExpanded(Array.from(expanded)).then((data) => {
          projectsData = data;
          renderTree();
        });
      });
    });

    els.projectTree.querySelectorAll('[data-select]').forEach((row) => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-select');
        const projectId = row.getAttribute('data-project');
        if (!id) return;

        const project = projectsData.projects.find((p) => p.id === id);
        const targetProjectId = projectId || (project?.type === 'project' ? id : null);

        void api.selectProject(targetProjectId).then((data) => {
          projectsData = data;
          renderTree();
          if (project?.type === 'project' && project.url) {
            const webview = els.webviews.work;
            if (webview) webview.src = project.url;
          }
        });
      });
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function openDialog(mode, projectId, parentFolderId) {
    dialogState = { mode, projectId, parentFolderId: parentFolderId ?? null };
    const isProject = mode === 'project';
    els.dialogTitle.textContent = isProject ? 'New Project' : 'New Folder';
    els.dialogHint.textContent = isProject
      ? 'Projects help you organize files and workflows.'
      : 'Folders live inside the selected project.';
    els.dialogInput.value = '';
    els.dialogBackdrop.classList.add('open');
    els.dialogInput.focus();
  }

  function closeDialog() {
    dialogState = null;
    els.dialogBackdrop.classList.remove('open');
  }

  async function confirmDialog() {
    const name = els.dialogInput.value.trim();
    if (!name || !dialogState) return;

    try {
      if (dialogState.mode === 'project') {
        projectsData = await api.createProject(name);
      } else if (dialogState.projectId) {
        projectsData = await api.createFolder(
          dialogState.projectId,
          dialogState.parentFolderId ?? null,
          name,
        );
      }
      renderTree();
      closeDialog();
    } catch (err) {
      console.error(err);
    }
  }

  async function init() {
    const platform = await api.getPlatform();
    if (platform === 'darwin') {
      document.body.classList.add('platform-darwin');
    }

    tabPaths = await api.getTabPaths();
    projectsData = await api.getProjects();

    const origin = (await api.getWebBaseUrl()).replace(/\/$/, '');
    /** @type {IdeTab[]} */
    const tabs = ['work', 'chat', 'orchestrations'];
    for (const tab of tabs) {
      els.webviews[tab].src = `${origin}${tabPaths[tab]}`;
    }

    renderTree();
    setActiveTab('work');

    els.tabs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = /** @type {IdeTab} */ (btn.dataset.tab);
        if (tab) setActiveTab(tab);
      });
    });

    els.btnNewProject.addEventListener('click', () => openDialog('project'));
    els.btnNewFolder.addEventListener('click', () => {
      const projectId = projectsData.selectedProjectId || projectsData.projects[0]?.id;
      if (!projectId) {
        openDialog('project');
        return;
      }
      openDialog('folder', projectId, null);
    });

    els.dialogCancel.addEventListener('click', closeDialog);
    els.dialogConfirm.addEventListener('click', () => void confirmDialog());
    els.dialogInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') void confirmDialog();
      if (e.key === 'Escape') closeDialog();
    });
    els.dialogBackdrop.addEventListener('click', (e) => {
      if (e.target === els.dialogBackdrop) closeDialog();
    });

    api.onNavigate((payload) => {
      const tab = payload.tab || tabForPath(payload.path);
      setActiveTab(tab, { path: payload.path });
    });

    api.onProjectsChanged((data) => {
      projectsData = data;
      renderTree();
    });
  }

  void init();
})();
