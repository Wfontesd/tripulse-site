function renderMain() {
  let screen = '';
  if (state.tab === 'home') screen = renderHome();
  if (state.tab === 'roadmap') screen = renderRoadmap();
  if (state.tab === 'assistant') screen = renderAssistant();
  if (state.tab === 'vault') screen = renderVault();
  if (state.tab === 'profile') screen = renderProfile();
  return `${screen}${renderNav()}`;
}

function renderHome() {
  const name = state.profile.firstName || 'toi';
  const activeTask = tasks.find(task => !state.completed.includes(task.id)) || tasks[0];
  const pct = Math.min(92, 22 + state.completed.length * 11);
  return `<section class="screen with-nav">
    <div class="dashboard-head">${brand(true)}<button class="avatar" data-action="tab" data-value="profile">${escapeHtml(name.slice(0,1).toUpperCase())}</button></div>
    <div class="greeting-row"><div><h1 class="greeting">Salut ${escapeHtml(name)} 👋</h1><p class="greeting-sub">Voilà la prochaine chose utile à faire.</p></div><span class="level">NIV. 2</span></div>
    <div class="progress-card"><div class="progress-card-head"><div><span class="progress-label">TON INDÉPENDANCE</span><strong class="progress-value">${pct}%</strong></div><span class="xp">+${120 + state.completed.length * 50} XP</span></div>${progress(pct / 100)}<p class="progress-hint">${state.completed.length ? `${state.completed.length} démarche${state.completed.length > 1 ? 's' : ''} terminée${state.completed.length > 1 ? 's' : ''}.` : 'Complète ta première démarche pour avancer.'}</p></div>
    <button class="next-card" data-action="open-task" data-value="${activeTask.id}"><div class="next-card-head">${pill('PROCHAINE ÉTAPE', 'lime')}<span class="next-duration">${activeTask.duration}</span></div><h2 class="next-title">${escapeHtml(activeTask.title)}</h2><p class="next-subtitle">${escapeHtml(activeTask.subtitle)}</p><div class="next-card-foot"><span class="next-when">⏱ ${escapeHtml(activeTask.timing)}</span><span class="next-arrow">→</span></div></button>
    <div class="quick-grid">
      ${quick('📷', 'Comprendre un courrier', 'Scan factice', 'fake-scan')}
      ${quick('✦', 'Poser une question', 'Assistant contextuel', 'tab', 'assistant')}
      ${quick('📁', 'Voir mes papiers', '2 documents manquent', 'tab', 'vault')}
    </div>
    <div class="section-head"><h2 class="section-title">Ta roadmap</h2><button class="link-btn" data-action="tab" data-value="roadmap">Tout voir</button></div>
    <div class="task-list">${tasks.slice(0,4).map(renderTaskRow).join('')}</div>
    <div class="safety-card"><span class="safety-icon">✓</span><div><span class="safety-title">TutoVie ne remplace pas les organismes.</span><span class="safety-text">L’app t’oriente, prépare tes pièces et renvoie vers la source officielle pour confirmer.</span></div></div>
  </section>`;
}

function quick(emoji, title, caption, action, value = '') {
  return `<button class="quick-card" data-action="${action}" ${value ? `data-value="${value}"` : ''}><span class="quick-emoji">${emoji}</span><span class="quick-title">${title}</span><span class="quick-caption">${caption}</span></button>`;
}

function renderTaskRow(task) {
  const done = state.completed.includes(task.id);
  return `<button class="task-row${done ? ' done' : ''}" data-action="open-task" data-value="${task.id}"><span class="task-check" data-action="toggle-task" data-value="${task.id}">${done ? '✓' : ''}</span><span class="task-copy"><span class="task-title">${escapeHtml(task.title)}</span><span class="task-meta">${task.category} · ${task.duration}</span></span><span class="chevron">›</span></button>`;
}

function renderRoadmap() {
  const categories = ['Logement', 'Aides', 'Documents', 'Santé', 'Impôts'];
  const chips = categories.map(category => {
    const subset = tasks.filter(task => task.category === category);
    const done = subset.filter(task => state.completed.includes(task.id)).length;
    return `<span class="category-chip">${category} <b>${done}/${subset.length}</b></span>`;
  }).join('');
  const timeline = tasks.map((task, index) => {
    const done = state.completed.includes(task.id);
    const priority = task.priority === 'urgent' ? ['À FAIRE MAINTENANT','warning'] : task.priority === 'soon' ? ['À ANTICIPER',''] : ['PLUS TARD','neutral'];
    return `<div class="timeline-row"><div class="timeline-rail"><button class="timeline-dot${done ? ' done' : ''}" data-action="toggle-task" data-value="${task.id}">${done ? '✓' : index + 1}</button>${index < tasks.length - 1 ? `<span class="timeline-line${done ? ' done' : ''}"></span>` : ''}</div><button class="timeline-card${done ? ' done' : ''}" data-action="open-task" data-value="${task.id}"><div class="timeline-card-head">${pill(priority[0], priority[1])}<span class="timeline-duration">${task.duration}</span></div><h3 class="timeline-title">${escapeHtml(task.title)}</h3><p class="timeline-text">${escapeHtml(task.subtitle)}</p><p class="timeline-when">${escapeHtml(task.timing)}</p></button></div>`;
  }).join('');
  return `<section class="screen with-nav"><div class="tab-intro"><p class="eyebrow">TON PARCOURS</p><h1 class="title small">Tout, dans le bon ordre.</h1><p class="subtitle">Les étapes s’adaptent à ta situation. Tu gardes toujours le contrôle.</p></div><div class="category-strip">${chips}</div><div>${timeline}</div></section>`;
}

function renderAssistant() {
  const messages = state.messages.map(message => `<div class="message ${message.role}">${escapeHtml(message.text)}${message.source ? `<span class="message-source">${escapeHtml(message.source)}</span>` : ''}</div>`).join('');
  const suggestionHtml = state.messages.length === 1 ? `<div class="suggestions">${suggestions.map(text => `<button class="suggestion" data-action="assistant-suggest" data-value="${escapeHtml(text)}">${escapeHtml(text)}</button>`).join('')}</div>` : '';
  return `<section class="screen with-nav assistant-screen"><div class="assistant-head"><div><h1 class="assistant-title">Assistant TutoVie</h1><p class="assistant-status">● Démo locale</p></div><div class="assistant-spark">✦</div></div><div class="chat"><div class="context-banner"><b>Je connais ton parcours</b><span>Premier logement · ${escapeHtml(state.profile.city || 'Lyon')} · démarches prioritaires</span></div>${messages}${suggestionHtml}</div><div class="composer-wrap"><div class="composer"><input id="assistant-input" class="field" placeholder="Ex. J’ai trouvé un appart…"><button class="send-btn" data-action="assistant-send">↑</button></div><p class="ai-note">L’IA peut se tromper. Les démarches importantes doivent être confirmées sur la source affichée.</p></div></section>`;
}

function renderVault() {
  const ready = documents.filter(doc => doc.status === 'ready').length;
  const rows = documents.map(doc => {
    const label = doc.status === 'ready' ? 'PRÊT' : doc.status === 'expires' ? 'À VÉRIFIER' : 'MANQUANT';
    const tone = doc.status === 'ready' ? 'success' : doc.status === 'expires' ? 'warning' : 'neutral';
    const icon = doc.status === 'ready' ? '✓' : doc.status === 'expires' ? '!' : '+';
    return `<button class="document-row" data-action="document-info" data-value="${doc.id}"><span class="document-status ${doc.status}">${icon}</span><span class="document-copy"><span class="document-title">${escapeHtml(doc.label)}</span><span class="document-hint">${escapeHtml(doc.hint)}</span></span>${pill(label,tone)}</button>`;
  }).join('');
  return `<section class="screen with-nav"><div class="tab-intro"><p class="eyebrow">TON COFFRE</p><h1 class="title small">Tes papiers, enfin retrouvables.</h1><p class="subtitle">La V1 stockera les fichiers localement ou dans un espace chiffré, selon le mode choisi.</p></div><div class="vault-summary"><span class="vault-label">DOSSIER DE BASE</span><strong class="vault-value">${ready}/${documents.length} prêts</strong><span class="vault-icon">▣</span>${progress(ready/documents.length)}</div>${primary('＋&nbsp; Ajouter un document','fake-upload')}<div class="section-head"><h2 class="section-title">Documents utiles</h2></div><div class="document-list">${rows}</div><div class="encryption-card"><b>⌁</b><div><strong>Confidentialité prévue dès la conception</strong><span>Chiffrement, suppression, durée de conservation et contrôle des accès devront être explicites avant la bêta réelle.</span></div></div></section>`;
}

function renderProfile() {
  const p = state.profile;
  const housing = housingOptions.find(option => option.id === p.housingStatus)?.label || 'Non renseigné';
  return `<section class="screen with-nav"><div class="profile-hero"><div class="profile-avatar">${escapeHtml((p.firstName || 'T').slice(0,1).toUpperCase())}</div><h1 class="profile-name">${escapeHtml(p.firstName || 'Profil démo')}</h1><p class="profile-meta">${p.age ? `${escapeHtml(p.age)} ans` : 'Âge non renseigné'} · ${escapeHtml(p.city || 'Ville non renseignée')}</p>${pill('PARCOURS EN COURS','lime')}</div><div class="section-head"><h2 class="section-title">Ta situation</h2></div><div class="profile-card">${profileRow('Logement',housing)}${profileRow('Priorités',`${p.goals.length || 1} sélectionnée${p.goals.length > 1 ? 's' : ''}`)}${profileRow('Démarches terminées',String(state.completed.length))}</div><div class="section-head"><h2 class="section-title">Réglages préparés</h2></div><div class="profile-card">${profileRow('Notifications utiles','Activées')}${profileRow('Stockage des documents','Mode démo')}${profileRow('Sources officielles','Toujours affichées')}</div><div class="demo-banner"><strong>Prototype interactif</strong><span>La connexion, le scanner, l’IA et les notifications sont simulés. Les parcours et interactions principales sont fonctionnels.</span></div>${secondary('Réinitialiser la démo','reset-demo')}<p class="version">TutoVie 0.1.0 · Expo SDK 57</p></section>`;
}

function profileRow(label,value) { return `<div class="profile-row"><b>${escapeHtml(label)}</b><span>${escapeHtml(value)}</span></div>`; }

function renderNav() {
  const items = [['home','⌂','Accueil'],['roadmap','✓','Parcours'],['assistant','✦','Assistant'],['vault','▣','Coffre'],['profile','●','Profil']];
  return `<nav class="bottom-nav" aria-label="Navigation principale">${items.map(([id,icon,label]) => `<button class="nav-item${state.tab === id ? ' active' : ''}" data-action="tab" data-value="${id}" aria-current="${state.tab === id ? 'page' : 'false'}"><span class="nav-icon">${icon}</span><span class="nav-label">${label}</span></button>`).join('')}</nav>`;
}

function renderTaskModal(task) {
  if (!task) return '';
  const done = state.completed.includes(task.id);
  return `<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="${escapeHtml(task.title)}"><button class="modal-dismiss" data-action="close-task" aria-label="Fermer"></button><div class="sheet"><div class="sheet-handle"></div><div class="sheet-top">${pill(task.category.toUpperCase(), task.priority === 'urgent' ? 'warning' : '')}<button class="icon-btn" data-action="close-task" aria-label="Fermer">×</button></div><h2 class="sheet-title">${escapeHtml(task.title)}</h2><p class="sheet-subtitle">${escapeHtml(task.subtitle)}</p><div class="sheet-facts"><div class="fact"><small>TEMPS</small><b>${task.duration}</b></div><div class="fact"><small>QUAND</small><b>${escapeHtml(task.timing)}</b></div></div><section class="detail"><h3>Pourquoi ?</h3><p>${escapeHtml(task.why)}</p></section><section class="detail"><h3>À préparer</h3><div class="bullet-list">${task.documents.map(doc => `<span class="bullet-item">${escapeHtml(doc)}</span>`).join('')}</div></section><section class="detail"><h3>Pas à pas</h3><div class="step-list">${task.steps.map((step,index) => `<span class="step-item"><b class="step-num">${index+1}</b><span>${escapeHtml(step)}</span></span>`).join('')}</div></section><a class="source-card" href="${task.sourceUrl}" target="_blank" rel="noopener"><span class="source-icon">↗</span><span class="source-copy"><small>SOURCE OFFICIELLE</small><b>${escapeHtml(task.sourceLabel)}</b></span><span class="chevron">›</span></a>${primary(done ? '↺&nbsp; Marquer comme à faire' : '✓&nbsp; C’est fait','modal-toggle-task',`data-value="${task.id}"`)}<p class="sheet-note">Dans la version réelle, la date de dernière vérification de chaque source sera affichée.</p></div></div>`;
}
