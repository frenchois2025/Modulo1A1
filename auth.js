// ── Frenchois Auth Guard ──
// Colle ce script en haut de chaque page protégée, juste après <head>
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// <script src="auth.js"></script>

(function() {
  const SUPABASE_URL = 'https://mvfrirxbhbtenunogdpj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_oT738uTwT-dtpbMpWGgFkg_LvODS1a-';

  // Hide page content until auth is verified
  document.documentElement.style.visibility = 'hidden';

  const { createClient } = supabase;
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

  sb.auth.getSession().then(({ data }) => {
    if (!data.session) {
      window.location.href = 'login.html';
    } else {
      // User is authenticated — show the page
      document.documentElement.style.visibility = 'visible';
      // Inject logout button into every page
      injectLogoutBtn(sb, data.session.user.email);
    }
  });

  function injectLogoutBtn(sb, email) {
    const btn = document.createElement('div');
    btn.style.cssText = 'position:fixed;top:14px;right:18px;z-index:99999;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.95);border:1.5px solid #e4ddd4;border-radius:20px;padding:6px 14px;font-family:"Nunito",sans-serif;font-size:12px;font-weight:700;color:#7a7a8c;box-shadow:0 2px 12px rgba(0,0,0,.08);';
    btn.innerHTML = '<span style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + email + '</span>' +
      '<button onclick="signOut()" style="background:#fdecea;color:#b02030;border:none;border-radius:10px;padding:4px 10px;font-family:\'Nunito\',sans-serif;font-size:11px;font-weight:800;cursor:pointer;">Déconnexion</button>';
    document.body.appendChild(btn);

    window.signOut = async function() {
      await sb.auth.signOut();
      window.location.href = 'login.html';
    };
  }
})();
