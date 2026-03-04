/**
 * Input sanitization utilities for user-facing form data
 * before writing to Firestore.
 */

const HTML_TAG_RE = /<\/?[^>]+(>|$)/g
const SCRIPT_RE = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi

/**
 * Sanitize a string: strip HTML/script tags, trim, enforce max length.
 */
export function sanitizeString(input: unknown, maxLength = 500): string {
    if (typeof input !== 'string') return ''
    return input
        .replace(SCRIPT_RE, '')
        .replace(HTML_TAG_RE, '')
        .trim()
        .slice(0, maxLength)
}

/**
 * Sanitize a number: clamp to range, fallback to default.
 */
export function sanitizeNumber(
    input: unknown,
    min: number,
    max: number,
    fallback: number = min,
): number {
    const n = typeof input === 'number' ? input : Number(input)
    if (!Number.isFinite(n)) return fallback
    return Math.max(min, Math.min(max, n))
}

/**
 * Sanitize an email (basic validation).
 */
export function sanitizeEmail(input: unknown): string {
    if (typeof input !== 'string') return ''
    const trimmed = input.trim().toLowerCase()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRe.test(trimmed) ? trimmed : ''
}
