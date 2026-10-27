import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { 
  FilePlus, 
  Users, 
  Layers, 
  Trash2, 
  Plus, 
  AlertCircle, 
  Save, 
  ArrowLeft, 
  Check, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'ai_mystery_room_case_draft';

export default function CreateCasePage() {
  const navigate = useNavigate();

  // Case Metadata State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Fictional murder mystery');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [location, setLocation] = useState('');
  const [investigationObjective, setInvestigationObjective] = useState('');

  // Suspects State
  const [suspects, setSuspects] = useState([
    {
      name: '',
      description: '',
      statement: '',
      alibi: '',
      backgroundInformation: '',
    },
  ]);

  // Clues State
  const [clues, setClues] = useState([
    {
      description: '',
      type: 'Physical evidence',
      source: '',
      timestamp: '',
      relatedSuspectNames: [],
      verificationStatus: 'User-provided',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const categories = [
    'Theft',
    'Missing object',
    'Fictional murder mystery',
    'Cyber mystery',
    'Fraud',
    'General mystery',
    'Other',
  ];

  const evidenceTypes = [
    'Physical evidence',
    'Digital evidence',
    'Witness statement',
    'Timeline',
    'Document',
    'Circumstantial evidence',
    'Other',
  ];

  const verificationStatuses = [
    'User-provided',
    'Unverified',
    'Corroborated',
    'Contradicted',
    'Inconclusive',
  ];

  // Restore draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.title || draft.description) {
          setTitle(draft.title || '');
          setCategory(draft.category || 'Fictional murder mystery');
          setDescription(draft.description || '');
          setIncidentDate(draft.incidentDate || '');
          setLocation(draft.location || '');
          setInvestigationObjective(draft.investigationObjective || '');
          if (Array.isArray(draft.suspects) && draft.suspects.length > 0) setSuspects(draft.suspects);
          if (Array.isArray(draft.clues) && draft.clues.length > 0) setClues(draft.clues);
          setDraftRestored(true);
        }
      }
    } catch {
      // Ignore draft read errors
    }
  }, []);

  // Track dirty changes and persist auto-draft
  useEffect(() => {
    if (title || description || suspects[0]?.name || clues[0]?.description) {
      setIsDirty(true);
      const draft = {
        title,
        category,
        description,
        incidentDate,
        location,
        investigationObjective,
        suspects,
        clues,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  }, [title, category, description, incidentDate, location, investigationObjective, suspects, clues]);

  // Suspect Handlers
  const handleAddSuspect = () => {
    setSuspects([
      ...suspects,
      {
        name: '',
        description: '',
        statement: '',
        alibi: '',
        backgroundInformation: '',
      },
    ]);
  };

  const handleUpdateSuspect = (index, field, value) => {
    const updated = [...suspects];
    updated[index][field] = value;
    setSuspects(updated);
  };

  const handleRemoveSuspect = (index) => {
    if (suspects.length === 1) {
      setSuspects([
        {
          name: '',
          description: '',
          statement: '',
          alibi: '',
          backgroundInformation: '',
        },
      ]);
    } else {
      setSuspects(suspects.filter((_, i) => i !== index));
    }
  };

  // Clue Handlers
  const handleAddClue = () => {
    setClues([
      ...clues,
      {
        description: '',
        type: 'Physical evidence',
        source: '',
        timestamp: '',
        relatedSuspectNames: [],
        verificationStatus: 'User-provided',
      },
    ]);
  };

  const handleUpdateClue = (index, field, value) => {
    const updated = [...clues];
    updated[index][field] = value;
    setClues(updated);
  };

  const handleToggleClueSuspect = (clueIndex, suspectName) => {
    const updated = [...clues];
    const current = updated[clueIndex].relatedSuspectNames || [];
    if (current.includes(suspectName)) {
      updated[clueIndex].relatedSuspectNames = current.filter((s) => s !== suspectName);
    } else {
      updated[clueIndex].relatedSuspectNames = [...current, suspectName];
    }
    setClues(updated);
  };

  const handleRemoveClue = (index) => {
    if (clues.length === 1) {
      setClues([
        {
          description: '',
          type: 'Physical evidence',
          source: '',
          timestamp: '',
          relatedSuspectNames: [],
          verificationStatus: 'User-provided',
        },
      ]);
    } else {
      setClues(clues.filter((_, i) => i !== index));
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setTitle('');
    setDescription('');
    setIncidentDate('');
    setLocation('');
    setInvestigationObjective('');
    setSuspects([{ name: '', description: '', statement: '', alibi: '', backgroundInformation: '' }]);
    setClues([{ description: '', type: 'Physical evidence', source: '', timestamp: '', relatedSuspectNames: [], verificationStatus: 'User-provided' }]);
    setDraftRestored(false);
    setIsDirty(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim() || title.trim().length < 3) {
      setError('Case title must be at least 3 characters long.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Case overview description must be at least 10 characters long.');
      return;
    }

    // Filter out completely empty suspects
    const validSuspects = suspects.filter((s) => s.name.trim() && s.statement.trim());
    if (suspects.some((s) => (s.name.trim() && !s.statement.trim()) || (!s.name.trim() && s.statement.trim()))) {
      setError('Each suspect requires at least a Name and an initial Statement/Testimony.');
      return;
    }

    // Filter out empty clues
    const validClues = clues.filter((c) => c.description.trim());

    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        incidentDate: incidentDate.trim(),
        location: location.trim(),
        investigationObjective: investigationObjective.trim(),
        suspects: validSuspects,
        clues: validClues,
      };

      const res = await api.post('/cases', payload);
      if (res.success && res.case?._id) {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        navigate(`/cases/${res.case._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit investigation file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-14rem)]">
      
      {/* Navigation & Header */}
      <div className="mb-8">
        <Link
          to="/cases"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-detective-muted hover:text-detective-gold transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Cases</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-detective-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-detective-gold mb-1">
              <FilePlus className="w-4 h-4" />
              <span>Investigation Intake Protocol</span>
            </div>
            <h1 className="font-cinzel text-3xl font-bold text-detective-text">
              Create Investigation File
            </h1>
          </div>

          {draftRestored && (
            <div className="flex items-center gap-2 bg-detective-card border border-detective-gold/30 px-3 py-1.5 rounded text-xs text-detective-gold">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Draft auto-restored</span>
              <button
                type="button"
                onClick={clearDraft}
                className="underline hover:text-white ml-2 text-[11px]"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-[#E16D70]/10 border border-[#E16D70]/30 text-[#E16D70] text-sm flex items-center gap-2 mb-8">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* SECTION 1: Case Details */}
        <section className="bg-detective-card rounded-xl border border-detective-border p-6 shadow-detective-card space-y-6">
          <div className="border-b border-detective-border pb-3 flex items-center justify-between">
            <h2 className="font-cinzel text-lg font-bold text-detective-text">
              1. Incident Overview
            </h2>
            <span className="text-xs font-mono text-detective-muted">Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-detective-muted mb-1.5">
                Case Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The Midnight Gallery Burglary"
                className="w-full px-3.5 py-2.5 bg-detective-surface border border-detective-border rounded-md text-sm text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-detective-muted mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-detective-surface border border-detective-border rounded-md text-sm text-detective-text focus:outline-none focus:border-detective-gold"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-detective-muted mb-1.5">
              Incident Narrative / Crime Scene Description *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive breakdown of the incident: what was discovered, how the scene was found, who alerted the authorities, and initial condition of the location."
              className="w-full px-3.5 py-2.5 bg-detective-surface border border-detective-border rounded-md text-sm text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-detective-muted mb-1.5">
                Incident Date / Time (Optional)
              </label>
              <input
                type="text"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                placeholder="e.g., October 24, 1895, 21:00"
                className="w-full px-3.5 py-2.5 bg-detective-surface border border-detective-border rounded-md text-sm text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-detective-muted mb-1.5">
                Incident Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Surrey, Blackwood Manor"
                className="w-full px-3.5 py-2.5 bg-detective-surface border border-detective-border rounded-md text-sm text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-detective-muted mb-1.5">
                Investigation Objective (Optional)
              </label>
              <input
                type="text"
                value={investigationObjective}
                onChange={(e) => setInvestigationObjective(e.target.value)}
                placeholder="e.g., Identify culprit who bypassed security"
                className="w-full px-3.5 py-2.5 bg-detective-surface border border-detective-border rounded-md text-sm text-detective-text placeholder-detective-muted/50 focus:outline-none focus:border-detective-gold"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: Suspects Builder */}
        <section className="bg-detective-card rounded-xl border border-detective-border p-6 shadow-detective-card space-y-6">
          <div className="border-b border-detective-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-detective-text flex items-center gap-2">
                <Users className="w-5 h-5 text-detective-gold" />
                <span>2. Suspects & Persons of Interest</span>
              </h2>
              <p className="text-xs text-detective-muted mt-0.5">
                Add suspects and their direct testimonies or claims.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddSuspect}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-detective-surface border border-detective-border hover:border-detective-gold text-xs font-mono text-detective-gold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Suspect</span>
            </button>
          </div>

          <div className="space-y-6">
            {suspects.map((suspect, idx) => (
              <div
                key={idx}
                className="p-5 bg-detective-surface rounded-lg border border-detective-border relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-detective-gold font-bold">
                    Suspect #{idx + 1}
                  </span>
                  {suspects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSuspect(idx)}
                      className="p-1 text-detective-muted hover:text-[#E16D70] transition-colors"
                      title="Remove suspect"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                      Name / Identifier *
                    </label>
                    <input
                      type="text"
                      value={suspect.name}
                      onChange={(e) => handleUpdateSuspect(idx, 'name', e.target.value)}
                      placeholder="e.g., Lord Reginald Sterling"
                      className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                      Role / Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={suspect.description}
                      onChange={(e) => handleUpdateSuspect(idx, 'description', e.target.value)}
                      placeholder="e.g., Eldest nephew; deep financial difficulties"
                      className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                      Statement / Testimony *
                    </label>
                    <textarea
                      rows={2}
                      value={suspect.statement}
                      onChange={(e) => handleUpdateSuspect(idx, 'statement', e.target.value)}
                      placeholder="e.g., 'I retired to the smoking room at 8:45 PM and heard nothing until alarms sounded.'"
                      className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                        Claimed Alibi (Optional)
                      </label>
                      <input
                        type="text"
                        value={suspect.alibi}
                        onChange={(e) => handleUpdateSuspect(idx, 'alibi', e.target.value)}
                        placeholder="e.g., Butler was serving drinks in the billiard room"
                        className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                        Background / Motive (Optional)
                      </label>
                      <input
                        type="text"
                        value={suspect.backgroundInformation}
                        onChange={(e) => handleUpdateSuspect(idx, 'backgroundInformation', e.target.value)}
                        placeholder="e.g., Sole heir to the estate; recently cut off from allowance"
                        className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                      />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Evidence & Clues Builder */}
        <section className="bg-detective-card rounded-xl border border-detective-border p-6 shadow-detective-card space-y-6">
          <div className="border-b border-detective-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-cinzel text-lg font-bold text-detective-text flex items-center gap-2">
                <Layers className="w-5 h-5 text-detective-gold" />
                <span>3. Evidence & Clues Catalog</span>
              </h2>
              <p className="text-xs text-detective-muted mt-0.5">
                Every clue will receive an official code (e.g. CLUE-1) cited by the AI.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddClue}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-detective-surface border border-detective-border hover:border-detective-gold text-xs font-mono text-detective-gold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Clue</span>
            </button>
          </div>

          <div className="space-y-6">
            {clues.map((clue, idx) => (
              <div
                key={idx}
                className="p-5 bg-detective-surface rounded-lg border border-detective-border relative group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-detective-gold font-bold">
                    Clue #{idx + 1}
                  </span>
                  {clues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveClue(idx)}
                      className="p-1 text-detective-muted hover:text-[#E16D70] transition-colors"
                      title="Remove clue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                      Clue Description *
                    </label>
                    <textarea
                      rows={2}
                      value={clue.description}
                      onChange={(e) => handleUpdateClue(idx, 'description', e.target.value)}
                      placeholder="e.g., A silver pocket watch stopped precisely at 9:18 PM with shattered glass."
                      className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                        Evidence Type *
                      </label>
                      <select
                        value={clue.type}
                        onChange={(e) => handleUpdateClue(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                      >
                        {evidenceTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                        Source / Location
                      </label>
                      <input
                        type="text"
                        value={clue.source}
                        onChange={(e) => handleUpdateClue(idx, 'source', e.target.value)}
                        placeholder="e.g., Under conservatory rug"
                        className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                        Timestamp Discovered
                      </label>
                      <input
                        type="text"
                        value={clue.timestamp}
                        onChange={(e) => handleUpdateClue(idx, 'timestamp', e.target.value)}
                        placeholder="e.g., 21:18"
                        className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1">
                        Verification Status
                      </label>
                      <select
                        value={clue.verificationStatus}
                        onChange={(e) => handleUpdateClue(idx, 'verificationStatus', e.target.value)}
                        className="w-full px-3 py-2 bg-detective-card border border-detective-border rounded text-xs text-detective-text focus:outline-none focus:border-detective-gold"
                      >
                        {verificationStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Associated Suspects Multi-Select Pills */}
                  {suspects.some((s) => s.name.trim()) && (
                    <div className="pt-2">
                      <label className="block text-[11px] font-mono uppercase text-detective-muted mb-1.5">
                        Link to Suspect(s):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {suspects
                          .filter((s) => s.name.trim())
                          .map((s) => {
                            const isLinked = (clue.relatedSuspectNames || []).includes(s.name.trim());
                            return (
                              <button
                                key={s.name}
                                type="button"
                                onClick={() => handleToggleClueSuspect(idx, s.name.trim())}
                                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                                  isLinked
                                    ? 'bg-detective-gold/20 text-detective-gold border-detective-gold'
                                    : 'bg-detective-card text-detective-muted border-detective-border hover:border-detective-muted'
                                }`}
                              >
                                {isLinked ? '✓ ' : '+ '} {s.name}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ))}
          </div>
        </section>

        {/* Bottom Form Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-detective-border">
          <Link
            to="/cases"
            className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-detective-surface border border-detective-border text-xs text-detective-muted hover:text-detective-text hover:bg-detective-card transition-colors text-center"
          >
            Cancel & Abandon
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 rounded-md bg-detective-gold text-detective-bg font-semibold text-sm hover:bg-detective-gold-hover transition-colors flex items-center justify-center gap-2 shadow-detective-card disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-detective-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>File Investigation Dossier</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
