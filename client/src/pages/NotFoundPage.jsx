import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center p-4 bg-detective-bg">
      <div className="max-w-md w-full text-center bg-detective-card border border-detective-border rounded-xl p-10 shadow-detective-card space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-detective-surface border border-detective-gold/30 flex items-center justify-center text-detective-gold">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="font-cinzel text-3xl font-bold text-detective-text">
          404: Case Not Found
        </h1>
        <p className="text-xs text-detective-muted leading-relaxed">
          The requested archive page or case file does not exist or has been sealed by order of the bureau.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-detective-gold text-detective-bg text-xs font-semibold hover:bg-detective-gold-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Bureau Headquarters</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
