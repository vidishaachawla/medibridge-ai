/**
 * api/analytics.js
 * ────────────────
 * Analytics API calls for dashboard charts and summary statistics.
 *
 * Backend endpoints:
 *   GET /analytics/summary      – headline KPI metrics
 *   GET /analytics/admissions   – admissions over time
 *   GET /analytics/diagnoses    – top diagnoses breakdown
 *   GET /analytics/demographics – patient demographics (age, gender)
 *   GET /analytics/ai-usage     – AI assistant usage statistics
 */
import client from './client'

/**
 * Fetch headline KPI summary (total patients, active cases, etc.)
 */
export async function getAnalyticsSummary() {
  const { data } = await client.get('/analytics/summary')
  return data
}

/**
 * Fetch admissions over time.
 * @param {Object} params – { period: 'daily'|'weekly'|'monthly', from_date, to_date }
 */
export async function getAdmissionsTimeline(params = {}) {
  const { data } = await client.get('/analytics/admissions', { params })
  return data
}

/**
 * Fetch top diagnoses / conditions breakdown.
 * @param {Object} params – { limit: number }
 */
export async function getTopDiagnoses(params = {}) {
  const { data } = await client.get('/analytics/diagnoses', { params })
  return data
}

/**
 * Fetch patient demographics data.
 */
export async function getDemographics() {
  const { data } = await client.get('/analytics/demographics')
  return data
}

/**
 * Fetch AI assistant usage stats.
 * @param {Object} params – { period }
 */
export async function getAIUsage(params = {}) {
  const { data } = await client.get('/analytics/ai-usage', { params })
  return data
}
