import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { 
  FolderLock, 
  Search, 
  PlusCircle, 
  Filter, 
  Trash2, 
  Clock, 
  Calendar, 
  ArrowRight,
  AlertCircle,
  FileQuestion,
  Users,
  Compass,
  Sparkles
} from 'lucide-react';

export default function CaseListPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Deletion Modal
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    'All',
    'Theft',
    'Missing object',
    'Fictional murder mystery',
    'Cyber mystery',
    'Fraud',
    'General mystery',
    'Other',
  ];

  const statuses = ['All', 'Open', 'Under Investigation', 'Solved', 'Cold Case'];

  const fetchCases = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (sortBy) params.sort = sortBy;

      const res = await api.get('/cases', { params });
      if (res.success) {
        setCases(res.cases || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load investigation cases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCases();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedStatus, sortBy]);

  const handleDeleteCase = async () => {
    if (!caseToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/cases/${caseToDelete._id}`);
      setCases(cases.filter((c) => c._id !== caseToDelete._id));
      setCaseToDelete(null);
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-14rem)]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-6 border-b border-detective-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-detective-gold mb-1">
            <FolderLock className="w-4 h-4" />
            <span>Active Case Vault</span>
          </div>
          <h1 className="font-cinzel text-3xl font-bold text-detective-text">
            My Investigations
          </h1>
          <p className="text-xs text-detective-muted mt-1">
            Browse, manage, and continue analyzing your submitted mysteries.
          </p>
        </div>

        <Link
          to="/cases/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-detective-gold text-detective-bg font-semibold text-sm hover:bg-detective-gold-hover transition-colors shadow-detective-card shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Investigation</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-detective-card p-4 rounded-xl border border-detective-border shadow-detective-card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-detective-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search case titles or clues..."
              className="w-full pl-9 pr-3 py-2 bg-detective-surface border border-detective-border rounded-md text-xs text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded-md text-xs text-detective-text focus:outline-none focus:border-detective-gold"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded-md text-xs text-detective-text focus:outline-none focus:border-detective-gold"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded-md text-xs text-detective-text focus:outline-none focus:border-detective-gold"
            >
              <option value="newest">Created (Newest First)</option>
              <option value="oldest">Created (Oldest First)</option>
              <option value="updated">Last Updated</option>
              <option value="title">Case Title (A-Z)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-[#E16D70]/10 border border-[#E16D70]/30 text-[#E16D70] text-sm flex items-center gap-2 mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-detective-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-detective-muted">
            Inspecting Archive Records...
          </p>
        </div>
      ) : cases.length === 0 ? (
        /* Empty State */
        <div className="bg-detective-card border border-detective-border rounded-xl p-12 text-center shadow-detective-card max-w-xl mx-auto my-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-detective-surface border border-detective-border flex items-center justify-center text-detective-gold mb-4">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-detective-text mb-2">
            No Active Investigations Found
          </h3>
          <p className="text-xs text-detective-muted mb-6 leading-relaxed">
            {searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All'
              ? 'No investigations match your active filter criteria. Try resetting filters.'
              : 'You have not submitted any mystery cases to the bureau yet. Submit your first mystery to let the AI detective analyze the evidence.'}
          </p>
          <Link
            to="/cases/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-detective-gold text-detective-bg font-semibold text-xs hover:bg-detective-gold-hover transition-colors shadow-detective-card"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create First Case File</span>
          </Link>
        </div>
      ) : (
        /* Cases Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((caseItem) => (
            <div
              key={caseItem._id}
              className="bg-detective-card rounded-xl border border-detective-border hover:border-detective-gold/50 transition-all shadow-detective-card flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                
                {/* Badges Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <StatusBadge status={caseItem.category} type="category" />
                  <StatusBadge status={caseItem.investigationStatus} type="status" />
                </div>

                {/* Case Title */}
                <h3 className="font-cinzel text-lg font-bold text-detective-text group-hover:text-detective-gold transition-colors line-clamp-1 mb-2">
                  <Link to={`/cases/${caseItem._id}`}>
                    {caseItem.title}
                  </Link>
                </h3>

                {/* Description */}
                <p className="text-xs text-detective-muted line-clamp-2 leading-relaxed mb-4">
                  {caseItem.description}
                </p>

                {/* Latest Analysis Pill */}
                {caseItem.latestAnalysisId ? (
                  <div className="p-3 bg-detective-surface rounded-lg border border-detective-border/80 mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono uppercase text-detective-gold flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        Analysis v{caseItem.analysisVersion || 1}
                      </span>
                      {caseItem.isAnalysisStale && (
                        <span className="text-[10px] font-mono text-[#E16D70] uppercase">
                          Stale
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-detective-text font-medium line-clamp-1">
                      {caseItem.latestAnalysisId.conclusion?.hypothesis || caseItem.latestAnalysisId.summary}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-detective-surface/50 rounded-lg border border-dashed border-detective-border mb-4 text-[11px] text-detective-muted italic">
                    No AI forensic analysis run yet.
                  </div>
                )}

                {/* Suspect & Clue Counts */}
                <div className="flex items-center justify-between text-xs font-mono text-detective-muted border-t border-detective-border/50 pt-3">
                  <div className="flex items-center gap-4">
                    <span>{caseItem.suspectsCount} Suspects</span>
                    <span>&bull;</span>
                    <span>{caseItem.cluesCount} Clues</span>
                  </div>
                  <span className="text-[11px]">
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                  </span>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3 bg-detective-surface/80 border-t border-detective-border flex items-center justify-between">
                <button
                  onClick={() => setCaseToDelete(caseItem)}
                  className="p-1.5 rounded text-detective-muted hover:text-[#E16D70] hover:bg-detective-card transition-colors"
                  title="Delete Case File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link
                  to={`/cases/${caseItem._id}`}
                  className="inline-flex items-center gap-1 text-xs font-mono text-detective-gold hover:text-detective-gold-hover transition-colors font-medium"
                >
                  <span>Open Investigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {caseToDelete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-detective-card border border-detective-border rounded-xl max-w-md w-full p-6 shadow-detective-card">
            <h3 className="font-cinzel text-lg font-bold text-detective-text mb-2">
              Confirm Case File Deletion
            </h3>
            <p className="text-xs text-detective-muted leading-relaxed mb-6">
              Are you sure you want to permanently purge{' '}
              <span className="text-detective-text font-bold">"{caseToDelete.title}"</span>? 
              This will irreversibly delete all cataloged suspects, clues, historical analyses, and detective transcripts.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCaseToDelete(null)}
                className="px-4 py-2 rounded-md bg-detective-surface border border-detective-border text-xs text-detective-text hover:bg-detective-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCase}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-[#E16D70] text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
