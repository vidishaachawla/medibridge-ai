/**
 * hooks/useAuditLogs.js
 * ─────────────────────
 * Paginated audit log fetching with filter support.
 */
import { useState, useEffect, useCallback } from 'react'
import { getAuditLogs } from '../api/audit'

export function useAuditLogs(initialParams = {}) {
  const [logs,    setLogs]    = useState([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [params,  setParams]  = useState({ page: 1, page_size: 20, ...initialParams })

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAuditLogs(params)
      setLogs(result.logs ?? result.items ?? result)
      setTotal(result.total ?? 0)
    } catch (err) {
      setError(err.detail || 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return { logs, total, loading, error, params, setParams, refetch: fetchLogs }
}
