// v1beta gemini-2.5-flash debug
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const prompt = body.messages?.[0]?.content || "";
    const apiKey = process.env.GEMINI_API_KEY;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000, thinkingConfig: { thinkingBudget: 0 } }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data.error || data));

    // gemini-2.5-flash may return thinking parts - find text part
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find(p => p.text && !p.thought);
    let text = textPart ? textPart.text : (parts[parts.length-1]?.text || "");

    // Return raw for debugging
    const debugJson = JSON.stringify({ title: "Raw", type: "debug", text: text.substring(0, 500), words: [], qcm: [], vocab: [] });
    return res.status(200).json({ content: [{ type: "text", text: debugJson }] });

  } catch (err) {
    const errJson = JSON.stringify({ title: "Erreur", type: "debug", text: err.message, words: [], qcm: [], vocab: [] });
    return res.status(200).json({ content: [{ type: "text", text: errJson }] });
  }
};
