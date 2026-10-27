import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  XCircle, 
  ShieldAlert, 
  Clock, 
  Search,
  Sparkles
} from 'lucide-react';

export default function StatusBadge({ status, type = 'status', className = '' }) {
  if (!status) return null;

  // Conclusion Statuses
  if (type === 'conclusion') {
    switch (status) {
      case 'Strongly supported':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[#70C49B]/15 text-[#70C49B] border border-[#70C49B]/30 ${className}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Strongly Supported
          </span>
        );
      case 'Plausible but unconfirmed':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[#D6B36A]/15 text-[#D6B36A] border border-[#D6B36A]/30 ${className}`}>
            <Sparkles className="w-3.5 h-3.5" />
            Plausible but Unconfirmed
          </span>
        );
      case 'Inconclusive':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[#769BDA]/15 text-[#769BDA] border border-[#769BDA]/30 ${className}`}>
            <HelpCircle className="w-3.5 h-3.5" />
            Inconclusive
          </span>
        );
      case 'Contradicted by available evidence':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[#E16D70]/15 text-[#E16D70] border border-[#E16D70]/30 ${className}`}>
            <XCircle className="w-3.5 h-3.5" />
            Contradicted by Evidence
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-detective-card text-detective-muted border border-detective-border ${className}`}>
            {status}
          </span>
        );
    }
  }

  // Clue Verification Statuses
  if (type === 'verification') {
    switch (status) {
      case 'Corroborated':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-[#70C49B]/10 text-[#70C49B] border border-[#70C49B]/25 ${className}`}>
            <CheckCircle2 className="w-3 h-3" />
            Corroborated
          </span>
        );
      case 'Contradicted':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-[#E16D70]/10 text-[#E16D70] border border-[#E16D70]/25 ${className}`}>
            <XCircle className="w-3 h-3" />
            Contradicted
          </span>
        );
      case 'User-provided':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-[#769BDA]/10 text-[#769BDA] border border-[#769BDA]/25 ${className}`}>
            User-provided
          </span>
        );
      case 'Unverified':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-detective-border text-detective-muted ${className}`}>
            <Clock className="w-3 h-3" />
            Unverified
          </span>
        );
      case 'Inconclusive':
      default:
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-[#D6B36A]/10 text-[#D6B36A] border border-[#D6B36A]/25 ${className}`}>
            <HelpCircle className="w-3 h-3" />
            Inconclusive
          </span>
        );
    }
  }

  // Investigation Status
  if (type === 'status') {
    switch (status) {
      case 'Solved':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#70C49B]/15 text-[#70C49B] border border-[#70C49B]/30 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#70C49B] animate-pulse" />
            Solved
          </span>
        );
      case 'Under Investigation':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D6B36A]/15 text-[#D6B36A] border border-[#D6B36A]/30 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6B36A]" />
            Under Investigation
          </span>
        );
      case 'Cold Case':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#769BDA]/15 text-[#769BDA] border border-[#769BDA]/30 ${className}`}>
            <Clock className="w-3 h-3" />
            Cold Case
          </span>
        );
      case 'Open':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-detective-card text-detective-muted border border-detective-border ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-detective-muted" />
            Open
          </span>
        );
    }
  }

  // Confidence
  if (type === 'confidence') {
    const color =
      status === 'high'
        ? 'text-[#70C49B] bg-[#70C49B]/10 border-[#70C49B]/30'
        : status === 'medium'
        ? 'text-[#D6B36A] bg-[#D6B36A]/10 border-[#D6B36A]/30'
        : 'text-[#769BDA] bg-[#769BDA]/10 border-[#769BDA]/30';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border ${color} ${className}`}>
        {status} Confidence
      </span>
    );
  }

  // Category
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-detective-card text-detective-text border border-detective-border/80 ${className}`}>
      {status}
    </span>
  );
}
