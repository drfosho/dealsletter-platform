'use client';

import Link from 'next/link';

interface ExportUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportUpgradeModal({ isOpen, onClose }: ExportUpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Lock icon */}
        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-primary text-center mb-2">
          Export is a Pro Feature
        </h3>
        <p className="text-muted text-center mb-6">
          Upgrade to Pro to export your analyses as PDF and Excel files. Share reports with partners, lenders, and your team.
        </p>

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold text-center"
          >
            Upgrade to Pro
          </Link>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-border text-muted rounded-lg hover:bg-muted/5 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
