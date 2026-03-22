// v1beta gemini-2.5-flash-lite
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
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            thinkingConfig: { thinkingBudget: 0 }
          }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data.error || data));

    const parts = data.candidates?.[0]?.content?.parts || [];
    const textPart = parts.find(p => p.text && !p.thought);
    let text = textPart ? textPart.text : (parts[parts.length-1]?.text || "");

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < 0) throw new Error("No JSON found");
    text = text.slice(start, end + 1);

    // Fix unescaped apostrophes that break JSON
    // Strategy: escape them as \u0027 inside string values
    // Replace APOSTROPHE_MARKER with a safe placeholder already done in prompt
    // Just use the text as-is since Gemini uses the marker
    let fixed = text;
    let parsed;
    try {
      parsed = JSON.parse(fixed);
    } catch(e) {
      parsed = { title: "Debug", type: "debug", text: e.message + " | " + fixed.substring(0,300), words: [], qcm: [], vocab: [] };
    }

    // Restore apostrophes from placeholder
    const restored = JSON.stringify(parsed).replace(/APOSTROPHE_MARKER/g, "'");
    return res.status(200).json({ content: [{ type: "text", text: restored }] });

  } catch (err) {
    return res.status(200).json({ content: [{ type: "text", text: JSON.stringify({ title: "Erreur", type: "debug", text: err.message, words: [], qcm: [], vocab: [] }) }] });
  }
};
