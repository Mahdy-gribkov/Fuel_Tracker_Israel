/**
 * Security Configuration
 * 
 * This file contains security configurations and utilities for the application.
 * It includes API key management, input sanitization, and security headers.
 * 
 * Features:
 * - API key management with environment variables
 * - Input sanitization utilities
 * - Security headers configuration
 * - XSS protection
 * - CSRF protection
 * - Rate limiting configuration
 * 
 * @author Fuel Tracker Global Team
 * @version 2.0.0
 */

// Security configuration object
export const securityConfig = {
  // API Keys - These should be set in environment variables
  apiKeys: {
    // Free APIs that don't require keys (examples)
    currency: process.env.REACT_APP_CURRENCY_API_KEY || 'demo',
    weather: process.env.REACT_APP_WEATHER_API_KEY || 'demo',
    news: process.env.REACT_APP_NEWS_API_KEY || 'demo',
    
    // Add your own API keys here
    // googleMaps: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    // sentry: process.env.REACT_APP_SENTRY_DSN,
  },

  // Security headers for API requests
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  },

  // Rate limiting configuration
  rateLimit: {
    requests: 100,
    window: 15 * 60 * 1000, // 15 minutes
    retryAfter: 60 * 1000 // 1 minute
  },

  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
    'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    'font-src': ["'self'", "https://fonts.gstatic.com"],
    'img-src': ["'self'", "data:", "https:", "blob:"],
    'connect-src': ["'self'", "https://api.exchangerate-api.com", "https://api.openweathermap.org"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"]
  }
};

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with score and feedback
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    score: 0,
    feedback: []
  };

  if (!password) {
    result.feedback.push('Password is required');
    return result;
  }

  if (password.length < 8) {
    result.feedback.push('Password must be at least 8 characters long');
  } else {
    result.score += 1;
  }

  if (!/[a-z]/.test(password)) {
    result.feedback.push('Password must contain at least one lowercase letter');
  } else {
    result.score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    result.feedback.push('Password must contain at least one uppercase letter');
  } else {
    result.score += 1;
  }

  if (!/\d/.test(password)) {
    result.feedback.push('Password must contain at least one number');
  } else {
    result.score += 1;
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.feedback.push('Password must contain at least one special character');
  } else {
    result.score += 1;
  }

  result.isValid = result.score >= 4;
  return result;
};

/**
 * Generate secure random token
 * @param {number} length - Token length
 * @returns {string} - Secure random token
 */
export const generateSecureToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for older browsers
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
};

/**
 * Hash sensitive data (simple hash for demo purposes)
 * In production, use a proper hashing library like bcrypt
 * @param {string} data - Data to hash
 * @returns {string} - Hashed data
 */
export const hashData = async (data) => {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for older browsers
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Check if URL is safe (not malicious)
 * @param {string} url - URL to check
 * @returns {boolean} - Whether URL is safe
 */
export const isSafeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Check for dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousProtocols.some(protocol => urlObj.protocol.toLowerCase().startsWith(protocol))) {
      return false;
    }
    
    // Check for suspicious domains (basic check)
    const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
    if (suspiciousDomains.includes(urlObj.hostname)) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(requests = 100, windowMs = 15 * 60 * 1000) {
    this.requests = requests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   * @param {string} key - Unique key for rate limiting
   * @returns {boolean} - Whether request is allowed
   */
  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old entries
    for (const [timestamp, count] of this.requests.entries()) {
      if (timestamp < windowStart) {
        this.requests.delete(timestamp);
      }
    }
    
    // Count current requests
    const currentRequests = Array.from(this.requests.values()).reduce((sum, count) => sum + count, 0);
    
    if (currentRequests >= this.requests) {
      return false;
    }
    
    // Add current request
    this.requests.set(now, (this.requests.get(now) || 0) + 1);
    return true;
  }

  /**
   * Get remaining requests
   * @returns {number} - Number of remaining requests
   */
  getRemainingRequests() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old entries
    for (const [timestamp] of this.requests.entries()) {
      if (timestamp < windowStart) {
        this.requests.delete(timestamp);
      }
    }
    
    const currentRequests = Array.from(this.requests.values()).reduce((sum, count) => sum + count, 0);
    return Math.max(0, this.requests - currentRequests);
  }
}

/**
 * Security headers middleware for API requests
 * @param {Object} options - Fetch options
 * @returns {Object} - Enhanced options with security headers
 */
export const addSecurityHeaders = (options = {}) => {
  return {
    ...options,
    headers: {
      ...securityConfig.headers,
      ...options.headers
    }
  };
};

/**
 * Content Security Policy configuration
 * @returns {string} - CSP header value
 */
export const getCSPHeader = () => {
  return Object.entries(securityConfig.csp)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

/**
 * Initialize security features
 */
export const initializeSecurity = () => {
  // Set CSP meta tag
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = getCSPHeader();
  document.head.appendChild(cspMeta);

  // Set security headers
  const securityMeta = document.createElement('meta');
  securityMeta.httpEquiv = 'X-Content-Type-Options';
  securityMeta.content = 'nosniff';
  document.head.appendChild(securityMeta);

  // Disable right-click context menu in production (optional)
  if (process.env.NODE_ENV === 'production') {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  // Disable F12 and other dev tools shortcuts in production (optional)
  if (process.env.NODE_ENV === 'production') {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J')) {
        e.preventDefault();
      }
    });
  }
};

// Initialize security on module load
if (typeof window !== 'undefined') {
  initializeSecurity();
}

export default {
  securityConfig,
  sanitizeInput,
  validateEmail,
  validatePassword,
  generateSecureToken,
  hashData,
  isSafeUrl,
  RateLimiter,
  addSecurityHeaders,
  getCSPHeader,
  initializeSecurity
};
