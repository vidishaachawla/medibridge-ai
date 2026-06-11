import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/navigation/Sidebar'
import TopBar from '../components/navigation/TopBar'

/**
 * AppLayout
 * ─────────
 * Shell layout used by all authenticated pages.
 * Integrates the fixed premium Sidebar and TopBar, injecting content via <Outlet />.
 */
function AppLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Fixed left sidebar */}
      <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

      {/* Main Content Area (offset by 64 = 256px on lg screens) */}
      <div className="flex flex-col flex-1 lg:ml-64 min-w-0">
        <TopBar onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
