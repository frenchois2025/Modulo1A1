// ═══════════════════════════════════════════════════════════════
// FRENCHOIS — generate.prod.js  (VERSION PRODUCTION)
// ---------------------------------------------------------------
// ✅ Vérifie la session Supabase avant d'appeler Gemini.
// 🔒 Le client DOIT envoyer le token dans le header Authorization.
//
// Variables d'environnement Vercel requises :
//   GEMINI_API_KEY      → clé Gemini
//   SUPABASE_URL        → ex: https://xxxx.supabase.co
//   SUPABASE_ANON_KEY   → clé publique anon de Supabase
//
// Utilisation (côté client) :
//   const session = (await supabase.auth.getSession()).data.session;
//   fetch('/generate', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer ' + session.access_token
//     },
//     body: JSON.stringify({ prompt: '...' })
//   });
// ═══════════════════════════════════════════════════════════════

module.exports = async function handler(req, res) {
  // ── CORS ─────────────────────────────────────────────────────
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // ── 1. Vérification de la session Supabase ───────────────────
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Non authentifié : token manquant." });
  }

  const supabaseUrl  = process.env.SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnon) {
    return res.status(500).json({ error: "Configuration Supabase manquante côté serveur." });
  }

  try {
    // Vérification du token via l'API REST de Supabase (sans dépendance npm)
    const authCheck = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "Authorization": "Bearer " + token,
        "apikey": supabaseAnon,
      },
    });

    if (!authCheck.ok) {
      return res.status(401).json({ error: "Session expirée ou invalide. Reconnectez-vous." });
    }

    // Session valide → on peut continuer
    // const user = await authCheck.json(); // disponible si besoin (user.id, user.email…)

  } catch (authErr) {
    return res.status(500).json({ error: "Impossible de vérifier la session : " + authErr.message });
  }

  // ── 2. Appel Gemini ──────────────────────────────────────────
  try {
    const body   = req.body;
    const prompt = body.messages?.[0]?.content || body.prompt || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("GEMINI_API_KEY manquante");

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data.error || data));

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    return res.status(200).json({
      content: [{ type: "text", text: aiText }]
    });

  } catch (err) {
    return res.status(200).json({
      content: [{
        type: "text",
        text: JSON.stringify({
          title: "Erreur",
          type: "debug",
          text: err.message,
          words: [], qcm: [], vocab: []
        })
      }]
    });
  }
};
