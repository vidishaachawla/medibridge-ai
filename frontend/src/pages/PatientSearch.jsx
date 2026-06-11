/**
 * pages/PatientSearch.jsx
 * ───────────────────────
 * Connected to live FastAPI Backend.
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, FileDown, UserPlus, Search, SlidersHorizontal, ShieldCheck, Users2, Activity,
  ChevronDown, IdCard, AlertTriangle, AlertCircle, CheckCircle, UserCircle, Sparkles,
  ChevronLeft, ChevronRight, ArrowRightCircle, Loader2
} from 'lucide-react'
import { PatientService, AnalyticsService } from '../api/services'

/* ─── Shared Components ───────────────────────────────────── */

function IosToggle({ defaultChecked = false, onChange }) {
  const [on, setOn] = useState(defaultChecked)
  const handleClick = () => {
    const newVal = !on
    setOn(newVal)
    onChange?.(newVal)
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={handleClick}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        on ? 'bg-[#1E6BA8]' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] mt-[2px] ${
          on ? 'translate-x-[20px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}

function RiskBar({ percent, colorClass, shadowClass }) {
  return (
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden relative">
      <div
        className={`h-full rounded-full risk-bar-anim ${colorClass} ${shadowClass}`}
        style={{ '--target-width': `${percent}%` }}
      />
    </div>
  )
}

function PatientRow({ patient }) {
  const navigate = useNavigate()

  let riskIcon = CheckCircle
  let riskLabel = "LOW RISK"
  let riskBg = "bg-emerald-50"
  let riskText = "text-emerald-600"
  let riskBorder = "border-emerald-100"
  let riskBarColor = "bg-[#10B981]"
  let riskBarShadow = "shadow-[0_0_8px_rgba(16,185,129,0.3)]"

  if (patient.risk_classification === 'High') {
    riskIcon = AlertTriangle
    riskLabel = "CRITICAL"
    riskBg = "bg-red-50"
    riskText = "text-red-600"
    riskBorder = "border-red-100"
    riskBarColor = "bg-[#7F1D1D]"
    riskBarShadow = "shadow-[0_0_8px_rgba(127,29,29,0.3)]"
  } else if (patient.risk_classification === 'Medium') {
    riskIcon = AlertCircle
    riskLabel = "ELEVATED"
    riskBg = "bg-orange-50"
    riskText = "text-orange-600"
    riskBorder = "border-orange-100"
    riskBarColor = "bg-[#EF4444]"
    riskBarShadow = "shadow-[0_0_8px_rgba(239,68,68,0.3)]"
  }

  const conditions = []
  if (patient.hypertension_status) conditions.push('Hypertension')
  if (patient.diabetes_status) conditions.push('Type 2 Diabetes')
  if (patient.smoker_status) conditions.push('Smoker')
  if (conditions.length === 0) conditions.push('No active conditions')

  return (
    <tr 
      onClick={() => navigate(`/patients/${patient.id}`)}
      className="table-row-premium group border-b border-slate-50 last:border-none cursor-pointer"
    >
      <td className="px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 rounded-2xl border-2 border-white flex items-center justify-center shadow-md overflow-hidden bg-slate-100`}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.first_name}`} className="w-full h-full object-cover" alt={patient.first_name} />
            </div>
            {patient.risk_classification === 'High' && (
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-red-500`} />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-base leading-tight tracking-tight">{patient.first_name} {patient.last_name}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()}Y • {patient.gender}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 text-[#1E6BA8] rounded-lg border border-blue-100 w-fit">
            <IdCard className="w-4 h-4" />
            <code className="font-mono text-[10px] font-bold">{patient.abha_number || 'Pending'}</code>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">ID: MB-{patient.id.toString().padStart(5, '0')}</span>
        </div>
      </td>
      <td className="px-6 py-6 min-w-[200px]">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border shadow-sm ${riskBg} ${riskText} ${riskBorder}`}>
              <RiskIcon className="w-3.5 h-3.5" /> {riskLabel}
            </span>
            <span className={`text-[11px] font-extrabold tracking-tight ${riskText.replace('text-', 'text-').replace('600', '500')}`}>
              {patient.risk_score.toFixed(1)}%
            </span>
          </div>
          <RiskBar percent={patient.risk_score} colorClass={riskBarColor} shadowClass={riskBarShadow} />
        </div>
      </td>
      <td className="px-6 py-6 max-w-[200px]">
        <div className="flex flex-wrap gap-2">
          {conditions.map((cond, i) => (
            <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-extrabold rounded-md border border-slate-100 uppercase tracking-tighter">
              {cond}
            </span>
          ))}
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-slate-800">
            {new Date(patient.updated_at).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600">
              Active Record
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-6 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button className="p-2.5 text-slate-400 hover:text-[#1E6BA8] hover:bg-blue-50 rounded-2xl transition-all" title="Full Chart">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function PatientSearch() {
  const [allPatients, setAllPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  // Filtering states
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilters, setRiskFilters] = useState({ High: false, Medium: false, Low: false })
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  
  // Pagination
  const [page, setPage] = useState(1)
  const limit = 10

  const fetchPatients = async (currentPage) => {
    try {
      setLoading(true)
      const skip = (currentPage - 1) * limit
      const [data, summary] = await Promise.all([
        PatientService.getPatients(skip, limit),
        AnalyticsService.getSummary()
      ])
      setAllPatients(data)
      setTotalCount(summary.total_patients)
      setError(null)
    } catch (err) {
      setError('Failed to fetch patient registry from backend.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Server-Side ABHA Search & Pagination
  useEffect(() => {
    const abhaRegex = /^\d{2}-\d{4}-\d{4}-\d{4}$/
    if (abhaRegex.test(searchQuery)) {
      setLoading(true)
      PatientService.searchByAbha(searchQuery)
        .then(res => {
          setAllPatients([res])
          setTotalCount(1)
          setPage(1)
        })
        .catch(() => {
          setAllPatients([])
          setTotalCount(0)
        })
        .finally(() => setLoading(false))
    } else if (searchQuery === '' && !loading) {
      // Reload based on page when ABHA search is cleared
      fetchPatients(page)
    }
  }, [searchQuery, page])

  // Client-Side filtering for name and risk
  const filteredPatients = useMemo(() => {
    const abhaRegex = /^\d{2}-\d{4}-\d{4}-\d{4}$/
    let filtered = allPatients

    // Name filtering (skip if it's an ABHA query since it's handled server-side)
    if (searchQuery && !abhaRegex.test(searchQuery)) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.first_name.toLowerCase().includes(q) || 
        p.last_name.toLowerCase().includes(q) ||
        `MB-${p.id.toString().padStart(5, '0')}`.toLowerCase().includes(q)
      )
    }

    // Risk filtering
    const activeRiskFilters = Object.entries(riskFilters).filter(([_, v]) => v).map(([k]) => k)
    if (activeRiskFilters.length > 0) {
      filtered = filtered.filter(p => activeRiskFilters.includes(p.risk_classification))
    }

    // Status filtering (Mock implementation - keeps UI functional without backend support)
    if (statusFilter !== 'All Statuses') {
      // Intentionally not filtering out patients to prevent an empty list,
      // as the backend doesn't currently provide an admission status field.
    }

    return filtered
  }, [allPatients, searchQuery, riskFilters, statusFilter])

  // Pagination Logic using backend total
  const totalPages = Math.ceil(totalCount / limit) || 1
  const paginatedPatients = filteredPatients // Backend already paginated, we just display the filtered result for the current page

  return (
    <>
      <style>{`
        .premium-card {
          background: #FFFFFF;
          border: 1px solid rgba(226,232,240,0.6);
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 12px -2px rgba(15, 23, 42, 0.04);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .premium-card:hover {
          box-shadow: 0 12px 24px -8px rgba(15, 23, 42, 0.12);
          transform: translateY(-1px);
        }
        .table-row-premium {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 4px solid transparent;
        }
        .table-row-premium:hover {
          background: linear-gradient(90deg, rgba(30, 107, 168, 0.04) 0%, rgba(255, 255, 255, 0) 100%);
          border-left-color: #1E6BA8;
        }
        @keyframes growWidth {
          from { width: 0; }
          to { width: var(--target-width); }
        }
        .risk-bar-anim {
          animation: growWidth 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .btn-primary {
          background-color: #1E6BA8;
          box-shadow: 0 4px 12px rgba(30, 107, 168, 0.2);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-primary:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(30, 107, 168, 0.3);
        }
        .btn-secondary {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-secondary:hover {
          background-color: #F8FAFC;
          border-color: #CBD5E1;
          transform: translateY(-1px);
        }
      `}</style>

      <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-[#1E6BA8] shadow-sm">
                <Users className="w-5 h-5" />
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Registry</h2>
            </div>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl">
              Cross-functional registry managing clinical profiles with real-time risk stratification and ABHA synchronization.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-secondary px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2.5 shadow-sm">
              <FileDown className="w-4 h-4" /> Export Data
            </button>
            <button className="btn-primary px-6 py-2.5 text-white rounded-xl text-sm font-bold flex items-center gap-2.5">
              <UserPlus className="w-4 h-4" /> New Admission
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative group max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-[#1E6BA8]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Search by name, exact ABHA (XX-XXXX-XXXX-XXXX), or clinical ID..." 
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1E6BA8] shadow-sm transition-all placeholder:text-slate-400 text-slate-900"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-24">
            <div className="premium-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#1E6BA8]" />
                  <h3 className="font-bold text-slate-900 uppercase text-[11px] tracking-widest">Filters</h3>
                </div>
                <button 
                  onClick={() => setRiskFilters({ High: false, Medium: false, Low: false })}
                  className="text-[11px] text-[#1E6BA8] font-bold hover:underline transition-colors px-2 py-1"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-6">
                {/* Risk */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Assessment</label>
                  </div>
                  <div className="space-y-3 px-1">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Critical Priority</span>
                      <IosToggle defaultChecked={riskFilters.High} onChange={(v) => setRiskFilters(prev => ({...prev, High: v}))} />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Elevated Risk</span>
                      <IosToggle defaultChecked={riskFilters.Medium} onChange={(v) => setRiskFilters(prev => ({...prev, Medium: v}))} />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Low Risk</span>
                      <IosToggle defaultChecked={riskFilters.Low} onChange={(v) => setRiskFilters(prev => ({...prev, Low: v}))} />
                    </label>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl">
                    <Users2 className="w-4 h-4 text-slate-400" />
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registry Status</label>
                  </div>
                  <div className="relative">
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1E6BA8] appearance-none transition-all text-slate-700 cursor-pointer shadow-sm"
                    >
                      <option>All Statuses</option>
                      <option>Active Inpatient</option>
                      <option>Outpatient Follow-up</option>
                      <option>Emergency Hold</option>
                      <option>Discharged</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Table Area */}
          <div className="flex-1 w-full space-y-6 min-w-0">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}
            
            <div className="premium-card rounded-3xl overflow-hidden">
              {/* Table Toolbar */}
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em]">
                    Registry Ledger ({loading ? '...' : totalCount} Total Results)
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-[#1E6BA8] animate-spin" />
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-white border-b border-slate-100">
                      <tr className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.12em]">
                        <th className="px-6 py-5 text-left font-bold">Patient Profile</th>
                        <th className="px-6 py-5 text-left font-bold">Registry Identity</th>
                        <th className="px-6 py-5 text-left font-bold min-w-[200px]">Risk Stratification</th>
                        <th className="px-6 py-5 text-left font-bold">Conditions</th>
                        <th className="px-6 py-5 text-left font-bold">Last Activity</th>
                        <th className="px-6 py-5 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {paginatedPatients.length > 0 ? (
                        paginatedPatients.map(patient => (
                          <PatientRow key={patient.id} patient={patient} />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            No patients found matching the criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {!loading && filteredPatients.length > 0 && (
                <div className="p-6 md:p-8 bg-slate-50/20 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-[#1E6BA8] hover:border-[#1E6BA8] hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-1.5 px-2">
                      <button className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-[#1E6BA8] bg-[#1E6BA8] flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-500/20">
                        {page}
                      </button>
                      {page < totalPages && (
                        <button 
                          onClick={() => setPage(page + 1)}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-transparent bg-transparent flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200/50 transition-all"
                        >
                          {page + 1}
                        </button>
                      )}
                      {page < totalPages - 1 && (
                        <>
                          <span className="px-2 text-slate-300 font-bold tracking-widest">...</span>
                          <button 
                            onClick={() => setPage(totalPages)}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-transparent bg-transparent flex items-center justify-center text-slate-500 font-bold hover:bg-slate-200/50 transition-all"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-[#1E6BA8] hover:border-[#1E6BA8] hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex flex-col items-center sm:items-end gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em]">
                    <span className="text-slate-400">
                      Registry Position: {((page - 1) * limit) + 1}-{Math.min(page * limit, totalCount)} of {totalCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
