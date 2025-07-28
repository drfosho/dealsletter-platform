'use client';

interface Deal {
  id: number;
  daysOnMarket?: number;
  [key: string]: unknown;
}

interface ActivityBadgesProps {
  deal: Deal;
  className?: string;
}

const ActivityBadges = ({ deal, className = '' }: ActivityBadgesProps) => {
  // NEW badge for deals less than 24 hours old (less than 1 day on market)
  const isNew = (deal.daysOnMarket ?? 0) < 1;
  
  // HOT badge for high-activity deals (simulate based on deal characteristics)
  // In production, this would be based on actual view/activity metrics
  const isHot = (() => {
    // Consider deals hot if they have multiple indicators of high activity
    const hotFactors = [
      (deal.daysOnMarket ?? 0) <= 2, // Recently listed
      deal.id % 3 === 0, // Use deal ID for consistent hot badge
    ].filter(Boolean).length;
    
    return hotFactors >= 2; // Deterministic based on deal properties
  })();

  if (!isNew && !isHot) return null;

  return (
    <div className={`flex gap-1 ${className}`}>
      {isNew && (
        <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-md shadow-lg">
          NEW
        </span>
      )}
      {isHot && (
        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-md shadow-lg animate-pulse">
          HOT
        </span>
      )}
    </div>
  );
};

export default ActivityBadges;