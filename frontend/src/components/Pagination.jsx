export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <button className="btn btn-ghost btn-small" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        &larr; Prev
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`btn btn-ghost btn-small ${p === page ? "pagination-current" : ""}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button className="btn btn-ghost btn-small" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Next &rarr;
      </button>
    </nav>
  );
}
