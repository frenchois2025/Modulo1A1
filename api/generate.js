// v1beta gemini-1.5-flash - Backend fonctionnel pour Vercel/Netlify
module.exports = async function handler(req, res) {
  // Gestion des CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) throw new Error("API Key manquante dans l'environnement");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            responseMimeType: "application/json" // Force Gemini à répondre en JSON
          }
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini Error:", data);
      throw new Error(data.error?.message || "Erreur API Gemini");
    }

    // Extraction du texte de la réponse
    let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Renvoi au format attendu par le frontend
    return res.status(200).json({ 
      content: [{ type: "text", text: aiText }] 
    });

  } catch (err) {
    console.error("Handler Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
