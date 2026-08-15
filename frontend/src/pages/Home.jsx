import { useEffect, useState } from "react";
import { api } from "../api/client";
import CategoryCard from "../components/CategoryCard";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listCategories()
      .then(({ categories }) => setCategories(categories))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <section className="hero">
        <div className="eyebrow">Community Evidence for Progressive Action</div>
        <h1>A public register for the arguments your community is having with evidence.</h1>
        <p className="hero-sub">
          CEPA is where members raise issues, bring data, and work toward action together —
          organized by chamber, open for reply, on the record.
        </p>
      </section>

      <hr className="hairline-double" />

      <section className="page-section">
        <h2>Chambers</h2>
        {loading && <p>Loading chambers…</p>}
        {error && <div className="error-banner">{error}</div>}
        <div className="category-grid">
          {categories.map((c, i) => (
            <CategoryCard key={c.id} category={c} index={i} />
          ))}
        </div>
        {!loading && categories.length === 0 && !error && (
          <p>No chambers yet. Once the API is seeded, they'll appear here.</p>
        )}
      </section>
    </div>
  );
}
