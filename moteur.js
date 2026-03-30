/* ═══════════════════════════════════════════════════════════════
   FRENCHOIS — MOTEUR AUDIO & EXERCICES
   moteur.js · v1.0 · Mars 2026
   ---------------------------------------------------------------
   À importer dans chaque page (après supabase + auth.js) :
     <script src="moteur.js" defer></script>
   ---------------------------------------------------------------
   ⚠️  Ce fichier est 100% côté navigateur (browser-only).
       Il ne fait AUCUN appel direct aux APIs IA.
       Les appels IA passent par /api/generate (serveur).
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   SECTION 1 — CONFIGURATION ELEVENLABS
   ────────────────────────────────────────────────────────────── */

const EL_VOICES = {
  charlotte: 'XB0fDUnXU5powFXDhCwa',   // Voix féminine douce (défaut)
  daniel:    'onwK4e9ZLuTAKqWW03F9',    // Voix masculine neutre
};

const EL_CONFIG = {
  model:    'eleven_multilingual_v2',
  language: 'fr',
  settings: { stability: 0.5, similarity_boost: 0.75 },
};

// Clé localStorage standardisée pour toute la plateforme
const LS_KEY_API   = 'el_api_key';
const LS_KEY_VOICE = 'el_voice_id';

/**
 * Migration automatique des anciennes clés localStorage.
 * Résout le conflit entre 'el_api_key' (comprehension) et
 * 'elevenlabs_api_key' (vocabulaire).
 */
(function migrateLegacyKeys() {
  const legacy = localStorage.getItem('elevenlabs_api_key');
  if (legacy && !localStorage.getItem(LS_KEY_API)) {
    localStorage.setItem(LS_KEY_API, legacy);
    // On conserve l'ancienne clé pour ne pas casser les pages non migrées
    console.info('[FRENCHOIS] Clé API migrée : elevenlabs_api_key → el_api_key');
  }
})();

function getELKey()   { return localStorage.getItem(LS_KEY_API)   || ''; }
function getELVoice() { return localStorage.getItem(LS_KEY_VOICE) || EL_VOICES.charlotte; }

function saveELKey(key, voiceId) {
  if (key   !== undefined) localStorage.setItem(LS_KEY_API,   key.trim());
  if (voiceId !== undefined) localStorage.setItem(LS_KEY_VOICE, voiceId);
  // Synchronisation rétrocompat (pour les pages non encore migrées)
  if (key !== undefined) localStorage.setItem('elevenlabs_api_key', key.trim());
  _audioCacheClear();
}


/* ──────────────────────────────────────────────────────────────
   SECTION 2 — MOTEUR AUDIO
   ────────────────────────────────────────────────────────────── */

/**
 * Cache audio : évite de re-télécharger le même fichier.
 * Clé = texte + voiceId, Valeur = URL objet (blob).
 */
const _AUDIO_CACHE = new Map();
let   _CURRENT_AUDIO = null;  // Instance Audio en cours

/** Vide le cache (ex. après changement de voix/clé API) */
function _audioCacheClear() {
  _AUDIO_CACHE.forEach(url => URL.revokeObjectURL(url));
  _AUDIO_CACHE.clear();
}

/**
 * Arrête tout audio en cours (ElevenLabs + SpeechSynthesis).
 * Appeler avant chaque nouvelle lecture.
 */
function stopAll() {
  if (_CURRENT_AUDIO) {
    _CURRENT_AUDIO.pause();
    _CURRENT_AUDIO.currentTime = 0;
    _CURRENT_AUDIO = null;
  }
  window.speechSynthesis.cancel();
}

/**
 * Fallback navigateur — SpeechSynthesis FR.
 * Utilisé quand la clé ElevenLabs est absente ou invalide.
 * @param {string} text  - Texte à lire en français
 * @param {number} [rate=0.85] - Vitesse de lecture (0.5–2)
 */
function bSpeak(text, rate) {
  stopAll();
  rate = rate || 0.85;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  u.rate = rate;
  // Sélectionne la meilleure voix française disponible
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(v => v.lang && v.lang.startsWith('fr'));
  if (frVoice) u.voice = frVoice;
  window.speechSynthesis.speak(u);
}

/**
 * Lit un texte en français via ElevenLabs avec cache intelligent.
 * Gère pause/reprise si le même audio est déjà en cours.
 * Bascule sur bSpeak() si pas de clé API.
 *
 * @param {string} text    - Texte à lire
 * @param {string} [voiceId] - ID voix ElevenLabs (défaut : voix mémorisée)
 * @param {string} [gender]  - 'f' ou 'm' (alternative à voiceId)
 * @returns {Promise<HTMLAudioElement|null>}
 */
async function speak(text, voiceId, gender) {
  // Résolution de la voix
  if (!voiceId) {
    voiceId = gender === 'f' ? EL_VOICES.charlotte
            : gender === 'm' ? EL_VOICES.daniel
            : getELVoice();
  }

  const key = text + '||' + voiceId;

  // ── Gestion pause/reprise si même audio en cours ──────────
  if (_CURRENT_AUDIO && !_CURRENT_AUDIO.paused) {
    if (_AUDIO_CACHE.get(key) === _CURRENT_AUDIO.src ||
        _CURRENT_AUDIO._cacheKey === key) {
      _CURRENT_AUDIO.pause();
      return _CURRENT_AUDIO;
    }
  }
  if (_CURRENT_AUDIO && _CURRENT_AUDIO.paused && _CURRENT_AUDIO._cacheKey === key) {
    _CURRENT_AUDIO.play();
    return _CURRENT_AUDIO;
  }

  stopAll();

  // ── Fallback navigateur si pas de clé ────────────────────
  const apiKey = getELKey();
  if (!apiKey) {
    bSpeak(text);
    return null;
  }

  // ── Cache : utiliser l'URL existante ─────────────────────
  if (_AUDIO_CACHE.has(key)) {
    const audio = new Audio(_AUDIO_CACHE.get(key));
    audio._cacheKey = key;
    _CURRENT_AUDIO = audio;
    audio.onended = () => { _CURRENT_AUDIO = null; };
    audio.play();
    return audio;
  }

  // ── Appel API ElevenLabs ──────────────────────────────────
  try {
    const body = {
      text: `<speak><s xml:lang="fr-FR">${text}</s></speak>`,
      model_id: EL_CONFIG.model,
      language_code: EL_CONFIG.language,
      voice_settings: EL_CONFIG.settings,
    };

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key':    apiKey,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) throw new Error(`EL ${res.status}`);

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    _AUDIO_CACHE.set(key, url);

    const audio = new Audio(url);
    audio._cacheKey = key;
    _CURRENT_AUDIO  = audio;
    audio.onended   = () => { _CURRENT_AUDIO = null; };
    audio.play();
    return audio;

  } catch (err) {
    console.warn('[FRENCHOIS] ElevenLabs indisponible :', err.message);
    bSpeak(text);
    return null;
  }
}

/**
 * Lit un texte avec sélection automatique de la voix selon le genre.
 * Alias court pour les modules de vocabulaire.
 * @param {string} text
 * @param {'f'|'m'} gender
 */
function speakEL(text, gender) {
  const voiceId = gender === 'f' ? EL_VOICES.charlotte : EL_VOICES.daniel;
  return speak(text, voiceId);
}

/**
 * Teste la connexion ElevenLabs avec un court "Bonjour !".
 * @param {string} key     - Clé à tester
 * @param {string} voiceId - Voix à tester
 * @returns {Promise<{ok: boolean, message: string}>}
 */
async function testEL(key, voiceId) {
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || EL_VOICES.charlotte}`,
      {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Bonjour !',
          model_id: EL_CONFIG.model,
          language_code: EL_CONFIG.language,
          voice_settings: EL_CONFIG.settings,
        }),
      }
    );
    if (!res.ok) throw new Error(res.status);
    new Audio(URL.createObjectURL(await res.blob())).play();
    return { ok: true, message: '✓ Connexion réussie !' };
  } catch (e) {
    return { ok: false, message: `✗ Erreur : ${e.message}` };
  }
}


/* ──────────────────────────────────────────────────────────────
   SECTION 3 — MODAL ELEVENLABS (FAB + boîte de configuration)
   Injecté dynamiquement sur chaque page.
   ────────────────────────────────────────────────────────────── */

/**
 * Injecte le FAB violet et la modale ElevenLabs dans le DOM.
 * À appeler une fois au chargement de la page :
 *   window.addEventListener('DOMContentLoaded', buildELModal);
 */
function buildELModal() {
  // ── FAB ──────────────────────────────────────────────────
  const fab = document.createElement('button');
  fab.id = 'el-fab';
  fab.textContent = '🎙';
  fab.title = 'Configurer ElevenLabs';
  fab.onclick = () => document.getElementById('el-modal').classList.add('open');
  document.body.appendChild(fab);

  // ── Modal ─────────────────────────────────────────────────
  const modal = document.createElement('div');
  modal.id = 'el-modal';

  const box = document.createElement('div');
  box.id = 'el-box';

  const voiceOptions = Object.entries(EL_VOICES).map(([name, id]) => {
    const labels = { charlotte: 'Charlotte (féminin)', daniel: 'Daniel (masculin)' };
    const selected = id === getELVoice() ? 'selected' : '';
    return `<option value="${id}" ${selected}>${labels[name] || name}</option>`;
  }).join('');

  box.innerHTML = `
    <h2>🎙️ Voz ElevenLabs</h2>
    <p>Conecta tu cuenta para voz francesa natural.<br>Tu clave se guarda solo en este navegador.</p>
    <label class="el-label">Clave API</label>
    <input class="el-input" id="el-key-input" type="password" placeholder="sk-..." value="${getELKey()}">
    <label class="el-label">Voz</label>
    <select class="el-select" id="el-voice-select">${voiceOptions}</select>
    <div class="el-btns">
      <button class="el-btn" style="background:#7c3aed;color:white" onclick="window.FRENCHOIS.saveELModal()">💾 Guardar</button>
      <button class="el-btn" style="background:#2eaa6b;color:white" onclick="window.FRENCHOIS.testELModal()">▶ Probar</button>
      <button class="el-btn" style="background:#f7f4ef;border:2px solid #e4ddd4" id="el-close-btn">✕ Cerrar</button>
    </div>
    <div class="el-status" id="el-status"></div>
  `;

  modal.appendChild(box);
  modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };
  document.body.appendChild(modal);

  document.getElementById('el-close-btn').onclick = () => modal.classList.remove('open');

  // Affichage de l'état courant
  _updateELStatus();
}

function _updateELStatus() {
  const st = document.getElementById('el-status');
  if (!st) return;
  if (getELKey()) {
    st.style.color = '#1d7a4c';
    st.textContent = '✓ Clave guardada';
  } else {
    st.style.color = '#e88c1a';
    st.textContent = '⚠ Sin clave → voz navegador';
  }
}

// Fonctions exposées pour les onclick inline de la modal
window.FRENCHOIS = window.FRENCHOIS || {};

window.FRENCHOIS.saveELModal = function() {
  const key     = document.getElementById('el-key-input').value.trim();
  const voiceId = document.getElementById('el-voice-select').value;
  saveELKey(key, voiceId);
  _updateELStatus();
  // Mettre à jour le badge API (vocabulaire) si présent
  if (typeof updateBadge === 'function') updateBadge();
};

window.FRENCHOIS.testELModal = async function() {
  const key     = document.getElementById('el-key-input').value.trim();
  const voiceId = document.getElementById('el-voice-select').value;
  const st      = document.getElementById('el-status');
  st.style.color = '#7a7a8c';
  st.textContent = '⏳ Probando…';
  const result = await testEL(key, voiceId);
  st.style.color = result.ok ? '#1d7a4c' : '#e63946';
  st.textContent = result.message;
  if (result.ok) {
    // Sauvegarder si le test réussit
    saveELKey(key, voiceId);
    if (typeof updateBadge === 'function') updateBadge();
  }
};


/* ──────────────────────────────────────────────────────────────
   SECTION 4 — MOTEUR D'EXERCICES
   ────────────────────────────────────────────────────────────── */

/**
 * Normalise un texte pour la comparaison (supprime accents,
 * casse, apostrophes, espaces doubles).
 * Résout la question des accents manquants dans les réponses.
 * @param {string} s
 * @returns {string}
 */
function norm(s) {
  return String(s).toLowerCase().trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // Supprime les diacritiques
    .replace(/['']/g, "'")             // Normalise les apostrophes
    .replace(/\s+/g, ' ');             // Espaces multiples → simple
}

/**
 * Vérifie si une réponse correspond à au moins une variante
 * acceptée (séparées par '/').
 * @param {string}   input    - Réponse de l'apprenant
 * @param {string}   expected - Réponse(s) attendue(s) ("le chat / un chat")
 * @param {boolean}  [strict=false] - Si true, accents obligatoires
 * @returns {boolean}
 */
function checkAnswer(input, expected, strict) {
  const normalize = strict ? s => s.toLowerCase().trim() : norm;
  const variants  = String(expected).split('/').map(v => normalize(v.trim()));
  return variants.some(v => normalize(input) === v);
}

/**
 * Vérifie une option QCM. Colore les boutons et affiche le feedback.
 * @param {HTMLButtonElement} btn        - Bouton cliqué
 * @param {boolean}           isCorrect  - Si ce bouton est la bonne réponse
 * @param {string}            [scoreId]  - ID de l'élément score (optionnel)
 * @param {object}            [state]    - Objet partagé { score, total }
 */
function checkQCM(btn, isCorrect, scoreId, state) {
  // Désactiver tous les boutons du groupe
  const group = btn.closest('.opts') || btn.parentElement;
  group.querySelectorAll('.opt').forEach(b => {
    b.disabled = true;
    // Révéler la bonne réponse si elle est annotée
    if (b.dataset.correct === 'true') b.classList.add('correct');
  });

  if (isCorrect) {
    btn.classList.add('correct');
    if (state) state.score = (state.score || 0) + 1;
  } else {
    btn.classList.add('wrong');
  }

  // Feedback textuel
  const fb = btn.closest('.qcm-item')?.querySelector('.fb');
  if (fb) {
    fb.classList.add('show', isCorrect ? 'ok' : 'nope');
    fb.textContent = isCorrect ? '✓ ¡Correcto!' : '✗ ' + (btn.dataset.correction || '');
  }

  // Mise à jour score
  if (scoreId && state) {
    const el = document.getElementById(scoreId);
    if (el) el.textContent = `${state.score || 0} / ${state.total || 0}`;
  }
}

/**
 * Construit un exercice de match (association gauche/droite) dans un conteneur.
 *
 * Accepte deux signatures d'appel :
 *   — Nouvelle (HTML générés) : buildMatch('container-id', [['gauche','droite'], ...])
 *   — Originale              : buildMatch([{left,right}], domElement, onComplete)
 *
 * @param {string|Array}      pairsOrId        - ID conteneur (string) OU tableau de paires
 * @param {Array|HTMLElement} containerOrPairs  - Tableau de paires OU élément DOM
 * @param {function}          [onComplete]     - Callback quand toutes paires trouvées
 */
function buildMatch(pairsOrId, containerOrPairs, onComplete) {
  let pairs, container;

  if (typeof pairsOrId === 'string') {
    // ── Nouvelle signature : buildMatch('id', [['gauche','droite'], ...]) ──
    container = document.getElementById(pairsOrId);
    if (!container) {
      console.warn('[FRENCHOIS] buildMatch: conteneur introuvable → #' + pairsOrId);
      return;
    }
    const rawPairs = Array.isArray(containerOrPairs) ? containerOrPairs : [];
    // Convertit [['gauche','droite']] en [{left:'gauche', right:'droite'}]
    pairs = rawPairs.map(p => Array.isArray(p) ? { left: p[0], right: p[1] } : p);
    // onComplete peut être le 3e argument ou absent
  } else {
    // ── Signature originale : buildMatch([{left,right}], domElement) ──
    pairs     = pairsOrId;
    container = (containerOrPairs instanceof HTMLElement)
      ? containerOrPairs
      : (typeof containerOrPairs === 'string'
          ? document.getElementById(containerOrPairs)
          : null);
    if (!container) {
      console.warn('[FRENCHOIS] buildMatch: conteneur DOM introuvable');
      return;
    }
  }

  if (!pairs || pairs.length === 0) {
    console.warn('[FRENCHOIS] buildMatch: aucune paire fournie');
    return;
  }

  // Mélanger les colonnes indépendamment
  const lefts  = [...pairs].map(p => p.left).sort(() => Math.random() - 0.5);
  const rights = [...pairs].map(p => p.right).sort(() => Math.random() - 0.5);

  // Créer un dictionnaire de correspondances
  const answers = {};
  pairs.forEach(p => { answers[p.left] = p.right; });

  let selectedLeft = null;
  let matchCount   = 0;

  const wrap = document.createElement('div');
  wrap.className = 'match-wrap';

  // Créer les deux colonnes
  ['gauche', 'droite'].forEach((side, colIdx) => {
    const colDiv = document.createElement('div');
    colDiv.innerHTML = `<div class="match-col-title">${side === 'gauche' ? '🇫🇷 Français' : '🇪🇸 Español'}</div>`;
    const col = document.createElement('div');
    col.className = 'match-col';

    const items = colIdx === 0 ? lefts : rights;
    items.forEach(txt => {
      const btn = document.createElement('button');
      btn.className = 'match-item';
      btn.textContent = txt;
      btn.dataset.val = txt;
      btn.dataset.side = side;

      btn.onclick = function() {
        if (this.classList.contains('matched-ok')) return;

        if (side === 'gauche') {
          // Désélectionner le précédent
          if (selectedLeft) selectedLeft.classList.remove('selected');
          selectedLeft = this;
          this.classList.add('selected');

        } else if (selectedLeft) {
          // Vérifier la correspondance
          const lVal = selectedLeft.dataset.val;
          const rVal = this.dataset.val;
          const ok   = answers[lVal] === rVal;

          if (ok) {
            selectedLeft.classList.remove('selected');
            selectedLeft.classList.add('matched-ok');
            this.classList.add('matched-ok');
            selectedLeft = null;
            matchCount++;
            if (matchCount === pairs.length && onComplete) onComplete();
          } else {
            selectedLeft.classList.add('matched-err');
            this.classList.add('matched-err');
            setTimeout(() => {
              selectedLeft?.classList.remove('selected', 'matched-err');
              this.classList.remove('matched-err');
              selectedLeft = null;
            }, 700);
          }
        }
      };

      col.appendChild(btn);
    });

    colDiv.appendChild(col);
    wrap.appendChild(colDiv);
  });

  container.appendChild(wrap);
}

/**
 * Vérifie les champs fill-in-the-blank dans un exercice.
 * Marque chaque input .ok ou .nope et affiche un score final.
 * @param {string} exId    - ID du conteneur d'exercice
 * @param {string} scoreId - ID de l'élément score
 * @param {boolean} [strict=false] - Comparaison stricte (accents requis)
 */
function checkFill(exId, scoreId, strict) {
  const container = document.getElementById(exId);
  if (!container) return;

  let correct = 0, total = 0;

  container.querySelectorAll('.fill-input, .fi').forEach(inp => {
    if (!inp.dataset.answer) return;
    total++;
    inp.disabled = true;
    const ok = checkAnswer(inp.value, inp.dataset.answer, strict);
    inp.classList.remove('ok', 'nope');
    inp.classList.add(ok ? 'ok' : 'nope');
    if (ok) correct++;

    // Afficher la correction si nécessaire
    const hint = inp.nextElementSibling;
    if (!ok && hint && (hint.classList.contains('fill-hint') || hint.classList.contains('fhint'))) {
      hint.textContent = '→ ' + inp.dataset.answer;
      hint.style.color = '#b02030';
    }
  });

  // Score
  if (scoreId) {
    const el = document.getElementById(scoreId);
    if (el) {
      el.textContent = `${correct}/${total}`;
      el.style.color = correct === total ? '#1d7a4c' : '#e63946';
    }
  }

  return { correct, total };
}


/* ──────────────────────────────────────────────────────────────
   SECTION 5 — NAVIGATION LEÇONS
   ────────────────────────────────────────────────────────────── */

/**
 * Affiche un panneau de leçon et marque le bouton nav actif.
 * Compatible avec data-lesson et id direct.
 *
 * @param {string|number} lessonId - Valeur du data-lesson ou id du panneau
 * @param {HTMLElement}   [navEl]  - Bouton nav à marquer actif
 */
function showLesson(lessonId, navEl) {
  // Masquer tous les panneaux
  document.querySelectorAll('.lesson-panel').forEach(p => {
    p.classList.remove('active');
    p.style.display = '';
  });

  // Désactiver tous les boutons nav
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.remove('active');
  });

  // Afficher le bon panneau
  // ⚠️ On cible explicitement .lesson-panel pour éviter de matcher les .nav-btn
  // qui portent aussi data-lesson (et apparaissent avant dans le DOM).
  const panel = document.querySelector(`.lesson-panel[data-lesson="${lessonId}"]`) ||
                document.getElementById(`lesson-${lessonId}`);
  if (panel) panel.classList.add('active');

  // Activer le bouton
  if (navEl) navEl.classList.add('active');

  // Scroll en haut (UX)
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/**
 * Affiche une vue (tab) et masque les autres.
 * @param {string} viewId - ID de la vue à afficher
 */
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}


/* ──────────────────────────────────────────────────────────────
   SECTION 6 — UTILITAIRES
   ────────────────────────────────────────────────────────────── */

/**
 * Mélange un tableau (Fisher-Yates shuffle).
 * @param {Array} arr
 * @returns {Array} Le même tableau mélangé
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Anime un score emoji (40px, centré) dans un conteneur.
 * @param {HTMLElement} el    - Conteneur cible
 * @param {number}      score - Score (ex: 7)
 * @param {number}      total - Total (ex: 10)
 */
function showScore(el, score, total) {
  if (!el) return;
  const pct   = total > 0 ? score / total : 0;
  const emoji = pct === 1 ? '🌟' : pct >= 0.8 ? '😊' : pct >= 0.5 ? '🙂' : '💪';
  el.innerHTML = `
    <div class="sc-em">${emoji}</div>
    <div class="sc-n">${score} / ${total}</div>
    <div class="sc-m">${
      pct === 1 ? '¡Perfecto!' :
      pct >= 0.8 ? '¡Muy bien!' :
      pct >= 0.5 ? 'Bien, sigue así.' :
      'Practica un poco más.'
    }</div>
  `;
  el.classList.add('show');
}

/**
 * Affiche un message d'état dans un élément (succès/erreur/info).
 * @param {HTMLElement|string} el  - Élément ou ID
 * @param {string}             msg - Message
 * @param {'ok'|'err'|'warn'}  [type='ok']
 */
function showStatus(el, msg, type) {
  const target = typeof el === 'string' ? document.getElementById(el) : el;
  if (!target) return;
  type = type || 'ok';
  const colors = {
    ok:   ['#1d7a4c', '#dcf5ea'],
    err:  ['#b02030', '#fdecea'],
    warn: ['#b86a00', '#fff3dc'],
  };
  const [color, bg] = colors[type] || colors.ok;
  target.style.color = color;
  target.style.background = bg;
  target.style.padding = '6px 12px';
  target.style.borderRadius = '8px';
  target.textContent = msg;
}

/**
 * Ajoute un spinner de chargement dans un élément.
 * Retourne une fonction pour le retirer.
 * @param {HTMLElement} btn - Bouton à désactiver pendant le chargement
 * @param {string}      label - Label de chargement
 * @returns {function} restore() - Restaure le bouton
 */
function startLoading(btn, label) {
  const original = btn.innerHTML;
  const disabled = btn.disabled;
  btn.disabled = true;
  btn.innerHTML = `⏳ ${label || 'Cargando…'}`;
  return function restore() {
    btn.innerHTML = original;
    btn.disabled  = disabled;
  };
}


/* ──────────────────────────────────────────────────────────────
   SECTION 7 — INITIALISATION AUTOMATIQUE
   ────────────────────────────────────────────────────────────── */

window.addEventListener('DOMContentLoaded', function() {
  // Injecter la modal ElevenLabs sur toutes les pages qui en ont besoin
  // (pages qui incluent moteur.js mais pas de gestion EL spécifique)
  if (!document.getElementById('el-fab') && !document.getElementById('modal-overlay')) {
    buildELModal();
  }
});


/* ──────────────────────────────────────────────────────────────
   SECTION 8 — API PUBLIQUE
   Exposition globale pour les onclick="" inline dans le HTML.
   ────────────────────────────────────────────────────────────── */

// Fonctions audio — accessibles globalement
window.speak     = speak;
window.speakEL   = speakEL;
window.bSpeak    = bSpeak;
window.stopAll   = stopAll;

// Fonctions exercices — accessibles globalement
window.norm        = norm;
window.checkAnswer = checkAnswer;
window.checkQCM    = checkQCM;
window.checkFill   = checkFill;
window.buildMatch  = buildMatch;

// Navigation — accessibles globalement
window.showLesson = showLesson;
window.showView   = showView;

// Utilitaires — accessibles globalement
window.shuffle     = shuffle;
window.showScore   = showScore;
window.showStatus  = showStatus;
window.startLoading= startLoading;

// Config ElevenLabs — accessibles globalement
window.getELKey    = getELKey;
window.getELVoice  = getELVoice;
window.saveELKey   = saveELKey;
window.testEL      = testEL;
window.buildELModal= buildELModal;

// Namespace consolidé (pour usage moderne)
window.FRENCHOIS = Object.assign(window.FRENCHOIS || {}, {
  speak, speakEL, bSpeak, stopAll,
  norm, checkAnswer, checkQCM, checkFill, buildMatch,
  showLesson, showView,
  shuffle, showScore, showStatus, startLoading,
  getELKey, getELVoice, saveELKey, testEL, buildELModal,
  EL_VOICES, EL_CONFIG,
});

console.info('[FRENCHOIS] moteur.js v1.0 chargé ✓');
