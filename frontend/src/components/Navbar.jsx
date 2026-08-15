import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">CEPA</span>
          <span className="brand-full">Community Evidence for Progressive Action</span>
        </Link>

        <SearchBar compact />

        <nav className="navbar-actions">
          {user ? (
            <>
              <Link to="/new-thread" className="btn btn-accent">Start a thread</Link>
              {user.role === "ADMIN" && (
                <Link to="/admin" className="btn btn-ghost">Admin</Link>
              )}
              <Link to={`/u/${user.username}`} className="navbar-user">{user.displayName}</Link>
              <button className="btn btn-ghost" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Join CEPA</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
