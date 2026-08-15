import { Link } from "react-router-dom";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function ThreadCard({ thread }) {
  return (
    <Link to={`/t/${thread.id}`} className="thread-row">
      <div className="thread-row-id record-no">No. {String(thread.id).padStart(4, "0")}</div>
      <div className="thread-row-main">
        <div className="thread-row-title">
          {thread.isPinned && <span className="tag tag-pinned">Pinned</span>}
          {thread.isLocked && <span className="tag tag-locked">Locked</span>}
          {thread.title}
        </div>
        <div className="thread-row-meta">
          by {thread.author?.displayName ?? "unknown"} &middot; {formatDate(thread.createdAt)}
          {thread.category && (
            <>
              {" "}
              &middot; in {thread.category.name}
            </>
          )}
        </div>
      </div>
      <div className="thread-row-stats">
        <div>
          <span className="count-number">{thread._count?.votes ?? 0}</span>
          <span className="count-label">endorsed</span>
        </div>
        <div>
          <span className="count-number">{thread._count?.replies ?? 0}</span>
          <span className="count-label">replies</span>
        </div>
      </div>
    </Link>
  );
}
