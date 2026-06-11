/**
 * api/audit.js
 * ────────────
 * Audit log API calls.
 *
 * Backend endpoints:
 *   GET /audit/logs             – paginated list of audit events
 *   GET /audit/logs/:id         – single audit event detail
 *   GET /audit/summary          – aggregate counts by action type
 */
import client from './client'

/**
 * Fetch paginated audit log entries.
 * @param {Object} params – { page, page_size, action, user_id, from_date, to_date }
 */
export async function getAuditLogs(params = {}) {
  const { data } = await client.get('/audit/logs', { params })
  return data
}

/**
 * Fetch a single audit log entry by ID.
 * @param {string|number} logId
 */
export async function getAuditLogDetail(logId) {
  const { data } = await client.get(`/audit/logs/${logId}`)
  return data
}

/**
 * Fetch aggregate audit summary (action counts, unique users, etc.)
 * @param {Object} params – { period }
 */
export async function getAuditSummary(params = {}) {
  const { data } = await client.get('/audit/summary', { params })
  return data
}
