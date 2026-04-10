/* ═══════════════════════════════════════════════════════════════
   FRENCHOIS — MOTEUR AUDIO & EXERCICES
   moteur.js · v2.0 · Avril 2026
   ---------------------------------------------------------------
   Version enrichie : QCM, fill, match, dialogue karaoké,
   lecture à voix haute avec enregistrement, navigation.
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   SECTION 1 — CONFIGURATION ELEVENLABS
   ────────────────────────────────────────────────────────────── */

const EL_VOICES = {
  charlotte: 'XB0fDUnXU5powFXDhCwa',
  daniel:    'onwK4e9ZLuTAKqWW03F9',
  bill:      'pqHfZKP75CvOlQylNhV4',
  lily:      'jsCqWAovK2LkecY7zXl4',
};

const EL_CONFIG = {
  model:    'eleven_multilingual_v2',
  language: 'fr',
  settings: { stability: 0.5, similarity_boost: 0.75 },
};

const LS_KEY_API   = 'el_api_key';
const LS_KEY_VOICE = 'el_voice_id';

(function migrateLegacyKeys() {
  const legacy = localStorage.getItem('elevenlabs_api_key');
  if (legacy) {
    if (!localStorage.getItem(LS_KEY_API)) {
      localStorage.setItem(LS_KEY_API, legacy);
      console.info('[FRENCHOIS] Clé API migrée : elevenlabs_api_key → el_api_key');
    }
    localStorage.removeItem('elevenlabs_api_key');
  }
})();

function getELKey()   { return localStorage.getItem(LS_KEY_API)   || ''; }
function getELVoice() { return localStorage.getItem(LS_KEY_VOICE) || EL_VOICES.charlotte; }

function saveELKey(key, voiceId) {
  if (key     !== undefined) localStorage.setItem(LS_KEY_API,   key.trim());
  if (voiceId !== undefined) localStorage.setItem(LS_KEY_VOICE, voiceId);
  _audioCacheClear();
}

/* ──────────────────────────────────────────────────────────────
   SECTION 2 — MOTEUR AUDIO
   ────────────────────────────────────────────────────────────── */

const _AUDIO_CACHE = new Map();
let   _CURRENT_AUDIO = null;

function _audioCacheClear() {
  _AUDIO_CACHE.forEach(url => URL.revokeObjectURL(url));
  _AUDIO_CACHE.clear();
}

function stopAll() {
  if (_CURRENT_AUDIO) {
    _CURRENT_AUDIO.pause();
    _CURRENT_AUDIO.currentTime = 0;
    _CURRENT_AUDIO = null;
  }
  window.speechSynthesis.cancel();
}

function bSpeak(text, rate) {
  stopAll();
  rate = rate || 0.85;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  u.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const frVoice = voices.find(v => v.lang && v.lang.startsWith('fr'));
  if (frVoice) u.voice = frVoice;
  window.speechSynthesis.speak(u);
}

async function speak(text, voiceId, gender) {
  if (!voiceId) {
    voiceId = gender === 'f' ? EL_VOICES.charlotte
            : gender === 'm' ? EL_VOICES.daniel
            : getELVoice();
  }
  const key = text + '||' + voiceId;
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
  const apiKey = getELKey();
  if (!apiKey) {
    bSpeak(text);
    return null;
  }
  if (_AUDIO_CACHE.has(key)) {
    const audio = new Audio(_AUDIO_CACHE.get(key));
    audio._cacheKey = key;
    _CURRENT_AUDIO = audio;
    audio.onended = () => { _CURRENT_AUDIO = null; };
    audio.play();
    return audio;
  }
  try {
    const body = {
      text: `<speak><s xml:lang="fr-FR">${text}</s></speak>`,
      model_id: EL_CONFIG.model,
      language_code: EL_CONFIG.language,
      voice_settings: EL_CONFIG.settings,
    };
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`EL ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    _AUDIO_CACHE.set(key, url);
    const audio = new Audio(url);
    audio._cacheKey = key;
    _CURRENT_AUDIO = audio;
    audio.onended = () => { _CURRENT_AUDIO = null; };
    audio.play();
    return audio;
  } catch (err) {
    console.warn('[FRENCHOIS] ElevenLabs indisponible :', err.message);
    bSpeak(text);
    return null;
  }
}

function speakEL(text, gender) {
  const voiceId = gender === 'f' ? EL_VOICES.charlotte : EL_VOICES.daniel;
  return speak(text, voiceId);
}

async function testEL(key, voiceId) {
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || EL_VOICES.charlotte}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Bonjour !', model_id: EL_CONFIG.model, language_code: EL_CONFIG.language, voice_settings: EL_CONFIG.settings }),
    });
    if (!res.ok) throw new Error(res.status);
    new Audio(URL.createObjectURL(await res.blob())).play();
    return { ok: true, message: '✓ Connexion réussie !' };
  } catch (e) {
    return { ok: false, message: `✗ Erreur : ${e.message}` };
  }
}

/* ──────────────────────────────────────────────────────────────
   SECTION 3 — MODAL ELEVENLABS
   ────────────────────────────────────────────────────────────── */

function buildELModal() {
  if (document.getElementById('el-fab')) return;
  const fab = document.createElement('button');
  fab.id = 'el-fab';
  fab.textContent = '🎙';
  fab.title = 'Configurer ElevenLabs';
  fab.onclick = () => document.getElementById('el-modal').classList.add('open');
  document.body.appendChild(fab);

  const modal = document.createElement('div');
  modal.id = 'el-modal';
  const voiceOptions = Object.entries(EL_VOICES).map(([name, id]) => {
    const labels = { charlotte: 'Charlotte (féminin)', daniel: 'Daniel (masculin)', bill: 'Bill (masculin)', lily: 'Lily (féminin)' };
    const selected = id === getELVoice() ? 'selected' : '';
    return `<option value="${id}" ${selected}>${labels[name] || name}</option>`;
  }).join('');
  modal.innerHTML = `
    <div id="el-box">
      <h2>🎙️ Voix ElevenLabs</h2>
      <p>Connecte ton compte pour une voix française naturelle.<br>Ta clé est enregistrée uniquement dans ce navigateur.</p>
      <label class="el-label">Clé API</label>
      <input class="el-input" id="el-key-input" type="password" placeholder="sk-..." value="${getELKey()}">
      <label class="el-label">Voix</label>
      <select class="el-select" id="el-voice-select">${voiceOptions}</select>
      <div class="el-btns">
        <button class="el-btn" style="background:#7c3aed;color:white" onclick="window.FRENCHOIS.saveELModal()">💾 Enregistrer</button>
        <button class="el-btn" style="background:#2eaa6b;color:white" onclick="window.FRENCHOIS.testELModal()">▶ Tester</button>
        <button class="el-btn" style="background:#f7f4ef;border:2px solid #e4ddd4" id="el-close-btn">✕ Fermer</button>
      </div>
      <div class="el-status" id="el-status"></div>
    </div>
  `;
  modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };
  document.body.appendChild(modal);
  document.getElementById('el-close-btn').onclick = () => modal.classList.remove('open');
  _updateELStatus();
}

function _updateELStatus() {
  const st = document.getElementById('el-status');
  if (!st) return;
  if (getELKey()) {
    st.style.color = '#1d7a4c';
    st.textContent = '✓ Clé enregistrée';
  } else {
    st.style.color = '#e88c1a';
    st.textContent = '⚠ Sans clé → voix navigateur';
  }
}

window.FRENCHOIS = window.FRENCHOIS || {};
window.FRENCHOIS.saveELModal = function() {
  const key = document.getElementById('el-key-input').value.trim();
  const voiceId = document.getElementById('el-voice-select').value;
  saveELKey(key, voiceId);
  _updateELStatus();
  if (typeof updateBadge === 'function') updateBadge();
};
window.FRENCHOIS.testELModal = async function() {
  const key = document.getElementById('el-key-input').value.trim();
  const voiceId = document.getElementById('el-voice-select').value;
  const st = document.getElementById('el-status');
  st.style.color = '#7a7a8c';
  st.textContent = '⏳ Test en cours…';
  const result = await testEL(key, voiceId);
  st.style.color = result.ok ? '#1d7a4c' : '#e63946';
  st.textContent = result.message;
  if (result.ok) saveELKey(key, voiceId);
};

/* ──────────────────────────────────────────────────────────────
   SECTION 4 — MOTEUR D'EXERCICES (ENRICHIE)
   ────────────────────────────────────────────────────────────── */

function norm(s) {
  return String(s).toLowerCase().trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ');
}

function checkAnswer(input, expected, strict) {
  const normalize = strict ? s => s.toLowerCase().trim() : norm;
  const variants = String(expected).split('/').map(v => normalize(v.trim()));
  return variants.some(v => normalize(input) === v);
}

// --- QCM ---
function buildQCM(containerId, questions, scoreId, accentColor) {
  const c = document.getElementById(containerId);
  if (!c) return;
  const state = { score: 0, total: questions.length, answered: 0 };
  c.innerHTML = '';
  questions.forEach((q, qi) => {
    const div = document.createElement('div');
    div.className = 'qcm-item';
    div.innerHTML = `
      <div class="q-label">Question ${qi+1}</div>
      <div class="q-text">${q.q}</div>
      <div class="opts" id="opts_${containerId}_${qi}">
        ${q.opts.map((o, oi) => `<button class="opt" data-correct="${oi === q.ans}" data-correction="${q.opts[q.ans]}">${o}</button>`).join('')}
      </div>
      <div class="fb"></div>
    `;
    c.appendChild(div);
    const optsDiv = div.querySelector('.opts');
    optsDiv.querySelectorAll('.opt').forEach(btn => {
      btn.onclick = () => {
        if (state.answered === state.total) return;
        const isCorrect = btn.dataset.correct === 'true';
        checkQCM(btn, isCorrect, scoreId, state);
        state.answered++;
        if (state.answered === state.total) {
          const box = document.getElementById(scoreId);
          if (box) {
            const pct = state.score / state.total;
            box.classList.add('show');
            const em = pct >= 0.8 ? '🎉' : pct >= 0.6 ? '👍' : '💪';
            const msg = pct >= 0.8 ? 'Excellent !' : pct >= 0.6 ? 'Bien !' : 'Continue à pratiquer.';
            document.getElementById(scoreId + '-em').textContent = em;
            document.getElementById(scoreId + '-n').textContent = `${state.score} / ${state.total}`;
            document.getElementById(scoreId + '-m').textContent = msg;
            box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      };
    });
  });
}

function checkQCM(btn, isCorrect, scoreId, state) {
  const group = btn.closest('.opts');
  group.querySelectorAll('.opt').forEach(b => { b.disabled = true; });
  if (isCorrect) {
    btn.classList.add('correct');
    if (state) state.score++;
  } else {
    btn.classList.add('wrong');
  }
  const fb = btn.closest('.qcm-item').querySelector('.fb');
  if (fb) {
    fb.classList.add('show', isCorrect ? 'ok' : 'nope');
    fb.textContent = isCorrect ? '✓ Correct !' : '✗ ' + (btn.dataset.correction || '');
  }
  if (scoreId && state) {
    const el = document.getElementById(scoreId);
    if (el) el.textContent = `${state.score || 0} / ${state.total || 0}`;
  }
}

// --- Fill-in-the-blank ---
function buildFill(containerId, items) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'fill-item';
    div.innerHTML = `
      <div class="fill-sentence">${item.sentence}</div>
      <input class="fill-input" id="${containerId}_${i}" placeholder="..." data-answer="${item.answer}" autocomplete="off">
      <div class="fill-hint" id="${containerId}_hint_${i}"></div>
    `;
    c.appendChild(div);
  });
}

function checkFill(exId, scoreId, strict) {
  const container = document.getElementById(exId);
  if (!container) return;
  let correct = 0, total = 0;
  container.querySelectorAll('.fill-input').forEach(inp => {
    if (!inp.dataset.answer) return;
    total++;
    inp.disabled = true;
    const ok = checkAnswer(inp.value, inp.dataset.answer, strict);
    inp.classList.remove('ok', 'nope');
    inp.classList.add(ok ? 'ok' : 'nope');
    if (ok) correct++;
    const hint = inp.nextElementSibling;
    if (!ok && hint && hint.classList.contains('fill-hint')) {
      hint.textContent = '→ ' + inp.dataset.answer;
      hint.style.color = '#b02030';
    }
  });
  if (scoreId) {
    const el = document.getElementById(scoreId);
    if (el) {
      el.textContent = `${correct}/${total}`;
      el.style.color = correct === total ? '#1d7a4c' : '#e63946';
    }
  }
  return { correct, total };
}

// --- Match (association) ---
function buildMatch(pairsOrId, containerOrPairs, onComplete) {
  let pairs, container;
  if (typeof pairsOrId === 'string') {
    container = document.getElementById(pairsOrId);
    if (!container) return;
    const rawPairs = Array.isArray(containerOrPairs) ? containerOrPairs : [];
    pairs = rawPairs.map(p => Array.isArray(p) ? { left: p[0], right: p[1] } : p);
  } else {
    pairs = pairsOrId;
    container = containerOrPairs instanceof HTMLElement ? containerOrPairs : document.getElementById(containerOrPairs);
    if (!container) return;
  }
  if (!pairs.length) return;
  const lefts = [...pairs].map(p => p.left).sort(() => Math.random() - 0.5);
  const rights = [...pairs].map(p => p.right).sort(() => Math.random() - 0.5);
  const answers = {};
  pairs.forEach(p => { answers[p.left] = p.right; });
  let selectedLeft = null;
  let matchCount = 0;
  const wrap = document.createElement('div');
  wrap.className = 'match-wrap';
  ['gauche', 'droite'].forEach((side, colIdx) => {
    const colDiv = document.createElement('div');
    colDiv.innerHTML = `<div class="match-col-title">${side === 'gauche' ? '🇫🇷 Français' : '🇪🇸 Espagnol'}</div>`;
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
          if (selectedLeft) selectedLeft.classList.remove('selected');
          selectedLeft = this;
          this.classList.add('selected');
        } else if (selectedLeft) {
          const lVal = selectedLeft.dataset.val;
          const rVal = this.dataset.val;
          const ok = answers[lVal] === rVal;
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
  const scoreDiv = document.createElement('div');
  scoreDiv.id = 'match-score-' + Math.random();
  scoreDiv.className = 'match-score';
  scoreDiv.textContent = `0 / ${pairs.length} paires correctes`;
  container.appendChild(scoreDiv);
  return scoreDiv;
}

// --- Dialogue karaoké et compréhension orale ---
const _dlTally = {};
const _dlDataStore = {};

function registerDL(id, data) { _dlDataStore[id] = data; }

function buildDialogueListen(containerId, data, accentColor) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  const ph1 = document.createElement('div'); ph1.id = containerId + '_phase1';
  const lb = document.createElement('div'); lb.style.cssText = 'text-align:center;padding:20px 0 24px';
  lb.innerHTML = `
    <div style="font-size:13px;color:#7a7a8c;margin-bottom:14px;font-style:italic">Écoute le dialogue complet, puis réponds aux questions sans regarder le texte.</div>
    <button id="${containerId}_listenAll" style="background:${accentColor};color:white;border:none;border-radius:12px;padding:14px 28px;font-size:15px;font-weight:800;cursor:pointer;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,.12)">🔊 Écouter le dialogue</button>
    <div id="${containerId}_playing" style="margin-top:10px;font-size:12px;color:${accentColor};font-weight:700;display:none">▶ En cours…</div>`;
  ph1.appendChild(lb);
  const ql = document.createElement('div'); ql.style.cssText = `font-size:12px;font-weight:800;color:${accentColor};text-transform:uppercase;letter-spacing:1px;margin-bottom:10px`;
  ql.textContent = '🧠 Compréhension — réponds sans voir le texte';
  ph1.appendChild(ql);
  data.qcm.forEach((q, qi) => {
    const d = document.createElement('div'); d.className = 'qcm-item';
    d.innerHTML = `
      <div class="q-label">Question ${qi+1}</div>
      <div class="q-text">${q.q}</div>
      <div class="opts" id="${containerId}_opts_${qi}">
        ${q.opts.map((o, oi) => `<button class="opt" data-correct="${oi === q.ans}" data-correction="${q.opts[q.ans]}">${o}</button>`).join('')}
      </div>
      <div class="fb" id="${containerId}_fb_${qi}"></div>`;
    ph1.appendChild(d);
  });
  const sc = document.createElement('div'); sc.className = 'score-box'; sc.id = containerId + '_score'; sc.style.background = accentColor + '22';
  sc.innerHTML = `<div class="score-emoji" id="${containerId}_sc_em"></div><div class="score-num" id="${containerId}_sc_n" style="color:${accentColor}"></div><div class="score-msg" id="${containerId}_sc_m"></div>`;
  ph1.appendChild(sc);
  c.appendChild(ph1);

  const ph2 = document.createElement('div'); ph2.id = containerId + '_phase2'; ph2.style.display = 'none';
  ph2.innerHTML = `<div style="font-size:12px;font-weight:800;color:${accentColor};text-transform:uppercase;letter-spacing:1px;margin:18px 0 10px">📖 Transcription du dialogue</div>`;
  const dw = document.createElement('div'); dw.style.cssText = 'background:#1a1a2e;border:1.5px solid #2a2a4e;border-radius:14px;padding:16px 18px';
  data.lines.forEach((line, li) => {
    const isF = line.speaker === 'f'; const al = isF ? '#e63946' : '#2a7dd1'; const bl = isF ? '#fdecea' : '#deeeff';
    const words = line.text.split(' ');
    const ws = words.map((w, wi) => `<span id="${containerId}_w${li}_${wi}" style="color:rgba(255,255,255,0.5);transition:color .12s">${w}</span>`).join(' ');
    const row = document.createElement('div'); row.style.cssText = `display:flex;align-items:flex-start;gap:10px;margin-bottom:${li < data.lines.length-1 ? '16' : '0'}px`;
    row.innerHTML = `
      <button onclick="playLineKaraoke('${containerId}',${li},_dlDataStore['${containerId}'].lines[${li}],this)" style="flex-shrink:0;width:34px;height:34px;border-radius:50%;border:1.5px solid ${al};background:${bl};cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center">🔊</button>
      <div style="flex:1">
        <div style="font-size:11px;font-weight:800;color:${al};margin-bottom:4px">${line.name || line.speaker}</div>
        <div style="font-family:'Playfair Display',serif;font-size:15px;font-weight:700;line-height:1.6">${ws}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:4px;font-style:italic">${line.translation || ''}</div>
      </div>`;
    dw.appendChild(row);
  });
  ph2.appendChild(dw);
  c.appendChild(ph2);

  const btn = document.getElementById(`${containerId}_listenAll`);
  if (btn) btn.onclick = () => playDialogueFull(containerId, _dlDataStore[containerId]);
}

async function playDialogueFull(cid, data) {
  const btn = document.getElementById(cid + '_listenAll');
  const ind = document.getElementById(cid + '_playing');
  if (!data) return;
  if (btn) btn.disabled = true;
  if (ind) ind.style.display = 'block';
  for (const line of data.lines) {
    const voiceId = line.speaker === 'f' ? EL_VOICES.charlotte : EL_VOICES.daniel;
    await speakPromise(line.text, voiceId);
    await new Promise(r => setTimeout(r, 320));
  }
  if (btn) { btn.disabled = false; btn.innerHTML = '🔊 Écouter à nouveau'; }
  if (ind) ind.style.display = 'none';
}

function speakPromise(text, voiceId) {
  return new Promise((resolve) => {
    if (!getELKey()) {
      bSpeak(text);
      setTimeout(resolve, text.length * 80 + 500);
    } else {
      speak(text, voiceId).then(audio => {
        if (audio) audio.onended = resolve;
        else setTimeout(resolve, text.length * 80 + 500);
      }).catch(() => setTimeout(resolve, 500));
    }
  });
}

async function playLineKaraoke(cid, li, line, btn) {
  if (!line) return;
  const words = line.text.split(' ');
  const voiceId = line.speaker === 'f' ? EL_VOICES.charlotte : EL_VOICES.daniel;
  btn.disabled = true;
  words.forEach((_, wi) => {
    const s = document.getElementById(cid + '_w' + li + '_' + wi);
    if (s) s.style.color = 'rgba(255,255,255,0.5)';
  });
  const sk = (dur) => {
    const ms = (dur * 1000) / words.length;
    words.forEach((_, wi) => setTimeout(() => {
      const s = document.getElementById(cid + '_w' + li + '_' + wi);
      if (s) s.style.color = '#ffd166';
    }, wi * ms));
    setTimeout(() => btn.disabled = false, dur * 1000 + 200);
  };
  if (!getELKey()) {
    bSpeak(line.text);
    sk(words.length * 0.42);
    return;
  }
  try {
    const audio = await speak(line.text, voiceId);
    if (audio) {
      audio.addEventListener('loadedmetadata', () => sk(audio.duration));
      audio.onended = () => { btn.disabled = false; };
    } else {
      sk(3);
    }
  } catch {
    btn.disabled = false;
  }
}

function answerDLQ(cid, qi, chosen, correct, total) {
  const key = cid + '_' + qi;
  if (_dlTally[key]) return;
  _dlTally[key] = { done: true, wasCorrect: chosen === correct };
  const opts = document.querySelectorAll(`#${cid}_opts_${qi} .opt`);
  opts.forEach((b, i) => {
    b.disabled = true;
    if (i === correct) b.classList.add('correct');
    else if (i === chosen && chosen !== correct) b.classList.add('wrong');
  });
  const fb = document.getElementById(cid + '_fb_' + qi);
  fb.textContent = chosen === correct ? '✅ Correct !' : '❌ ' + opts[correct].textContent;
  fb.style.cssText = `color:${chosen === correct ? '#1d7a4c' : '#c0392b'};font-size:12px;margin-top:6px;font-weight:700`;
  let answered = 0, good = 0;
  for (let i = 0; i < total; i++) {
    if (_dlTally[cid + '_' + i]) {
      answered++;
      if (_dlTally[cid + '_' + i].wasCorrect) good++;
    }
  }
  if (answered === total) {
    const sc = document.getElementById(cid + '_score');
    if (sc) {
      sc.classList.add('show');
      const pct = good / total;
      document.getElementById(cid + '_sc_em').textContent = pct >= 0.75 ? '🎉' : pct >= 0.5 ? '👍' : '💪';
      document.getElementById(cid + '_sc_n').textContent = good + ' / ' + total;
      document.getElementById(cid + '_sc_m').textContent = pct >= 0.75 ? 'Excellente compréhension !' : pct >= 0.5 ? 'Bien ! Réécoute le dialogue.' : 'Écoute le dialogue à nouveau.';
      sc.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    setTimeout(() => {
      const p2 = document.getElementById(cid + '_phase2');
      if (p2) { p2.style.display = 'block'; p2.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
    }, 900);
  }
}

// --- Lecture à voix haute (Read Aloud) avec enregistrement ---
const _REC = {};

function buildReadAloud(containerId, phrases, accentColor) {
  const c = document.getElementById(containerId);
  if (!c) return;
  c.innerHTML = '';
  phrases.forEach((p, i) => {
    const rid = containerId + '_p' + i;
    const div = document.createElement('div');
    div.className = 'ra-item';
    div.innerHTML = `
      <div class="ra-phrase">${p.phrase}</div>
      <div class="ra-translation">${p.translation}</div>
      <div class="ra-controls">
        <button class="ra-btn" style="background:${accentColor};color:white" data-phrase="${p.phrase.replace(/"/g, '&quot;')}" data-voice="${p.voice || ''}">🔊 Écouter le modèle</button>
        <button class="ra-btn" style="background:#555;color:white" id="rb_${rid}">🎙️ Enregistrer ma voix</button>
        <span id="rs_${rid}" class="ra-status"></span>
      </div>
      <div id="rc_${rid}" class="ra-compare">
        <button class="ra-cmp-btn" data-phrase="${p.phrase.replace(/"/g, '&quot;')}" data-voice="${p.voice || ''}">🇫🇷 Modèle</button>
        <button class="ra-cmp-btn" data-rec="${rid}">▶ Ma voix</button>
      </div>`;
    c.appendChild(div);
    const listenBtn = div.querySelector('.ra-btn:first-child');
    listenBtn.onclick = () => {
      const phrase = listenBtn.getAttribute('data-phrase');
      const voice = listenBtn.getAttribute('data-voice');
      speak(phrase, voice === 'f' ? EL_VOICES.charlotte : voice === 'm' ? EL_VOICES.daniel : null);
    };
    const recBtn = div.querySelector('#rb_' + rid);
    recBtn.onclick = () => recToggle(rid);
    const cmpModel = div.querySelector('.ra-cmp-btn:first-child');
    cmpModel.onclick = () => {
      const phrase = cmpModel.getAttribute('data-phrase');
      const voice = cmpModel.getAttribute('data-voice');
      speak(phrase, voice === 'f' ? EL_VOICES.charlotte : voice === 'm' ? EL_VOICES.daniel : null);
    };
    const cmpPlay = div.querySelector('.ra-cmp-btn:last-child');
    cmpPlay.onclick = () => recPlayback(rid);
  });
}

async function recStart(id) {
  if (_REC[id] && _REC[id].recording) return;
  const statusEl = document.getElementById('rs_' + id);
  const btnEl = document.getElementById('rb_' + id);
  const cmpEl = document.getElementById('rc_' + id);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    _REC[id] = { chunks: [], recording: true, blob: null };
    const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
    _REC[id].recorder = new MediaRecorder(stream, { mimeType: mime });
    _REC[id].recorder.ondataavailable = e => { if (e.data.size > 0) _REC[id].chunks.push(e.data); };
    _REC[id].recorder.onstop = () => {
      _REC[id].blob = new Blob(_REC[id].chunks, { type: mime });
      _REC[id].recording = false;
      stream.getTracks().forEach(t => t.stop());
      if (statusEl) { statusEl.textContent = '✓ Enregistré !'; statusEl.style.color = '#1d7a4c'; }
      if (btnEl) { btnEl.textContent = '🎙️ Enregistrer à nouveau'; btnEl.style.background = '#555'; }
      if (cmpEl) cmpEl.style.display = 'flex';
    };
    _REC[id].recorder.start(100);
    if (statusEl) { statusEl.textContent = '● Enregistrement…'; statusEl.style.color = '#e63946'; }
    if (btnEl) { btnEl.textContent = '⬛ Arrêter'; btnEl.style.background = '#e63946'; }
    if (cmpEl) cmpEl.style.display = 'none';
  } catch (err) {
    if (statusEl) statusEl.textContent = '⚠ Microphone non disponible';
  }
}

function recStop(id) {
  if (_REC[id] && _REC[id].recording && _REC[id].recorder) _REC[id].recorder.stop();
}

function recToggle(id) {
  if (_REC[id] && _REC[id].recording) recStop(id);
  else recStart(id);
}

function recPlayback(id) {
  if (_REC[id] && _REC[id].blob) {
    const url = URL.createObjectURL(_REC[id].blob);
    new Audio(url).play();
  }
}

/* ──────────────────────────────────────────────────────────────
   SECTION 5 — NAVIGATION LEÇONS
   ────────────────────────────────────────────────────────────── */

function showLesson(lessonId, navEl) {
  document.querySelectorAll('.lesson-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const panel = document.querySelector(`.lesson-panel[data-lesson="${lessonId}"]`) || document.getElementById(`panel-${lessonId}`);
  if (panel) panel.classList.add('active');
  if (navEl) navEl.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ──────────────────────────────────────────────────────────────
   SECTION 6 — UTILITAIRES
   ────────────────────────────────────────────────────────────── */

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showScore(el, score, total) {
  if (!el) return;
  const pct = total > 0 ? score / total : 0;
  const emoji = pct === 1 ? '🌟' : pct >= 0.8 ? '😊' : pct >= 0.5 ? '🙂' : '💪';
  el.innerHTML = `
    <div class="sc-em">${emoji}</div>
    <div class="sc-n">${score} / ${total}</div>
    <div class="sc-m">${pct === 1 ? 'Parfait !' : pct >= 0.8 ? 'Très bien !' : pct >= 0.5 ? 'Bien, continue !' : 'Pratique encore un peu.'}</div>
  `;
  el.classList.add('show');
}

function showStatus(el, msg, type) {
  const target = typeof el === 'string' ? document.getElementById(el) : el;
  if (!target) return;
  type = type || 'ok';
  const colors = { ok: ['#1d7a4c', '#dcf5ea'], err: ['#b02030', '#fdecea'], warn: ['#b86a00', '#fff3dc'] };
  const [color, bg] = colors[type] || colors.ok;
  target.style.color = color;
  target.style.background = bg;
  target.style.padding = '6px 12px';
  target.style.borderRadius = '8px';
  target.textContent = msg;
}

function startLoading(btn, label) {
  const original = btn.innerHTML;
  const disabled = btn.disabled;
  btn.disabled = true;
  btn.innerHTML = `⏳ ${label || 'Cargando…'}`;
  return () => { btn.innerHTML = original; btn.disabled = disabled; };
}

/* ──────────────────────────────────────────────────────────────
   SECTION 7 — INITIALISATION AUTOMATIQUE
   ────────────────────────────────────────────────────────────── */

window.addEventListener('DOMContentLoaded', function() {
  if (!document.getElementById('el-fab') && !document.getElementById('modal-overlay')) {
    buildELModal();
  }
});

/* ──────────────────────────────────────────────────────────────
   SECTION 8 — API PUBLIQUE (exposition globale)
   ────────────────────────────────────────────────────────────── */

window.speak = speak;
window.speakEL = speakEL;
window.bSpeak = bSpeak;
window.stopAll = stopAll;
window.norm = norm;
window.checkAnswer = checkAnswer;
window.checkQCM = checkQCM;
window.buildQCM = buildQCM;
window.checkFill = checkFill;
window.buildFill = buildFill;
window.buildMatch = buildMatch;
window.registerDL = registerDL;
window.buildDialogueListen = buildDialogueListen;
window.answerDLQ = answerDLQ;
window.buildReadAloud = buildReadAloud;
window.recToggle = recToggle;
window.recPlayback = recPlayback;
window.showLesson = showLesson;
window.showView = showView;
window.shuffle = shuffle;
window.showScore = showScore;
window.showStatus = showStatus;
window.startLoading = startLoading;
window.getELKey = getELKey;
window.getELVoice = getELVoice;
window.saveELKey = saveELKey;
window.testEL = testEL;
window.buildELModal = buildELModal;

Object.assign(window.FRENCHOIS, {
  speak, speakEL, bSpeak, stopAll,
  norm, checkAnswer, checkQCM, buildQCM, checkFill, buildFill, buildMatch,
  registerDL, buildDialogueListen, answerDLQ, buildReadAloud, recToggle, recPlayback,
  showLesson, showView,
  shuffle, showScore, showStatus, startLoading,
  getELKey, getELVoice, saveELKey, testEL, buildELModal,
  EL_VOICES, EL_CONFIG,
});

console.info('[FRENCHOIS] moteur.js v2.0 chargé ✓');