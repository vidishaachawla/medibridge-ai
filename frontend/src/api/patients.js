/**
 * api/patients.js
 * ───────────────
 * Patient-related API calls. Each function returns the Axios response.data.
 *
 * Backend endpoints (FastAPI):
 *   GET  /patients              – list / search patients
 *   GET  /patients/:id          – single patient record
 *   GET  /patients/:id/history  – medical history
 *   GET  /patients/:id/vitals   – vital signs timeline
 *   GET  /patients/:id/medications – current medications
 */
import client from './client'

/**
 * Search / list patients.
 * @param {Object} params – { q, page, page_size, gender, ... }
 */
export async function searchPatients(params = {}) {
  const { data } = await client.get('/patients', { params })
  return data
}

/**
 * Fetch a single patient by ID.
 * @param {string|number} patientId
 */
export async function getPatient(patientId) {
  const { data } = await client.get(`/patients/${patientId}`)
  return data
}

/**
 * Fetch a patient's full medical history.
 * @param {string|number} patientId
 */
export async function getPatientHistory(patientId) {
  const { data } = await client.get(`/patients/${patientId}/history`)
  return data
}

/**
 * Fetch a patient's vitals timeline.
 * @param {string|number} patientId
 * @param {Object} params – { from_date, to_date }
 */
export async function getPatientVitals(patientId, params = {}) {
  const { data } = await client.get(`/patients/${patientId}/vitals`, { params })
  return data
}

/**
 * Fetch a patient's current medications.
 * @param {string|number} patientId
 */
export async function getPatientMedications(patientId) {
  const { data } = await client.get(`/patients/${patientId}/medications`)
  return data
}
