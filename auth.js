// ── Frenchois Auth Guard ──
// Colle ce script en haut de chaque page protégée, juste après <head>
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="auth.js"></script>

(function () {

  /* ═══════════════════════════════════════════════════════════════
     BYPASS MODE — Branche de test v2
     ───────────────────────────────────────────────────────────────
     Actif automatiquement quand :
       • hostname contient "vercel.app"  (URL de preview Vercel)
       • hostname est "localhost" ou "127.0.0.1" (dev local)
     En production (domaine personnalisé) : bloc ignoré, auth normale.
     ═══════════════════════════════════════════════════════════════ */
  var _host = window.location.hostname;
  var BYPASS_MODE = (
    _host.indexOf('vercel.app') !== -1 ||
    _host === 'localhost'               ||
    _host === '127.0.0.1'              ||
    _host === ''
  );

  if (BYPASS_MODE) {
    // 1. Afficher la page immédiatement — aucune redirection
    document.documentElement.style.visibility = 'visible';

    // 2. Injecter les indicateurs visuels dès que le DOM est prêt
    function _injectBypassUI() {

      // ── Bandeau "MODE TEST V2" ───────────────────────────────
      var banner = document.createElement('div');
      banner.id  = 'frenchois-test-banner';
      banner.setAttribute('style', [
        'position:fixed',
        'top:0', 'left:0', 'right:0',
        'z-index:999998',
        'background:linear-gradient(90deg,#f59e0b 0%,#d97706 100%)',
        'color:#fff',
        'font-family:"Nunito",sans-serif',
        'font-size:11px',
        'font-weight:800',
        'letter-spacing:1.2px',
        'text-transform:uppercase',
        'text-align:center',
        'padding:5px 12px',
        'line-height:1.6',
        'box-shadow:0 2px 8px rgba(0,0,0,.15)',
      ].join(';'));
      banner.textContent = '⚡ MODE TEST V2 — Authentification désactivée ⚡';
      document.body.prepend(banner);

      // Compense le bandeau pour ne pas couvrir le contenu (hauteur ~26px)
      document.body.style.paddingTop = (
        (parseInt(document.body.style.paddingTop) || 0) + 28
      ) + 'px';

      // ── Indicateur de session simulée (remplace le bouton logout) ──
      var badge = document.createElement('div');
      badge.id  = 'frenchois-test-badge';
      badge.setAttribute('style', [
        'position:fixed',
        'top:38px', 'right:18px',
        'z-index:99999',
        'display:flex',
        'align-items:center',
        'gap:8px',
        'background:rgba(245,158,11,.12)',
        'border:1.5px solid #f59e0b',
        'border-radius:20px',
        'padding:5px 14px',
        'font-family:"Nunito",sans-serif',
        'font-size:12px',
        'font-weight:700',
        'color:#92400e',
        'box-shadow:0 2px 12px rgba(0,0,0,.08)',
      ].join(';'));
      badge.innerHTML = '🧪&nbsp;<span>test@frenchois.app</span>';
      document.body.appendChild(badge);
    }

    // Lance dès que le DOM est disponible
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _injectBypassUI);
    } else {
      _injectBypassUI();
    }

    // 3. Exposer une fonction signOut factice (pour les pages qui l'appellent)
    window.signOut = function () {
      console.info('[FRENCHOIS] Mode test : signOut simulé.');
    };

    return; // ← Supabase ignoré complètement
  }


  /* ═══════════════════════════════════════════════════════════════
     AUTH PRODUCTION — Supabase OTP
     ═══════════════════════════════════════════════════════════════ */
  var SUPABASE_URL = 'https://mvfrirxbhbtenunogdpj.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_oT738uTwT-dtpbMpWGgFkg_LvODS1a-';

  // Masquer la page jusqu'à vérification de la session
  document.documentElement.style.visibility = 'hidden';

  var sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  sb.auth.getSession().then(function (ref) {
    var data = ref.data;
    if (!data.session) {
      window.location.href = 'login.html';
    } else {
      document.documentElement.style.visibility = 'visible';
      _injectLogoutBtn(sb, data.session.user.email);
    }
  });

  function _injectLogoutBtn(sb, email) {
    var btn = document.createElement('div');
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
    btn.innerHTML =
      '<span style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
      email + '</span>' +
      '<button onclick="signOut()" style="background:#fdecea;color:#b02030;border:none;' +
      'border-radius:10px;padding:4px 10px;font-family:\'Nunito\',sans-serif;' +
      'font-size:11px;font-weight:800;cursor:pointer;">Déconnexion</button>';
    document.body.appendChild(btn);

    window.signOut = async function () {
      await sb.auth.signOut();
      window.location.href = 'login.html';
    };
  }

})();
