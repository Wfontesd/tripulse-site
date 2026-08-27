'use strict';

const STORAGE_KEY = 'tutovie.webdemo.v1';
const app = document.getElementById('app-shell');
const toastRegion = document.getElementById('toast-region');
let generatorTimer = null;
let assistantTimer = null;

const housingOptions = [
  { id: 'parents', emoji: '🏠', label: 'Chez mes parents', caption: 'Je prépare mon départ' },
  { id: 'searching', emoji: '🔎', label: 'Je cherche', caption: 'Premier appart ou coloc' },
  { id: 'tenant', emoji: '🔑', label: 'Déjà en location', caption: 'Je veux tout mettre au carré' },
  { id: 'residence', emoji: '🏢', label: 'En résidence', caption: 'Crous, foyer ou résidence privée' }
];

const flagOptions = [
  { id: 'boursier', label: 'Je suis boursier·e' },
  { id: 'international', label: 'Étudiant·e international·e' },
  { id: 'revenu', label: "J'ai un revenu étudiant" },
  { id: 'sans-garant', label: "Je n'ai pas de garant" },
  { id: 'premiere-declaration', label: "Je n'ai jamais déclaré mes impôts" }
];

const goalOptions = [
  { id: 'housing', emoji: '🛋️', label: 'Trouver mon appart', caption: 'Budget, dossier, garant et bail' },
  { id: 'benefits', emoji: '💸', label: 'Faire le point sur mes aides', caption: 'Savoir où vérifier et quoi préparer' },
  { id: 'documents', emoji: '📁', label: 'Mettre mes papiers au carré', caption: 'Savoir quoi garder et retrouver vite' },
  { id: 'health', emoji: '🩺', label: 'Comprendre santé et impôts', caption: 'Ameli, mutuelle, première déclaration' },
  { id: 'moving', emoji: '📦', label: 'Préparer mon départ', caption: 'Toutes les démarches dans le bon ordre' }
];

const tasks = [
  {
    id: 'housing-budget', title: 'Calcule ton vrai budget logement', subtitle: "Ne te fie pas qu'au montant du loyer.",
    category: 'Logement', duration: '4 min', timing: 'Avant de contacter des propriétaires', priority: 'urgent',
    why: "Un logement implique aussi les charges, l'assurance, l'énergie, internet, le dépôt et parfois les transports.",
    documents: ['Revenus mensuels', 'Aides déjà connues', 'Dépenses fixes'],
    steps: ['Indique ce que tu reçois chaque mois.', 'Ajoute tes dépenses fixes et ton budget de vie.', 'Garde une marge pour les dépenses imprévues.', 'Utilise le résultat comme plafond de recherche.'],
    sourceLabel: 'ANIL — information logement', sourceUrl: 'https://www.anil.org/'
  },
  {
    id: 'visale', title: 'Vérifie Visale avant de signer', subtitle: 'Une garantie gratuite peut remplacer un garant classique.',
    category: 'Logement', duration: '12 min', timing: 'Avant la signature du bail', priority: 'urgent',
    why: "Le visa doit être préparé assez tôt pour être présenté au bailleur avant la mise en place du cautionnement.",
    documents: ["Pièce d'identité", 'Justificatif de situation', 'Informations sur les ressources'],
    steps: ['Vérifie ton éligibilité sur le site officiel.', 'Crée ton espace et dépose les justificatifs demandés.', 'Télécharge le visa une fois validé.', 'Transmets-le au bailleur avant la signature.'],
    sourceLabel: 'Visale — site officiel', sourceUrl: 'https://www.visale.fr/'
  },
  {
    id: 'rental-file', title: 'Prépare un dossier locatif propre', subtitle: 'Un dossier complet évite les allers-retours.',
    category: 'Documents', duration: '15 min', timing: 'Avant les premières visites', priority: 'soon',
    why: "Un dossier organisé permet de candidater vite tout en évitant d'envoyer des informations inutiles ou sensibles.",
    documents: ["Pièce d'identité", 'Certificat de scolarité', 'Justificatifs de ressources', 'Documents du garant'],
    steps: ['Réunis les pièces utiles dans ton coffre.', 'Masque les informations non nécessaires.', 'Fais vérifier le dossier par DossierFacile.', 'N’envoie jamais de paiement avant une visite et un cadre clair.'],
    sourceLabel: 'DossierFacile — service public', sourceUrl: 'https://www.dossierfacile.logement.gouv.fr/'
  },
  {
    id: 'benefits-check', title: 'Vérifie les aides qui te concernent', subtitle: "TutoVie t'oriente, le simulateur officiel confirme.",
    category: 'Aides', duration: '10 min', timing: "Dès qu'une situation change", priority: 'soon',
    why: "L'éligibilité dépend de nombreux paramètres. La bonne pratique consiste à utiliser une source officielle puis à suivre la démarche.",
    documents: ['Ressources', 'Situation familiale', 'Adresse et logement', 'Statut étudiant'],
    steps: ['Prépare les informations sur ta situation.', 'Lance le simulateur officiel Mes droits sociaux.', 'Note les aides à vérifier auprès de chaque organisme.', 'Ajoute les démarches retenues à ta roadmap.'],
    sourceLabel: 'Mes droits sociaux — simulateur officiel', sourceUrl: 'https://www.mesdroitssociaux.gouv.fr/'
  },
  {
    id: 'housing-aid', title: "Prépare ta demande d'aide au logement", subtitle: 'À faire une fois le bail signé et les clés récupérées.',
    category: 'Aides', duration: '15 min', timing: "Après l'entrée dans le logement", priority: 'later',
    why: "La demande nécessite des informations précises sur le logement, le bailleur et le compte bancaire du demandeur.",
    documents: ['Bail', 'RIB', 'Coordonnées du bailleur', 'Montant du loyer'],
    steps: ['Crée ou ouvre ton compte CAF.', 'Renseigne les informations exactes du bail.', 'Ajoute le RIB et les justificatifs demandés.', 'Suis les messages et demandes complémentaires.'],
    sourceLabel: 'CAF — aides au logement', sourceUrl: 'https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/logement'
  },
  {
    id: 'ameli', title: 'Vérifie ton espace Ameli', subtitle: 'Coordonnées, RIB, carte Vitale et médecin traitant.',
    category: 'Santé', duration: '8 min', timing: 'Au début de ton autonomie', priority: 'later',
    why: "Des coordonnées à jour facilitent les remboursements et les échanges avec l'Assurance Maladie.",
    documents: ['Carte Vitale', 'RIB', 'Adresse actuelle'],
    steps: ['Connecte-toi ou crée ton compte Ameli.', 'Vérifie ton adresse et ton RIB.', 'Contrôle les informations de ta carte Vitale.', 'Repère tes contacts utiles en cas de problème.'],
    sourceLabel: 'Assurance Maladie — Ameli', sourceUrl: 'https://www.ameli.fr/'
  },
  {
    id: 'first-tax', title: 'Anticipe ta première déclaration', subtitle: 'Comprendre rattachement, foyer fiscal et justificatifs.',
    category: 'Impôts', duration: '10 min', timing: 'Avant la prochaine campagne déclarative', priority: 'later',
    why: "La première déclaration est plus simple lorsqu'on sait si l'on reste rattaché au foyer parental et où trouver les informations nécessaires.",
    documents: ['Numéro fiscal si disponible', 'Revenus de l’année', 'Adresse au 1er janvier'],
    steps: ['Clarifie ta situation de rattachement avec tes parents.', 'Conserve les justificatifs de revenus.', 'Vérifie ton adresse fiscale.', 'Consulte la procédure officielle au moment de la campagne.'],
    sourceLabel: 'Service-Public — première déclaration', sourceUrl: 'https://www.service-public.fr/particuliers/vosdroits/F369'
  }
];

const documents = [
  { id: 'identity', label: "Pièce d'identité", hint: 'Recto-verso lisible', status: 'ready' },
  { id: 'school', label: 'Certificat de scolarité', hint: 'Année en cours', status: 'ready' },
  { id: 'rib', label: 'RIB à ton nom', hint: 'Souvent demandé par les organismes', status: 'missing' },
  { id: 'insurance', label: 'Assurance habitation', hint: 'À fournir pour le logement', status: 'missing' },
  { id: 'tax', label: "Avis d'imposition", hint: 'Le tien ou celui du foyer selon la situation', status: 'expires' }
];

const suggestions = [
  "J'ai trouvé un appart, je fais quoi maintenant ?",
  "C'est quoi un avis d'imposition ?",
  "Je n'ai pas de garant, quelles options vérifier ?",
  "Quels papiers je dois garder ?"
];

const initialState = {
  stage: 'welcome',
  onboardingStep: 0,
  tab: 'home',
  selectedTask: null,
  completed: [],
  profile: { firstName: '', email: '', age: '', city: '', housingStatus: null, flags: [], goals: [] },
  messages: [{ id: 'hello', role: 'bot', text: "Salut. Explique-moi où tu en es, et je te dirai la prochaine étape sans jargon." }]
};

let state = loadState();

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored && typeof stored === 'object' ? { ...structuredClone(initialState), ...stored, profile: { ...initialState.profile, ...(stored.profile || {}) } } : structuredClone(initialState);
  } catch (_) {
    return structuredClone(initialState);
  }
}

function saveState() {
  try {
    const copy = { ...state, selectedTask: null };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
  } catch (_) {}
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function brand(compact = false) {
  return `<div class="brand${compact ? ' compact' : ''}"><span class="brand-icon">T</span><span class="brand-name">TutoVie</span>${compact ? '' : '<span class="beta">BÊTA</span>'}</div>`;
}

function pill(text, tone = '') { return `<span class="pill ${tone}">${escapeHtml(text)}</span>`; }
function progress(value) { return `<div class="progress-track"><div class="progress-fill" style="width:${Math.max(0, Math.min(1, value)) * 100}%"></div></div>`; }
function primary(label, action, extra = '') { return `<button class="btn primary" data-action="${action}" ${extra}>${label}</button>`; }
function secondary(label, action, extra = '') { return `<button class="btn secondary" data-action="${action}" ${extra}>${label}</button>`; }

function render() {
  clearTimeout(generatorTimer);
  if (state.stage === 'welcome') app.innerHTML = renderWelcome();
  else if (state.stage === 'auth') app.innerHTML = renderAuth();
  else if (state.stage === 'onboarding') app.innerHTML = renderOnboarding();
  else if (state.stage === 'generating') app.innerHTML = renderGenerating();
  else app.innerHTML = renderMain();
  if (state.selectedTask) app.insertAdjacentHTML('beforeend', renderTaskModal(tasks.find(task => task.id === state.selectedTask)));
  bindInputs();
  saveState();
  if (state.stage === 'generating') startGenerator();
  if (state.stage === 'app' && state.tab === 'assistant') requestAnimationFrame(() => {
    const chat = app.querySelector('.chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
  });
}
