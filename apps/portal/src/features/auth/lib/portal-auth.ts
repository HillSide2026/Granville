import type { AuthUser } from '@/stores/auth-store'

export const ALLOWED_SIGNUP_DOMAINS = [
  'levine-law.ca',
  'levinelegal.ca',
  'levinelegalservices.com',
] as const

export const ALLOWED_EMAIL_MESSAGE =
  'Use a levine-law.ca, levinelegal.ca, or levinelegalservices.com email address.'

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function emailDomain(email: string) {
  const parts = normalizeEmail(email).split('@')
  return parts[parts.length - 1] ?? ''
}

export function isAllowedPortalEmail(email: string) {
  return ALLOWED_SIGNUP_DOMAINS.includes(
    emailDomain(email) as (typeof ALLOWED_SIGNUP_DOMAINS)[number]
  )
}

export function createPortalUser(email: string): AuthUser {
  const normalizedEmail = normalizeEmail(email)
  const domain = emailDomain(normalizedEmail)

  return {
    id: `portal:${normalizedEmail}`,
    email: normalizedEmail,
    role: 'customer',
    organizationName: organizationNameFromDomain(domain),
  }
}

export function createPortalAccessToken(email: string) {
  return `portal-${normalizeEmail(email).replace(/[^a-z0-9]+/g, '-')}`
}

function organizationNameFromDomain(domain: string) {
  if (domain === 'levine-law.ca') return 'Levine Law'
  if (domain === 'levinelegalservices.com') return 'Levine Legal Services'
  return 'Levine Legal'
}
