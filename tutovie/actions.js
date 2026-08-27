function bindInputs() {
  app.querySelectorAll('[data-field]').forEach(input => input.addEventListener('input', event => {
    const key = event.currentTarget.dataset.field;
    let value = event.currentTarget.value;
    if (key === 'age') value = value.replace(/\D/g,'').slice(0,2);
    state.profile[key] = value;
    saveState();
  }));
  const email = app.querySelector('#auth-email');
  if (email) email.addEventListener('input', event => { state.profile.email = event.currentTarget.value; saveState(); });
  const assistant = app.querySelector('#assistant-input');
  if (assistant) assistant.addEventListener('keydown', event => { if (event.key === 'Enter') sendAssistant(); });
}

function validOnboardingStep() {
  const p = state.profile;
  if (state.onboardingStep === 0) return p.firstName.trim().length > 1 && p.age.trim() && p.city.trim().length > 1;
  if (state.onboardingStep === 1) return Boolean(p.housingStatus);
  if (state.onboardingStep === 3) return p.goals.length > 0;
  return true;
}

function toggleArray(key,value) {
  const arr = state.profile[key];
  state.profile[key] = arr.includes(value) ? arr.filter(item => item !== value) : [...arr,value];
}

function toggleTask(id, close = false) {
  const done = state.completed.includes(id);
  state.completed = done ? state.completed.filter(item => item !== id) : [...state.completed,id];
  if (!done) { launchConfetti(); showToast('Étape terminée. +50 XP adulte.'); }
  if (close) state.selectedTask = null;
  render();
}

function sendAssistant(text) {
  const input = app.querySelector('#assistant-input');
  const value = (text || input?.value || '').trim();
  if (!value) return;
  state.messages.push({ id: `u-${Date.now()}`, role: 'user', text: value });
  render();
  clearTimeout(assistantTimer);
  assistantTimer = setTimeout(() => {
    state.messages.push({ id: `a-${Date.now()}`, role: 'bot', text: "Dans ce prototype, je commencerais par vérifier ta situation logement, puis je te proposerais une checklist sourcée. Le moteur réel devra rechercher la règle officielle à jour et afficher sa date de vérification.", source: 'Réponse de démonstration · source officielle à brancher' });
    render();
  }, 650);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastRegion.replaceChildren(toast);
  setTimeout(() => toast.remove(), 2600);
}

function launchConfetti() {
  const palette = ['#6c4dff','#c9f36a','#ffd8c7','#70c7ff','#ffffff'];
  for (let i=0;i<28;i++) {
    const node = document.createElement('i');
    node.className = 'confetti';
    node.style.left = `${8 + Math.random()*84}vw`;
    node.style.background = palette[i % palette.length];
    node.style.setProperty('--x', `${(Math.random()-.5)*180}px`);
    node.style.animationDelay = `${Math.random()*.25}s`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 1900);
  }
}

app.addEventListener('click', event => {
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const value = target.dataset.value;
  if (action === 'start-auth') { state.stage = 'auth'; render(); }
  if (action === 'start-demo') { state.stage = 'onboarding'; render(); }
  if (action === 'go-welcome') { state.stage = 'welcome'; render(); }
  if (action === 'auth-continue') {
    const email = state.profile.email.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return showToast('Entre une adresse e-mail valide pour continuer.');
    state.stage = 'onboarding'; render();
  }
  if (action === 'social-login') { state.profile.email ||= 'demo@tutovie.app'; state.stage = 'onboarding'; showToast('Connexion simulée.'); render(); }
  if (action === 'onboarding-back') {
    if (state.onboardingStep === 0) state.stage = 'welcome'; else state.onboardingStep--;
    render();
  }
  if (action === 'onboarding-next') {
    if (!validOnboardingStep()) return showToast('Complète cette étape pour continuer.');
    if (state.onboardingStep === 3) state.stage = 'generating'; else state.onboardingStep++;
    render();
  }
  if (action === 'choose-housing') { state.profile.housingStatus = value; render(); }
  if (action === 'toggle-flag') { toggleArray('flags',value); render(); }
  if (action === 'toggle-goal') { toggleArray('goals',value); render(); }
  if (action === 'tab') { state.tab = value; state.selectedTask = null; render(); }
  if (action === 'open-task') { state.selectedTask = value; render(); }
  if (action === 'close-task') { state.selectedTask = null; render(); }
  if (action === 'toggle-task') { event.stopPropagation(); toggleTask(value); }
  if (action === 'modal-toggle-task') toggleTask(value,true);
  if (action === 'fake-scan') showToast('Caméra et analyse IA préparées — fonction simulée dans cette V1.');
  if (action === 'fake-upload') showToast('Sélecteur de fichiers et chiffrement à connecter.');
  if (action === 'document-info') {
    const doc = documents.find(item => item.id === value);
    showToast(`${doc.label} — ${doc.hint}`);
  }
  if (action === 'assistant-suggest') sendAssistant(value);
  if (action === 'assistant-send') sendAssistant();
  if (action === 'reset-demo') {
    if (confirm('Réinitialiser toutes les données locales de démonstration ?')) {
      localStorage.removeItem(STORAGE_KEY);
      state = structuredClone(initialState);
      render();
    }
  }
});

setTimeout(render, 450);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
