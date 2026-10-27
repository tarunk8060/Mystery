import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { 
  Settings as SettingsIcon, 
  User, 
  Lock, 
  ShieldCheck, 
  Cpu, 
  Database, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // System Health
  const [health, setHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await api.get('/health');
        setHealth(res);
      } catch (err) {
        setHealth({ status: 'offline', error: err.message });
      } finally {
        setCheckingHealth(false);
      }
    }
    checkHealth();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const payload = { name };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await updateProfile(payload);
      setSuccessMsg('Profile credentials updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update credentials');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-14rem)] space-y-8">
      
      {/* Page Title */}
      <div className="border-b border-detective-border pb-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-detective-gold mb-1">
          <SettingsIcon className="w-4 h-4" />
          <span>Bureau Configuration</span>
        </div>
        <h1 className="font-cinzel text-3xl font-bold text-detective-text">
          Account & System Diagnostics
        </h1>
      </div>

      {/* Profile & Security Form */}
      <div className="bg-detective-card rounded-xl border border-detective-border p-6 shadow-detective-card space-y-6">
        <h2 className="font-cinzel text-lg font-bold text-detective-text border-b border-detective-border pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-detective-gold" />
          <span>Investigator Profile</span>
        </h2>

        {successMsg && (
          <div className="p-3.5 rounded bg-[#70C49B]/10 border border-[#70C49B]/30 text-[#70C49B] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded bg-[#E16D70]/10 border border-[#E16D70]/30 text-[#E16D70] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono uppercase text-detective-muted mb-1.5">
                Detective Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
              />
            </div>

            <div>
              <label className="block font-mono uppercase text-detective-muted mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-detective-surface/50 border border-detective-border rounded text-detective-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-detective-border/60">
            <h3 className="font-mono text-xs uppercase text-detective-gold font-bold mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Change Cipher Password (Optional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono uppercase text-detective-muted mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-detective-muted mb-1.5">
                  New Password (Min 6 Characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded bg-detective-gold text-detective-bg font-semibold text-xs hover:bg-detective-gold-hover transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* System Diagnostics Box */}
      <div className="bg-detective-card rounded-xl border border-detective-border p-6 shadow-detective-card space-y-4">
        <h2 className="font-cinzel text-lg font-bold text-detective-text border-b border-detective-border pb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-detective-gold" />
          <span>System Diagnostics & Engine Status</span>
        </h2>

        {checkingHealth ? (
          <div className="text-xs font-mono text-detective-muted">Checking API connectivity...</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-detective-surface rounded border border-detective-border">
                <span className="text-detective-muted block mb-1">Backend Server:</span>
                <span className="text-[#70C49B] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#70C49B] inline-block" />
                  Operational ({health?.environment || 'development'})
                </span>
              </div>

              <div className="p-3.5 bg-detective-surface rounded border border-detective-border">
                <span className="text-detective-muted block mb-1">Gemini API Key:</span>
                <span className={`font-bold flex items-center gap-1.5 ${health?.geminiConfigured ? 'text-[#70C49B]' : 'text-[#E16D70]'}`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {health?.geminiConfigured ? 'Active & Configured' : 'Missing (Not Configured)'}
                </span>
              </div>

              <div className="p-3.5 bg-detective-surface rounded border border-detective-border">
                <span className="text-detective-muted block mb-1">Database Connectivity:</span>
                <span className={`font-bold flex items-center gap-1.5 ${health?.dbConnected ? 'text-[#70C49B]' : 'text-[#E16D70]'}`}>
                  <Database className="w-3.5 h-3.5" />
                  {health?.dbConnected ? 'Connected (Ready)' : 'Disconnected'}
                </span>
              </div>
            </div>

            {!health?.geminiConfigured && (
              <div className="p-3.5 rounded bg-[#E16D70]/10 border border-[#E16D70]/30 text-xs">
                <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#E16D70]" />
                  <span>AI Detective Reasoning is currently paused</span>
                </div>
                <p className="text-detective-muted leading-relaxed">
                  The backend requires a Google Gemini API key to run forensic deductions and chat interrogations.
                  Get a free key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-detective-gold underline font-bold">Google AI Studio</a> and set <code>GEMINI_API_KEY=your_key</code> in your <code>.env</code> file.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Privacy and Ethics Guidance */}
      <div className="bg-detective-card rounded-xl border border-detective-border p-6 shadow-detective-card space-y-3">
        <h2 className="font-cinzel text-lg font-bold text-detective-text flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-detective-gold" />
          <span>Investigation Ethics & Data Privacy</span>
        </h2>
        <p className="text-xs text-detective-muted leading-relaxed">
          Your investigation records are strictly isolated. Each user has exclusive access to their own submitted cases. AI analysis is performed through isolated backend API calls with Google Gemini; no secret keys are exposed on client browsers. Original evidence is preserved immutably, and AI outputs are strictly validated to prevent hallucinations.
        </p>
      </div>

      {/* Sign Out Action */}
      <div className="pt-2 flex justify-start">
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-detective-surface border border-detective-border text-[#E16D70] hover:bg-[#E16D70]/10 text-xs font-semibold transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Bureau</span>
        </button>
      </div>

    </div>
  );
}
