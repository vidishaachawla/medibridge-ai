/**
 * api/index.js
 * ────────────
 * Barrel export for all API service modules.
 * Import from here to keep consumer imports clean:
 *   import { searchPatients, sendAIMessage } from '../api'
 */
export * from './patients'
export * from './ai'
export * from './analytics'
export * from './fhir'
export * from './audit'
export { default as apiClient } from './client'
