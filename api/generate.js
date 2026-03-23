// api/generate.js
export default async function handler(req, res) {
  // Configuration des headers pour Vercel (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body;
    // Extraction du prompt envoyé par le frontend (format messages ou direct)
    const prompt = body.messages?.[0]?.content || body.prompt || "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("GEMINI_API_KEY is missing in Vercel settings");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            // Force Gemini à sortir un JSON propre pour éviter les erreurs de parsing
            responseMimeType: "application/json" 
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data.error || data));

    // Récupération du texte généré par Gemini
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // On renvoie un format compatible avec votre frontend existant
    return res.status(200).json({ 
      content: [{ type: "text", text: aiText }] 
    });

  } catch (err) {
    console.error("Backend Error:", err.message);
    // On renvoie une erreur silencieuse mais structurée pour ne pas faire planter le JS du front
    return res.status(200).json({ 
      content: [{ 
        type: "text", 
        text: JSON.stringify({ title: "Erreur", type: "debug", text: err.message, words: [], qcm: [], vocab: [] }) 
      }] 
    });
  }
}
