import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get authentication headers for API requests
 * @returns Headers object with authorization token if available
 */
export function getAuthHeaders(): Record<string, string> {
  const baseHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Better Auth automatically handles authentication tokens via cookies
  // For manual token handling, you would need to get the session first
  // and then extract the token from it if needed
  
  return baseHeaders;
}

/**
 * Check if an error is authentication-related
 * @param error - The error to check
 * @returns true if the error is auth-related
 */
export function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  
  // Check for Better Auth specific error properties
  if ('code' in error) {
    const errorCode = (error as { code: string }).code;
    return ['UNAUTHORIZED', 'FORBIDDEN', 'TOKEN_EXPIRED', 'INVALID_TOKEN'].includes(errorCode);
  }
  
  // Check for HTTP status codes
  if ('status' in error) {
    const status = (error as { status: number }).status;
    return status === 401 || status === 403;
  }
  
  // Check error message for common auth error patterns
  if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
    const message = (error as { message: string }).message.toLowerCase();
    return message.includes('unauthorized') || 
           message.includes('forbidden') || 
           message.includes('token') || 
           message.includes('authentication');
  }
  
  return false;
}

/**
 * Handle authentication errors with appropriate actions
 * @param error - The error to handle
 * @returns Processed error information
 */
export function handleAuthError(error: unknown): {
  message: string;
  shouldRedirect: boolean;
  redirectPath?: string;
} {
  if (!isAuthError(error)) {
    return {
      message: 'An unexpected error occurred',
      shouldRedirect: false,
    };
  }
  
  // Handle different types of auth errors
  if (error && typeof error === 'object') {
    if ('code' in error) {
      const errorCode = (error as { code: string }).code;
      
      switch (errorCode) {
        case 'UNAUTHORIZED':
          return {
            message: 'You need to sign in to access this resource',
            shouldRedirect: true,
            redirectPath: '/sign-in',
          };
        case 'FORBIDDEN':
          return {
            message: 'You do not have permission to access this resource',
            shouldRedirect: false,
          };
        case 'TOKEN_EXPIRED':
          return {
            message: 'Your session has expired. Please sign in again',
            shouldRedirect: true,
            redirectPath: '/sign-in',
          };
        case 'INVALID_TOKEN':
          return {
            message: 'Invalid authentication token. Please sign in again',
            shouldRedirect: true,
            redirectPath: '/sign-in',
          };
        default:
          return {
            message: 'Authentication error occurred',
            shouldRedirect: true,
            redirectPath: '/sign-in',
          };
      }
    }
    
    if ('status' in error) {
      const status = (error as { status: number }).status;
      
      if (status === 401) {
        return {
          message: 'You need to sign in to access this resource',
          shouldRedirect: true,
          redirectPath: '/sign-in',
        };
      }
      
      if (status === 403) {
        return {
          message: 'You do not have permission to access this resource',
          shouldRedirect: false,
        };
      }
    }
  }
  
  return {
    message: 'Authentication error occurred',
    shouldRedirect: true,
    redirectPath: '/sign-in',
  };
}
