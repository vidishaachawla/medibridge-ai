/**
 * hooks/useAnalytics.js
 * ─────────────────────
 * Fetches all analytics data needed by the Analytics page and Dashboard.
 * Returns individual loading/error state per chart dataset.
 */
import { useState, useEffect } from 'react'
import {
  getAnalyticsSummary,
  getAdmissionsTimeline,
  getTopDiagnoses,
  getDemographics,
  getAIUsage,
} from '../api/analytics'

/**
 * @param {Object} options – { period: 'daily'|'weekly'|'monthly' }
 */
export function useAnalytics(options = { period: 'monthly' }) {
  const [summary,     setSummary]     = useState(null)
  const [admissions,  setAdmissions]  = useState([])
  const [diagnoses,   setDiagnoses]   = useState([])
  const [demographics,setDemographics]= useState(null)
  const [aiUsage,     setAIUsage]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, a, d, dem, ai] = await Promise.all([
        getAnalyticsSummary(),
        getAdmissionsTimeline({ period: options.period }),
        getTopDiagnoses({ limit: 10 }),
        getDemographics(),
        getAIUsage({ period: options.period }),
      ])
      setSummary(s)
      setAdmissions(a)
      setDiagnoses(d)
      setDemographics(dem)
      setAIUsage(ai)
    } catch (err) {
      setError(err.detail || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [options.period]) // eslint-disable-line react-hooks/exhaustive-deps

  return { summary, admissions, diagnoses, demographics, aiUsage, loading, error, refetch: fetchAll }
}
