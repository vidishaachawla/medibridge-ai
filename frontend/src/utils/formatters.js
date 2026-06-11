/**
 * formatters.js
 * ─────────────
 * Shared display-formatting utilities for dates, numbers, and medical codes.
 */

/**
 * Format an ISO date string to a readable date (e.g. "Jun 11, 2026")
 */
export function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format an ISO datetime string to "Jun 11, 2026 · 7:30 PM"
 */
export function formatDateTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Format a number as compact notation (e.g. 1500 → "1.5K")
 */
export function formatCount(n) {
  if (n === null || n === undefined) return '—'
  return Intl.NumberFormat('en-US', { notation: 'compact' }).format(n)
}

/**
 * Derive initials from a full name string (e.g. "Jane Doe" → "JD")
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

/**
 * Map FHIR resource type to a display label
 */
export function fhirResourceLabel(resourceType) {
  const labels = {
    Patient: 'Patient',
    Observation: 'Observation',
    Condition: 'Condition',
    MedicationRequest: 'Medication',
    Encounter: 'Encounter',
    DiagnosticReport: 'Diagnostic Report',
    Procedure: 'Procedure',
    AllergyIntolerance: 'Allergy',
    Immunization: 'Immunization',
  }
  return labels[resourceType] || resourceType
}
