/* One catalog shared by project buttons and the writeups collection. Paths are site-relative. */
(() => {
  const siteRoot = new URL('../', document.currentScript.src);
  const catalog = [
    { project: 'NO RAIL', documents: [
      { title: 'NO RAIL — System and Level Design Master Document', file: 'NORAIL System and Level Design Master Doc.pdf' }
    ] },
    { project: 'AI Movement', category: 'AI Projects', documents: [
      { title: 'AI Movement — Process Letter', file: 'Process Letter AI Movement.pdf' }
    ] },
    { project: 'Pathfinding', category: 'AI Projects', documents: [
      { title: 'Pathfinding — Process Letter', file: 'Process Letter Pathfinding.pdf' }
    ] },
    { project: 'Decision Making', category: 'AI Projects', documents: [
      { title: 'Decision Making — Process Letter', file: 'Process Letter Decision-Making.pdf' }
    ] },
    { project: 'Rockin Derby', listOnCard: true, documents: [
      { title: 'Controller Documentation', file: 'Rockin Derby Controller Doc.pdf' },
      { title: 'Prototype — Dev Diary', file: 'Alt Control Prototype Dev Diary.pdf' },
      { title: 'Sprint 1 — Dev Diary', file: 'Alt Control Sprint 1 Dev Diary.pdf' },
      { title: 'Sprint 2 — Dev Diary', file: 'Alt Control Sprint 2 Dev Diary.pdf' },
      { title: 'Sprint 3 — Dev Diary', file: 'Alt Control Sprint 3 Dev Diary.pdf' },
      { title: 'Sprint 4 — Dev Diary', file: 'Alt Control Sprint 4 Dev Diary.pdf' }
    ] },
    { project: 'Graphics Engine Development', documents: [
      { title: 'Flappy Squirrel — Final Project Write-Up', file: 'finalprojectwriteup.pdf' },
      { title: 'Engine Audio, Collision, and Physics Systems', file: 'enginesystemwriteup.pdf' }
    ] },
    { project: 'Castle of Cardboard', listOnCard: true, documents: [
      { title: 'Enemy Technical Documentation', file: 'CoC Enemy Tech Doc.pdf' },
      { title: 'Development Diary', file: 'Castle of Cardboard DEV Diary.pdf' }
    ] },
    { project: 'Squirrel Souls', documents: [
      { title: 'State Pattern Code Analysis', file: 'SquirrelSoulsAnalysisState.pdf' },
      { title: 'Type Object Pattern Code Analysis', file: 'SquirrelSoulAnalysisTpyeObject.pdf' },
      { title: 'Behavior Tree Code Analysis', file: 'SquirrelSoulAnalysisBT.pdf' }
    ] },
    { project: 'Pet Fish Simulator', documents: [
      { title: 'Procedural Generation Code Analysis', file: 'Code Analysis Pet Fish.pdf' }
    ] },
    { project: 'Tetris', documents: [
      { title: 'Tetris Architecture Code Analysis', file: 'Tetris Code Analysis.pdf' },
      { title: 'Command Pattern and Undo/Redo Analysis', file: 'Tetris with Command pattern Code Analysis .pdf' }
    ] },
    { project: 'Weapon Wheel & Gadget System', documents: [
      { title: 'Weapon Wheel Code Analysis', file: 'Code Analysis Weapon Wheel.pdf' }
    ] }
  ];
  const pdfURL = doc => new URL(`pdfs/${encodeURIComponent(doc.file)}`, siteRoot).href;
  const element = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  };
  const pdfLink = (doc, text, download = false) => {
    const link = element('a', 'btn btn-ghost', text);
    link.href = pdfURL(doc);
    if (download) link.download = doc.file;
    else { link.target = '_blank'; link.rel = 'noopener'; }
    return link;
  };
  const openViewer = (group, selected = 0) => {
    if (document.querySelector('.pdf-overlay')) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const overlay = element('div', 'modal-overlay pdf-overlay');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'pdf-project-title');
    const panel = element('div', 'pdf-panel');
    const header = element('div', 'pdf-header');
    const title = element('h2', '', group.project);
    title.id = 'pdf-project-title';
    const subtitle = element('p', 'pdf-document-title');
    const closeButton = element('button', 'modal-close', '×');
    closeButton.setAttribute('aria-label', 'Close PDF viewer');
    const controls = element('div', 'pdf-controls');
    const label = element('label', '', 'Document');
    const select = element('select', 'pdf-select');
    select.id = 'pdf-document-choice';
    label.htmlFor = select.id;
    group.documents.forEach((doc, i) => {
      const option = element('option', '', doc.title);
      option.value = String(i);
      select.append(option);
    });
    select.value = String(selected);
    if (group.documents.length > 1) controls.append(label, select);
    const actions = element('div', 'pdf-actions');
    const fallback = element('p', 'pdf-fallback', 'PDF not displaying on your device? Use Open PDF to read it in a new tab.');
    const frame = element('iframe', 'pdf-frame');
    const showDocument = () => {
      const doc = group.documents[Number(select.value)];
      subtitle.textContent = doc.title;
      frame.title = `${group.project}: ${doc.title}`;
      frame.src = `${pdfURL(doc)}#view=FitH`;
      actions.replaceChildren(pdfLink(doc, 'Open PDF ↗'), pdfLink(doc, 'Download PDF ↓', true));
    };
    select.addEventListener('change', showDocument);
    showDocument();
    header.append(title, subtitle, controls, actions, fallback, closeButton);
    panel.append(header, frame);
    overlay.append(panel);
    document.body.append(overlay);
    document.body.style.overflow = 'hidden';
    let closed = false;
    const close = () => {
      if (closed) return;
      closed = true;
      document.removeEventListener('keydown', onKey, true);
      overlay.remove();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
    const onKey = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      }
      if (event.key === 'Tab') {
        const focusable = [...panel.querySelectorAll('button, a, select, iframe')];
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    closeButton.addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    requestAnimationFrame(() => overlay.classList.add('open'));
    closeButton.focus();
  };
  const viewerButton = (group, index, text) => {
    const button = element('button', 'btn btn-ghost', text);
    button.type = 'button';
    button.addEventListener('click', () => openViewer(group, index));
    return button;
  };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.showcase-card').forEach(card => {
      const project = card.querySelector('.showcase-title')?.textContent.trim();
      const group = catalog.find(item => !item.unassigned && item.project === project);
      if (!group) return;
      let actions = card.querySelector('.showcase-links');
      if (!actions) { actions = element('div', 'showcase-links'); card.querySelector('.showcase-body').append(actions); }
      const button = viewerButton(group, 0, 'Technical Analysis →');
      button.dataset.analysisProject = project;
      actions.append(button);
      if (group.listOnCard) {
        const documents = element('div', 'showcase-desc');
        documents.append(element('strong', '', 'Documentation & Dev Diaries'));
        const list = element('ul', 'project-systems-list');
        group.documents.forEach((doc, index) => {
          const item = element('li');
          const documentButton = viewerButton(group, index, doc.title);
          documentButton.dataset.analysisProject = project;
          documentButton.dataset.analysisIndex = String(index);
          item.append(documentButton);
          list.append(item);
        });
        documents.append(list);
        actions.before(documents);
      }
    });
    // Delegation also handles buttons cloned into the existing project popup.
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-analysis-project]');
      if (!button || !button.closest('.modal-panel')) return;
      const group = catalog.find(item => item.project === button.dataset.analysisProject);
      if (group) openViewer(group, Number(button.dataset.analysisIndex || 0));
    });
    const collection = document.getElementById('writeups-collection');
    if (!collection) return;
    const sections = new Map();
    catalog.forEach(group => {
      const heading = group.category || group.project;
      let section = sections.get(heading);
      if (!section) {
        section = element('section', 'writeup-group');
        section.append(element('h2', '', heading));
        sections.set(heading, section);
        collection.append(section);
      }
      group.documents.forEach((doc, index) => {
        const article = element('article', 'writeup-document');
        const details = element('div');
        details.append(element('h3', '', doc.title), element('p', '', group.unassigned ? doc.file : group.project));
        const actions = element('div', 'showcase-links');
        actions.append(viewerButton(group, index, 'View PDF →'), pdfLink(doc, 'Open in New Tab ↗'));
        article.append(details, actions);
        section.append(article);
      });
    });
  });
})();
