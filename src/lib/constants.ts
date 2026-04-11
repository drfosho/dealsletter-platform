// Single source of truth for free / pro / pro-max monthly analysis limits.
// `Infinity` means "no monthly cap" — paid tiers are still rate-limited
// by hour/day but have no monthly count gate.
export const FREE_MONTHLY_ANALYSIS_LIMIT = 3;
export const PRO_MONTHLY_ANALYSIS_LIMIT = Infinity;
export const PRO_MAX_MONTHLY_ANALYSIS_LIMIT = Infinity;
