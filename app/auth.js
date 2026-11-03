// ── Frenchois Auth Guard — VERSION PRODUCTION ──
// Colle ce script en haut de chaque page protégée, juste après <head>
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="auth.js"></script>

(function () {

  /* ═══════════════════════════════════════════════════════════════
     AUTH PRODUCTION — Supabase
     • Masque la page pendant la vérification
     • Redirige vers login.html si pas de session
     • Affiche le bouton de déconnexion si session valide
     ═══════════════════════════════════════════════════════════════ */
  var SUPABASE_URL = 'https://mvfrirxbhbtenunogdpj.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_oT738uTwT-dtpbMpWGgFkg_LvODS1a-';

  // Masquer la page jusqu'à vérification de la session
  document.documentElement.style.visibility = 'hidden';

  // Un seul client Supabase par page : on le partage via window.
  // Évite l'avertissement « Multiple GoTrueClient instances ».
  var sb = window.__frenchoisSb || (window.__frenchoisSb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
  window.sb = window.sb || sb;

  sb.auth.getSession().then(function (ref) {
    var data = ref.data;
    if (!data.session) {
      window.location.href = 'login.html';
    } else {
      document.documentElement.style.visibility = 'visible';
      var email = data.session.user.email;
      // Attendre que <body> existe avant d'injecter le bouton
      if (document.body) {
        _injectLogoutBtn(sb, email);
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          _injectLogoutBtn(sb, email);
        });
      }
    }
  });

  function _injectLogoutBtn(sb, email) {
    if (!document.body) return;
    if (document.getElementById('frenchois-logout')) return;

    var btn = document.createElement('div');
    btn.id = 'frenchois-logout';
    btn.setAttribute('style', [
      'position:fixed',
      'top:14px', 'right:18px',
      'z-index:99999',
      'display:flex',
      'align-items:center',
      'gap:8px',
      'background:rgba(255,255,255,.95)',
      'border:1.5px solid #e4ddd4',
      'border-radius:20px',
      'padding:6px 14px',
      'font-family:"Nunito",sans-serif',
      'font-size:12px',
      'font-weight:700',
      'color:#7a7a8c',
      'box-shadow:0 2px 12px rgba(0,0,0,.08)',
    ].join(';'));

    // Construction sans innerHTML pour éviter d'injecter l'email comme du HTML
    var label = document.createElement('span');
    label.setAttribute('style', 'max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap');
    label.textContent = email;

    var out = document.createElement('button');
    out.type = 'button';
    out.textContent = 'Déconnexion';
    out.setAttribute('style', [
      'background:#fdecea',
      'color:#b02030',
      'border:none',
      'border-radius:10px',
      'padding:4px 10px',
      'font-family:"Nunito",sans-serif',
      'font-size:11px',
      'font-weight:800',
      'cursor:pointer'
    ].join(';'));
    out.addEventListener('click', function () { window.signOut(); });

    btn.appendChild(label);
    btn.appendChild(out);
    document.body.appendChild(btn);
  }

  window.signOut = async function () {
    await sb.auth.signOut();
    window.location.href = 'login.html';
  };

})();
