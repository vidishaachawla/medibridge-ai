/**
 * hooks/useDebounce.js
 * ────────────────────
 * Debounces a rapidly-changing value (e.g. search input) by the given delay.
 *
 * @param {*}      value  – the value to debounce
 * @param {number} delay  – debounce delay in ms (default 350)
 * @returns the debounced value
 */
import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
