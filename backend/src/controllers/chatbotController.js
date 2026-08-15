const { body, validationResult } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.status = 400;
    throw error;
  }
}

const chatValidators = [
  body("message").trim().isLength({ min: 1, max: 1000 }).withMessage("Message must be 1–1000 characters."),
];

// Static FAQ context the chatbot is grounded in. Edit this to match what
// CEPA members actually ask — the more specific this is, the better the
// bot's answers will be.
const FAQ_CONTEXT = `
You are the CEPA help assistant. CEPA stands for Community Evidence for
Progressive Action, a community forum organized into "chambers" (categories),
where members post threads and replies to raise issues and back them with
evidence.

Answer only questions about how to use the CEPA site, its purpose, or its
community guidelines. Keep answers under 100 words, plain and friendly.

Frequently asked questions:
- How do I join? Click "Join CEPA" in the top right and fill in the form.
- How do I post? Sign in, open a chamber, click "Start a thread".
- How do I reply? Open any thread and use the reply box at the bottom.
- What are chambers? Topic areas threads are organized under (e.g. Community
  Health, Education & Youth).
- Can I delete my post? Yes — thread and reply authors can delete their own
  posts. Moderators and admins can delete any post.
- What if someone breaks the rules? Contact a moderator or admin listed in
  the chamber they posted in.

If a question falls outside CEPA's use or guidelines, say you're only able to
help with questions about using the CEPA site, and suggest they ask a
moderator for anything else.
`.trim();

// Calls the Anthropic API directly from the backend so the API key never
// reaches the browser. Requires ANTHROPIC_API_KEY to be set in .env.
const chat = asyncHandler(async (req, res) => {
  checkValidation(req);

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: "The chatbot isn't configured yet. Add ANTHROPIC_API_KEY to backend/.env to enable it.",
    });
  }

  const { message, history } = req.body;

  const messages = [
    ...(Array.isArray(history) ? history.slice(-6) : []),
    { role: "user", content: message },
  ];

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: FAQ_CONTEXT,
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Anthropic API error:", response.status, detail);
    return res.status(502).json({ error: "The chatbot is temporarily unavailable. Try again shortly." });
  }

  const data = await response.json();
  const reply = data.content
    ?.filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n") || "Sorry, I couldn't come up with an answer to that.";

  res.json({ reply });
});

module.exports = { chat, chatValidators };
