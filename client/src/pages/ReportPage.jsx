import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { 
  FileText, 
  Printer, 
  ArrowLeft, 
  RefreshCw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Scale, 
  Download,
  AlertCircle,
  ShieldCheck,
  Compass
} from 'lucide-react';

export default function ReportPage() {
  const { id } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/cases/${id}/report`);
      if (res.success) {
        setReportData(res.report);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate investigation dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      await api.post(`/cases/${id}/analyze`);
      await fetchReport();
    } catch (err) {
      alert(`Reanalysis failed: ${err.message}`);
    } finally {
      setReanalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!reportData) return;
    const element = document.getElementById('printable-dossier');
    if (!element) return;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Investigation Dossier - ${reportData.case.title}</title>
  <style>
    body { font-family: 'Georgia', serif; color: #111827; margin: 40px; line-height: 1.6; }
    h1, h2, h3 { font-family: 'Cinzel', serif; color: #000; }
    .badge { border: 1px solid #ccc; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-family: monospace; }
    .section { border-bottom: 1px solid #ddd; padding-bottom: 20px; margin-bottom: 20px; }
    .box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
  ${element.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Case_Dossier_${reportData.case.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-detective-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-wider text-detective-muted">
          Compiling Forensic Investigation Dossier...
        </p>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h2 className="font-cinzel text-xl font-bold text-detective-text mb-4">
          Unable to Load Dossier
        </h2>
        <p className="text-xs text-detective-muted mb-6">{error || 'Case not found'}</p>
        <Link
          to={`/cases/${id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-detective-gold text-detective-bg text-xs font-semibold"
        >
          Return to Workspace
        </Link>
      </div>
    );
  }

  const { case: caseInfo, suspects, clues, analysis, isAnalysisStale, disclaimer } = reportData;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-14rem)] space-y-6">
      
      {/* Top Header Actions (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-detective-border">
        <Link
          to={`/cases/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-detective-muted hover:text-detective-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Investigation Workspace</span>
        </Link>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-detective-card border border-detective-border hover:border-detective-gold text-xs font-mono text-detective-gold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reanalyzing ? 'animate-spin' : ''}`} />
            <span>Reanalyze Case</span>
          </button>

          <button
            onClick={handleDownloadHtml}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-detective-card border border-detective-border hover:border-detective-gold text-xs font-mono text-detective-text transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-detective-gold" />
            <span>Export HTML</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-detective-gold text-detective-bg font-semibold text-xs hover:bg-detective-gold-hover transition-colors shadow-detective-card"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier / PDF</span>
          </button>
        </div>
      </div>

      {/* Stale Warning Banner (hidden in print) */}
      {isAnalysisStale && (
        <div className="no-print p-4 rounded-lg bg-[#E16D70]/15 border border-[#E16D70]/30 text-detective-text text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E16D70] shrink-0" />
            <span>
              <strong>Note:</strong> Evidence has been modified since this analysis was generated. Click "Reanalyze Case" to reflect the latest clues.
            </span>
          </div>
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="px-3 py-1 rounded bg-[#E16D70] text-white font-mono text-[11px] font-semibold hover:bg-red-600 transition-colors shrink-0"
          >
            Update Analysis
          </button>
        </div>
      )}

      {/* PRINTABLE DOSSIER CONTAINER */}
      <div
        id="printable-dossier"
        className="bg-detective-card border border-detective-border rounded-xl p-8 sm:p-12 shadow-detective-card space-y-8 text-detective-text print-card"
      >
        
        {/* Dossier Header */}
        <div className="border-b-2 border-detective-gold pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-detective-gold font-bold mb-1">
              <FileText className="w-4 h-4" />
              <span>CONFIDENTIAL INVESTIGATION DOSSIER</span>
            </div>
            <h1 className="font-cinzel text-3xl font-extrabold text-detective-text">
              {caseInfo.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-detective-muted mt-2">
              <span>Category: <strong>{caseInfo.category}</strong></span>
              <span>&bull;</span>
              <span>Incident Date: <strong>{caseInfo.incidentDate || 'Unspecified'}</strong></span>
              <span>&bull;</span>
              <span>Location: <strong>{caseInfo.location || 'Unspecified'}</strong></span>
            </div>
          </div>

          <div className="text-right sm:shrink-0 font-mono text-xs text-detective-muted">
            <div>Dossier Version: <strong>v{analysis?.version || 1}</strong></div>
            <div>Generated: {new Date(reportData.generatedAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* 1. Case Summary & Objective */}
        <section className="space-y-3">
          <h2 className="font-cinzel text-base font-bold text-detective-gold uppercase tracking-wider">
            1. Case Background & Investigative Objective
          </h2>
          <p className="text-xs leading-relaxed text-detective-text/90">
            {caseInfo.description}
          </p>
          {caseInfo.investigationObjective && (
            <div className="p-3 bg-detective-surface rounded border border-detective-border text-xs">
              <strong className="text-detective-gold font-mono uppercase">Primary Objective:</strong>{' '}
              {caseInfo.investigationObjective}
            </div>
          )}
        </section>

        {/* 2. Evidence Overview */}
        <section className="space-y-3">
          <h2 className="font-cinzel text-base font-bold text-detective-gold uppercase tracking-wider">
            2. Cataloged Evidence Summary ({clues.length} Items)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-detective-border">
              <thead className="bg-detective-surface font-mono uppercase text-detective-muted text-[11px]">
                <tr>
                  <th className="p-2.5 border-b border-detective-border">Clue Code</th>
                  <th className="p-2.5 border-b border-detective-border">Type</th>
                  <th className="p-2.5 border-b border-detective-border">Description</th>
                  <th className="p-2.5 border-b border-detective-border">Verification</th>
                  <th className="p-2.5 border-b border-detective-border">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-detective-border/60">
                {clues.map((c) => (
                  <tr key={c._id}>
                    <td className="p-2.5 font-mono font-bold text-detective-gold">{c.clueCode}</td>
                    <td className="p-2.5 text-detective-muted">{c.type}</td>
                    <td className="p-2.5 font-medium">{c.description}</td>
                    <td className="p-2.5">{c.verificationStatus}</td>
                    <td className="p-2.5 text-detective-muted">{c.source || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Most Plausible Hypothesis & 4. Conclusion */}
        {analysis?.conclusion ? (
          <section className="p-6 bg-detective-surface rounded-xl border border-detective-gold/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-detective-border/80 pb-3">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-detective-gold font-bold block mb-1">
                  3. Primary Deductive Conclusion
                </span>
                <h3 className="font-cinzel text-xl font-bold text-detective-text">
                  {analysis.conclusion.hypothesis}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={analysis.conclusion.status} type="conclusion" />
                <StatusBadge status={analysis.conclusion.confidence} type="confidence" />
              </div>
            </div>

            <div className="text-xs leading-relaxed space-y-2">
              <div>
                <strong className="font-mono text-detective-gold uppercase">Primary Identified Cause / Party:</strong>{' '}
                <span className="font-semibold text-detective-text">{analysis.conclusion.primaryCulpritOrCause}</span>
              </div>
              <p className="text-detective-text/90 leading-relaxed">
                {analysis.conclusion.explanation}
              </p>
            </div>
          </section>
        ) : (
          <div className="p-6 bg-detective-surface rounded border border-dashed border-detective-border text-center text-xs text-detective-muted">
            No analysis record available yet. Click "Reanalyze Case" above to run the AI forensic engine.
          </div>
        )}

        {/* 5. Alternative Hypotheses */}
        {analysis?.alternativeHypotheses?.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-cinzel text-base font-bold text-detective-gold uppercase tracking-wider">
              4. Alternative Scenarios & Likelihood Comparison
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {analysis.alternativeHypotheses.map((alt, idx) => (
                <div key={idx} className="p-4 bg-detective-surface rounded border border-detective-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-detective-text">{alt.hypothesis}</span>
                    <span className="font-mono text-[11px] uppercase text-detective-gold">
                      {alt.likelihood} Likelihood
                    </span>
                  </div>
                  {alt.counterEvidence?.length > 0 && (
                    <div className="text-detective-muted text-[11px]">
                      <strong>Counter-Evidence:</strong> {alt.counterEvidence.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Suspect Comparison & Alibis */}
        {suspects.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-cinzel text-base font-bold text-detective-gold uppercase tracking-wider">
              5. Suspect Comparison & Alibi Plausibility Matrix
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suspects.map((s) => {
                const assess = analysis?.suspectAssessments?.find(
                  (a) => a.suspectName.toLowerCase() === s.name.toLowerCase()
                );
                return (
                  <div key={s._id} className="p-4 bg-detective-surface rounded border border-detective-border text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-cinzel font-bold text-detective-text">{s.name}</span>
                      {assess && (
                        <span className="font-mono text-[10px] uppercase text-detective-gold px-2 py-0.5 rounded bg-detective-card border border-detective-border">
                          Alibi: {assess.alibiStatus}
                        </span>
                      )}
                    </div>
                    <p className="text-detective-muted italic">"{s.statement}"</p>
                    {assess && (
                      <p className="text-detective-text/90 pt-1 border-t border-detective-border/50">
                        {assess.plausibilitySummary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 7. Supporting Evidence Breakdown */}
        {analysis?.supportingEvidence?.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-cinzel text-base font-bold text-detective-gold uppercase tracking-wider">
              6. Supporting Evidence & Clue Grounding
            </h2>
            <div className="space-y-2 text-xs">
              {analysis.supportingEvidence.map((item, idx) => (
                <div key={idx} className="p-3 bg-detective-surface rounded border border-detective-border flex items-start gap-3">
                  <span className="font-mono font-bold text-detective-gold bg-detective-card px-2 py-0.5 rounded border border-detective-gold/30 shrink-0">
                    {item.clueCode}
                  </span>
                  <p className="text-detective-text">{item.relevance}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Contradictions & Inconsistencies */}
        {analysis?.contradictions?.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-cinzel text-base font-bold text-[#E16D70] uppercase tracking-wider">
              7. Contradictions & Irreconcilable Inconsistencies
            </h2>
            <div className="space-y-2 text-xs">
              {analysis.contradictions.map((contra, idx) => (
                <div key={idx} className="p-3 bg-[#E16D70]/10 border border-[#E16D70]/30 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E16D70]">
                      {contra.involvedSuspects?.join(', ') || 'General Conflict'}
                    </span>
                    <span className="font-mono text-[11px] text-detective-muted">
                      Clues: {contra.conflictingClueCodes?.join(', ') || 'N/A'}
                    </span>
                  </div>
                  <p className="text-detective-text">{contra.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. Timeline Analysis */}
        {analysis?.timelineChronology?.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-cinzel text-base font-bold text-detective-gold uppercase tracking-wider">
              8. Chronological Timeline Reconstruction
            </h2>
            <div className="space-y-2 text-xs">
              {analysis.timelineChronology.map((t, idx) => (
                <div key={idx} className="p-2.5 bg-detective-surface rounded border border-detective-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-detective-gold font-bold shrink-0">{t.time}</span>
                    <span className="text-detective-text">{t.event}</span>
                  </div>
                  {t.sourceClueCode && (
                    <span className="font-mono text-[11px] text-detective-muted bg-detective-card px-2 py-0.5 rounded border border-detective-border shrink-0">
                      {t.sourceClueCode}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 10. Missing Information & Recommended Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analysis?.missingInformation?.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-cinzel text-base font-bold text-detective-gold uppercase tracking-wider">
                9. Missing Critical Facts
              </h2>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-detective-muted">
                {analysis.missingInformation.map((item, idx) => (
                  <li key={idx} className="text-detective-text">{item}</li>
                ))}
              </ul>
            </section>
          )}

          {analysis?.nextSteps?.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-cinzel text-base font-bold text-detective-gold uppercase tracking-wider">
                10. Recommended Next Steps
              </h2>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-detective-muted">
                {analysis.nextSteps.map((step, idx) => (
                  <li key={idx} className="text-detective-text">{step}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* 11. Limitations & Uncertainties */}
        {analysis?.limitations?.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-cinzel text-base font-bold text-detective-gold uppercase tracking-wider">
              11. Limitations & Gaps in Evidence
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-detective-muted">
              {analysis.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </section>
        )}

        {/* 12. Disclaimer */}
        <div className="pt-6 border-t border-detective-border text-[11px] text-detective-muted leading-relaxed font-mono">
          <div className="flex items-center gap-2 mb-1 text-detective-text font-bold">
            <Scale className="w-4 h-4 text-detective-gold" />
            <span>Investigative Methodology Notice</span>
          </div>
          <p>{disclaimer}</p>
        </div>

      </div>

    </div>
  );
}
