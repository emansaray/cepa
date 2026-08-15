import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import VoteButton from "./VoteButton";

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReplyItem({ reply, index, onDelete, onUpdated }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reply.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOwner = user && user.id === reply.author?.id;
  const isStaff = user && ["MODERATOR", "ADMIN"].includes(user.role);
  const canModify = isOwner || isStaff;

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const { reply: updated } = await api.updateReply(reply.id, { body: draft });
      onUpdated?.(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="reply-item">
      <div className="reply-marker record-no">#{index + 1}</div>
      <div className="reply-body-wrap">
        <header className="reply-header">
          <span className="reply-author">{reply.author?.displayName ?? "unknown"}</span>
          <span className="reply-date">
            {formatDate(reply.createdAt)}
            {reply.updatedAt && reply.updatedAt !== reply.createdAt ? " (edited)" : ""}
          </span>
        </header>

        {editing ? (
          <div className="inline-edit">
            {error && <div className="error-banner">{error}</div>}
            <textarea value={draft} onChange={(e) => setDraft(e.target.value)} minLength={2} maxLength={4000} />
            <div className="inline-edit-actions">
              <button className="btn btn-accent btn-small" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button className="btn btn-ghost btn-small" onClick={() => { setEditing(false); setDraft(reply.body); }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="reply-body">{reply.body}</p>
        )}

        <div className="reply-actions">
          <VoteButton
            count={reply._count?.votes ?? 0}
            voted={reply.userVoted}
            onToggle={() => api.voteReply(reply.id)}
            size="small"
          />
          {canModify && !editing && (
            <>
              <button className="btn btn-ghost btn-small" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="btn btn-danger btn-small" onClick={() => onDelete(reply.id)}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
