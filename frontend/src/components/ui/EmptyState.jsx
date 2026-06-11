/**
 * components/ui/EmptyState.jsx
 * ────────────────────────────
 * Placeholder shown when a list or query returns no results.
 *
 * Props:
 *   icon     – ReactNode (lucide icon recommended)
 *   title    – main heading
 *   message  – supporting text
 *   action   – optional ReactNode (e.g. a Button)
 */
function EmptyState({ icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-800 text-surface-500">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-surface-200">{title}</h3>
      {message && <p className="max-w-xs text-xs text-surface-500">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export default EmptyState
