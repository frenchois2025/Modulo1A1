// Endpoint Vercel : /api/generate
// Variables d'environnement requises : GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY.
// ALLOWED_ORIGIN n'est pas requis : les requêtes navigateur sont limitées à la même origine.

const crypto = require('crypto');

const MAX_PROMPT_LENGTH = 8000;
const GEMINI_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 200;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const GENERATION_CACHE = new Map();
const IP_GENERATIONS = new Map();
const RETRY_DELAYS_MS = [800, 1600];

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

function getCachedResponse(key, now) {
  const entry = GENERATION_CACHE.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now) {
    GENERATION_CACHE.delete(key);
    return null;
  }
  // Refresh insertion order to keep frequently used entries in the cache.
  GENERATION_CACHE.delete(key);
  GENERATION_CACHE.set(key, entry);
  return entry.content;
}

function setCachedResponse(key, content, now) {
  for (const [cacheKey, entry] of GENERATION_CACHE) {
    if (entry.expiresAt <= now) GENERATION_CACHE.delete(cacheKey);
  }
  GENERATION_CACHE.delete(key);
  GENERATION_CACHE.set(key, { content, expiresAt: now + CACHE_TTL_MS });
  while (GENERATION_CACHE.size > CACHE_MAX_ENTRIES) {
    GENERATION_CACHE.delete(GENERATION_CACHE.keys().next().value);
  }
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function checkRateLimit(ip, now) {
  // Expire old entries and cap the map to prevent unbounded memory use.
  for (const [storedIp, timestamps] of IP_GENERATIONS) {
    const recent = timestamps.filter((timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS);
    if (recent.length) IP_GENERATIONS.set(storedIp, recent);
    else IP_GENERATIONS.delete(storedIp);
  }
  let timestamps = IP_GENERATIONS.get(ip) || [];
  timestamps = timestamps.filter((timestamp) => timestamp > now - RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    IP_GENERATIONS.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  IP_GENERATIONS.set(ip, timestamps);
  while (IP_GENERATIONS.size > 10000) {
    IP_GENERATIONS.delete(IP_GENERATIONS.keys().next().value);
  }
  return true;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
  } catch (_) {
    return jsonError(res, 502, 'Impossible de joindre Supabase pour vérifier le jeton.', { cause: 'supabase_unreachable' });
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

  const now = Date.now();
  const cacheKey = crypto.createHash('sha256').update(prompt, 'utf8').digest('hex');
  const cachedContent = getCachedResponse(cacheKey, now);
  if (cachedContent !== null) {
    return res.status(200).json({ content: [{ type: 'text', text: cachedContent }] });
  }
  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, now)) {
    return jsonError(res, 429, 'Limite atteinte : maximum 10 générations par heure pour cette adresse IP. Réessayez plus tard.');
  }

  let modelIndex = 0;
  let lastStatus = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const model = GEMINI_MODELS[modelIndex];
    let response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              responseMimeType: 'application/json',
              thinkingConfig: { thinkingBudget: 0 }
            }
          })
        }
      );
    } catch (_) {
      lastStatus = null;
      if (attempt < 2) {
        if (modelIndex === 0 && attempt === 1) modelIndex = 1;
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      return jsonError(res, 502, 'Échec de l’appel à Gemini après plusieurs tentatives.', { cause: 'gemini_unreachable' });
    }

    if (response.ok) {
      let data;
      try { data = await response.json(); }
      catch (_) { data = {}; }
      const aiText = data.candidates && data.candidates[0] && data.candidates[0].content &&
        data.candidates[0].content.parts && data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text;
      if (typeof aiText === 'string') {
        setCachedResponse(cacheKey, aiText, Date.now());
        return res.status(200).json({ content: [{ type: 'text', text: aiText }] });
      }
      lastStatus = response.status;
    } else {
      lastStatus = response.status;
    }

    if (attempt >= 2) break;
    const retryable = lastStatus === 429 || lastStatus === 500 || lastStatus === 503;
    if (modelIndex === 0 && !retryable) {
      // Un modèle indisponible (404) ou toute erreur non réessayable déclenche le secours.
      modelIndex = 1;
      continue;
    }
    if (retryable && modelIndex === 0 && attempt === 1) modelIndex = 1;
    await sleep(RETRY_DELAYS_MS[attempt]);
  }

  return jsonError(res, 502, 'Gemini n’a pas pu générer de réponse après plusieurs tentatives.', {
    cause: lastStatus ? `gemini_http_${lastStatus}` : 'empty_gemini_response'
  });
};
