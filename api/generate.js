// CommonJS - gemini-2.5-flash with JSON mode
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = req.body;
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
        text: JSON.stringify({ title: "Erreur", type: "debug", text: err.message, words: [], qcm: [], vocab: [] })
      }]
    });
  }
};
