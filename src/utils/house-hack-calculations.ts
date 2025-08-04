/**
 * Utility functions for consistent house hack calculations across the app
 */

/**
 * Calculate monthly mortgage payment
 */
export function calculateMonthlyMortgage(
  price: number,
  downPaymentPercent: number = 25,
  interestRate: number = 0.067,
  years: number = 30
): number {
  if (!price || !downPaymentPercent) return 0;
  
  const loanAmount = price * (1 - (downPaymentPercent / 100));
  const monthlyRate = interestRate / 12;
  const numPayments = years * 12;
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(monthlyPayment);
}

/**
 * Calculate effective mortgage for house hack properties
 * This is the actual out-of-pocket cost after rental income
 */
export function calculateEffectiveMortgage(
  price: number,
  downPaymentPercent: number = 25,
  monthlyRent: number = 0,
  interestRate: number = 0.067,
  years: number = 30
): number {
  const totalMortgage = calculateMonthlyMortgage(price, downPaymentPercent, interestRate, years);
  const effectiveMortgage = totalMortgage - monthlyRent;
  
  // Return the effective mortgage (can be negative if rent exceeds mortgage)
  return effectiveMortgage;
}

/**
 * Check if a property is a house hack
 */
export function isHouseHackProperty(strategy?: string): boolean {
  if (!strategy) return false;
  const strategyLower = strategy.toLowerCase();
  return strategyLower.includes('house hack') || strategyLower.includes('househack');
}

/**
 * Get color class for effective mortgage display
 */
export function getEffectiveMortgageColor(effectiveMortgage: number): string {
  if (effectiveMortgage <= 0) return 'text-green-600'; // Negative means profit
  if (effectiveMortgage <= 1000) return 'text-green-600';
  if (effectiveMortgage <= 2000) return 'text-blue-600';
  return 'text-amber-600';
}