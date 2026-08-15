import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ChatbotPanel from "./components/ChatbotPanel";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ThreadPage from "./pages/ThreadPage";
import NewThread from "./pages/NewThread";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchPage from "./pages/SearchPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/c/:slug" element={<CategoryPage />} />
          <Route path="/t/:id" element={<ThreadPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/u/:username" element={<ProfilePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/new-thread"
            element={
              <ProtectedRoute>
                <NewThread />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container">
          <span className="record-no">CEPA — Community Evidence for Progressive Action</span>
        </div>
      </footer>
      <ChatbotPanel />
    </>
  );
}
