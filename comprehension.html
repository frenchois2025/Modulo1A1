<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Compréhension de texte · Frenchois</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="auth.js"></script>
<style>
:root{--bg:#f7f4ef;--white:#fff;--text:#1c1c2e;--muted:#7a7a8c;--border:#e4ddd4;
--a1:#2a7dd1;--a1l:#deeeff;--a1d:#1a5fa0;
--a2:#e88c1a;--a2l:#fff3dc;--a2d:#b86a00;
--b1:#7c3aed;--b1l:#f3e8ff;--b1d:#5b21b6;
--ok:#2eaa6b;--okl:#dcf5ea;--okd:#1d7a4c;
--err:#e63946;--errl:#fdecea;--errd:#b02030;
--shadow:0 4px 24px rgba(0,0,0,.08)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.app{display:flex;min-height:100vh}
.sidebar{width:270px;flex-shrink:0;background:var(--white);border-right:1px solid var(--border);padding:24px 16px;position:sticky;top:0;height:100vh;overflow-y:auto;display:flex;flex-direction:column;gap:4px}
.sidebar-logo{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;padding:0 8px 16px;border-bottom:1px solid var(--border);margin-bottom:10px;line-height:1.4}
.sidebar-logo span{color:#e88c1a}
.sidebar-back{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg);color:var(--muted);font-size:12px;font-weight:700;cursor:pointer;text-decoration:none;margin-bottom:12px;transition:all .15s}
.sidebar-back:hover{border-color:var(--text);color:var(--text)}
.nav-section{font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);padding:8px 12px 4px;margin-top:8px}
.nav-btn{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:none;background:transparent;color:var(--muted);font-family:'Nunito',sans-serif;font-size:13px;font-weight:600;cursor:pointer;text-align:left;transition:all .18s;width:100%}
.nav-btn:hover{background:var(--bg)}
.nav-btn.active{color:white}
.main{flex:1;padding:40px 36px;max-width:900px}
.view{display:none}.view.active{display:block;animation:fadeIn .3s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.level-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px}
.level-card{border-radius:18px;padding:28px 22px;cursor:pointer;border:2px solid transparent;transition:all .2s;text-align:center}
.level-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.1)}
.level-emoji{font-size:36px;margin-bottom:10px}
.level-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:4px}
.level-desc{font-size:12px;opacity:.75;line-height:1.5}
.gen-section{margin-bottom:24px}
.gen-title{font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
.chip-grid{display:flex;flex-wrap:wrap;gap:8px}
.chip{padding:8px 16px;border-radius:20px;border:1.5px solid var(--border);background:var(--white);color:var(--text);font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s}
.chip:hover{border-color:var(--text)}
.chip.sel{color:white;border-color:transparent}
.gen-btn{width:100%;padding:16px;border-radius:14px;border:none;font-family:'Nunito',sans-serif;font-size:15px;font-weight:800;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:10px;margin-top:24px}
.gen-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.15)}
.gen-btn:disabled{cursor:default}
.loading-card{background:var(--white);border:1px solid var(--border);border-radius:18px;padding:60px 40px;text-align:center;box-shadow:var(--shadow)}
.spin{display:inline-block;font-size:48px;margin-bottom:16px;animation:rot 1.5s linear infinite}
@keyframes rot{from{transform:rotate(0)}to{transform:rotate(360deg)}}
.loading-title{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;margin-bottom:8px}
.loading-sub{font-size:14px;color:var(--muted);line-height:1.7}
.reader-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;line-height:1.2;margin-bottom:6px}
.phase-bar{display:flex;gap:8px;margin-bottom:24px}
.pdot{flex:1;height:5px;border-radius:3px;background:var(--border);transition:all .3s}
.pdot.done{background:var(--ok)}
.pbadge{display:inline-block;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;margin-bottom:16px}
.text-box{background:var(--white);border:1px solid var(--border);border-radius:18px;padding:28px 32px;margin-bottom:20px;box-shadow:var(--shadow);line-height:2.1;font-size:16px}
.text-box p{margin-bottom:14px}.text-box p:last-child{margin-bottom:0}
.hl{cursor:pointer;border-bottom:1.5px dashed;position:relative;transition:opacity .15s}
.hl:hover{opacity:.8}
.hl-tip{position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#1c1c2e;color:white;font-size:12px;font-weight:700;padding:5px 10px;border-radius:8px;white-space:nowrap;z-index:100;pointer-events:none;opacity:0;transition:opacity .15s}
.hl:hover .hl-tip{opacity:1}
.listen-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:10px;border:none;font-family:'Nunito',sans-serif;font-size:13px;font-weight:800;cursor:pointer;transition:all .18s;margin-bottom:20px}
.listen-btn:hover{transform:translateY(-1px)}
.ex-card{background:var(--white);border:1px solid var(--border);border-radius:18px;padding:26px;margin-bottom:20px;box-shadow:var(--shadow)}
.qitem{margin-bottom:20px}
.qlabel{font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;opacity:.6}
.qtext{font-size:15px;font-weight:700;margin-bottom:10px;line-height:1.5}
.opts{display:flex;flex-direction:column;gap:8px}
.opt{padding:11px 16px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg);color:var(--text);font-size:14px;font-weight:600;cursor:pointer;text-align:left;font-family:'Nunito',sans-serif;transition:all .15s}
.opt:hover:not(:disabled){border-color:var(--text);background:var(--white)}
.opt:disabled{cursor:default}
.opt.correct{border-color:var(--ok);background:var(--okl);color:var(--okd)}
.opt.wrong{border-color:var(--err);background:var(--errl);color:var(--errd)}
.fb{margin-top:6px;padding:8px 14px;border-radius:8px;font-size:13px;font-weight:600;display:none}
.fb.show{display:block}.fb.ok{background:var(--okl);color:var(--okd)}.fb.nope{background:var(--errl);color:var(--errd)}
.score-box{border-radius:16px;padding:24px;text-align:center;margin-top:16px;display:none}
.score-box.show{display:block}
.sc-em{font-size:40px;margin-bottom:8px}
.sc-n{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;margin-bottom:4px}
.sc-m{font-size:14px;color:var(--muted);margin-bottom:16px}
.vitem{background:var(--white);border:1.5px solid var(--border);border-radius:12px;padding:16px 18px;margin-bottom:10px}
.vword{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;margin-bottom:2px}
.ves{font-size:12px;color:var(--muted);margin-bottom:10px}
.vsent{font-size:14px;font-weight:600;margin-bottom:8px;line-height:1.9}
.fi{border:2px solid var(--border);border-radius:8px;padding:6px 12px;font-family:'Nunito',sans-serif;font-size:14px;font-weight:600;min-width:110px;background:var(--bg);color:var(--text);outline:none;transition:border-color .15s}
.fi:focus{border-color:var(--a1)}
.fi.ok{border-color:var(--ok);background:var(--okl);color:var(--okd)}
.fi.nope{border-color:var(--err);background:var(--errl);color:var(--errd)}
.fhint{font-size:12px;color:var(--muted);margin-top:4px;font-style:italic}
.btn-p{padding:13px 28px;border-radius:12px;border:none;font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;cursor:pointer;transition:all .18s}
.btn-p:hover{transform:translateY(-1px)}
.btn-s{padding:11px 22px;border-radius:10px;border:1.5px solid var(--border);background:var(--white);font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;cursor:pointer;color:var(--muted);transition:all .15s}
.btn-s:hover{border-color:var(--text);color:var(--text)}
.brow{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
@media(max-width:700px){.sidebar{display:none}.main{padding:20px 16px}.level-grid{grid-template-columns:1fr}.text-box{padding:18px 16px}}
#el-fab{position:fixed;bottom:22px;right:22px;width:46px;height:46px;border-radius:50%;background:#7c3aed;color:white;border:none;font-size:20px;cursor:pointer;z-index:9999;box-shadow:0 4px 18px rgba(124,58,237,.45);display:flex;align-items:center;justify-content:center;transition:all .2s}
#el-fab:hover{transform:scale(1.1)}
#el-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:10000;align-items:center;justify-content:center}
#el-modal.open{display:flex}
#el-box{background:#fff;border-radius:20px;padding:28px;width:min(480px,94vw);box-shadow:0 20px 60px rgba(0,0,0,.2);font-family:'Nunito',sans-serif}
#el-box h2{font-family:'Playfair Display',serif;font-size:20px;margin-bottom:4px}
#el-box p{font-size:12px;color:#7a7a8c;margin-bottom:20px;line-height:1.5}
.el-label{font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#7a7a8c;margin-bottom:6px;display:block}
.el-input{width:100%;border:2px solid #e4ddd4;border-radius:10px;padding:10px 14px;font-family:'Nunito',sans-serif;font-size:14px;font-weight:600;outline:none;margin-bottom:14px}
.el-select{width:100%;border:2px solid #e4ddd4;border-radius:10px;padding:10px 14px;font-family:'Nunito',sans-serif;font-size:14px;font-weight:600;outline:none;margin-bottom:18px;background:#f7f4ef}
.el-btns{display:flex;gap:8px;flex-wrap:wrap}
.el-btn{padding:10px 18px;border-radius:10px;border:none;font-family:'Nunito',sans-serif;font-size:13px;font-weight:800;cursor:pointer}
.el-status{margin-top:12px;font-size:13px;font-weight:700;min-height:20px;text-align:center}
.speaking{opacity:.65;pointer-events:none}
</style>
</head>
<body>
<div class="app">
<nav class="sidebar">
  <div class="sidebar-logo">Compréhension<br><span>de texte</span></div>
  <a href="index.html" class="sidebar-back">&#8592; Volver al inicio</a>
  <div class="nav-section">Niveaux</div>
  <button class="nav-btn" id="nav-a1" onclick="showGen('A1')">&#127807; Niveau A1</button>
  <button class="nav-btn" id="nav-a2" onclick="showGen('A2')">&#127807; Niveau A2</button>
  <button class="nav-btn" id="nav-b1" onclick="showGen('B1')">&#127795; Niveau B1</button>
  <div style="margin-top:auto;padding:14px 8px 0;border-top:1px solid var(--border)">
    <div style="font-size:11px;color:var(--muted);line-height:1.7">&#10024; Cada texto es generado por IA &#8212; &#250;nico cada vez. Infinitos textos disponibles.</div>
  </div>
</nav>
<main class="main">

  <div class="view active" id="view-home">
    <div style="margin-bottom:32px">
      <div style="font-family:'Playfair Display',serif;font-size:32px;font-weight:700;margin-bottom:10px">Compréhension<br>de texte</div>
      <div style="font-size:14px;color:var(--muted);line-height:1.7;max-width:540px">Elige tu nivel y un tema &#8212; la IA genera un texto &#250;nico en franc&#233;s con sus ejercicios de comprensi&#243;n y vocabulario. Cada vez es diferente.</div>
    </div>
    <div class="level-grid">
      <div class="level-card" style="background:var(--a1l)" onclick="showGen('A1')">
        <div class="level-emoji">&#127807;</div>
        <div class="level-name" style="color:var(--a1d)">A1</div>
        <div class="level-desc" style="color:var(--a1d)">Emails &middot; SMS &middot; Affiches<br>Dialogues &middot; Menus</div>
      </div>
      <div class="level-card" style="background:var(--a2l)" onclick="showGen('A2')">
        <div class="level-emoji">&#127807;</div>
        <div class="level-name" style="color:var(--a2d)">A2</div>
        <div class="level-desc" style="color:var(--a2d)">Articles &middot; Lettres<br>Descriptions &middot; Annonces</div>
      </div>
      <div class="level-card" style="background:var(--b1l)" onclick="showGen('B1')">
        <div class="level-emoji">&#127795;</div>
        <div class="level-name" style="color:var(--b1d)">B1</div>
        <div class="level-desc" style="color:var(--b1d)">Presse &middot; Portraits<br>R&#233;cits &middot; Chroniques</div>
      </div>
    </div>
  </div>

  <div class="view" id="view-gen">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:28px">
      <button class="btn-s" onclick="showHome()">&#8592; Volver</button>
      <div id="gen-title" style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700"></div>
    </div>
    <div class="gen-section">
      <div class="gen-title">Tipo de texto</div>
      <div class="chip-grid" id="chips-type"></div>
    </div>
    <div class="gen-section">
      <div class="gen-title">Tema</div>
      <div class="chip-grid" id="chips-theme"></div>
    </div>
    <button class="gen-btn" id="gen-btn" onclick="generateText()" disabled>
      &#10024; <span id="gen-lbl">Elige un tipo y un tema</span>
    </button>
  </div>

  <div class="view" id="view-loading">
    <div class="loading-card">
      <div class="spin">&#9881;&#65039;</div>
      <div class="loading-title">Generando tu texto&#8230;</div>
      <div class="loading-sub">La IA est&#225; escribiendo un texto original en franc&#233;s<br>adaptado a tu nivel con sus ejercicios. Un momento&#8230;</div>
    </div>
  </div>

  <div class="view" id="view-reader">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <button class="btn-s" onclick="showGen(CL)">&#8592; Nuevo texto</button>
      <div id="rtag"></div>
    </div>
    <div class="phase-bar" id="pbar"></div>
    <div id="rcontent"></div>
  </div>

</main>
</div>

<script>
const AUDIO_CACHE=new Map();
const EL_VOICES=[{id:'XB0fDUnXU5powFXDhCwa',name:'Charlotte (f&#233;minin)'},{id:'onwK4e9ZLuTAKqWW03F9',name:'Daniel (masculin)'}];
let EL_KEY=localStorage.getItem('el_api_key')||'';
let EL_VOICE=localStorage.getItem('el_voice_id')||EL_VOICES[0].id;
const VF='XB0fDUnXU5powFXDhCwa',VM='onwK4e9ZLuTAKqWW03F9';

// Global audio player — one at a time, pauseable
let CURRENT_AUDIO=null;

function stopAll(){
  if(CURRENT_AUDIO){CURRENT_AUDIO.pause();CURRENT_AUDIO.currentTime=0;CURRENT_AUDIO=null;}
  window.speechSynthesis.cancel();
}

function bSpeak(t){
  stopAll();
  const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';u.rate=.85;
  const v=window.speechSynthesis.getVoices().find(x=>x.lang&&x.lang.startsWith('fr'));if(v)u.voice=v;
  window.speechSynthesis.speak(u);
}

async function speak(text,vid){
  vid=vid||EL_VOICE;
  // If same audio is playing, toggle pause/resume
  if(CURRENT_AUDIO&&!CURRENT_AUDIO.paused){
    CURRENT_AUDIO.pause();return;
  }
  if(CURRENT_AUDIO&&CURRENT_AUDIO.paused&&AUDIO_CACHE.get(text+'||'+vid)===CURRENT_AUDIO.src){
    CURRENT_AUDIO.play();return;
  }
  stopAll();
  if(!EL_KEY){bSpeak(text);return;}
  const k=text+'||'+vid;
  if(AUDIO_CACHE.has(k)){
    CURRENT_AUDIO=new Audio(AUDIO_CACHE.get(k));
    CURRENT_AUDIO.play();
    return;
  }
  try{
    const r=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+vid,{method:'POST',headers:{'xi-api-key':EL_KEY,'Content-Type':'application/json'},body:JSON.stringify({text:'<speak><s xml:lang="fr-FR">'+text+'</s></speak>',model_id:'eleven_multilingual_v2',language_code:'fr',voice_settings:{stability:0.5,similarity_boost:0.75}})});
    if(!r.ok)throw 0;
    const b=await r.blob();const url=URL.createObjectURL(b);AUDIO_CACHE.set(k,url);
    CURRENT_AUDIO=new Audio(url);CURRENT_AUDIO.play();
  }catch{bSpeak(text);}
}
function buildEL(){
  const fab=document.createElement('button');fab.id='el-fab';fab.textContent='&#127897;';fab.onclick=()=>document.getElementById('el-modal').classList.add('open');document.body.appendChild(fab);
  const modal=document.createElement('div');modal.id='el-modal';const box=document.createElement('div');box.id='el-box';
  box.innerHTML='<h2>&#127897;&#65039; Voz ElevenLabs</h2><p>Conecta tu cuenta para voz francesa natural.</p><label class="el-label">Clave API</label><input class="el-input" id="el-key-input" type="password" placeholder="sk-..."><label class="el-label">Voz</label><select class="el-select" id="el-voice-select"></select><div class="el-btns"><button class="el-btn" style="background:#7c3aed;color:white" onclick="saveEL()">&#128190; Guardar</button><button class="el-btn" style="background:#2eaa6b;color:white" onclick="testEL()">&#9654; Probar</button><button class="el-btn" style="background:#f7f4ef;border:2px solid #e4ddd4" id="el-close-btn">&#x2715; Cerrar</button></div><div class="el-status" id="el-status"></div>';
  modal.appendChild(box);modal.onclick=e=>{if(e.target===modal)modal.classList.remove('open');};document.body.appendChild(modal);
  document.getElementById('el-close-btn').onclick=()=>modal.classList.remove('open');
  const sel=document.getElementById('el-voice-select');EL_VOICES.forEach(v=>{const o=document.createElement('option');o.value=v.id;o.textContent=v.name;if(v.id===EL_VOICE)o.selected=true;sel.appendChild(o);});
  document.getElementById('el-key-input').value=EL_KEY;const st=document.getElementById('el-status');st.style.color=EL_KEY?'#1d7a4c':'#e88c1a';st.textContent=EL_KEY?'&#x2713; Clave guardada':'&#x26A0; Sin clave &#8594; voz navegador';
}
function saveEL(){EL_KEY=document.getElementById('el-key-input').value.trim();EL_VOICE=document.getElementById('el-voice-select').value;localStorage.setItem('el_api_key',EL_KEY);localStorage.setItem('el_voice_id',EL_VOICE);AUDIO_CACHE.clear();}
async function testEL(){const key=document.getElementById('el-key-input').value.trim();const voice=document.getElementById('el-voice-select').value;const st=document.getElementById('el-status');st.textContent='&#x23F3; Probando...';
  try{const r=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+voice,{method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json'},body:JSON.stringify({text:'Bonjour !',model_id:'eleven_multilingual_v2',language_code:'fr',voice_settings:{stability:0.5,similarity_boost:0.75}})});if(!r.ok)throw new Error(r.status);new Audio(URL.createObjectURL(await r.blob())).play();EL_KEY=key;EL_VOICE=voice;localStorage.setItem('el_api_key',key);localStorage.setItem('el_voice_id',voice);st.style.color='#1d7a4c';st.textContent='&#x2713; &#161;Perfecto!';}catch(e){st.style.color='#e63946';st.textContent='&#x2717; '+e.message;}}

const COL={A1:{c:'var(--a1)',l:'var(--a1l)',d:'var(--a1d)'},A2:{c:'var(--a2)',l:'var(--a2l)',d:'var(--a2d)'},B1:{c:'var(--b1)',l:'var(--b1l)',d:'var(--b1d)'}};
const CFG={
  A1:{label:'&#127807; Niveau A1 &#8212; D&#233;butant',
    types:['&#128231; Email','&#128172; SMS','&#128203; Affiche','&#127869;&#65039; Menu','&#128483; Dialogue','&#128717; Liste de courses'],
    themes:['Famille','Voyage','Nourriture','&#201;cole','Amis','M&#233;t&#233;o','Sport','Ville','Shopping','Animaux','H&#244;tel','Sant&#233;']},
  A2:{label:'&#127807; Niveau A2 &#8212; Interm&#233;diaire',
    types:['&#128240; Article court','&#9993;&#65039; Lettre','&#128226; Annonce','&#128483; Interview','&#128214; Description','&#128221; Blog'],
    themes:['Culture','Environnement','Travail','Sant&#233;','Loisirs','Technologie','Histoire','Gastronomie','Mode','Transports','Logement','&#201;ducation']},
  B1:{label:'&#127795; Niveau B1 &#8212; Avanc&#233;',
    types:['&#128240; Article de presse','&#127917; Portrait','&#128188; Reportage','&#127897;&#65039; Entretien','&#128218; R&#233;cit','&#128466;&#65039; Chronique'],
    themes:['Soci&#233;t&#233;','Politique','Science','Art','&#201;conomie','&#201;cologie','&#201;ducation','Sport','M&#233;dias','Innovation','Philosophie','Mondialisation']}
};

let CL='A1',ST=null,STh=null,CD=null,phase=1,QS={},QScore=0;

function showView(id){document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo({top:0,behavior:'instant'});}
function showHome(){showView('view-home');document.querySelectorAll('.nav-btn').forEach(b=>{b.classList.remove('active');b.style.background='';b.style.color='';});}
function showGen(lv){
  CL=lv;ST=null;STh=null;phase=1;QS={};QScore=0;
  const col=COL[lv],cfg=CFG[lv];
  document.querySelectorAll('.nav-btn').forEach(b=>{b.classList.remove('active');b.style.background='';b.style.color='';});
  const nb=document.getElementById('nav-'+lv.toLowerCase());if(nb){nb.classList.add('active');nb.style.background=col.c;nb.style.color='white';}
  document.getElementById('gen-title').innerHTML=cfg.label;
  const ct=document.getElementById('chips-type');ct.innerHTML='';
  cfg.types.forEach(t=>{const c=document.createElement('button');c.className='chip';c.innerHTML=t;c.onclick=()=>pickChip('t',t,col.c,c,ct);ct.appendChild(c);});
  const ch=document.getElementById('chips-theme');ch.innerHTML='';
  cfg.themes.forEach(t=>{const c=document.createElement('button');c.className='chip';c.innerHTML=t;c.onclick=()=>pickChip('th',t,col.c,c,ch);ch.appendChild(c);});
  updBtn(col);showView('view-gen');
}
function pickChip(k,v,color,el,parent){
  parent.querySelectorAll('.chip').forEach(c=>{c.classList.remove('sel');c.style.background='';c.style.color='';c.style.borderColor='';});
  el.classList.add('sel');el.style.background=color;el.style.color='white';el.style.borderColor=color;
  if(k==='t')ST=v.replace(/^[^\s]+\s/,'');else STh=v;
  updBtn(COL[CL]);
}
function updBtn(col){
  const btn=document.getElementById('gen-btn');const ok=ST&&STh;
  btn.disabled=!ok;btn.style.background=ok?col.c:'var(--border)';btn.style.color=ok?'white':'var(--muted)';
  document.getElementById('gen-lbl').textContent=ok?'Générer : '+ST+' · '+STh:'Elige un tipo y un tema';
}

async function generateText(){
  showView('view-loading');
  const lvDesc={
    A1:'A1 d&#233;butant absolu : phrases courtes (5-8 mots), vocabulaire tr&#232;s simple, pr&#233;sent indicatif uniquement, structures sujet-verbe-objet basiques',
    A2:'A2 &#233;l&#233;mentaire : phrases simples &#224; moyennes, pass&#233; compos&#233;, futur proche, connecteurs logiques simples, vocabulaire courant',
    B1:'B1 interm&#233;diaire : phrases complexes, subjonctif, conditionnel, imparfait, vocabulaire vari&#233;, registres diff&#233;rents'
  };
  const wc={A1:'60-90',A2:'100-130',B1:'140-180'};
  const prompt='Tu es un professeur de fran&#231;ais expert cr&#233;ant du mat&#233;riel p&#233;dagogique pour hispanophones.\n\nCr&#233;e un texte de compr&#233;hension de niveau '+CL+' sur le th&#232;me "'+STh+'", de type "'+ST+'".\n\nCONTRAINTES :\n- Niveau : '+lvDesc[CL]+'\n- Longueur : '+wc[CL]+' mots environ\n- Type : '+ST+' authentique et r&#233;aliste\n- Th&#232;me : '+STh+'\n- Naturel, pas artificiel\n\nR&#233;ponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou apr&#232;s :\n\n{"title":"titre","type":"'+ST+'","paragraphs":[[{"word":"mot_important","es":"traducci&#243;n"},"mot_simple","mot_simple"]],"qcm":[{"q":"pregunta en espa&#241;ol","opts":["A","B","C"],"ans":0}],"vocab":[{"word":"mot","es":"traducci&#243;n","sentence":"frase con ___ en lugar del mot","answer":"mot","hint":"pista en espa&#241;ol"}]}\n\nR&#200;GLES :\n- paragraphs : chaque paragraphe = tableau de tokens. Token = string simple OU objet {"word":"...","es":"..."} pour mots importants (5-8 max, les plus utiles p&#233;dagogiquement)\n- qcm : exactement 4 questions en espagnol, 3 options chacune, "ans" = index 0/1/2\n- vocab : exactement 3 mots cl&#233;s du texte avec phrase &#224; trous diff&#233;rente du texte\n- JSON pur uniquement';

  try{
    const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,messages:[{role:'user',content:prompt}]})});
    if(!res.ok){const e=await res.json();throw new Error(e.error?.message||res.status);}
    const data=await res.json();
    const raw=data.content.filter(b=>b.type==='text').map(b=>b.text).join('');
    // Strip markdown, find JSON object
    let clean=raw.replace(/```json|```/g,'').trim();
    const jsonStart=clean.indexOf('{');
    const jsonEnd=clean.lastIndexOf('}');
    if(jsonStart>=0&&jsonEnd>=0) clean=clean.slice(jsonStart,jsonEnd+1);
    CD=JSON.parse(clean);
    if(!CD.paragraphs) throw new Error('Structure incorrecte: '+JSON.stringify(Object.keys(CD)));
    phase=1;QS={};QScore=0;
    renderReader();showView('view-reader');
  }catch(err){showView('view-gen');alert('Error al generar: '+err.message+'\nIntenta de nuevo.');}
}

function renderReader(){
  const t=CD,col=COL[CL];
  document.getElementById('rtag').innerHTML='<span style="background:'+col.l+';color:'+col.d+';font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:4px 12px;border-radius:20px">'+CL+' &#183; '+t.type+'</span>';
  const pb=document.getElementById('pbar');pb.innerHTML='';
  [1,2,3].forEach(p=>{const d=document.createElement('div');d.className='pdot'+(p<phase?' done':'');if(p===phase)d.style.background=col.c;pb.appendChild(d);});
  const rc=document.getElementById('rcontent');rc.innerHTML='';
  if(phase===1)p1(rc,t,col);else if(phase===2)p2(rc,t,col);else p3(rc,t,col);
}

function p1(c,t,col){
  c.innerHTML='<div class="reader-title">'+t.title+'</div>';
  const badge=document.createElement('div');badge.className='pbadge';badge.style.cssText='background:'+col.l+';color:'+col.d;badge.textContent='&#128214; Phase 1 &#8212; Lecture';c.appendChild(badge);
  const instr=document.createElement('div');instr.style.cssText='font-size:13px;color:var(--muted);margin-bottom:16px;padding:12px 16px;background:var(--bg);border-radius:10px;line-height:1.6';
  instr.textContent='Lee el texto. Pasa el cursor por las palabras subrayadas para ver su traducci\u00F3n. Usa el bot\u00F3n \uD83D\uDD0A para escuchar.';c.appendChild(instr);
  // Audio button with manual state flag — most reliable approach
  const audioWrap=document.createElement('div');audioWrap.style.cssText='margin-bottom:20px';
  const loadBtn=document.createElement('button');loadBtn.className='listen-btn';loadBtn.style.cssText='background:'+col.c+';color:white';loadBtn.innerHTML='\uD83D\uDD0A Escuchar el texto';
  const audioEl=document.createElement('audio');
  audioWrap.appendChild(loadBtn);
  
  // Manual state: 'idle' | 'loading' | 'playing' | 'paused' | 'ended'
  let state='idle';

  // Wait for play() promise to resolve before allowing next click
  loadBtn.onclick=async()=>{
    loadBtn.disabled=true; // block immediately on every click

    if(state==='playing'){
      audioEl.pause();
      state='paused';
      loadBtn.innerHTML='\u25B6\uFE0F Reanudar';
      loadBtn.disabled=false;
      return;
    }
    if(state==='paused'){
      await audioEl.play();
      state='playing';
      loadBtn.innerHTML='\u23F8\uFE0F Pausar';
      loadBtn.disabled=false;
      return;
    }
    // idle or ended
    loadBtn.innerHTML='\u23F3 Cargando\u2026';
    const txt=t.paragraphs.map(p=>p.map(w=>typeof w==='object'?w.word:w).join(' ')).join(' ');
    const vid=CL==='A1'?VF:VM;const k=txt+'||'+vid;
    let url;
    if(AUDIO_CACHE.has(k)){
      url=AUDIO_CACHE.get(k);
    } else {
      if(!EL_KEY){bSpeak(txt);state='idle';loadBtn.disabled=false;loadBtn.innerHTML='\uD83D\uDD0A Escuchar el texto';return;}
      try{
        const r=await fetch('https://api.elevenlabs.io/v1/text-to-speech/'+vid,{
          method:'POST',headers:{'xi-api-key':EL_KEY,'Content-Type':'application/json'},
          body:JSON.stringify({text:'<speak><s xml:lang="fr-FR">'+txt+'</s></speak>',model_id:'eleven_multilingual_v2',language_code:'fr',voice_settings:{stability:0.5,similarity_boost:0.75}})
        });
        if(!r.ok)throw 0;
        const blob=await r.blob();url=URL.createObjectURL(blob);AUDIO_CACHE.set(k,url);
      }catch{state='idle';loadBtn.disabled=false;loadBtn.innerHTML='\uD83D\uDD0A Escuchar el texto';return;}
    }
    audioEl.src=url;
    await audioEl.play(); // wait for play to actually start
    state='playing';
    loadBtn.innerHTML='\u23F8\uFE0F Pausar';
    loadBtn.disabled=false;
    audioEl.onended=()=>{state='ended';loadBtn.disabled=false;loadBtn.innerHTML='\uD83D\uDD0A Escuchar de nuevo';};
  };
  c.appendChild(audioWrap);
  const box=document.createElement('div');box.className='text-box';
  t.paragraphs.forEach(para=>{
    const p=document.createElement('p');
    para.forEach((tok,ti)=>{
      if(ti>0)p.appendChild(document.createTextNode(' '));
      if(typeof tok==='object'&&tok.word){
        const span=document.createElement('span');span.className='hl';span.style.borderColor=col.c;span.style.color=col.d;
        span.appendChild(document.createTextNode(tok.word));
        const tip=document.createElement('span');tip.className='hl-tip';tip.textContent=tok.es;span.appendChild(tip);
        span.onclick=()=>speak(tok.word);p.appendChild(span);
      }else{p.appendChild(document.createTextNode(String(tok)));}
    });
    box.appendChild(p);
  });
  c.appendChild(box);
  const nb=document.createElement('button');nb.className='btn-p';nb.style.cssText='background:'+col.c+';color:white';nb.textContent='Ir a las preguntas \u2192';
  nb.onclick=()=>{phase=2;renderReader();};
  const row=document.createElement('div');row.className='brow';row.appendChild(nb);c.appendChild(row);
}

function p2(c,t,col){
  const badge=document.createElement('div');badge.className='pbadge';badge.style.cssText='background:'+col.l+';color:'+col.d;badge.textContent='\uD83E\uDDE0 Phase 2 \u2014 Comprensi\u00F3n';c.appendChild(badge);
  const instr=document.createElement('div');instr.style.cssText='font-size:13px;color:var(--muted);margin-bottom:20px;padding:12px 16px;background:var(--bg);border-radius:10px;line-height:1.6';
  instr.textContent='Responde las preguntas. El texto ya no es visible \u2014 pon a prueba tu comprensi\u00F3n real.';c.appendChild(instr);
  const card=document.createElement('div');card.className='ex-card';
  t.qcm.forEach((q,qi)=>{
    const id='q'+qi;const d=document.createElement('div');d.className='qitem';
    d.innerHTML='<div class="qlabel">Pregunta '+(qi+1)+' / '+t.qcm.length+'</div><div class="qtext">'+q.q+'</div>'+
      '<div class="opts" id="o'+id+'">'+q.opts.map((o,oi)=>'<button class="opt" onclick="ansQ(\''+id+'\','+oi+','+q.ans+','+t.qcm.length+')">'+o+'</button>').join('')+'</div>'+
      '<div class="fb" id="f'+id+'"></div>';
    card.appendChild(d);
  });
  const sc=document.createElement('div');sc.className='score-box';sc.id='sc2';sc.style.background=col.l;
  sc.innerHTML='<div class="sc-em" id="s2em"></div><div class="sc-n" id="s2n" style="color:'+col.d+'"></div><div class="sc-m" id="s2m"></div><div class="brow" style="justify-content:center" id="s2btns"></div>';
  card.appendChild(sc);c.appendChild(card);
}
function ansQ(id,chosen,correct,total){
  if(QS[id])return;QS[id]=true;const ok=chosen===correct;if(ok)QScore++;
  const opts=document.querySelectorAll('#o'+id+' .opt');
  opts.forEach((b,i)=>{b.disabled=true;if(i===correct)b.classList.add('correct');else if(i===chosen&&!ok)b.classList.add('wrong');});
  const fb=document.getElementById('f'+id);fb.textContent=ok?'\u2705 \u00A1Correcto!':'\u274C '+opts[correct].textContent;fb.className='fb show '+(ok?'ok':'nope');
  if(Object.keys(QS).length===total){
    const sc=document.getElementById('sc2');sc.classList.add('show');const pct=QScore/total;const col=COL[CL];
    document.getElementById('s2em').textContent=pct>=.75?'\uD83C\uDF89':pct>=.5?'\uD83D\uDC4D':'\uD83D\uDCAA';
    document.getElementById('s2n').textContent=QScore+' / '+total;
    document.getElementById('s2m').textContent=pct>=.75?'\u00A1Excelente comprensi\u00F3n!':pct>=.5?'\u00A1Bien! Algunos errores.':'Vuelve a leer el texto.';
    const btns=document.getElementById('s2btns');
    if(pct<.5){const rb=document.createElement('button');rb.className='btn-s';rb.textContent='\u2190 Releer';rb.onclick=()=>{phase=1;renderReader();};btns.appendChild(rb);}
    const nb=document.createElement('button');nb.className='btn-p';nb.style.cssText='background:'+col.c+';color:white';nb.textContent='Vocabulaire \u2192';nb.onclick=()=>{phase=3;renderReader();};btns.appendChild(nb);
    sc.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}

function p3(c,t,col){
  const badge=document.createElement('div');badge.className='pbadge';badge.style.cssText='background:'+col.l+';color:'+col.d;badge.textContent='\uD83D\uDCDD Phase 3 \u2014 Vocabulaire en contexte';c.appendChild(badge);
  const instr=document.createElement('div');instr.style.cssText='font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.6';
  instr.textContent='Utiliza las palabras clave del texto en nuevas frases. Haz clic en \uD83D\uDD0A para escuchar la palabra.';c.appendChild(instr);
  const card=document.createElement('div');card.className='ex-card';
  t.vocab.forEach((v,i)=>{
    const item=document.createElement('div');item.className='vitem';
    const sid='vi'+i;
    const sentHtml=v.sentence.replace('___','<input class="fi" id="'+sid+'" data-answer="'+v.answer.replace(/"/g,'&quot;')+'" placeholder="\u2026" autocomplete="off" autocorrect="off" spellcheck="false">');
    item.innerHTML='<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">'+
      '<div class="vword">'+v.word+'</div>'+
      '<button onclick="speak(\''+v.word.replace(/'/g,"\\'")+'\');" style="background:'+col.l+';color:'+col.d+';border:none;border-radius:6px;padding:3px 10px;font-size:12px;font-weight:700;cursor:pointer">\uD83D\uDD0A</button></div>'+
      '<div class="ves">'+v.es+'</div>'+
      '<div class="vsent">'+sentHtml+'</div>'+
      '<div class="fhint" id="vh'+i+'">'+v.hint+'</div>';
    card.appendChild(item);
  });
  const cb=document.createElement('button');cb.className='btn-p';cb.style.cssText='background:'+col.c+';color:white;margin-top:16px';cb.textContent='Verificar';
  cb.onclick=()=>checkV(t,col);card.appendChild(cb);
  const sc=document.createElement('div');sc.className='score-box';sc.id='sc3';sc.style.background=col.l;
  sc.innerHTML='<div class="sc-em" id="s3em"></div><div class="sc-n" id="s3n" style="color:'+col.d+'"></div><div class="sc-m" id="s3m"></div>'+
    '<div class="brow" style="justify-content:center;margin-top:16px">'+
    '<button class="btn-p" style="background:'+col.c+';color:white" onclick="showGen(CL)">\u2728 Nuevo texto</button>'+
    '<button class="btn-s" onclick="showHome()">\u2190 Inicio</button></div>';
  card.appendChild(sc);c.appendChild(card);
}
function checkV(t,col){
  let ok=0;
  t.vocab.forEach((v,i)=>{
    const inp=document.getElementById('vi'+i);if(!inp)return;
    const val=inp.value.trim().toLowerCase();
    const correct=v.answer.split('|').some(a=>val===a.toLowerCase().trim());
    inp.className='fi '+(correct?'ok':'nope');inp.disabled=true;
    const hint=document.getElementById('vh'+i);
    if(!correct){hint.style.cssText='color:var(--errd);font-style:normal;font-size:12px;margin-top:4px';hint.innerHTML='\u2192 <strong>'+v.answer.split('|')[0]+'</strong>';}
    else{ok++;hint.style.cssText='color:var(--okd);font-size:11px;margin-top:4px';hint.textContent='\u2713';}
  });
  const sc=document.getElementById('sc3');sc.classList.add('show');const pct=ok/t.vocab.length;
  document.getElementById('s3em').textContent=pct>=.8?'\uD83C\uDF89':pct>=.6?'\uD83D\uDC4D':'\uD83D\uDCAA';
  document.getElementById('s3n').textContent=ok+' / '+t.vocab.length;
  document.getElementById('s3m').textContent=pct>=.8?'\u00A1Texto completado!':'\u00A1Bien! Repasa las palabras incorrectas.';
  sc.scrollIntoView({behavior:'smooth',block:'nearest'});
}

document.addEventListener('DOMContentLoaded',()=>{
  window.speechSynthesis.getVoices();
  buildEL();
});
</script>
</body>
</html>
