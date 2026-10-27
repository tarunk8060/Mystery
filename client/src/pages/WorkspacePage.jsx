import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { 
  Users, 
  Layers, 
  MessageSquare, 
  Sparkles, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit3, 
  FileText, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Filter, 
  RefreshCw,
  Search,
  ChevronRight,
  Info,
  Calendar,
  Compass
} from 'lucide-react';

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [investigation, setInvestigation] = useState(null);
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('suspects'); // 'suspects' | 'evidence' | 'chat'

  // Loading States
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);
  const [error, setError] = useState(null);
  const [chatError, setChatError] = useState(null);

  // Evidence Board Filters
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('All');
  const [suspectFilter, setSuspectFilter] = useState('All');
  const [verificationFilter, setVerificationFilter] = useState('All');

  // Modals
  const [isAddSuspectOpen, setIsAddSuspectOpen] = useState(false);
  const [editingSuspect, setEditingSuspect] = useState(null);
  const [isAddClueOpen, setIsAddClueOpen] = useState(false);
  const [editingClue, setEditingClue] = useState(null);

  // Chat Input
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  // Fetch full case, latest analysis, and chat history
  const loadCaseData = async () => {
    try {
      setError(null);
      const [caseRes, analysisRes, chatRes] = await Promise.all([
        api.get(`/cases/${id}`),
        api.get(`/cases/${id}/analysis`),
        api.get(`/cases/${id}/chat`),
      ]);

      if (caseRes.success) {
        setInvestigation(caseRes.case);
      }
      if (analysisRes.success) {
        setLatestAnalysis(analysisRes.analysis);
      }
      if (chatRes.success) {
        setChatMessages(chatRes.messages || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load investigation workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Run or Re-run AI Analysis
  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.post(`/cases/${id}/analyze`);
      if (res.success) {
        setLatestAnalysis(res.analysis);
        setInvestigation(res.case);
      }
    } catch (err) {
      setError(err.message || 'AI detective analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  // Chat message submit
  const handleSendChat = async (e, customPrompt = null) => {
    if (e) e.preventDefault();
    const query = customPrompt || chatInput;
    if (!query.trim() || sendingChat) return;

    setSendingChat(true);
    setChatError(null);
    setChatInput('');

    // Optimistically add user message
    const tempUserMsg = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: query,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.post(`/cases/${id}/chat`, { message: query });
      if (res.success) {
        setChatMessages((prev) => [
          ...prev.filter((m) => m._id !== tempUserMsg._id),
          res.userMessage,
          res.assistantMessage,
        ]);
      }
    } catch (err) {
      setChatError(`Detective Interrogation Error: ${err.message}`);
      setChatMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
    } finally {
      setSendingChat(false);
    }
  };

  // Suspect Handlers
  const handleSaveSuspect = async (suspectData) => {
    try {
      if (editingSuspect) {
        await api.patch(`/cases/${id}/suspects/${editingSuspect._id}`, suspectData);
      } else {
        await api.post(`/cases/${id}/suspects`, suspectData);
      }
      setIsAddSuspectOpen(false);
      setEditingSuspect(null);
      await loadCaseData();
    } catch (err) {
      alert(`Error saving suspect: ${err.message}`);
    }
  };

  const handleDeleteSuspect = async (suspectId) => {
    if (!window.confirm('Are you sure you want to remove this suspect from the case file?')) return;
    try {
      await api.delete(`/cases/${id}/suspects/${suspectId}`);
      await loadCaseData();
    } catch (err) {
      alert(`Error deleting suspect: ${err.message}`);
    }
  };

  // Clue Handlers
  const handleSaveClue = async (clueData) => {
    try {
      if (editingClue) {
        await api.patch(`/cases/${id}/clues/${editingClue._id}`, clueData);
      } else {
        await api.post(`/cases/${id}/clues`, clueData);
      }
      setIsAddClueOpen(false);
      setEditingClue(null);
      await loadCaseData();
    } catch (err) {
      alert(`Error saving clue: ${err.message}`);
    }
  };

  const handleDeleteClue = async (clueId) => {
    if (!window.confirm('Are you sure you want to remove this clue from the case file?')) return;
    try {
      await api.delete(`/cases/${id}/clues/${clueId}`);
      await loadCaseData();
    } catch (err) {
      alert(`Error deleting clue: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-detective-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-wider text-detective-muted">
          Loading Investigation Evidence Board...
        </p>
      </div>
    );
  }

  if (!investigation) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="font-cinzel text-xl font-bold text-detective-text mb-4">
          Case Record Not Found
        </h2>
        <Link
          to="/cases"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-detective-gold text-detective-bg text-xs font-semibold"
        >
          Return to My Cases
        </Link>
      </div>
    );
  }

  // Filtered Clues
  const filteredClues = (investigation.clues || []).filter((clue) => {
    if (evidenceTypeFilter !== 'All' && clue.type !== evidenceTypeFilter) return false;
    if (verificationFilter !== 'All' && clue.verificationStatus !== verificationFilter) return false;
    if (suspectFilter !== 'All' && !(clue.relatedSuspectNames || []).includes(suspectFilter)) return false;
    return true;
  });

  const clueHypothesisMap = new Map();
  if (latestAnalysis?.supportingEvidence) {
    latestAnalysis.supportingEvidence.forEach((item) => {
      clueHypothesisMap.set(item.clueCode, item.relevance);
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-14rem)] space-y-6">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-detective-border">
        <div className="flex items-center gap-3">
          <Link
            to="/cases"
            className="p-1.5 rounded hover:bg-detective-card text-detective-muted hover:text-detective-text transition-colors"
            title="Return to Cases"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-detective-gold">
              <span>{investigation.category}</span>
              <span>&bull;</span>
              <span>Ref #{investigation._id.slice(-6).toUpperCase()}</span>
            </div>
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-detective-text">
              {investigation.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-detective-gold text-detective-bg font-semibold text-xs hover:bg-detective-gold-hover transition-colors shadow-detective-card disabled:opacity-50"
          >
            {analyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{latestAnalysis ? 'Reanalyze Case' : 'Run AI Analysis'}</span>
          </button>

          <Link
            to={`/cases/${id}/report`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-detective-card border border-detective-border hover:border-detective-gold text-xs font-mono text-detective-text transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-detective-gold" />
            <span>View Full Report</span>
          </Link>
        </div>
      </div>

      {/* Prominent Error Alert Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-[#E16D70]/15 border border-[#E16D70]/40 text-detective-text text-xs flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#E16D70] shrink-0" />
            <div>
              <p className="font-semibold text-white">Investigation Engine Error</p>
              <p className="text-detective-muted mt-0.5">{error}</p>
              {error.includes('Gemini API key') && (
                <p className="text-detective-gold mt-1">
                  Tip: Get a free key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="underline font-bold">Google AI Studio</a> and paste it into your <code>.env</code> file.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-detective-muted hover:text-white px-2 py-1 rounded text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stale Analysis Alert Banner */}
      {investigation.isAnalysisStale && (
        <div className="p-4 rounded-lg bg-[#E16D70]/15 border border-[#E16D70]/30 text-detective-text text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E16D70] shrink-0" />
            <span>
              <strong>Analysis Outdated:</strong> Case evidence or suspects have been modified since the last AI deduction.
            </span>
          </div>
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="px-3 py-1.5 rounded bg-[#E16D70] text-white font-mono text-xs font-semibold hover:bg-red-600 transition-colors shrink-0"
          >
            {analyzing ? 'Updating...' : 'Update Analysis Now'}
          </button>
        </div>
      )}

      {/* Case Overview Metadata Box */}
      <div className="bg-detective-card rounded-xl border border-detective-border p-5 shadow-detective-card">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-detective-border/60">
          <div className="flex items-center gap-3">
            <StatusBadge status={investigation.investigationStatus} type="status" />
            {latestAnalysis && (
              <StatusBadge status={latestAnalysis.conclusion.status} type="conclusion" />
            )}
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-detective-muted">
            <span>Created: {new Date(investigation.createdAt).toLocaleDateString()}</span>
            <span>&bull;</span>
            <span>{(investigation.suspects || []).length} Suspects</span>
            <span>&bull;</span>
            <span>{(investigation.clues || []).length} Clues</span>
          </div>
        </div>

        <p className="text-xs text-detective-text leading-relaxed">
          {investigation.description}
        </p>

        {investigation.investigationObjective && (
          <div className="mt-3 pt-3 border-t border-detective-border/40 text-xs">
            <span className="font-mono text-detective-gold uppercase tracking-wider font-semibold">
              Objective:{' '}
            </span>
            <span className="text-detective-muted">
              {investigation.investigationObjective}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-detective-border gap-2">
        <button
          onClick={() => setActiveTab('suspects')}
          className={`py-3 px-5 text-xs font-mono uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'suspects'
              ? 'border-detective-gold text-detective-gold font-bold bg-detective-card/40'
              : 'border-transparent text-detective-muted hover:text-detective-text'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Suspects & Alibis ({(investigation.suspects || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`py-3 px-5 text-xs font-mono uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'evidence'
              ? 'border-detective-gold text-detective-gold font-bold bg-detective-card/40'
              : 'border-transparent text-detective-muted hover:text-detective-text'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Evidence Board ({(investigation.clues || []).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-3 px-5 text-xs font-mono uppercase tracking-wider border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-detective-gold text-detective-gold font-bold bg-detective-card/40'
              : 'border-transparent text-detective-muted hover:text-detective-text'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-detective-gold" />
          <span>AI Detective Console ({chatMessages.length})</span>
        </button>
      </div>

      {/* TAB 1: SUSPECTS PANEL */}
      {activeTab === 'suspects' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-detective-muted font-mono uppercase">
              Person of Interest Dossiers
            </span>
            <button
              onClick={() => {
                setEditingSuspect(null);
                setIsAddSuspectOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-detective-card border border-detective-border hover:border-detective-gold text-xs font-mono text-detective-gold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Suspect</span>
            </button>
          </div>

          {(investigation.suspects || []).length === 0 ? (
            <div className="p-10 text-center bg-detective-card rounded-xl border border-detective-border text-xs text-detective-muted">
              No suspects registered for this case file yet. Add suspects to allow the AI to cross-check alibis.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investigation.suspects.map((suspect) => {
                // Find matching AI assessment if available
                const assessment = latestAnalysis?.suspectAssessments?.find(
                  (a) => a.suspectName.toLowerCase() === suspect.name.toLowerCase()
                );

                return (
                  <div
                    key={suspect._id}
                    className="bg-detective-card rounded-xl border border-detective-border p-5 shadow-detective-card flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Suspect Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-cinzel text-lg font-bold text-detective-text">
                            {suspect.name}
                          </h3>
                          {suspect.description && (
                            <p className="text-xs text-detective-muted">
                              {suspect.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingSuspect(suspect);
                              setIsAddSuspectOpen(true);
                            }}
                            className="p-1 rounded text-detective-muted hover:text-detective-gold"
                            title="Edit Suspect"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSuspect(suspect._id)}
                            className="p-1 rounded text-detective-muted hover:text-[#E16D70]"
                            title="Remove Suspect"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Statement & Alibi */}
                      <div className="space-y-2 mt-3 pt-3 border-t border-detective-border/60 text-xs">
                        <div>
                          <span className="font-mono text-detective-gold uppercase text-[10px] block mb-0.5">
                            Official Statement
                          </span>
                          <p className="text-detective-text italic leading-relaxed">
                            "{suspect.statement}"
                          </p>
                        </div>

                        {suspect.alibi && (
                          <div className="pt-2">
                            <span className="font-mono text-detective-blue uppercase text-[10px] block mb-0.5">
                              Claimed Alibi
                            </span>
                            <p className="text-detective-muted">
                              {suspect.alibi}
                            </p>
                          </div>
                        )}

                        {suspect.backgroundInformation && (
                          <div className="pt-2">
                            <span className="font-mono text-detective-muted uppercase text-[10px] block mb-0.5">
                              Background & Motive Note
                            </span>
                            <p className="text-detective-muted/90">
                              {suspect.backgroundInformation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Assessment Section */}
                    {assessment ? (
                      <div className="p-3.5 rounded bg-detective-surface border border-detective-border/80 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase text-detective-gold font-bold">
                            AI Forensic Assessment
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              assessment.alibiStatus === 'Contradicted'
                                ? 'bg-[#E16D70]/15 text-[#E16D70]'
                                : assessment.alibiStatus === 'Corroborated'
                                ? 'bg-[#70C49B]/15 text-[#70C49B]'
                                : 'bg-[#D6B36A]/15 text-[#D6B36A]'
                            }`}
                          >
                            Alibi {assessment.alibiStatus}
                          </span>
                        </div>
                        <p className="text-xs text-detective-muted leading-relaxed">
                          {assessment.plausibilitySummary}
                        </p>
                        {assessment.keyDiscrepancies?.length > 0 && (
                          <div className="pt-1 text-[11px] text-[#E16D70]">
                            <strong>Discrepancies:</strong>{' '}
                            {assessment.keyDiscrepancies.join('; ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-detective-muted/60 font-mono italic">
                        Run AI Analysis to assess this suspect's alibi and statements.
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EVIDENCE BOARD */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 bg-detective-card rounded-xl border border-detective-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Type Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-mono text-detective-muted">Type:</span>
                <select
                  value={evidenceTypeFilter}
                  onChange={(e) => setEvidenceTypeFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-detective-surface border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                >
                  <option value="All">All Types</option>
                  <option value="Physical evidence">Physical</option>
                  <option value="Digital evidence">Digital</option>
                  <option value="Witness statement">Witness</option>
                  <option value="Timeline">Timeline</option>
                  <option value="Document">Document</option>
                  <option value="Circumstantial evidence">Circumstantial</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Verification Status Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-mono text-detective-muted">Status:</span>
                <select
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-detective-surface border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                >
                  <option value="All">All Statuses</option>
                  <option value="User-provided">User-provided</option>
                  <option value="Corroborated">Corroborated</option>
                  <option value="Contradicted">Contradicted</option>
                  <option value="Unverified">Unverified</option>
                  <option value="Inconclusive">Inconclusive</option>
                </select>
              </div>

              {/* Suspect Filter */}
              {(investigation.suspects || []).length > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-mono text-detective-muted">Suspect:</span>
                  <select
                    value={suspectFilter}
                    onChange={(e) => setSuspectFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-detective-surface border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                  >
                    <option value="All">All Suspects</option>
                    {investigation.suspects.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            <button
              onClick={() => {
                setEditingClue(null);
                setIsAddClueOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-detective-surface border border-detective-border hover:border-detective-gold text-xs font-mono text-detective-gold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catalog New Clue</span>
            </button>
          </div>

          {/* Clues Grid */}
          {filteredClues.length === 0 ? (
            <div className="p-10 text-center bg-detective-card rounded-xl border border-detective-border text-xs text-detective-muted">
              No clues match the current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredClues.map((clue) => {
                const relevance = clueHypothesisMap.get(clue.clueCode);

                return (
                  <div
                    key={clue._id}
                    className="bg-detective-card rounded-xl border border-detective-border p-5 shadow-detective-card flex flex-col justify-between space-y-3"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-detective-surface border border-detective-gold/40 text-detective-gold">
                          {clue.clueCode}
                        </span>
                        <div className="flex items-center gap-1">
                          <StatusBadge status={clue.verificationStatus} type="verification" />
                          <button
                            onClick={() => {
                              setEditingClue(clue);
                              setIsAddClueOpen(true);
                            }}
                            className="p-1 rounded text-detective-muted hover:text-detective-gold"
                            title="Edit Clue"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteClue(clue._id)}
                            className="p-1 rounded text-detective-muted hover:text-[#E16D70]"
                            title="Remove Clue"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-detective-text leading-relaxed font-medium">
                        {clue.description}
                      </p>

                      {/* Metadata */}
                      <div className="mt-3 pt-2 border-t border-detective-border/50 text-[11px] font-mono text-detective-muted space-y-1">
                        <div>Type: <span className="text-detective-text">{clue.type}</span></div>
                        {clue.source && <div>Source: <span className="text-detective-text">{clue.source}</span></div>}
                        {clue.timestamp && <div>Discovered: <span className="text-detective-text">{clue.timestamp}</span></div>}
                        {(clue.relatedSuspectNames || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {clue.relatedSuspectNames.map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-detective-surface text-detective-gold text-[10px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* How It Relates to Hypothesis */}
                    {relevance && (
                      <div className="p-2.5 rounded bg-detective-surface border border-detective-border text-[11px] text-detective-muted">
                        <span className="font-mono text-detective-gold font-semibold block text-[10px] uppercase mb-0.5">
                          Investigative Relevance
                        </span>
                        {relevance}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI DETECTIVE INTERROGATION CONSOLE */}
      {activeTab === 'chat' && (
        <div className="bg-detective-card rounded-xl border border-detective-border shadow-detective-card overflow-hidden flex flex-col h-[650px]">
          
          {/* Header */}
          <div className="p-4 bg-detective-surface border-b border-detective-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#70C49B] animate-pulse" />
              <span className="font-cinzel text-sm font-bold text-detective-text">
                Lead Detective AI Console
              </span>
              <span className="text-xs font-mono text-detective-muted">
                &bull; Case Memory Synchronized
              </span>
            </div>

            <span className="text-[11px] font-mono text-detective-muted">
              Zero Hallucination Constraint: ON
            </span>
          </div>

          {/* Prompt Suggestions Bar */}
          <div className="p-2.5 bg-detective-surface/60 border-b border-detective-border flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-detective-muted font-mono text-[11px] uppercase shrink-0">
              Suggested:
            </span>
            <button
              onClick={() => handleSendChat(null, 'Which clue is most critical in this case?')}
              className="px-2.5 py-1 rounded-full bg-detective-card border border-detective-border text-detective-muted hover:text-detective-gold hover:border-detective-gold text-[11px] shrink-0 transition-colors"
            >
              Which clue is most critical?
            </button>
            <button
              onClick={() => handleSendChat(null, 'What contradictions exist between suspect testimonies and the timeline?')}
              className="px-2.5 py-1 rounded-full bg-detective-card border border-detective-border text-detective-muted hover:text-detective-gold hover:border-detective-gold text-[11px] shrink-0 transition-colors"
            >
              What contradictions exist?
            </button>
            <button
              onClick={() => handleSendChat(null, 'What critical evidence is still missing to solve this case?')}
              className="px-2.5 py-1 rounded-full bg-detective-card border border-detective-border text-detective-muted hover:text-detective-gold hover:border-detective-gold text-[11px] shrink-0 transition-colors"
            >
              What evidence is missing?
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
                <MessageSquare className="w-8 h-8 text-detective-gold/60" />
                <h4 className="font-cinzel text-base font-bold text-detective-text">
                  Direct Interrogation Channel
                </h4>
                <p className="text-xs text-detective-muted leading-relaxed">
                  Interrogate the AI Detective regarding specific clues, timeline gaps, suspect alibis, or conflicting statements. All replies are strictly grounded in submitted evidence.
                </p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={msg._id || idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-4 text-xs leading-relaxed space-y-1.5 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-detective-surface border border-detective-border text-detective-text'
                        : 'bg-detective-card border border-detective-gold/30 text-detective-text'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-detective-muted mb-1">
                      <span className={msg.role === 'assistant' ? 'text-detective-gold font-bold' : ''}>
                        {msg.role === 'user' ? 'Lead Investigator' : 'AI Detective'}
                      </span>
                      <span>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}

            {sendingChat && (
              <div className="flex justify-start">
                <div className="bg-detective-card border border-detective-gold/30 rounded-lg p-3.5 text-xs text-detective-gold flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-detective-gold border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono">Analyzing evidence files...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Error Alert */}
          {chatError && (
            <div className="px-4 py-2.5 bg-[#E16D70]/15 border-t border-b border-[#E16D70]/30 text-xs text-[#E16D70] flex items-center justify-between">
              <span>{chatError}</span>
              <button
                type="button"
                onClick={() => setChatError(null)}
                className="underline text-[11px] hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendChat}
            className="p-4 bg-detective-surface border-t border-detective-border flex items-center gap-3"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about the case, suspects, or evidence..."
              className="flex-1 px-4 py-2.5 bg-detective-card border border-detective-border rounded-md text-xs text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold"
            />
            <button
              type="submit"
              disabled={sendingChat || !chatInput.trim()}
              className="p-2.5 rounded-md bg-detective-gold text-detective-bg hover:bg-detective-gold-hover transition-colors disabled:opacity-40"
              title="Send Interrogation Query"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* SUSPECT MODAL */}
      {isAddSuspectOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-detective-card border border-detective-border rounded-xl max-w-lg w-full p-6 shadow-detective-card max-h-[90vh] overflow-y-auto">
            <h3 className="font-cinzel text-lg font-bold text-detective-text mb-4">
              {editingSuspect ? 'Edit Suspect Dossier' : 'Add Person of Interest'}
            </h3>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSaveSuspect({
                  name: formData.get('name'),
                  description: formData.get('description'),
                  statement: formData.get('statement'),
                  alibi: formData.get('alibi'),
                  backgroundInformation: formData.get('backgroundInformation'),
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-mono uppercase text-detective-muted mb-1">
                  Name / Identifier *
                </label>
                <input
                  name="name"
                  required
                  defaultValue={editingSuspect?.name || ''}
                  className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-detective-muted mb-1">
                  Role / Description
                </label>
                <input
                  name="description"
                  defaultValue={editingSuspect?.description || ''}
                  className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-detective-muted mb-1">
                  Statement / Testimony *
                </label>
                <textarea
                  name="statement"
                  required
                  rows={3}
                  defaultValue={editingSuspect?.statement || ''}
                  className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-detective-muted mb-1">
                  Claimed Alibi
                </label>
                <input
                  name="alibi"
                  defaultValue={editingSuspect?.alibi || ''}
                  className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                />
              </div>

              <div>
                <label className="block font-mono uppercase text-detective-muted mb-1">
                  Background / Motive Info
                </label>
                <input
                  name="backgroundInformation"
                  defaultValue={editingSuspect?.backgroundInformation || ''}
                  className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-detective-border">
                <button
                  type="button"
                  onClick={() => setIsAddSuspectOpen(false)}
                  className="px-4 py-2 rounded bg-detective-surface border border-detective-border text-detective-muted hover:text-detective-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-detective-gold text-detective-bg font-semibold hover:bg-detective-gold-hover"
                >
                  Save Suspect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLUE MODAL */}
      {isAddClueOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-detective-card border border-detective-border rounded-xl max-w-lg w-full p-6 shadow-detective-card max-h-[90vh] overflow-y-auto">
            <h3 className="font-cinzel text-lg font-bold text-detective-text mb-4">
              {editingClue ? `Edit Evidence ${editingClue.clueCode}` : 'Catalog Evidence Clue'}
            </h3>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleSaveClue({
                  description: formData.get('description'),
                  type: formData.get('type'),
                  source: formData.get('source'),
                  timestamp: formData.get('timestamp'),
                  verificationStatus: formData.get('verificationStatus'),
                });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-mono uppercase text-detective-muted mb-1">
                  Clue Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingClue?.description || ''}
                  className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase text-detective-muted mb-1">
                    Evidence Type *
                  </label>
                  <select
                    name="type"
                    defaultValue={editingClue?.type || 'Physical evidence'}
                    className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                  >
                    <option value="Physical evidence">Physical evidence</option>
                    <option value="Digital evidence">Digital evidence</option>
                    <option value="Witness statement">Witness statement</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Document">Document</option>
                    <option value="Circumstantial evidence">Circumstantial evidence</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono uppercase text-detective-muted mb-1">
                    Verification Status *
                  </label>
                  <select
                    name="verificationStatus"
                    defaultValue={editingClue?.verificationStatus || 'User-provided'}
                    className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                  >
                    <option value="User-provided">User-provided</option>
                    <option value="Corroborated">Corroborated</option>
                    <option value="Contradicted">Contradicted</option>
                    <option value="Unverified">Unverified</option>
                    <option value="Inconclusive">Inconclusive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono uppercase text-detective-muted mb-1">
                    Source / Location
                  </label>
                  <input
                    name="source"
                    defaultValue={editingClue?.source || ''}
                    className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                  />
                </div>

                <div>
                  <label className="block font-mono uppercase text-detective-muted mb-1">
                    Timestamp
                  </label>
                  <input
                    name="timestamp"
                    defaultValue={editingClue?.timestamp || ''}
                    className="w-full px-3 py-2 bg-detective-surface border border-detective-border rounded text-detective-text focus:outline-none focus:border-detective-gold"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-detective-border">
                <button
                  type="button"
                  onClick={() => setIsAddClueOpen(false)}
                  className="px-4 py-2 rounded bg-detective-surface border border-detective-border text-detective-muted hover:text-detective-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-detective-gold text-detective-bg font-semibold hover:bg-detective-gold-hover"
                >
                  Save Clue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
