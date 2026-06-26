import { Link, useNavigate } from 'react-router-dom';
import { Code2, LayoutDashboard, FileText, FolderOpen, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCallback } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <nav className="border-b border-zinc-800 bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Code2 className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold text-white">CodeReview AI</span>
          </Link>

          {/* Navigation Links */}
          {user ? (
            <div className="flex items-center gap-6">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                to="/editor"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">New Review</span>
              </Link>
              <Link
                to="/projects"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Projects</span>
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
            </div>
          ) : null}

          {/* User Menu */}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-zinc-400 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
