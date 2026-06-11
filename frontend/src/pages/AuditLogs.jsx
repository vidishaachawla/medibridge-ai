/**
 * pages/AuditLogs.jsx
 * ───────────────────
 * Security Audit Ledger with timeline view, filters, and event badges.
 * Converted from MediBridge AI Superdesign prototype.
 *
 * AppLayout already supplies Sidebar + TopBar; this renders page body only.
 */
import { useState, useEffect } from 'react'
import { AuditService } from '../api/services'
import {
  ShieldCheck,
  FileText,
  ExternalLink,
  Database,
  TrendingUp,
  ShieldAlert,
  Share2,
  Lock,
  RotateCcw,
  Clock4,
  Calendar,
  AlertCircle,
  Layers,
  ChevronDown,
  User,
  Search,
  Activity,
  CheckCircle,
  ScanEye,
  DownloadCloud,
  AlertTriangle,
  Edit3,
  Clock,
  Bot,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

/* ─── Shared Components ───────────────────────────────────── */

function IosToggle({ defaultChecked = false }) {
  const [on, setOn] = useState(defaultChecked)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-[18px] w-[36px] shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        on ? 'bg-[#1E6BA8]' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] mt-[2px] ${
          on ? 'translate-x-[18px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  )
}

function KpiCard({
  borderColor,
  iconBg,
  iconColor,
  iconHover,
  icon: Icon,
  badgeBg,
  badgeColor,
  badgeText,
  badgeIcon: BadgeIcon,
  badgePulse = false,
  label,
  value,
}) {
  return (
    <div className={`premium-card p-6 group ${borderColor}`}>
      <div className="flex justify-between items-start mb-5">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg} ${iconColor} transition-transform ${iconHover}`}>
          <Icon className="w-7 h-7" />
        </div>
        {badgeText && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-tighter ${badgeBg} ${badgeColor} ${badgePulse ? 'animate-pulse' : ''}`}>
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
            {badgeText}
          </div>
        )}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className={`text-4xl font-extrabold tracking-tighter ${badgeColor.replace('text-', 'text-').replace('700', '600').replace('500', '600')}`.replace('bg-', '')}>
        {value}
      </h3>
    </div>
  )
}

function AuditRow({
  time,
  timeMeta,
  initials,
  avatarBg,
  avatarTextColor,
  actorName,
  actorRole,
  actorRoleBg,
  actorRoleColor,
  actionIcon: ActionIcon,
  actionIconBg,
  actionIconColor,
  actionBorder,
  actionShadow,
  actionTitle,
  actionDescPrefix,
  actionDescMain,
  actionDescSuffix,
  riskLabel,
  riskIcon: RiskIcon,
  badgeClass,
  borderClass,
  rowBgClass = '',
  buttonClass,
  buttonText,
}) {
  return (
    <tr className={`table-row-premium ${borderClass} ${rowBgClass}`}>
      <td className="px-8 py-6 whitespace-nowrap">
        <div className={`font-extrabold text-sm ${borderClass.includes('critical') ? 'text-red-600' : 'text-slate-900'}`}>{time}</div>
        <div className={`text-[10px] font-bold mt-1.5 uppercase ${borderClass.includes('critical') ? 'text-red-400' : 'text-slate-400'}`}>{timeMeta}</div>
      </td>
      <td className="px-6 py-6">
        <div className="flex items-center gap-4">
          {initials === 'Bot' ? (
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-xs shadow-md border-2 border-white ${avatarBg} ${avatarTextColor}`}>
              <Bot className="w-5 h-5" />
            </div>
          ) : (
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-xs shadow-md border-2 border-white ${avatarBg} ${avatarTextColor}`}>
              {initials}
            </div>
          )}
          <div>
            <div className="font-bold text-slate-900 text-sm">{actorName}</div>
            <div className="mt-1">
              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${actorRoleBg} ${actorRoleColor}`}>
                {actorRole}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${actionIconBg} ${actionIconColor} ${actionBorder} ${actionShadow || ''}`}>
            <ActionIcon className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-800 text-xs tracking-tight">{actionTitle}</span>
        </div>
        <div className="text-[11px] text-slate-500 font-medium pl-11">
          {actionDescPrefix}{' '}
          <span className="text-slate-900 font-bold">{actionDescMain}</span>{' '}
          {actionDescSuffix && <span className="text-slate-400 font-normal">{actionDescSuffix}</span>}
        </div>
      </td>
      <td className="px-6 py-6">
        <span className={`badge-premium ${badgeClass}`}>
          <RiskIcon className="mr-2 w-3.5 h-3.5" />
          {riskLabel}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        {buttonText ? (
          <button className={buttonClass}>{buttonText}</button>
        ) : (
          <button className="p-3 text-slate-400 hover:text-[#1E6BA8] hover:bg-blue-50 rounded-2xl transition-all btn-press">
            <ScanEye className="w-5 h-5" />
          </button>
        )}
      </td>
    </tr>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    AuditService.getAuditLogs({ skip: (page - 1) * 10, limit: 10 }).then(data => {
      setLogs(data)
      setLoading(false)
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })
  }, [page])

  return (
    <>
      <style>{`
        .premium-card {
          background: linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%);
          border: 1px solid rgba(30,107,168,0.08);
          box-shadow: 0 4px 12px -2px rgba(15,23,42,0.08);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          border-radius: 1rem;
        }
        .premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -4px rgba(15,23,42,0.12);
        }
        .border-accent-blue { border-top: 4px solid #1E6BA8; }
        .border-accent-red { border-top: 4px solid #DC2626; }
        .border-accent-amber { border-top: 4px solid #D97706; }
        .border-accent-emerald { border-top: 4px solid #10B981; }
        
        .badge-premium {
          display: inline-flex;
          align-items: center;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border: 2px solid transparent;
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
        }
        .badge-critical { color: #FFFFFF; background: #7F1D1D; border-color: #991B1B; }
        .badge-high { color: #EF4444; background: #FEE2E2; border-color: #FCA5A5; }
        .badge-medium { color: #D97706; background: #FEF3C7; border-color: #FCD34D; }
        .badge-low { color: #10B981; background: #ECFDF5; border-color: #6EE7B7; }
        
        .risk-border-critical { border-left: 4px solid #DC2626; }
        .risk-border-high { border-left: 4px solid #EA580C; }
        .risk-border-medium { border-left: 4px solid #1E40AF; }
        .risk-border-low { border-left: 4px solid #059669; }
        
        .table-row-premium { transition: all 0.2s cubic-bezier(0.4,0,0.2,1); }
        .table-row-premium:hover { background-color: rgba(241,245,249,0.5); }
        
        .btn-press:active { transform: scale(0.96); }
      `}</style>

      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight lg:text-4xl">Security Audit Ledger</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold uppercase tracking-widest border border-emerald-100 shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                HIPAA Compliant
              </div>
            </div>
            <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed">
              Secure forensic timeline tracking clinical data access, regulatory compliance events, and administrative security protocols.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button className="px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2.5 shadow-sm btn-press">
              <FileText className="w-5 h-5 text-blue-600" /> Compliance Report
            </button>
            <button className="px-6 py-3 bg-[#1E6BA8] text-white rounded-xl text-sm font-bold hover:bg-[#165a8e] shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2.5 btn-press">
              <ExternalLink className="w-5 h-5" /> Export Ledger
            </button>
          </div>
        </div>

        {/* ── KPI Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KpiCard
            borderColor="border-accent-blue"
            icon={Database} iconBg="bg-blue-50" iconColor="text-[#1E6BA8]" iconHover="group-hover:rotate-6"
            badgeBg="bg-emerald-50" badgeColor="text-emerald-600" badgeText="LIVE" badgeIcon={TrendingUp}
            label="Audit Events (Fetched)" value={logs.length}
          />
          <KpiCard
            borderColor="border-accent-red"
            icon={ShieldAlert} iconBg="bg-red-50" iconColor="text-red-600" iconHover="group-hover:scale-110"
            badgeBg="bg-red-50" badgeColor="text-red-600" badgeText="Priority Review" badgePulse={true}
            label="Critical Alerts" value="02"
          />
          <KpiCard
            borderColor="border-accent-amber"
            icon={Share2} iconBg="bg-amber-50" iconColor="text-amber-600" iconHover="group-hover:-translate-y-1"
            badgeBg="bg-slate-50" badgeColor="text-slate-500" badgeText="External Flow"
            label="Data Exports" value="14"
          />
          <KpiCard
            borderColor="border-accent-emerald"
            icon={Lock} iconBg="bg-emerald-50" iconColor="text-emerald-600" iconHover="group-hover:rotate-12"
            badgeBg="bg-emerald-50" badgeColor="text-emerald-600" badgeText="Integrity Clear"
            label="Breach Attempts" value="00"
          />
        </div>

        {/* ── Main Layout (Sidebar + Content) ──────────────────── */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:col-span-3 space-y-6">
            <div className="premium-card p-6 sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Refine Ledger</h3>
                <button className="text-xs text-[#1E6BA8] font-bold hover:text-blue-800 transition-colors flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              <div className="space-y-8">
                {/* Period */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock4 className="w-4 h-4 text-slate-400" />
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Analysis Period</label>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input type="text" defaultValue="Oct 24 - Oct 27, 2023" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E6BA8]/20 transition-all" />
                  </div>
                </div>

                {/* Toggles */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-slate-400" />
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Severity Toggles</label>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between group cursor-pointer">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Critical Severity</span>
                      <IosToggle defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">High Severity</span>
                      <IosToggle defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Medium Severity</span>
                      <IosToggle />
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Low Severity</span>
                      <IosToggle />
                    </div>
                  </div>
                </div>

                {/* Action Group */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-4 h-4 text-slate-400" />
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Action Group</label>
                  </div>
                  <div className="relative">
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E6BA8]/20 transition-all appearance-none cursor-pointer">
                      <option>All Event Types</option>
                      <option>Data Access (READ)</option>
                      <option>Modification (UPDATE)</option>
                      <option>Bulk Export (EXPORT)</option>
                      <option>Auth Events (AUTH)</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Actor */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-slate-400" />
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">Entity / Actor</label>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search name or ID..." className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E6BA8]/20 transition-all" />
                  </div>
                </div>

                <button className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-slate-900/10 btn-press">
                  Apply Parameters
                </button>
              </div>
            </div>
          </aside>

          {/* Table Container */}
          <div className="w-full lg:col-span-9 space-y-6">
            <div className="premium-card overflow-hidden flex flex-col border-none bg-white">
              
              {/* Toolbar */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-[#1E6BA8]" />
                  <span className="text-[12px] font-extrabold text-slate-500 uppercase tracking-[0.1em]">Clinical Intelligence Feed</span>
                </div>
                <div className="flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider">Live Monitoring</span>
                  </div>
                  <div className="h-4 w-[1.5px] bg-slate-200 hidden md:block" />
                  <select className="bg-transparent border-none text-[11px] font-extrabold text-[#1E6BA8] focus:outline-none cursor-pointer uppercase tracking-wider">
                    <option>Newest Entries First</option>
                    <option>Severity Ranking</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50/80 border-b border-slate-100 font-extrabold text-slate-400 uppercase tracking-[0.08em] text-[10px]">
                    <tr>
                      <th className="px-8 py-5 text-left">Timeline & Origin</th>
                      <th className="px-6 py-5 text-left">Identity</th>
                      <th className="px-6 py-5 text-left">Operational Parameters</th>
                      <th className="px-6 py-5 text-left">Risk Index</th>
                      <th className="px-8 py-5 text-right">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr><td colSpan="5" className="text-center py-8 text-slate-500 font-bold">Loading audit logs...</td></tr>
                    ) : logs.map(log => (
                      <AuditRow
                        key={log.id}
                        time={new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                        timeMeta={new Date(log.timestamp).toLocaleDateString()}
                        initials={log.performed_by.substring(0, 2).toUpperCase()}
                        avatarBg="bg-gradient-to-br from-blue-500 to-indigo-600"
                        avatarTextColor="text-white"
                        actorName={log.performed_by}
                        actorRole="System User"
                        actorRoleBg="bg-slate-100"
                        actorRoleColor="text-slate-400"
                        actionIcon={FileText}
                        actionIconBg="bg-blue-50"
                        actionIconColor="text-blue-600"
                        actionBorder="border-blue-100"
                        actionTitle={log.action}
                        actionDescPrefix="Target:"
                        actionDescMain={log.patient_id ? `Patient ID: ${log.patient_id}` : 'System'}
                        actionDescSuffix={log.details ? JSON.stringify(log.details) : ''}
                        riskLabel="Low Risk"
                        riskIcon={CheckCircle}
                        badgeClass="badge-low"
                        borderClass="risk-border-low"
                      />
                    ))}
                    {logs.length === 0 && !loading && (
                      <tr><td colSpan="5" className="text-center py-8 text-slate-500 font-bold">No audit logs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-8 border-t border-slate-100 bg-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-3.5">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-11 h-11 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-[#1E6BA8] hover:border-[#1E6BA8] transition-all shadow-sm btn-press disabled:opacity-50">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    <button className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm shadow-xl shadow-slate-900/20">{page}</button>
                  </div>
                  <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 10} className="w-11 h-11 rounded-xl border-2 border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-[#1E6BA8] hover:border-[#1E6BA8] transition-all shadow-sm btn-press disabled:opacity-50">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2.5 text-[12px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">
                  Displaying forensic records <span className="text-slate-900">{(page - 1) * 10 + 1} — {(page - 1) * 10 + logs.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
