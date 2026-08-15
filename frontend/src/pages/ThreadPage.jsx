import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import ReplyItem from "../components/ReplyItem";
import VoteButton from "../components/VoteButton";
import { useAuth } from "../context/AuthContext";

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ThreadPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingOp, setEditingOp] = useState(false);
  const [opDraftTitle, setOpDraftTitle] = useState("");
  const [opDraftBody, setOpDraftBody] = useState("");
  const [opSaving, setOpSaving] = useState(false);
  const [opError, setOpError] = useState("");

  function load() {
    setLoading(true);
    api
      .getThread(id)
      .then(({ thread, userVotedThread, votedReplyIds }) => {
        const withVotes = {
          ...thread,
          userVoted: userVotedThread,
          replies: thread.replies.map((r) => ({ ...r, userVoted: votedReplyIds.includes(r.id) })),
        };
        setThread(withVotes);
        setOpDraftTitle(thread.title);
        setOpDraftBody(thread.body);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleReplySubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.createReply(id, { body: replyBody });
      setReplyBody("");
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReplyUpdated(updated) {
    setThread((t) => ({
      ...t,
      replies: t.replies.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
    }));
  }

  async function handleDeleteReply(replyId) {
    if (!confirm("Delete this reply? This can't be undone.")) return;
    await api.deleteReply(replyId);
    load();
  }

  async function handleDeleteThread() {
    if (!confirm("Delete this whole thread and its replies? This can't be undone.")) return;
    await api.deleteThread(id);
    navigate(`/c/${thread.category.slug}`);
  }

  async function handleSaveOp() {
    setOpSaving(true);
    setOpError("");
    try {
      await api.updateThread(id, { title: opDraftTitle, body: opDraftBody });
      setEditingOp(false);
      load();
    } catch (err) {
      setOpError(err.message);
    } finally {
      setOpSaving(false);
    }
  }

  if (loading) return <div className="container page"><p>Loading…</p></div>;
  if (error) return <div className="container page"><div className="error-banner">{error}</div></div>;
  if (!thread) return null;

  const isOwner = user && user.id === thread.author?.id;
  const isStaff = user && ["MODERATOR", "ADMIN"].includes(user.role);
  const canModify = isOwner || isStaff;

  return (
    <div className="container page">
      <Link to={`/c/${thread.category.slug}`} className="back-link">
        &larr; {thread.category.name}
      </Link>

      <article className="thread-op card">
        <div className="record-no">Record No. {String(thread.id).padStart(4, "0")}</div>

        {editingOp ? (
          <div className="inline-edit">
            {opError && <div className="error-banner">{opError}</div>}
            <div className="field">
              <label htmlFor="opTitle">Title</label>
              <input id="opTitle" value={opDraftTitle} onChange={(e) => setOpDraftTitle(e.target.value)} minLength={5} maxLength={200} />
            </div>
            <div className="field">
              <label htmlFor="opBody">Body</label>
              <textarea id="opBody" value={opDraftBody} onChange={(e) => setOpDraftBody(e.target.value)} minLength={10} maxLength={4000} rows={6} />
            </div>
            <div className="inline-edit-actions">
              <button className="btn btn-accent btn-small" onClick={handleSaveOp} disabled={opSaving}>
                {opSaving ? "Saving…" : "Save"}
              </button>
              <button className="btn btn-ghost btn-small" onClick={() => setEditingOp(false)}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1>{thread.title}</h1>
            <div className="thread-op-meta">
              Opened by {thread.author?.displayName} &middot; {formatDate(thread.createdAt)} &middot;{" "}
              {thread.viewCount} views
              {thread.updatedAt !== thread.createdAt ? " · edited" : ""}
            </div>
            <p className="thread-op-body">{thread.body}</p>
          </>
        )}

        <div className="thread-op-actions">
          <VoteButton
            count={thread._count?.votes ?? 0}
            voted={thread.userVoted}
            onToggle={() => api.voteThread(thread.id)}
          />
          {canModify && !editingOp && (
            <>
              <button className="btn btn-ghost btn-small" onClick={() => setEditingOp(true)}>
                Edit
              </button>
              <button className="btn btn-danger btn-small" onClick={handleDeleteThread}>
                Delete thread
              </button>
            </>
          )}
        </div>
      </article>

      <div className="section-header">
        <h2>Replies ({thread.replies.length})</h2>
      </div>
      <hr className="hairline" />

      <div className="reply-list">
        {thread.replies.map((r, i) => (
          <ReplyItem key={r.id} reply={r} index={i} onDelete={handleDeleteReply} onUpdated={handleReplyUpdated} />
        ))}
        {thread.replies.length === 0 && <p>No replies yet. Bring your evidence.</p>}
      </div>

      {thread.isLocked ? (
        <p className="locked-note">This thread is locked and no longer accepting replies.</p>
      ) : user ? (
        <form className="card reply-form" onSubmit={handleReplySubmit}>
          <h3>Add a reply</h3>
          {formError && <div className="error-banner">{formError}</div>}
          <div className="field">
            <label htmlFor="replyBody">Your reply</label>
            <textarea
              id="replyBody"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              required
              minLength={2}
              maxLength={4000}
              placeholder="Bring evidence, not just opinion."
            />
          </div>
          <button className="btn btn-accent" type="submit" disabled={submitting}>
            {submitting ? "Posting…" : "Post reply"}
          </button>
        </form>
      ) : (
        <p>
          <Link to="/login">Sign in</Link> to reply to this thread.
        </p>
      )}
    </div>
  );
}
