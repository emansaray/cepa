import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import ThreadCard from "../components/ThreadCard";
import Pagination from "../components/Pagination";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  const [threads, setThreads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (q.trim().length < 2) {
      setThreads([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .searchThreads(q, { page })
      .then((data) => {
        setThreads(data.threads);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [q, page]);

  function goToPage(p) {
    setSearchParams({ q, page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="container page">
      <div className="eyebrow">Search</div>
      <h1>Results for &ldquo;{q}&rdquo;</h1>

      {loading && <p>Searching…</p>}
      {error && <div className="error-banner">{error}</div>}

      <div className="thread-list">
        {threads.map((t) => (
          <ThreadCard key={t.id} thread={t} />
        ))}
        {!loading && threads.length === 0 && <p>No threads match that search.</p>}
      </div>

      {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={goToPage} />}
    </div>
  );
}
