/**
 * components/navigation/Sidebar.jsx
 * ──────────────────────────────────
 * Fixed left sidebar with brand logo, nav links, and user profile area.
 * Active state is derived from the current route via useLocation.
 */
import { NavLink, useLocation } from 'react-router-dom'
import {
  Activity,
  LayoutDashboard,
  Users,
  FileText,
  Sparkles,
  BarChart3,
  Share2,
  ClipboardList,
  ShieldCheck,
  X,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const MAIN_MENU = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Patient Search', path: '/patients', icon: Users, dynamicBase: '/patients' },
  { label: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
]

const ENTERPRISE_MENU = [
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'FHIR Export', path: '/fhir-export', icon: Share2 },
  { label: 'Audit Logs', path: '/audit-logs', icon: ClipboardList },
]

function Sidebar({ isOpen, onClose }) {
  const { pathname } = useLocation()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      <aside 
        className={cn(
          "w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E6BA8] rounded-xl flex items-center justify-center text-white shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
          <h1 className="font-bold text-lg tracking-tight text-slate-900">
            MediBridge <span className="text-[#1E6BA8]">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            Clinical Intelligence
          </p>
        </div>
      </div>
      <button 
        onClick={onClose}
        className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Main Menu</div>
        {MAIN_MENU.map(({ label, path, icon: Icon, exact, dynamicBase }) => {
          const isActive = exact 
            ? pathname === path 
            : dynamicBase 
              ? pathname.startsWith(dynamicBase) && pathname.length > dynamicBase.length
              : pathname.startsWith(path)
          
          return (
            <NavLink
              key={path}
              to={path}
              onClick={() => { if (window.innerWidth < 1024) onClose?.() }}
              className={cn(
                'flex items-center gap-3 px-6 py-3.5 transition-all border-r-4',
                isActive
                  ? 'bg-slate-100 border-[#1E6BA8] text-[#1E6BA8]'
                  : 'text-slate-600 hover:bg-slate-50 border-transparent'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-medium truncate">{label}</span>
            </NavLink>
          )
        })}

        <div className="px-4 py-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enterprise</div>
        {ENTERPRISE_MENU.map(({ label, path, icon: Icon }) => {
          const isActive = pathname.startsWith(path)

          return (
            <NavLink
              key={path}
              to={path}
              onClick={() => { if (window.innerWidth < 1024) onClose?.() }}
              className={cn(
                'flex items-center gap-3 px-6 py-3.5 transition-all border-r-4',
                isActive
                  ? 'bg-slate-100 border-[#1E6BA8] text-[#1E6BA8]'
                  : 'text-slate-600 hover:bg-slate-50 border-transparent'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="font-medium truncate">{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Footer / HIPAA */}
      <div className="p-6 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-[#1E6BA8] shrink-0" />
            <span className="text-xs font-semibold text-slate-700">HIPAA Compliant</span>
          </div>
          <div className="w-full bg-slate-200 h-1 rounded-full">
            <div className="bg-[#1E6BA8] h-1 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    </aside>
    </>
  )
}

export default Sidebar
