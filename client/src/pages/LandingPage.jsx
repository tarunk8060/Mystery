import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileSearch, 
  ArrowRight, 
  ShieldAlert, 
  GitCompare, 
  HelpCircle, 
  CheckCircle, 
  FileText, 
  Search, 
  ChevronRight, 
  Sparkles,
  Users,
  Compass,
  Lock,
  Layers
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';

export default function LandingPage() {
  const [activePreviewTab, setActivePreviewTab] = useState('conclusion');

  const sampleCase = {
    title: 'The Blackwood Manor Emerald Heist',
    category: 'Theft',
    status: 'Solved',
    suspects: [
      { name: 'Charles Vance', role: 'Head Butler', statement: 'Polishing silver in pantry until 10:00 PM.' },
      { name: 'Evelyn Reed', role: 'Heiress', statement: 'Reading in conservatory with garden view.' }
    ],
    clues: [
      { code: 'CLUE-1', type: 'Physical', desc: 'Broken stained-glass window forced inward from terrace.' },
      { code: 'CLUE-2', type: 'Timeline', desc: 'Conservatory storm shutters automatically sealed at 9:00 PM.' },
      { code: 'CLUE-3', type: 'Circumstantial', desc: 'Emergency pantry keys found inside vault lock mechanism.' }
    ],
    aiDeduction: {
      status: 'Strongly supported',
      culprit: 'Charles Vance',
      explanation: 'CLUE-3 directly implicates the pantry key holder. Evelyn’s claimed view of the terrace at 9:30 PM is directly contradicted by CLUE-2 (shutters sealed at 9:00 PM), showing she provided a false alibi to protect Charles.'
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-detective-bg">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden border-b border-detective-border/60">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(214,179,106,0.12),rgba(11,13,18,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-detective-card border border-detective-gold/30 text-xs font-mono text-detective-gold mb-8 shadow-detective-card">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Algorithmic Forensic Deduction Engine</span>
          </div>

          <h1 className="font-cinzel text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-detective-text max-w-4xl mx-auto leading-tight">
            Every clue tells a story. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-detective-gold via-[#F0D597] to-detective-gold">
              Find the truth.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-detective-muted max-w-2xl mx-auto leading-relaxed">
            Submit your mystery, catalog your suspects and evidence, and let our AI Detective rigorously uncover contradictions, verify alibis, and determine the most plausible solution.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/cases/new"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-detective-gold text-detective-bg font-semibold text-base hover:bg-detective-gold-hover transition-all flex items-center justify-center gap-2 shadow-detective-gold group"
            >
              <span>Start an Investigation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-detective-card text-detective-text border border-detective-border hover:border-detective-gold/50 font-medium text-base transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Features</span>
            </a>
          </div>

          <div className="mt-14 flex items-center justify-center gap-8 text-xs font-mono text-detective-muted">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#70C49B]" />
              <span>Strict Clue Grounding</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#70C49B]" />
              <span>Zero Hallucinations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#70C49B]" />
              <span>Exportable Case Dossiers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Case Preview */}
      <section className="py-20 bg-detective-surface/60 border-b border-detective-border/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-detective-text">
              Deduction in Action
            </h2>
            <p className="mt-2 text-sm text-detective-muted">
              Inspect how the AI synthesizes user-provided testimonies and clues into verifiable conclusions.
            </p>
          </div>

          <div className="bg-detective-card border border-detective-border rounded-xl shadow-detective-card overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-detective-border bg-detective-bg/50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-detective-gold">
                  Sample Case File #089
                </span>
                <h3 className="font-cinzel text-lg font-bold text-detective-text">
                  {sampleCase.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={sampleCase.category} type="category" />
                <StatusBadge status="Strongly supported" type="conclusion" />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-detective-border bg-detective-surface px-4 gap-2">
              <button
                onClick={() => setActivePreviewTab('conclusion')}
                className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
                  activePreviewTab === 'conclusion'
                    ? 'border-detective-gold text-detective-gold font-bold'
                    : 'border-transparent text-detective-muted hover:text-detective-text'
                }`}
              >
                AI Deduction & Contradictions
              </button>
              <button
                onClick={() => setActivePreviewTab('evidence')}
                className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
                  activePreviewTab === 'evidence'
                    ? 'border-detective-gold text-detective-gold font-bold'
                    : 'border-transparent text-detective-muted hover:text-detective-text'
                }`}
              >
                Cataloged Clues (3)
              </button>
              <button
                onClick={() => setActivePreviewTab('suspects')}
                className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors ${
                  activePreviewTab === 'suspects'
                    ? 'border-detective-gold text-detective-gold font-bold'
                    : 'border-transparent text-detective-muted hover:text-detective-text'
                }`}
              >
                Suspect Testimonies (2)
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {activePreviewTab === 'conclusion' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-[#70C49B]/10 border border-[#70C49B]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono uppercase text-[#70C49B] font-semibold">
                        Primary Culprit Identified
                      </span>
                      <span className="text-xs font-mono text-detective-muted">
                        Confidence: High
                      </span>
                    </div>
                    <p className="font-cinzel text-lg font-bold text-detective-text">
                      {sampleCase.aiDeduction.culprit}
                    </p>
                    <p className="mt-2 text-sm text-detective-text/90 leading-relaxed">
                      {sampleCase.aiDeduction.explanation}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-detective-surface rounded border border-detective-border">
                      <span className="font-mono text-detective-gold uppercase tracking-wider block mb-1">
                        Contradiction Detected
                      </span>
                      <p className="text-detective-muted">
                        Evelyn claimed to see the terrace at 9:30 PM, yet CLUE-2 confirms motorized shutters locked at 9:00 PM.
                      </p>
                    </div>
                    <div className="p-3 bg-detective-surface rounded border border-detective-border">
                      <span className="font-mono text-[#70C49B] uppercase tracking-wider block mb-1">
                        Physical Proof
                      </span>
                      <p className="text-detective-muted">
                        CLUE-3 (pantry keys) confirms access restricted to Butler Charles Vance during the vault breach.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'evidence' && (
                <div className="space-y-3">
                  {sampleCase.clues.map((clue) => (
                    <div key={clue.code} className="p-3 rounded bg-detective-surface border border-detective-border flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2 py-1 bg-detective-card border border-detective-gold/40 text-detective-gold rounded">
                          {clue.code}
                        </span>
                        <span className="text-xs font-medium text-detective-text">
                          {clue.desc}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-detective-muted shrink-0">
                        {clue.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activePreviewTab === 'suspects' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sampleCase.suspects.map((s) => (
                    <div key={s.name} className="p-4 bg-detective-surface rounded border border-detective-border">
                      <h4 className="font-cinzel text-sm font-bold text-detective-text mb-1">
                        {s.name} <span className="text-xs font-normal text-detective-muted">({s.role})</span>
                      </h4>
                      <p className="text-xs text-detective-muted italic">
                        "{s.statement}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-detective-gold block mb-2">
            Forensic Capabilities
          </span>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-detective-text">
            Engineered for Pure Deductive Reasoning
          </h2>
          <p className="mt-3 text-sm text-detective-muted max-w-xl mx-auto">
            Traditional AI games hallucinate clues. AI Mystery Room constrains the AI to solve only with the facts you submit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div className="p-6 rounded-xl bg-detective-card border border-detective-border hover:border-detective-gold/50 transition-all shadow-detective-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-detective-surface border border-detective-border flex items-center justify-center text-detective-gold mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-detective-text mb-2">
                Evidence Board
              </h3>
              <p className="text-xs text-detective-muted leading-relaxed">
                Organize physical, digital, forensic, and testimonial evidence with verification tags and suspect associations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-detective-border/50 text-[11px] font-mono text-detective-gold">
              Filters &bull; Verification Tags
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-xl bg-detective-card border border-detective-border hover:border-detective-gold/50 transition-all shadow-detective-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-detective-surface border border-detective-border flex items-center justify-center text-[#E16D70] mb-5">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-detective-text mb-2">
                Contradiction Detection
              </h3>
              <p className="text-xs text-detective-muted leading-relaxed">
                Automatically scans suspect testimonies against timestamps, locations, and physical clues to expose irreconcilable lies.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-detective-border/50 text-[11px] font-mono text-[#E16D70]">
              Chronological & Factual Cross-Check
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-xl bg-detective-card border border-detective-border hover:border-detective-gold/50 transition-all shadow-detective-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-detective-surface border border-detective-border flex items-center justify-center text-detective-blue mb-5">
                <GitCompare className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-detective-text mb-2">
                Hypothesis Testing
              </h3>
              <p className="text-xs text-detective-muted leading-relaxed">
                Compares the primary culprit against alternative scenarios, ranking likelihoods based solely on corroborating evidence.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-detective-border/50 text-[11px] font-mono text-detective-blue">
              Multiple Explanations Evaluated
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-xl bg-detective-card border border-detective-border hover:border-detective-gold/50 transition-all shadow-detective-card flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-detective-surface border border-detective-border flex items-center justify-center text-[#70C49B] mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-cinzel text-base font-bold text-detective-text mb-2">
                Investigation Dossiers
              </h3>
              <p className="text-xs text-detective-muted leading-relaxed">
                Export 12-section printable case reports with cited evidence, suspect assessments, missing facts, and version tracking.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-detective-border/50 text-[11px] font-mono text-[#70C49B]">
              Print-Ready &bull; HTML Export
            </div>
          </div>

        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section className="py-24 bg-detective-surface/40 border-t border-detective-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-detective-gold block mb-2">
              Investigation Lifecycle
            </span>
            <h2 className="font-cinzel text-3xl font-bold text-detective-text">
              How the AI Detective Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="p-5 rounded-lg bg-detective-card border border-detective-border">
              <span className="font-mono text-2xl font-bold text-detective-gold/40 block mb-3">01</span>
              <h3 className="font-cinzel text-base font-bold text-detective-text mb-2">Record the Case</h3>
              <p className="text-xs text-detective-muted leading-relaxed">
                Enter the incident details, category, date, and core objective (e.g. theft, cyber mystery, fictional murder).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-lg bg-detective-card border border-detective-border">
              <span className="font-mono text-2xl font-bold text-detective-gold/40 block mb-3">02</span>
              <h3 className="font-cinzel text-base font-bold text-detective-text mb-2">Input Suspects</h3>
              <p className="text-xs text-detective-muted leading-relaxed">
                Add suspects, their official statements, claimed alibis, and relevant background histories.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-lg bg-detective-card border border-detective-border">
              <span className="font-mono text-2xl font-bold text-detective-gold/40 block mb-3">03</span>
              <h3 className="font-cinzel text-base font-bold text-detective-text mb-2">Catalog Evidence</h3>
              <p className="text-xs text-detective-muted leading-relaxed">
                Provide physical, digital, and timeline clues. Each gets a unique clue ID referenced by the AI.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-lg bg-detective-card border border-detective-border">
              <span className="font-mono text-2xl font-bold text-detective-gold/40 block mb-3">04</span>
              <h3 className="font-cinzel text-base font-bold text-detective-text mb-2">Solve & Interrogate</h3>
              <p className="text-xs text-detective-muted leading-relaxed">
                Trigger forensic AI analysis, chat interactively with the detective, add new clues, and export reports.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 bg-gradient-to-b from-detective-surface to-detective-bg text-center border-t border-detective-border">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-detective-text">
            Ready to solve your first mystery?
          </h2>
          <p className="mt-4 text-sm text-detective-muted max-w-xl mx-auto">
            Test your detective stories, verify complex game scenarios, or organize complex case facts without hallucinated deductions.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/cases/new"
              className="px-8 py-3.5 rounded-md bg-detective-gold text-detective-bg font-semibold text-base hover:bg-detective-gold-hover transition-all flex items-center gap-2 shadow-detective-gold"
            >
              <span>Create Investigation File</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
