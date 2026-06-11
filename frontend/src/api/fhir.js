/**
 * api/fhir.js
 * ───────────
 * FHIR Export API calls.
 *
 * Backend endpoints:
 *   POST /fhir/export           – trigger an export job
 *   GET  /fhir/export/:jobId    – poll job status
 *   GET  /fhir/export/:jobId/download – download the generated FHIR bundle
 *   GET  /fhir/resources        – list supported FHIR resource types
 */
import client from './client'

/**
 * Initiate a FHIR export job.
 * @param {Object} payload – { patient_ids?, resource_types, format: 'json'|'ndjson' }
 */
export async function startFHIRExport(payload) {
  const { data } = await client.post('/fhir/export', payload)
  return data // { job_id, status, created_at }
}

/**
 * Poll the status of an export job.
 * @param {string} jobId
 */
export async function getFHIRExportStatus(jobId) {
  const { data } = await client.get(`/fhir/export/${jobId}`)
  return data // { job_id, status, progress, download_url? }
}

/**
 * Download a completed FHIR export bundle.
 * Returns the raw blob for file-saver or <a> download trigger.
 * @param {string} jobId
 */
export async function downloadFHIRExport(jobId) {
  const response = await client.get(`/fhir/export/${jobId}/download`, {
    responseType: 'blob',
  })
  return response.data
}

/**
 * Fetch the list of FHIR resource types supported by the backend.
 */
export async function getFHIRResourceTypes() {
  const { data } = await client.get('/fhir/resources')
  return data
}
