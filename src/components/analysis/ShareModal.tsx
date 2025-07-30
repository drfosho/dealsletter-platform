'use client';

import { useState } from 'react';

interface ShareModalProps {
  analysisId: string;
  onClose: () => void;
}

export default function ShareModal({ analysisId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const shareUrl = `${window.location.origin}/analysis/shared/${analysisId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareVia = (platform: string) => {
    const text = 'Check out my property investment analysis';
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    switch (platform) {
      case 'email':
        window.open(`mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-primary">Share Analysis</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Public/Private Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
            <div>
              <p className="font-medium text-primary">Make Public</p>
              <p className="text-sm text-muted">Allow anyone with the link to view</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                isPublic ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-primary mb-2">Share Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 bg-muted/10 border border-border rounded-lg text-sm"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-primary text-secondary hover:bg-primary/90'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share Options */}
        <div>
          <p className="text-sm font-medium text-primary mb-3">Share via</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShareVia('email')}
              className="flex items-center gap-2 px-4 py-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors"
            >
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Email</span>
            </button>
            
            <button
              onClick={() => handleShareVia('twitter')}
              className="flex items-center gap-2 px-4 py-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span className="text-sm font-medium">Twitter</span>
            </button>
            
            <button
              onClick={() => handleShareVia('linkedin')}
              className="flex items-center gap-2 px-4 py-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span className="text-sm font-medium">LinkedIn</span>
            </button>
            
            <button
              onClick={() => handleShareVia('facebook')}
              className="flex items-center gap-2 px-4 py-3 bg-muted/10 rounded-lg hover:bg-muted/20 transition-colors"
            >
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Shared analyses will include property details and financial projections but will hide your personal information.
          </p>
        </div>
      </div>
    </div>
  );
}