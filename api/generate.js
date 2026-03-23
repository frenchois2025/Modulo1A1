// api/generate.js
export default async function handler(req, res) {
  // Autoriser les requêtes de votre site (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  
  // Vérification de la méthode
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Seul POST est autorisé" });
  }

  try {
    // Vercel parse automatiquement le body s'il reçoit du JSON
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "La variable GEMINI_API_KEY est manquante sur Vercel." });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Le prompt est vide." });
    }

    // Appel à Gemini 1.5 Flash (le plus performant en gratuit)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2500,
            // Paramètre CRUCIAL pour éviter les erreurs de formatage JSON
            responseMimeType: "application/json" 
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: data.error?.message || "Erreur provenant de l'API Google" 
      });
    }

    // On récupère le texte pur généré
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // On renvoie le résultat au format attendu par votre frontend
    return res.status(200).json({ content: aiText });

  } catch (err) {
    console.error("Erreur Backend:", err);
    return res.status(500).json({ error: "Erreur interne : " + err.message });
  }
}
