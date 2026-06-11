/**
 * constants.js
 * ────────────
 * Application-wide constants shared across modules.
 */

/** Base URL for the FastAPI backend.
 *  In development, Vite proxy rewrites /api → http://localhost:8000
 *  In production, set VITE_API_BASE_URL in your .env file.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/** Default pagination page size */
export const DEFAULT_PAGE_SIZE = 20

/** AI Assistant roles */
export const MESSAGE_ROLE = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
}

/** Audit log action types (mirrors backend enum) */
export const AUDIT_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW_PATIENT: 'view_patient',
  EDIT_PATIENT: 'edit_patient',
  AI_QUERY: 'ai_query',
  FHIR_EXPORT: 'fhir_export',
  DATA_EXPORT: 'data_export',
}

/** FHIR export resource types */
export const FHIR_RESOURCE_TYPES = [
  'Patient',
  'Observation',
  'Condition',
  'MedicationRequest',
  'Encounter',
  'DiagnosticReport',
  'Procedure',
  'AllergyIntolerance',
  'Immunization',
]

/** Navigation links used by Sidebar */
export const NAV_LINKS = [
  { label: 'Dashboard',      path: '/dashboard',    icon: 'LayoutDashboard' },
  { label: 'Patients',       path: '/patients',     icon: 'Users' },
  { label: 'AI Assistant',   path: '/ai-assistant', icon: 'Bot' },
  { label: 'Analytics',      path: '/analytics',    icon: 'BarChart2' },
  { label: 'FHIR Export',    path: '/fhir-export',  icon: 'FileDown' },
  { label: 'Audit Logs',     path: '/audit-logs',   icon: 'ScrollText' },
]
