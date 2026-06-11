/**
 * components/navigation/TopBar.jsx
 * ─────────────────────────────────
 * Top application bar with global search, notifications, and user profile.
 */
import { Bell, Search, Menu } from 'lucide-react'

function TopBar({ onMenuClick }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input */}
        <div className="hidden sm:flex items-center bg-slate-100 px-4 py-2 rounded-lg w-72 md:w-96 focus-within:ring-2 focus-within:ring-[#1E6BA8]/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input 
          type="text" 
          placeholder="Search patients by name, ID or ABHA..." 
          className="bg-transparent border-none text-sm w-full focus:outline-none text-slate-600 placeholder:text-slate-400"
        />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1E6BA8] transition-colors">Dr. Sarah Chen</p>
            <p className="text-[10px] font-medium text-slate-500">Chief Medical Officer</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden shadow-sm group-hover:border-[#1E6BA8] transition-all">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopBar
