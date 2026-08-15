import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [catError, setCatError] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);

  function loadAll() {
    setLoading(true);
    Promise.all([api.listAllUsers(), api.listCategories()])
      .then(([u, c]) => {
        setUsers(u.users);
        setCategories(c.categories);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  async function handleRoleChange(id, role) {
    try {
      await api.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateCategory(e) {
    e.preventDefault();
    setCatError("");
    setCatSubmitting(true);
    try {
      await api.createCategory({ name: newCatName, description: newCatDesc });
      setNewCatName("");
      setNewCatDesc("");
      loadAll();
    } catch (err) {
      setCatError(err.message);
    } finally {
      setCatSubmitting(false);
    }
  }

  async function handleDeleteCategory(id) {
    if (!confirm("Delete this chamber and all its threads? This can't be undone.")) return;
    try {
      await api.deleteCategory(id);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="container page"><p>Loading…</p></div>;

  return (
    <div className="container page">
      <div className="eyebrow">Admin</div>
      <h1>Admin dashboard</h1>
      {error && <div className="error-banner">{error}</div>}

      <div className="page-section">
        <h2>Members</h2>
        <div className="admin-table">
          {users.map((u) => (
            <div className="admin-row" key={u.id}>
              <div className="admin-row-main">
                <strong>{u.displayName}</strong> <span className="record-no">@{u.username}</span>
              </div>
              <select
                value={u.role}
                disabled={u.id === currentUser.id}
                onChange={(e) => handleRoleChange(u.id, e.target.value)}
              >
                <option value="MEMBER">Member</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="page-section">
        <h2>Chambers</h2>
        <div className="admin-table">
          {categories.map((c) => (
            <div className="admin-row" key={c.id}>
              <div className="admin-row-main">
                <strong>{c.name}</strong>
                <div className="reply-date">{c.description}</div>
              </div>
              <button className="btn btn-danger btn-small" onClick={() => handleDeleteCategory(c.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>

        <form className="card auth-form" onSubmit={handleCreateCategory} style={{ marginTop: "1rem" }}>
          <h3>New chamber</h3>
          {catError && <div className="error-banner">{catError}</div>}
          <div className="field">
            <label htmlFor="catName">Name</label>
            <input id="catName" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} required minLength={2} maxLength={120} />
          </div>
          <div className="field">
            <label htmlFor="catDesc">Description</label>
            <textarea id="catDesc" value={newCatDesc} onChange={(e) => setNewCatDesc(e.target.value)} required minLength={2} maxLength={400} rows={3} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={catSubmitting}>
            {catSubmitting ? "Creating…" : "Create chamber"}
          </button>
        </form>
      </div>
    </div>
  );
}
