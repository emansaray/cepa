import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client";
import ThreadCard from "../components/ThreadCard";
import Pagination from "../components/Pagination";

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .listThreads(slug, { page })
      .then((data) => {
        setCategory(data.category);
        setThreads(data.threads);
        setPagination(data.pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, page]);

  function goToPage(p) {
    setSearchParams({ page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="container page">
      <Link to="/" className="back-link">&larr; All chambers</Link>

      {loading && <p>Loading…</p>}
      {error && <div className="error-banner">{error}</div>}

      {category && (
        <>
          <div className="eyebrow">Chamber</div>
          <h1>{category.name}</h1>
          <p className="hero-sub">{category.description}</p>

          <div className="section-header">
            <h2>Threads</h2>
            <Link to={`/new-thread?category=${category.slug}`} className="btn btn-accent">
              Start a thread
            </Link>
          </div>

          <hr className="hairline" />
          <div className="thread-list">
            {threads.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
            {threads.length === 0 && <p>No threads yet — be the first to raise an issue here.</p>}
          </div>

          {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={goToPage} />}
        </>
      )}
    </div>
  );
}
