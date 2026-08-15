import { useState, useRef, useEffect } from "react";
import { api } from "../api/client";

export default function ChatbotPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the CEPA help bot. Ask me anything about using the site — how to post, reply, join a chamber, and so on." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setSending(true);

    try {
      // Only pass role/content pairs the API expects, excluding our seed greeting.
      const history = nextMessages
        .slice(1, -1)
        .map(({ role, content }) => ({ role, content }));
      const { reply } = await api.chat(text, history);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chatbot-root">
      {open && (
        <div className="chatbot-panel card">
          <div className="chatbot-header">
            <span>CEPA Help Bot</span>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close chat">
              &times;
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-message chatbot-message-${m.role}`}>
                {m.content}
              </div>
            ))}
            {sending && <div className="chatbot-message chatbot-message-assistant">Thinking…</div>}
            {error && <div className="error-banner">{error}</div>}
            <div ref={bottomRef} />
          </div>
          <form className="chatbot-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              aria-label="Chat message"
              maxLength={1000}
            />
            <button className="btn btn-accent btn-small" type="submit" disabled={sending}>
              Send
            </button>
          </form>
        </div>
      )}

      <button
        className="chatbot-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close help chat" : "Open help chat"}
      >
        {open ? "×" : "?"}
      </button>
    </div>
  );
}
