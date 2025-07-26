/**
 * Safely converts any error to a string message
 * This prevents React error #31 when objects are rendered
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (error && typeof error === 'object') {
    // Check for common error object patterns
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorObj = error as any;
    
    // Google Maps API errors often have these properties
    if (errorObj.message) return String(errorObj.message);
    if (errorObj.error) return String(errorObj.error);
    if (errorObj.code) return `Error code: ${errorObj.code}`;
    if (errorObj.status) return `Error status: ${errorObj.status}`;
    
    // Try to get any string representation
    try {
      const stringified = JSON.stringify(error);
      if (stringified !== '{}') {
        return `Error: ${stringified}`;
      }
    } catch {
      // If can't stringify, fall through
    }
  }
  
  return 'An unknown error occurred';
}

/**
 * Safely logs an error to console
 */
export function logError(context: string, error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`[${context}]`, message);
  
  // Also log the full error object for debugging, but safely
  if (error && typeof error === 'object' && !(error instanceof Error)) {
    try {
      console.error(`[${context}] Full error object:`, JSON.stringify(error, null, 2));
    } catch {
      console.error(`[${context}] Could not stringify error object`);
    }
  }
}