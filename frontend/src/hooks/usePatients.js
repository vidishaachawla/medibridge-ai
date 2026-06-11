/**
 * hooks/usePatients.js
 * ────────────────────
 * React hook for searching and listing patients.
 * Manages loading, error, and pagination state.
 */
import { useState, useEffect, useCallback } from 'react'
import { searchPatients } from '../api/patients'

/**
 * @param {Object} initialParams – initial query params (q, page, etc.)
 * @returns {{ patients, loading, error, total, params, setParams, refetch }}
 */
export function usePatients(initialParams = {}) {
  const [patients, setPatients] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [params, setParams]     = useState({ page: 1, page_size: 20, ...initialParams })

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await searchPatients(params)
      setPatients(result.patients ?? result.items ?? result)
      setTotal(result.total ?? 0)
    } catch (err) {
      setError(err.detail || 'Failed to load patients')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  return { patients, loading, error, total, params, setParams, refetch: fetchPatients }
}
