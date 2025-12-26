/**
 * Utility functions for formatting and cleaning text from AI responses
 */

/**
 * Strips markdown formatting from text
 * Removes: **bold**, *italic*, # headers, - bullets, etc.
 */
export function stripMarkdown(text: string | undefined | null): string {
  if (!text) return '';

  return text
    // Remove bold/italic markers
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/___([^_]+)___/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s*/gm, '')
    // Remove bullet points at start of lines
    .replace(/^[-*•→►]\s*/gm, '')
    .replace(/^\s*[-*•→►]\s*/gm, '')
    // Remove numbered list markers
    .replace(/^\d+\.\s*/gm, '')
    .replace(/^\s*\d+\.\s*/gm, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove horizontal rules
    .replace(/^---+\s*$/gm, '')
    .replace(/^\*\*\*+\s*$/gm, '')
    .replace(/^___+\s*$/gm, '')
    // Remove trailing dashes/artifacts
    .replace(/\s*--\s*$/gm, '')
    .replace(/\s*—\s*$/gm, '')
    // Remove blockquotes
    .replace(/^>\s*/gm, '')
    // Clean up standalone asterisks
    .replace(/^\*\s*$/gm, '')
    .replace(/\s+\*\s*$/gm, '')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Formats currency values
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return '$0';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats percentage values
 */
export function formatPercent(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '0%';

  // Handle infinite values
  if (!isFinite(value) || value > 999) return 'INFINITE';

  return `${value.toFixed(decimals)}%`;
}

/**
 * Cleans and formats AI-generated summary text
 */
export function formatSummary(text: string | undefined | null): string {
  if (!text) return 'No summary available.';

  const cleaned = stripMarkdown(text);

  // Ensure it ends with proper punctuation
  if (cleaned && !cleaned.match(/[.!?]$/)) {
    return cleaned + '.';
  }

  return cleaned;
}

/**
 * Cleans and formats AI-generated recommendation text
 * Removes formatting artifacts and makes text professional
 */
export function formatRecommendation(text: string | undefined | null): string {
  if (!text) return 'No recommendation available.';

  let cleaned = text
    // Remove section headers that might appear
    .replace(/^RECOMMENDATION:\s*/gim, '')
    .replace(/^SUMMARY:\s*/gim, '')
    // Remove "Rationale:" or similar labels
    .replace(/\bRationale:\s*/gi, '')
    .replace(/\bExplanation:\s*/gi, '')
    .replace(/\bReasoning:\s*/gi, '')
    // Remove trailing dashes and other artifacts
    .replace(/\s*--\s*$/g, '')
    .replace(/\s*-+\s*$/g, '')
    .replace(/\s*—\s*$/g, '')
    // Remove multiple asterisks (often used as separators)
    .replace(/\*{2,}/g, '')
    // Clean up any remaining single asterisks at word boundaries
    .replace(/\s*\*\s*/g, ' ')
    // Remove colons after recommendation types that are already formatted
    .replace(/(PASS|BUY|HOLD|CONDITIONAL PASS|CONDITIONAL BUY|STRONG BUY):\s*/gi, '$1 - ')
    // Fix double dashes in recommendations
    .replace(/(PASS|BUY|HOLD)\s*-\s*-\s*/gi, '$1 - ')
    // Clean up double spaces
    .replace(/\s{2,}/g, ' ')
    // Clean up line breaks with proper spacing
    .replace(/\n{3,}/g, '\n\n')
    // Remove any lingering underscores used for emphasis
    .replace(/__/g, '')
    .replace(/_([^_]+)_/g, '$1')
    // Remove any [brackets] that might appear
    .replace(/\[([^\]]+)\]/g, '$1')
    // Fix common grammatical issues
    .replace(/\s+,/g, ',')
    .replace(/\s+\./g, '.')
    .replace(/,,/g, ',')
    .replace(/\.\./g, '.')
    // Clean up any numbers stuck to words
    .replace(/(\d)([A-Za-z])/g, '$1 $2');

  // Apply markdown stripping
  cleaned = stripMarkdown(cleaned);

  // Ensure proper sentence ending
  if (cleaned && !cleaned.match(/[.!?]$/)) {
    cleaned = cleaned + '.';
  }

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned.trim();
}

/**
 * Determines recommendation type from text
 */
export function getRecommendationType(text: string | undefined | null): 'positive' | 'negative' | 'neutral' {
  if (!text) return 'neutral';

  const lowerText = text.toLowerCase();

  if (
    lowerText.includes('pass') ||
    lowerText.includes('avoid') ||
    lowerText.includes("don't") ||
    lowerText.includes('not recommended') ||
    lowerText.includes('high risk')
  ) {
    return 'negative';
  }

  if (
    lowerText.includes('maybe') ||
    lowerText.includes('cautious') ||
    lowerText.includes('careful') ||
    lowerText.includes('moderate risk') ||
    lowerText.includes('proceed with caution')
  ) {
    return 'neutral';
  }

  return 'positive';
}

/**
 * Gets color classes based on recommendation type
 */
export function getRecommendationColors(type: 'positive' | 'negative' | 'neutral'): {
  bg: string;
  border: string;
  title: string;
  text: string;
  icon: string;
} {
  switch (type) {
    case 'negative':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        title: 'text-red-900',
        text: 'text-red-800',
        icon: 'text-red-600'
      };
    case 'neutral':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        title: 'text-yellow-900',
        text: 'text-yellow-800',
        icon: 'text-yellow-600'
      };
    default:
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        title: 'text-green-900',
        text: 'text-green-800',
        icon: 'text-green-600'
      };
  }
}

/**
 * Formats a list of items (risks/opportunities) - strips markdown from each
 */
export function formatListItems(items: string[] | undefined | null): string[] {
  if (!items || !Array.isArray(items)) return [];

  return items
    .map(item => stripMarkdown(item))
    .filter(item => item.length > 0);
}
