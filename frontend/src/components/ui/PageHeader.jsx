/**
 * components/ui/PageHeader.jsx
 * ─────────────────────────────
 * Standard page-level heading with optional subtitle and right-side action area.
 *
 * Props:
 *   title     – page title (h1)
 *   subtitle  – supporting description text
 *   action    – ReactNode rendered on the right (buttons, etc.)
 */
function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold text-surface-50 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-surface-400">{subtitle}</p>
        )}
      </div>
      {action && <div className="mt-3 sm:mt-0 flex items-center gap-2">{action}</div>}
    </div>
  )
}

export default PageHeader
