// v1 direct HTTP - no SDK
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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data.error || data));

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < 0) throw new Error("No JSON found");
    text = text.slice(start, end + 1);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch(e) {
      parsed = { title: "Debug", type: "debug", text: e.message + " | " + text.substring(0,200), words: [], qcm: [], vocab: [] };
    }

    return res.status(200).json({ content: [{ type: "text", text: JSON.stringify(parsed) }] });

  } catch (err) {
    return res.status(200).json({ content: [{ type: "text", text: JSON.stringify({ title: "Erreur", type: "debug", text: err.message, words: [], qcm: [], vocab: [] }) }] });
  }
};
