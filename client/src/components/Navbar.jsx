import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Compass, 
  FolderLock, 
  PlusCircle, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  FileSearch,
  User as UserIcon
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-detective-bg/95 backdrop-blur-md border-b border-detective-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-detective-card border border-detective-gold/40 flex items-center justify-center shadow-detective-card group-hover:border-detective-gold transition-colors">
              <FileSearch className="w-5 h-5 text-detective-gold" />
            </div>
            <div>
              <span className="font-cinzel text-lg font-bold tracking-wider text-detective-text group-hover:text-detective-gold transition-colors block">
                AI MYSTERY ROOM
              </span>
              <span className="text-[10px] tracking-widest uppercase text-detective-muted block font-mono">
                AI Detective & Case Solver
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-detective-gold bg-detective-card border border-detective-gold/30' 
                  : 'text-detective-muted hover:text-detective-text hover:bg-detective-card/50'
              }`}
            >
              Overview
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/cases"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/cases') 
                      ? 'text-detective-gold bg-detective-card border border-detective-gold/30' 
                      : 'text-detective-muted hover:text-detective-text hover:bg-detective-card/50'
                  }`}
                >
                  <FolderLock className="w-4 h-4" />
                  My Investigations
                </Link>
                <Link
                  to="/cases/new"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    isActive('/cases/new') 
                      ? 'text-detective-gold bg-detective-card border border-detective-gold/30' 
                      : 'text-detective-muted hover:text-detective-text hover:bg-detective-card/50'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-detective-gold" />
                  New Case
                </Link>
              </>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  className="p-2 rounded-md text-detective-muted hover:text-detective-text hover:bg-detective-card border border-transparent hover:border-detective-border transition-colors"
                  title="Account Settings"
                >
                  <SettingsIcon className="w-4 h-4" />
                </Link>

                <div className="h-4 w-px bg-detective-border mx-1" />

                <div className="flex items-center gap-2 px-3 py-1 bg-detective-card border border-detective-border rounded-md text-xs">
                  <UserIcon className="w-3.5 h-3.5 text-detective-gold" />
                  <span className="text-detective-text font-medium truncate max-w-[120px]">
                    {user?.name || 'Detective'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-detective-muted hover:text-detective-error hover:bg-detective-card border border-transparent hover:border-detective-border transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-sm text-detective-muted hover:text-detective-text hover:bg-detective-card transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-detective-gold text-detective-bg hover:bg-detective-gold-hover transition-colors shadow-detective-card"
                >
                  Join Detective Bureau
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-detective-muted hover:text-detective-text hover:bg-detective-card"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-detective-border bg-detective-surface px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-detective-text hover:bg-detective-card"
          >
            Overview
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/cases"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-detective-text hover:bg-detective-card"
              >
                My Investigations
              </Link>
              <Link
                to="/cases/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-detective-text hover:bg-detective-card"
              >
                Start New Case
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-detective-text hover:bg-detective-card"
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-detective-error hover:bg-detective-card"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-detective-border flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-center rounded-md text-base font-medium text-detective-text bg-detective-card"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-center rounded-md text-base font-medium bg-detective-gold text-detective-bg"
              >
                Join Detective Bureau
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
