import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";

const Navbar = ({ searchQuery, onSearchChange }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    showToast("Logged out successfully", "success");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex flex-wrap justify-between items-center gap-4">
      <div className="text-xl font-bold shrink-0">
        <Link to="/home">NoteApp</Link>
      </div>

      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery || ""}
        onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        className="bg-gray-600 text-white placeholder-gray-300 px-4 py-2 rounded flex-1 min-w-[200px] max-w-md outline-none focus:ring-2 focus:ring-blue-400"
      />

      <div className="flex items-center gap-3 shrink-0 flex-wrap">
        {user ? (
          <span className="text-sm text-gray-200 mr-1">Hi, {user.name}</span>
        ) : (
          <span className="text-sm text-gray-400 mr-1">Guest</span>
        )}
        {!user && (
          <>
            <Link
              to="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Sign Up
            </Link>
          </>
        )}
        {user && (
          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
