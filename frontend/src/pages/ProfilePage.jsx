import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [threads, setThreads] = useState([]);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .getProfile(username)
      .then((data) => {
        setProfile(data.user);
        setThreads(data.threads);
        setReplies(data.replies);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="container page"><p>Loading…</p></div>;
  if (error) return <div className="container page"><div className="error-banner">{error}</div></div>;
  if (!profile) return null;

  const isSelf = currentUser && currentUser.username === profile.username;

  return (
    <div className="container page">
      <div className="eyebrow">Member profile</div>
      <h1>{profile.displayName}</h1>
      <p className="hero-sub">
        @{profile.username} &middot; {profile.role} &middot; joined {formatDate(profile.createdAt)}
      </p>
      {profile.bio && <p className="profile-bio">{profile.bio}</p>}
      {isSelf && (
        <Link to="/settings/profile" className="btn btn-ghost btn-small">
          Edit profile
        </Link>
      )}

      <div className="profile-stats">
        <div><span className="count-number">{profile._count?.threads ?? 0}</span><span className="count-label">threads</span></div>
        <div><span className="count-number">{profile._count?.replies ?? 0}</span><span className="count-label">replies</span></div>
      </div>

      <div className="page-section">
        <h2>Recent threads</h2>
        <div className="thread-list">
          {threads.map((t) => (
            <Link key={t.id} to={`/t/${t.id}`} className="thread-row">
              <div className="thread-row-id record-no">No. {String(t.id).padStart(4, "0")}</div>
              <div className="thread-row-main">
                <div className="thread-row-title">{t.title}</div>
                <div className="thread-row-meta">in {t.category?.name} &middot; {formatDate(t.createdAt)}</div>
              </div>
            </Link>
          ))}
          {threads.length === 0 && <p>No threads yet.</p>}
        </div>
      </div>

      <div className="page-section">
        <h2>Recent replies</h2>
        <div className="thread-list">
          {replies.map((r) => (
            <Link key={r.id} to={`/t/${r.threadId}`} className="thread-row">
              <div className="thread-row-main">
                <div className="thread-row-title">Re: {r.thread?.title}</div>
                <div className="thread-row-meta">{formatDate(r.createdAt)}</div>
              </div>
            </Link>
          ))}
          {replies.length === 0 && <p>No replies yet.</p>}
        </div>
      </div>
    </div>
  );
}
