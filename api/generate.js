const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const prompt = body.messages?.[0]?.content || "";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
    });

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end < 0) throw new Error("No JSON in response");
    text = text.slice(start, end + 1);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch(e) {
      const safe = text.substring(0, 300).replace(/"/g, "'");
      const errJson = `{"title":"Debug","type":"debug","text":"${e.message.replace(/"/g,"'")} | ${safe}","words":[],"qcm":[],"vocab":[]}`;
      return res.status(200).json({ content: [{ type: "text", text: errJson }] });
    }

    return res.status(200).json({ content: [{ type: "text", text: JSON.stringify(parsed) }] });

  } catch (err) {
    const errJson = `{"title":"Erreur","type":"debug","text":"${err.message.replace(/"/g,"'")}","words":[],"qcm":[],"vocab":[]}`;
    return res.status(200).json({ content: [{ type: "text", text: errJson }] });
  }
};
