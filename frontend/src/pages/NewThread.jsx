import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";

export default function NewThread() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.listCategories().then(({ categories }) => {
      setCategories(categories);
      const preselect = searchParams.get("category");
      const match = categories.find((c) => c.slug === preselect);
      setCategoryId(match ? String(match.id) : categories[0] ? String(categories[0].id) : "");
    });
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { thread } = await api.createThread({ title, body, categoryId: Number(categoryId) });
      navigate(`/t/${thread.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page page-narrow">
      <div className="eyebrow">New record</div>
      <h1>Start a thread</h1>
      <p className="hero-sub">State the issue, then bring the evidence.</p>

      <form className="card auth-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label htmlFor="category">Chamber</label>
          <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={5}
            maxLength={200}
            placeholder="What's the issue, in one line?"
          />
        </div>

        <div className="field">
          <label htmlFor="body">Body</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            minLength={10}
            maxLength={4000}
            placeholder="Lay out the issue and the evidence behind it."
            rows={8}
          />
        </div>

        <button className="btn btn-accent" type="submit" disabled={submitting}>
          {submitting ? "Posting…" : "Post thread"}
        </button>
      </form>
    </div>
  );
}
