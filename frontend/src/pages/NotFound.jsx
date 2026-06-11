/**
 * pages/NotFound.jsx
 * ──────────────────
 * 404 page shown for unmatched routes.
 */
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surface-950 text-center">
      <p className="text-7xl font-black text-brand-600">404</p>
      <h1 className="text-xl font-bold text-surface-100">Page not found</h1>
      <p className="text-sm text-surface-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

export default NotFound
