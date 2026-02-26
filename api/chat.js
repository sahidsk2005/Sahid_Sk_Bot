export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { messages, system } = req.body;

    // Groq - 100% FREE, no credit card, very fast (Llama 3)
    // Get your free key at: https://console.groq.com
    const GROQ_KEY = process.env.GROQ_API_KEY;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: system },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.9
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", JSON.stringify(data));
      return res.status(500).json({ error: data?.error?.message || "API error" });
    }

    const reply = data.choices?.[0]?.message?.content?.trim()
      || "Hmm, couldn't get a response. Try again?";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
