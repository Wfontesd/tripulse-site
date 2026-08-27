function renderWelcome() {
  return `<section class="screen welcome">
    <div class="topbar">${brand()}</div>
    <div class="hero-visual" aria-hidden="true">
      <div class="floating-card one"><b>🏠</b><span>Premier appart</span></div>
      <div class="floating-card two"><b>💸</b><span>Aides à vérifier</span></div>
      <div class="floating-card three"><b>📁</b><span>Papiers carrés</span></div>
      <div class="hero-orb">?</div>
    </div>
    <div class="hero-copy">
      ${pill('LE MODE D’EMPLOI QUI MANQUAIT', 'lime')}
      <h1 class="title">La vie adulte aurait dû avoir un tuto.</h1>
      <p class="subtitle">Logement, aides, papiers, santé : TutoVie te dit quoi faire, dans quel ordre, et où trouver la bonne source.</p>
    </div>
    <div class="welcome-actions">
      ${primary('Créer mon parcours&nbsp; →', 'start-auth')}
      ${secondary('Tester sans compte', 'start-demo')}
      <p class="privacy-note">Démo locale : aucune donnée n’est envoyée.</p>
    </div>
  </section>`;
}

function renderAuth() {
  return `<section class="screen">
    <div class="topbar"><button class="btn ghost" data-action="go-welcome">← Retour</button>${brand(true)}</div>
    <div class="auth-intro">
      <p class="eyebrow">CONNEXION</p>
      <h1 class="title">Ton parcours, retrouvé partout.</h1>
      <p class="subtitle">L’authentification est simulée. L’interface est prête pour Supabase, Firebase ou Clerk.</p>
    </div>
    <div class="card auth-card">
      <label class="field-group"><span class="field-label">Adresse e-mail</span><input id="auth-email" class="field" type="email" autocomplete="email" placeholder="prenom@ecole.fr" value="${escapeHtml(state.profile.email)}"></label>
      ${primary('Recevoir mon lien magique', 'auth-continue')}
      <div class="divider-row">ou</div>
      ${secondary('<b>G</b>&nbsp; Continuer avec Google', 'social-login')}
      ${secondary('●&nbsp; Continuer avec Apple', 'social-login')}
    </div>
    <p class="legal">Aucun mot de passe réel n’est traité dans ce prototype.</p>
  </section>`;
}

function renderOnboarding() {
  const step = state.onboardingStep;
  const p = state.profile;
  let body = '';
  if (step === 0) body = `<p class="eyebrow">D’ABORD, TOI</p><h1 class="title">On fait connaissance ?</h1><p class="subtitle">Juste assez d’infos pour éviter les conseils génériques.</p>
    <div class="form-stack">
      <label class="field-group"><span class="field-label">Ton prénom</span><input class="field" data-field="firstName" placeholder="Lina" autocomplete="given-name" value="${escapeHtml(p.firstName)}"></label>
      <div class="form-row">
        <label class="field-group"><span class="field-label">Ton âge</span><input class="field" data-field="age" inputmode="numeric" maxlength="2" placeholder="19" value="${escapeHtml(p.age)}"></label>
        <label class="field-group"><span class="field-label">Ta ville d’études</span><input class="field" data-field="city" placeholder="Lyon" value="${escapeHtml(p.city)}"></label>
      </div>
    </div>`;
  if (step === 1) body = `<p class="eyebrow">TON LOGEMENT</p><h1 class="title">Tu en es où ?</h1><p class="subtitle">Le bon ordre des démarches dépend surtout de cette étape.</p>
    <div class="choice-stack">${housingOptions.map(option => choice(option, p.housingStatus === option.id, 'choose-housing')).join('')}</div>`;
  if (step === 2) body = `<p class="eyebrow">TA SITUATION</p><h1 class="title">Qu’est-ce qui te concerne ?</h1><p class="subtitle">Tu peux passer cette étape. On ajustera plus tard.</p>
    <div class="choice-stack">${flagOptions.map(option => choice(option, p.flags.includes(option.id), 'toggle-flag', true)).join('')}</div>`;
  if (step === 3) body = `<p class="eyebrow">TON OBJECTIF</p><h1 class="title">Tu veux régler quoi en premier ?</h1><p class="subtitle">Choisis une ou plusieurs priorités. TutoVie construira ta roadmap.</p>
    <div class="choice-stack">${goalOptions.map(option => choice(option, p.goals.includes(option.id), 'toggle-goal')).join('')}</div>`;
  return `<section class="screen">
    <div class="onboarding-head"><button class="btn ghost" data-action="onboarding-back">← ${step === 0 ? 'Accueil' : 'Retour'}</button><span class="step-count">${step + 1}/4</span></div>
    ${progress((step + 1) / 4)}
    <div class="onboarding-body">${body}</div>
    <div class="onboarding-action">${primary(step === 3 ? 'Créer mon TutoVie' : 'Continuer', 'onboarding-next')}</div>
  </section>`;
}

function choice(option, selected, action, compact = false) {
  return `<button class="choice-card${selected ? ' selected' : ''}${compact ? ' compact' : ''}" data-action="${action}" data-value="${option.id}" aria-pressed="${selected}">
    ${option.emoji ? `<span class="choice-emoji">${option.emoji}</span>` : ''}
    <span class="choice-copy"><span class="choice-title">${escapeHtml(option.label)}</span>${option.caption ? `<span class="choice-caption">${escapeHtml(option.caption)}</span>` : ''}</span>
    <span class="choice-check">${selected ? '✓' : ''}</span>
  </button>`;
}

function renderGenerating() {
  return `<section class="screen"><div class="generator">
    <div class="generator-orb">✦</div>
    <h1 class="title small">On prépare ton tuto.</h1>
    <p id="generator-label" class="generator-label">On comprend ta situation…</p>
    <div class="progress-track"><div id="generator-progress" class="progress-fill" style="width:4%"></div></div>
    <p class="generator-note">Sources officielles · étapes personnalisées · validation humaine</p>
  </div></section>`;
}

function startGenerator() {
  const label = app.querySelector('#generator-label');
  const bar = app.querySelector('#generator-progress');
  const phases = [
    [500, 'On vérifie les étapes utiles…', '34%'],
    [1150, 'On met les démarches dans le bon ordre…', '68%'],
    [1850, 'Ta roadmap est prête.', '100%']
  ];
  phases.forEach(([delay, text, width]) => setTimeout(() => { if (label) label.textContent = text; if (bar) bar.style.width = width; }, delay));
  generatorTimer = setTimeout(() => { state.stage = 'app'; state.tab = 'home'; render(); }, 2350);
}
