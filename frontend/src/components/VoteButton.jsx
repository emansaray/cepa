import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function VoteButton({ count, voted: initialVoted, onToggle, size = "normal" }) {
  const { user } = useAuth();
  const [voted, setVoted] = useState(Boolean(initialVoted));
  const [voteCount, setVoteCount] = useState(count ?? 0);
  const [busy, setBusy] = useState(false);

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user || busy) return;
    setBusy(true);
    try {
      const result = await onToggle();
      setVoted(result.voted);
      setVoteCount(result.voteCount);
    } catch {
      // Silently ignore — the button just won't update, no need to interrupt reading.
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className={`vote-btn ${voted ? "vote-btn-active" : ""} ${size === "small" ? "vote-btn-small" : ""}`}
      onClick={handleClick}
      disabled={!user || busy}
      title={user ? (voted ? "Remove endorsement" : "Endorse this") : "Sign in to endorse"}
      type="button"
    >
      <span className="vote-icon" aria-hidden="true">&#9650;</span>
      <span className="vote-count">{voteCount}</span>
    </button>
  );
}
