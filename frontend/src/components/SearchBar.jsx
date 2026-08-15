import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ compact = false }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed.length < 2) return;
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className={`search-bar ${compact ? "search-bar-compact" : ""}`} onSubmit={handleSubmit} role="search">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search threads…"
        aria-label="Search threads"
        minLength={2}
      />
      <button type="submit" className="btn btn-ghost btn-small">Search</button>
    </form>
  );
}
