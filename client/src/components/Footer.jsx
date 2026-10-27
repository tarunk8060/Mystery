import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileSearch, Scale } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="no-print bg-detective-surface border-t border-detective-border text-detective-muted text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-detective-gold" />
              <span className="font-cinzel text-base font-bold text-detective-text tracking-wider">
                AI MYSTERY ROOM
              </span>
            </div>
            <p className="text-xs text-detective-muted leading-relaxed max-w-md">
              A forensic deductive case-solving platform where users provide the clues and suspects, and the AI acts as the rigorous lead detective. Evaluates alibis, reveals contradictions, and weighs alternative hypotheses without inventing evidence.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-detective-muted/80">
              <ShieldCheck className="w-4 h-4 text-detective-gold" />
              <span>Evidence-Bound Reasoning Engine &bull; Powered by Google Gemini</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-detective-text font-semibold mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-detective-gold transition-colors">
                  Overview & Features
                </Link>
              </li>
              <li>
                <Link to="/cases" className="hover:text-detective-gold transition-colors">
                  My Investigations
                </Link>
              </li>
              <li>
                <Link to="/cases/new" className="hover:text-detective-gold transition-colors">
                  New Case File
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-detective-gold transition-colors">
                  System Diagnostics
                </Link>
              </li>
            </ul>
          </div>

          {/* Investigative Disclaimer */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-detective-text font-semibold mb-3 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-detective-gold" />
              Legal & Forensic Notice
            </h4>
            <p className="text-[11px] text-detective-muted/90 leading-relaxed">
              AI Mystery Room is an analytical thinking and fiction-writing tool. For real-world events, all AI assessments constitute uncorroborated hypotheses and do not replace professional law enforcement investigations or constitute legal proof of guilt.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-detective-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} AI Mystery Room. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <span className="text-detective-muted font-mono">SPEC v1.0.0</span>
            <span className="text-detective-muted font-mono">Zero Hallucination Constraint Enabled</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
