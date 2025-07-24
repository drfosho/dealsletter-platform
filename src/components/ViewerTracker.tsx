'use client';

import { useState, useEffect, useRef } from 'react';

interface ViewerTrackerProps {
  dealId: number;
  className?: string;
}

// Simulate real-time viewer tracking - in production this would connect to a websocket/real-time service
const ViewerTracker = ({ dealId, className = '' }: ViewerTrackerProps) => {
  const [viewerCount, setViewerCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize with a base viewer count based on deal popularity
    const baseViewers = Math.floor(Math.random() * 8) + 2; // 2-9 initial viewers
    setViewerCount(baseViewers);

    // Simulate real-time updates
    intervalRef.current = setInterval(() => {
      setViewerCount(prev => {
        // Randomly increase or decrease by 0-2 viewers
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const newCount = Math.max(1, prev + change); // Never go below 1
        return Math.min(15, newCount); // Cap at 15 viewers for realism
      });
    }, 3000 + Math.random() * 4000); // Update every 3-7 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dealId]);

  return (
    <div className={`flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs rounded-md ${className}`}>
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="font-medium">{viewerCount}</span>
      </div>
      <span className="opacity-90">
        {viewerCount === 1 ? 'investor viewing' : 'investors viewing'}
      </span>
    </div>
  );
};

export default ViewerTracker;