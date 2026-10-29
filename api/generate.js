// Endpoint Vercel : /api/generate
// Variables d'environnement requises : GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY.
// ALLOWED_ORIGIN n'est pas requis : les requêtes navigateur sont limitées à la même origine.

const MAX_PROMPT_LENGTH = 8000;

function jsonError(res, status, error, details) {
  const payload = { error };
  if (details) payload.details = details;
  return res.status(status).json(payload);
}

function requestOriginIsSame(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // Requête serveur-à-serveur (pas de contrôle CORS navigateur).
  try {
    const originUrl = new URL(origin);
    const requestHost = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    return Boolean(requestHost) && originUrl.host.toLowerCase() === requestHost.toLowerCase();
  } catch (_) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Vary', 'Origin');
  const sameOrigin = requestOriginIsSame(req);
  if (sameOrigin && req.headers.origin) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    if (!sameOrigin) return jsonError(res, 403, 'Origine CORS refusée. Utilisez le même domaine que l’application.');
    return res.status(204).end();
  }
  if (!sameOrigin) return jsonError(res, 403, 'Origine CORS refusée. Utilisez le même domaine que l’application.');
  if (req.method !== 'POST') return jsonError(res, 405, 'Méthode non autorisée. Utilisez POST.');

  // 1) Configuration serveur Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return jsonError(res, 500, 'Configuration Supabase manquante côté serveur.', {
      missing: [!supabaseUrl && 'SUPABASE_URL', !supabaseAnonKey && 'SUPABASE_ANON_KEY'].filter(Boolean)
    });
  }

  // 2) Jeton Bearer transmis par le navigateur
  const authHeader = req.headers.authorization || '';
  const bearerMatch = /^Bearer\s+(.+)$/i.exec(authHeader);
  const token = bearerMatch && bearerMatch[1].trim();
  if (!token) {
    return jsonError(res, 401, 'Jeton absent ou mal formé. Envoyez Authorization: Bearer <access_token>.', {
      cause: 'token_absent'
    });
  }

  let authCheck;
  try {
    authCheck = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}`, apikey: supabaseAnonKey }
    });
  } catch (err) {
    return jsonError(res, 502, 'Impossible de joindre Supabase pour vérifier le jeton.', { cause: err.message });
  }
  if (authCheck.status === 401 || authCheck.status === 403) {
    return jsonError(res, 401, 'Jeton Supabase invalide ou session expirée. Reconnectez-vous.', {
      cause: 'token_invalide'
    });
  }
  if (!authCheck.ok) {
    return jsonError(res, 502, 'Supabase a renvoyé une erreur pendant la vérification du jeton.', {
      cause: `supabase_http_${authCheck.status}`
    });
  }

  // 3) Vérifier et limiter le prompt avant l'appel Gemini
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch (_) { return jsonError(res, 400, 'Corps JSON invalide.'); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError(res, 400, 'Corps de requête invalide : un objet JSON est attendu.');
  }
  const firstMessage = Array.isArray(body.messages) ? body.messages[0] : null;
  const prompt = (firstMessage && typeof firstMessage.content === 'string' ? firstMessage.content :
    (typeof body.prompt === 'string' ? body.prompt : ''));
  if (!prompt.trim()) return jsonError(res, 400, 'Prompt manquant ou vide.');
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return jsonError(res, 400, `Prompt trop long : maximum ${MAX_PROMPT_LENGTH} caractères.`, {
      maxCharacters: MAX_PROMPT_LENGTH, receivedCharacters: prompt.length
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return jsonError(res, 500, 'Configuration Gemini manquante côté serveur (GEMINI_API_KEY).');

  // 4) Appel Gemini ; la clé est transmise dans le header et non dans l’URL.
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );

    let data;
    try { data = await response.json(); }
    catch (_) { data = {}; }
    if (!response.ok) {
      return jsonError(res, 502, 'Erreur renvoyée par Gemini.', {
        cause: data.error && data.error.message ? data.error.message : `gemini_http_${response.status}`
      });
    }

    const aiText = data.candidates && data.candidates[0] && data.candidates[0].content &&
      data.candidates[0].content.parts && data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;
    if (typeof aiText !== 'string') {
      return jsonError(res, 502, 'Gemini n’a renvoyé aucun texte généré.', { cause: 'empty_gemini_response' });
    }
    return res.status(200).json({ content: [{ type: 'text', text: aiText }] });
  } catch (err) {
    return jsonError(res, 502, 'Échec de l’appel à Gemini.', { cause: err.message });
  }
};
