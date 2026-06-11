/**
 * hooks/usePatientDetails.js
 * ──────────────────────────
 * Fetches a single patient record plus history, vitals, and medications.
 * All sub-fetches are parallelised.
 */
import { useState, useEffect } from 'react'
import {
  getPatient,
  getPatientHistory,
  getPatientVitals,
  getPatientMedications,
} from '../api/patients'

/**
 * @param {string|number} patientId
 * @returns {{ patient, history, vitals, medications, loading, error, refetch }}
 */
export function usePatientDetails(patientId) {
  const [patient,     setPatient]     = useState(null)
  const [history,     setHistory]     = useState([])
  const [vitals,      setVitals]      = useState([])
  const [medications, setMedications] = useState([])
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  const fetchAll = async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const [p, h, v, m] = await Promise.all([
        getPatient(patientId),
        getPatientHistory(patientId),
        getPatientVitals(patientId),
        getPatientMedications(patientId),
      ])
      setPatient(p)
      setHistory(h)
      setVitals(v)
      setMedications(m)
    } catch (err) {
      setError(err.detail || 'Failed to load patient details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [patientId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { patient, history, vitals, medications, loading, error, refetch: fetchAll }
}
