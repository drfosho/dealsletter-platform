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
    // Initialize with a base viewer count based on deal ID for consistency
    const baseViewers = (dealId % 8) + 2; // 2-9 initial viewers based on deal ID
    setViewerCount(baseViewers);

    // Simulate real-time updates
    let counter = 0;
    intervalRef.current = setInterval(() => {
      counter++;
      setViewerCount(prev => {
        // Deterministic change based on counter and deal ID
        const change = ((counter + dealId) % 5) - 2; // -2 to +2
        const newCount = Math.max(1, prev + change); // Never go below 1
        return Math.min(15, newCount); // Cap at 15 viewers for realism
      });
    }, 5000); // Update every 5 seconds

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