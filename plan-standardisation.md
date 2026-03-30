# Plan de Standardisation — Plateforme FRENCHOIS
*Analyse complète · Mars 2026*

---

## 1. AUDIT DES FICHIERS HTML

### Vue d'ensemble

| Fichier | Rôle | Synchro audio | Système design |
|---|---|---|---|
| `index.html` | Tableau de bord | ❌ | A1/A2/B1 (rouge/bleu/vert) |
| `login.html` | Authentification | ❌ | Violet/Rouge/Beige |
| `a1-module1.html` | Prononciation & phonétique | ✅ ElevenLabs + fallback | --l0 à --l5 (6 couleurs) |
| `a1-module2.html` | Grammaire (être/avoir) | ✅ ElevenLabs + fallback | --l1 à --l6 |
| `a1-module3.html` | Famille & adjectifs | ✅ ElevenLabs + fallback | --l1 à --l4 |
| `a1-module4.html` | Module A1 | ✅ ElevenLabs + fallback | Variante |
| `a1-module5.html` | Module A1 | ✅ ElevenLabs + fallback | Variante |
| `b1-module1.html` | Module B1 | ✅ ElevenLabs + fallback | Variante verte |
| `comprehension.html` | Lecture IA (Claude API) | ✅ Niveau phrase | A1/A2/B1 par niveau |
| `prononciation.html` | Entraînement phonétique | ✅ + enregistrement | --l0 à --l5 |
| `vocabulaire.html` | Flashcards A1 | ✅ Mode dictée | Rouge/Beige gradient |
| `vocabulaire-a2.html` | Flashcards A2 | ✅ Mode dictée | Variante |

---

## 2. MEILLEUR MOTEUR DE SYNCHRONISATION TEXTE/AUDIO

### 🏆 Verdict : `comprehension.html`

C'est le fichier le plus moderne et le plus fluide pour la synchronisation texte/audio. Voici pourquoi :

**Architecture propre en 3 couches :**
- **Couche données** : JSON structuré retourné par l'API Claude (mots surlignés, QCM, vocabulaire)
- **Couche audio** : Objet `CURRENT_AUDIO` centralisé + cache Map par clé `text+voiceID`
- **Couche UI** : Classe `.playing` animée + tooltips sur survol des mots surlignés

**Fonctions clés à conserver :**
```javascript
// Cache audio intelligent (évite de re-télécharger le même audio)
const AUDIO_CACHE = new Map();

// Gestion instance unique (coupe l'audio précédent automatiquement)
let CURRENT_AUDIO = null;

async function speak(text, vid) {
  if (CURRENT_AUDIO) { CURRENT_AUDIO.pause(); CURRENT_AUDIO = null; }
  const key = text + vid;
  if (!AUDIO_CACHE.has(key)) {
    // appel ElevenLabs → Blob → URL objet
    const blob = await response.blob();
    AUDIO_CACHE.set(key, URL.createObjectURL(blob));
  }
  const audio = new Audio(AUDIO_CACHE.get(key));
  CURRENT_AUDIO = audio;
  audio.play();
}

// Fallback navigateur (SpeechSynthesis)
function bSpeak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR'; u.rate = 0.85;
  speechSynthesis.speak(u);
}

// Arrêt universel
function stopAll() {
  if (CURRENT_AUDIO) { CURRENT_AUDIO.pause(); CURRENT_AUDIO = null; }
  speechSynthesis.cancel();
}
```

**Ce qui le distingue des autres modules :**
- Lecture **au niveau de la phrase** (pas seulement mot par mot)
- Fallback `bSpeak()` automatique si pas de clé API
- `stopAll()` centralisé (les modules 1-3 n'ont pas cette sécurité)
- Animation ripple sur le bouton d'écoute (feedback visuel immédiat)
- Surlignage des mots-clés cliquables avec tooltip de traduction

**Second meilleur :** `vocabulaire.html` pour son mode dictée avec correspondance floue des accents (ignore les fautes d'accentuation).

---

## 3. MEILLEURS ÉLÉMENTS DE DESIGN & FONCTIONNALITÉS

### 🎨 Palette de couleurs (à unifier)

| Source | Couleur | Usage actuel | Statut |
|---|---|---|---|
| `index.html` | `#e63946` | Niveau A1 | ✅ À garder comme couleur primaire |
| `index.html` | `#2a7dd1` | Niveau A2 | ✅ À garder |
| `index.html` | `#2eaa6b` | Niveau B1 | ✅ À garder |
| `login.html` | `#7c3aed` | Accent violet | ✅ À garder pour UI (boutons, focus) |
| `login.html` | `#f7f4ef` | Fond beige chaud | ✅ Fond universel de la plateforme |
| Modules | `--l0` à `--l5` | Couleurs leçons | ⚠️ À standardiser en 6 variables globales |

### ✨ Animations réussies (à conserver)

| Animation | Fichier source | Effet | Note |
|---|---|---|---|
| `fadeIn` 0.3s | Modules A1 | Apparition douce des panneaux | Simple et efficace |
| `shake` 0.3s | Module 1 | Feedback erreur (mauvaise réponse) | Très intuitif |
| `blink` 1s infini | Module 1 | Point rouge d'enregistrement | Clair et standard |
| `pop` 0.3s | Vocabulaire | Retournement de carte flashcard | Fluide |
| `ripple` | Compréhension | Cercle sur bouton play | Moderne, Material Design |
| `rotation` | Compréhension | Spinner de chargement IA | Propre |
| Hover élévation | Index | Cartes qui montent au survol | UX dashboard pro |

### 🔧 Fonctionnalités bonus les plus réussies

1. **Correspondance floue accent** (`vocabulaire.html`) — L'apprenant peut taper "francais" au lieu de "français" et obtenir quand même la bonne réponse. Indispensable pour une app d'apprentissage.

2. **Génération IA contextuelle** (`comprehension.html`) — Textes créés à la volée par Claude API avec exercices intégrés (QCM + vocabulaire) selon niveau et thème. Très différenciateur.

3. **Cache audio intelligent** (`comprehension.html`) — Évite de re-télécharger le même fichier audio. Réduit la consommation API et améliore la réactivité.

4. **Mode dictée** (`vocabulaire.html`) — 3 modes d'apprentissage (ES→FR, FR→ES, Dictée) dans une seule interface à onglets. Architecture de flashcards solide avec 297 entrées structurées.

5. **Barre de progression de phase** (`comprehension.html`) — Indicateur visuel 5px avec `transition 0.3s` qui guide l'apprenant dans sa progression. Discret mais efficace.

6. **FAB ElevenLabs** (Modules 2-3) — Bouton flottant en bas à droite pour configurer la clé API sans quitter la page. Bon pattern UX.

7. **Système de score emoji** (tous les modules) — Feedback émotionnel immédiat avec emoji 40px. Gamification légère et motivante.

8. **Sidebar de navigation leçons** (Module 1) — Navigation latérale avec icônes emoji par leçon. Donne une vue d'ensemble de la progression dans un module.

---

## 4. PLAN DE STANDARDISATION

### Objectif
Créer deux fichiers de référence — `style.css` et `moteur.js` — qui serviront de **base commune importée par toutes les pages** de la plateforme.

---

### 📁 `style.css` — Design System Unifié

#### Structure proposée

```css
/* ═══════════════════════════════════════════
   FRENCHOIS — DESIGN SYSTEM GLOBAL
   ═══════════════════════════════════════════ */

/* 1. TOKENS (variables CSS) */
:root {
  /* Niveaux de langue */
  --a1: #e63946;
  --a1-light: #fde8ea;
  --a2: #2a7dd1;
  --a2-light: #deeeff;
  --b1: #2eaa6b;
  --b1-light: #dcf5ea;
  --b2: #7c3aed;
  --b2-light: #f3e8ff;

  /* Couleurs leçons (remplace --l0 à --l5 éparpillés) */
  --l1: #e63946; --l1-bg: #fde8ea;
  --l2: #2a7dd1; --l2-bg: #deeeff;
  --l3: #2eaa6b; --l3-bg: #dcf5ea;
  --l4: #e88c1a; --l4-bg: #fff3dc;
  --l5: #7c3aed; --l5-bg: #f3e8ff;
  --l6: #0891b2; --l6-bg: #e0f7fa;

  /* Neutres */
  --bg: #f7f4ef;       /* Fond beige chaud */
  --surface: #ffffff;
  --border: #e5e0d8;
  --text: #1a1a2e;
  --text-muted: #6b7280;

  /* Typographie */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Nunito', sans-serif;

  /* Espacements */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;

  /* Transitions */
  --t-fast: 0.15s ease;
  --t-normal: 0.3s ease;
  --t-slow: 0.5s ease;
}

/* 2. ANIMATIONS GLOBALES */
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
@keyframes pop { 0%{transform:scale(0.97);opacity:0.7} 100%{transform:scale(1);opacity:1} }
@keyframes ripple { to { transform: scale(4); opacity: 0; } }
@keyframes spin { to { transform: rotate(360deg); } }

/* 3. BASE LAYOUT */
/* ... sidebar, header, card-grid, etc. */

/* 4. COMPOSANTS RÉUTILISABLES */
/* ... boutons, badges, modals, pills, progress bars, etc. */

/* 5. EXERCICES */
/* ... QCM, fill-in-the-blank, match, flashcard, etc. */

/* 6. OVERRIDES PAR PAGE */
/* Chaque page peut importer style.css puis ajouter ses propres règles */
```

---

### ⚙️ `moteur.js` — Moteur Audio & Exercices Unifié

#### Structure proposée

```javascript
/* ═══════════════════════════════════════════
   FRENCHOIS — MOTEUR AUDIO & EXERCICES
   ═══════════════════════════════════════════ */

/* ── SECTION 1 : CONFIGURATION ── */
const FRENCHOIS = {
  elevenLabs: {
    key: () => localStorage.getItem('el_key') || '',
    voices: {
      charlotte: 'XB0fDUnXU5powFXDhCwa',   // Voix féminine douce
      daniel:    'onwK4e9ZLuTAKqWW03F9',    // Voix masculine neutre
    }
  },
  defaultVoice: 'charlotte',
};

/* ── SECTION 2 : MOTEUR AUDIO ── */
const AUDIO_CACHE = new Map();
let CURRENT_AUDIO = null;

async function speak(text, voiceId) {
  // 1. Arrêt de l'audio précédent
  stopAll();
  voiceId = voiceId || FRENCHOIS.defaultVoice;
  const key = text + voiceId;

  // 2. Cache ou appel API
  if (!AUDIO_CACHE.has(key)) {
    const key_str = FRENCHOIS.elevenLabs.key();
    if (!key_str) { bSpeak(text); return; }
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': key_str, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.5, similarity_boost: 0.8 } })
      });
      if (!res.ok) { bSpeak(text); return; }
      AUDIO_CACHE.set(key, URL.createObjectURL(await res.blob()));
    } catch { bSpeak(text); return; }
  }

  // 3. Lecture avec gestion d'état
  const audio = new Audio(AUDIO_CACHE.get(key));
  CURRENT_AUDIO = audio;
  audio.onended = () => { CURRENT_AUDIO = null; };
  audio.play();
  return audio;
}

function bSpeak(text, rate = 0.85) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR'; u.rate = rate;
  speechSynthesis.speak(u);
}

function stopAll() {
  if (CURRENT_AUDIO) { CURRENT_AUDIO.pause(); CURRENT_AUDIO = null; }
  speechSynthesis.cancel();
}

/* ── SECTION 3 : MOTEUR D'EXERCICES ── */

// QCM : valide le choix, colore vert/rouge, ajoute au score
function checkQCM(btn, isCorrect, scoreId) { ... }

// Fill-in-the-blank : correspondance avec tolérance accent
function checkFill(input, expected, feedbackEl, scoreId) {
  const normalize = s => s.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalize(input.value) === normalize(expected);
}

// Match : exercice de correspondance gauche/droite
function buildMatch(pairs, containerId) { ... }

// Flashcard : progression + shuffle
function nextCard(deck, state) { ... }

/* ── SECTION 4 : NAVIGATION LEÇONS ── */
function showLesson(id, el) {
  document.querySelectorAll('[data-lesson]').forEach(p => p.hidden = true);
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-lesson="${id}"]`).hidden = false;
  if (el) el.classList.add('active');
}

/* ── SECTION 5 : UTILITAIRES ── */
function saveAPIKey(key) {
  localStorage.setItem('el_key', key);
}
function getAPIKey() {
  return localStorage.getItem('el_key') || '';
}

// Export pour utilisation modulaire
window.FRENCHOIS_ENGINE = { speak, bSpeak, stopAll, checkQCM,
  checkFill, buildMatch, nextCard, showLesson, saveAPIKey };
```

---

### 🗂️ Architecture finale recommandée

```
frenchois/
├── assets/
│   ├── style.css          ← Design system unifié (CE FICHIER)
│   └── moteur.js          ← Moteur audio + exercices (CE FICHIER)
├── index.html             ← importe style.css + moteur.js
├── login.html             ← importe style.css
├── a1-module1.html        ← importe style.css + moteur.js
├── a1-module2.html        ← importe style.css + moteur.js
├── comprehension.html     ← importe style.css + moteur.js
├── prononciation.html     ← importe style.css + moteur.js
├── vocabulaire.html       ← importe style.css + moteur.js
└── vocabulaire-a2.html    ← importe style.css + moteur.js
```

**Dans chaque HTML :**
```html
<link rel="stylesheet" href="assets/style.css">
<script src="assets/moteur.js" defer></script>
```

---

### 📋 Ordre de travail recommandé

| Étape | Action | Priorité |
|---|---|---|
| 1 | Créer `style.css` avec les tokens CSS (couleurs, typo, radius, transitions) | 🔴 Urgent |
| 2 | Y ajouter toutes les animations globales (@keyframes) | 🔴 Urgent |
| 3 | Y ajouter les composants réutilisables (cartes, boutons, badges, modals) | 🟡 Haute |
| 4 | Créer `moteur.js` avec la Section Audio (speak, bSpeak, stopAll) | 🔴 Urgent |
| 5 | Y ajouter les fonctions d'exercices (QCM, fill, match, flashcard) | 🟡 Haute |
| 6 | Migrer `comprehension.html` en premier (le plus propre, bon modèle) | 🟡 Haute |
| 7 | Migrer `vocabulaire.html` (logique flashcard + dictée) | 🟡 Haute |
| 8 | Migrer les modules A1 un par un | 🟢 Normale |
| 9 | Tester sur mobile (sidebar responsive) | 🟢 Normale |

---

*Document généré automatiquement par analyse de 12 fichiers HTML · FRENCHOIS 2026*
