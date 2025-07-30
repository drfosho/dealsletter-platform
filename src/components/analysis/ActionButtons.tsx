'use client';

import { useState } from 'react';

interface ActionButtonsProps {
  analysisId: string;
  isSaved: boolean;
  onSave: () => void;
  onShare: () => void;
  onCompare: () => void;
  onReanalyze: () => void;
  onDelete: () => void;
}

export default function ActionButtons({
  analysisId,
  isSaved,
  onSave,
  onShare,
  onCompare,
  onReanalyze,
  onDelete
}: ActionButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement actual PDF export
      const response = await fetch(`/api/analysis/${analysisId}/export?format=pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis-${analysisId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('PDF export coming soon!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement actual Excel export
      alert('Excel export coming soon!');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Primary Actions */}
      <button
        onClick={onSave}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
          ${isSaved 
            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
            : 'bg-primary text-secondary hover:bg-primary/90'
          }
        `}
      >
        <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {isSaved ? 'Saved' : 'Save to Dashboard'}
      </button>

      {/* Export Dropdown */}
      <div className="relative group">
        <button
          className="px-4 py-2 bg-card border border-primary text-primary rounded-lg hover:bg-primary/5 font-medium flex items-center gap-2"
          disabled={isExporting}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting ? 'Exporting...' : 'Export'}
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="absolute top-full left-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <button
            onClick={handleExportPDF}
            className="w-full px-4 py-2 text-left text-sm hover:bg-muted/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
            </svg>
            Export as PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="w-full px-4 py-2 text-left text-sm hover:bg-muted/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-5L9 2H4z" clipRule="evenodd" />
            </svg>
            Export as Excel
          </button>
        </div>
      </div>

      {/* Secondary Actions */}
      <button
        onClick={onShare}
        className="px-4 py-2 bg-card border border-border text-primary rounded-lg hover:bg-muted/20 font-medium flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.464 0m5.464 0a3 3 0 10-5.464 0M6.732 6.732a3 3 0 10-4.268 4.268m4.268-4.268a3 3 0 10-4.268 4.268" />
        </svg>
        Share
      </button>

      <button
        onClick={onCompare}
        className="px-4 py-2 bg-card border border-border text-primary rounded-lg hover:bg-muted/20 font-medium flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Compare
      </button>

      <button
        onClick={onReanalyze}
        className="px-4 py-2 bg-card border border-border text-primary rounded-lg hover:bg-muted/20 font-medium flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Re-analyze
      </button>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="px-4 py-2 bg-card border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>
  );
}