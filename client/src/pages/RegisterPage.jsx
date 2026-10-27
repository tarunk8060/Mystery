import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { FileSearch, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/cases', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-detective-bg">
      <div className="max-w-md w-full space-y-8 bg-detective-card p-8 rounded-xl border border-detective-border shadow-detective-card">
        
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-lg bg-detective-surface border border-detective-gold/40 flex items-center justify-center text-detective-gold mb-3">
            <FileSearch className="w-6 h-6" />
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-detective-text">
            Register Investigator Badge
          </h2>
          <p className="mt-1 text-xs text-detective-muted">
            Create an analytical case solving workspace.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-[#E16D70]/10 border border-[#E16D70]/30 text-[#E16D70] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-detective-muted mb-1.5">
              Detective Name / Codename
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-detective-muted">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Inspector Jane Marple"
                className="w-full pl-10 pr-3 py-2 bg-detective-surface border border-detective-border rounded-md text-sm text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-detective-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-detective-muted">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@bureau.org"
                className="w-full pl-10 pr-3 py-2 bg-detective-surface border border-detective-border rounded-md text-sm text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-detective-muted mb-1.5">
              Cipher Password (Min 6 Characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-detective-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3 py-2 bg-detective-surface border border-detective-border rounded-md text-sm text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-md bg-detective-gold text-detective-bg font-semibold text-sm hover:bg-detective-gold-hover transition-colors flex items-center justify-center gap-2 shadow-detective-card disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-detective-bg border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Issue Detective Credentials</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-detective-border text-center text-xs text-detective-muted">
          Already registered?{' '}
          <Link to="/login" className="text-detective-gold hover:underline font-medium">
            Sign in with existing badge
          </Link>
        </div>

      </div>
    </div>
  );
}
