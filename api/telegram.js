export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).json({ ok: true });

  const GROQ_KEY = process.env.GROQ_API_KEY;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  try {
    const { message } = req.body;
    if (!message || !message.text) return res.status(200).json({ ok: true });

    const chatId = message.chat.id;
    const userText = message.text;

    // Skip /start command
    if (userText === "/start") {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "Hey! I'm Sahid Sk 👋 Think of me as your friend who's always here to chat, help you decide stuff, or just listen. What's on your mind?"
        })
      });
      return res.status(200).json({ ok: true });
    }

    // Call Groq
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + GROQ_KEY
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "Your name is Sahid Sk. You are a warm, honest, supportive friend who helps people make decisions. Talk casually like a real person on WhatsApp. Be friendly, practical and kind. Use simple language. Occasionally say bro or yaar if it fits. Never pretend to be a doctor, lawyer or financial advisor for serious matters."
          },
          { role: "user", content: userText }
        ],
        max_tokens: 1000,
        temperature: 0.9
      })
    });

    const groqData = await groqRes.json();
    const reply = groqData.choices?.[0]?.message?.content?.trim()
      || "Hmm, couldn't think of a reply. Try again yaar!";

    // Send reply to Telegram
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply
      })
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("Telegram handler error:", err.message);
    return res.status(200).json({ ok: true });
  }
}
