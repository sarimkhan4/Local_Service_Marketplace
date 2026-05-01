import { BadRequestException } from '@nestjs/common';

/**
 * Sanitization utilities to prevent XSS and injection attacks
 */

// HTML escape characters
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return input;
  return input.replace(/[&<>"'/]/g, char => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Remove potentially dangerous HTML tags
 */
export function stripHtmlTags(input: string): string {
  if (typeof input !== 'string') return input;
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize a string by escaping HTML
 */
export function sanitizeString(input: string, maxLength?: number): string {
  if (typeof input !== 'string') return input;
  
  let sanitized = escapeHtml(input);
  
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Sanitize an object by applying sanitization to all string properties
 */
export function sanitizeObject(
  obj: Record<string, any>,
  maxLength?: number,
  excludeFields: string[] = ['password', 'token', 'secret'],
): Record<string, any> {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    if (excludeFields.includes(key)) {
      sanitized[key] = obj[key]; // Don't sanitize sensitive fields
      continue;
    }

    const value = obj[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, maxLength);
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        sanitized[key] = value.map(item =>
          typeof item === 'string'
            ? sanitizeString(item, maxLength)
            : typeof item === 'object' && item !== null
            ? sanitizeObject(item, maxLength, excludeFields)
            : item,
        );
      } else {
        sanitized[key] = sanitizeObject(value, maxLength, excludeFields);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();
  
  if (!emailRegex.test(trimmed)) {
    throw new BadRequestException('Invalid email format');
  }
  
  return trimmed;
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitize UUID or throw error
 */
export function sanitizeUUID(uuid: string, fieldName: string = 'ID'): string {
  if (!isValidUUID(uuid)) {
    throw new BadRequestException(`Invalid ${fieldName} format`);
  }
  return uuid.toLowerCase();
}

/**
 * Remove SQL injection patterns
 */
export function sanitizeSQLInput(input: string): string {
  if (typeof input !== 'string') return input;
  
  // Remove common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(\b(UNION|INSERT INTO|DELETE FROM|DROP TABLE)\b)/gi,
    /(--|;|--|\/\*|\*\/)/g,
  ];
  
  let sanitized = input;
  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized;
}

/**
 * Validate file extension for uploads
 */
export function isAllowedFileExtension(
  filename: string,
  allowedExtensions: string[] = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return allowedExtensions.includes(ext);
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return '';
  
  // Remove path traversal attempts
  return filename
    .replace(/\.\.\/+/g, '')
    .replace(/^[\/\\]+/, '')
    .replace(/[<>:"|?*]/g, '_')
    .substring(0, 255);
}

/**
 * Rate limiting helper - check if operation should be allowed
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    
    // Clean old entries
    const validTimestamps = timestamps.filter(
      timestamp => now - timestamp < this.windowMs,
    );
    
    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  reset(key: string): void {
    this.requests.delete(key);
  }
}
