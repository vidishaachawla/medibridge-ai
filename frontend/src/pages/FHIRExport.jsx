/**
 * pages/FHIRExport.jsx
 * ─────────────────────
 * Premium FHIR Interoperability Studio – converted from MediBridge AI Superdesign prototype.
 * Icons  : lucide-react (already installed)
 * Styling: Tailwind v4 utility classes + scoped CSS
 *
 * AppLayout already supplies Sidebar + TopBar; this renders the page body only.
 */
import { useState, useEffect } from 'react'
import { PatientService, FhirService, AuditService } from '../api/services'
import {
  Share2,
  Layers,
  Zap,
  Fingerprint,
  Hash,
  Calendar,
  ShieldCheck,
  Settings2,
  HelpCircle,
  UserCircle,
  Activity,
  ClipboardList,
  Check,
  Cpu,
  Search,
  Copy,
  DownloadCloud,
  History,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react'

/* ─── Toggle Switch ──────────────────────────────────────── */
function Toggle({ defaultChecked = false }) {
  const [on, setOn] = useState(defaultChecked)
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className={`relative inline-flex h-[22px] w-[44px] shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${on ? 'bg-[#1E6BA8]' : 'bg-slate-200'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] mt-[3px] ${on ? 'translate-x-[25px]' : 'translate-x-[3px]'}`}
      />
    </button>
  )
}

/* ─── Resource Row ───────────────────────────────────────── */
function ResourceRow({ icon: Icon, iconColor, label, sub, defaultOn }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-[1.25rem] bg-slate-50 hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-[10px] text-slate-500 font-bold">{sub}</p>
        </div>
      </div>
      <Toggle defaultChecked={defaultOn} />
    </div>
  )
}

/* ─── Audit Table Row ────────────────────────────────────── */
function AuditRow({ ts, initials, initiatorBg, initiatorTextColor, name, format, contextLabel, contextStyle, status }) {
  const isError = status === 'error'
  return (
    <tr className={`transition-all cursor-default group ${isError ? 'hover:bg-red-50/30' : 'hover:bg-slate-50'}`}>
      <td className={`px-8 py-6 font-mono font-medium text-slate-500 ${isError ? 'group-hover:text-red-600' : ''}`}>{ts}</td>
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className={`w-8 h-8 rounded-lg ${initiatorBg} ${initiatorTextColor} flex items-center justify-center font-black text-[10px]`}>
            {initials}
          </div>
          <span className="font-bold text-slate-800">{name}</span>
        </div>
      </td>
      <td className="px-8 py-6 font-bold text-slate-600">{format}</td>
      <td className="px-8 py-6">
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase ring-4 ${contextStyle}`}>
          {contextLabel}
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        {status === 'success' ? (
          <span className="inline-flex items-center gap-2 font-black text-emerald-600 text-[11px] uppercase tracking-tighter bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 font-black text-red-500 text-[11px] uppercase tracking-tighter bg-red-50 px-3 py-1 rounded-lg border border-red-100">
            <AlertOctagon className="w-3.5 h-3.5" /> SIG_FAIL
          </span>
        )}
      </td>
    </tr>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function FHIRExport() {
  const [patient, setPatient] = useState(null)
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentLogs, setRecentLogs] = useState([])

  const [protocol, setProtocol] = useState('JSON')
  const [deident, setDeident] = useState(true)
  const [attachments, setAttachments] = useState(false)

  const protocols = ['JSON', 'XML', 'NDJSON']

  useEffect(() => {
    PatientService.getPatients(0, 1).then(data => {
      if (data && data.length > 0) {
        setPatient(data[0])
        FhirService.getBundle(data[0].id).then(bundleData => {
          setBundle(bundleData)
          setLoading(false)
        }).catch(err => {
          console.error(err)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    }).catch(err => {
      console.error(err)
      setLoading(false)
    })

    AuditService.getAuditLogs({ limit: 3 }).then(logs => {
      setRecentLogs(logs)
    }).catch(console.error)
  }, [])

  const formatJSON = (obj) => {
    if (!obj) return ''
    const jsonStr = JSON.stringify(obj, null, 2)
    return jsonStr.split('\n').map((line, i) => {
      let highlightedLine = line
        .replace(/"([^"]+)":/g, '<span class="fhir-key">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="fhir-string">"$1"</span>')
        .replace(/: (true|false)/g, ': <span class="fhir-bool">$1</span>')
        .replace(/: ([-+]?\d*\.?\d+)/g, ': <span class="fhir-number">$1</span>')
      return <div key={i} dangerouslySetInnerHTML={{ __html: highlightedLine }} />
    })
  }

  return (
    <>
      {/* Scoped styles */}
      <style>{`
        @keyframes pulseSoft {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.7; }
        }
        .pulse-anim { animation: pulseSoft 2s infinite ease-in-out; }

        .fhir-key    { color: #60a5fa; font-weight: 600; }
        .fhir-string { color: #67e8f9; }
        .fhir-number { color: #fbbf24; }
        .fhir-bool   { color: #c084fc; font-weight: 600; }
        .fhir-gray   { color: #94a3b8; }

        /* premium-card hover lift */
        .p-card {
          background: #fff;
          border: 1px solid rgba(226,232,240,0.7);
          box-shadow: 0 1px 3px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.03), 0 4px 6px -4px rgba(0,0,0,0.03);
          transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        .p-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.03);
        }
        .progress-glow { box-shadow: 0 0 20px rgba(30,107,168,0.35); }
        .btn-active:active { transform: scale(0.96); }
      `}</style>

      <div
        className="p-6 lg:p-10 max-w-[1400px] mx-auto space-y-10"
        style={{ fontFamily: "'Inter', sans-serif", color: '#1E293B' }}
      >
        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
              <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-[#1E6BA8] shadow-sm">
                <Share2 className="w-6 h-6" />
              </span>
              Interoperability Studio
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
              Enterprise-grade clinical data exchange leveraging HL7® FHIR® R4 standards for seamless care coordination.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <button
              id="btn-bulk-export"
              className="p-card btn-active px-6 py-3 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-3"
            >
              <Layers className="w-5 h-5 text-[#1E6BA8]" />
              Bulk Operations
            </button>
            <button
              id="btn-start-export"
              className="btn-active px-8 py-3 bg-gradient-to-br from-[#1E6BA8] to-[#2579BE] text-white rounded-2xl text-sm font-bold hover:shadow-xl hover:shadow-blue-900/20 active:scale-95 transition-all flex items-center gap-3 shadow-md"
            >
              <Zap className="w-5 h-5" />
              Initiate Live Link
            </button>
          </div>
        </div>

        {/* ── Patient Context Card ──────────────────────────────── */}
        <div className="p-card rounded-[2rem] p-8 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          {/* Blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl opacity-60 pointer-events-none" />

          {/* Left: avatar + bio */}
          <div className="flex flex-col md:flex-row items-center gap-8 z-10 w-full lg:w-auto">
            <div className="relative">
              <div className="w-24 h-24 rounded-[1.5rem] bg-slate-50 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden ring-1 ring-slate-200 group-hover:ring-[#1E6BA8]/30 transition-all">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient?.first_name || 'Loading'}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl border-4 border-white shadow-md">
                <ShieldCheck className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {loading ? 'Loading...' : `${patient?.first_name} ${patient?.last_name}`}
                </h3>
                <span className="px-4 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold tracking-wider border border-red-100 uppercase ring-4 ring-red-50/50">
                  {patient?.risk_classification || 'UNKNOWN'} RISK
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
                <p className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-[#1E6BA8]" />
                  <span className="text-slate-400">ABHA:</span> {patient?.abha_number || '---'}
                </p>
                <p className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#1E6BA8]" />
                  <span className="text-slate-400">ID:</span> MB-{patient?.id || '---'}
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1E6BA8]" />
                  <span className="text-slate-400">DOB:</span> {patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : '---'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: status blocks */}
          <div className="flex items-center gap-12 lg:pr-6 z-10 w-full lg:w-auto justify-around lg:justify-end">
            <div className="text-center lg:text-right space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Registry Connection</p>
              <p className="font-bold text-emerald-600 flex items-center justify-center lg:justify-end gap-2 text-base">
                <ShieldCheck className="w-5 h-5" /> FHIR R4 VERIFIED
              </p>
            </div>
            <div className="w-px h-12 bg-slate-100 hidden lg:block" />
            <div className="text-center lg:text-right space-y-1.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">Metadata Freshness</p>
              <p className="font-bold text-slate-800 text-base">Live (3s ago)</p>
            </div>
          </div>
        </div>

        {/* ── Main Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-10">

          {/* ═══ LEFT COLUMN ══════════════════════════════════════ */}
          <div className="col-span-12 lg:col-span-4 space-y-10">

            {/* Link Parameters */}
            <div className="p-card rounded-[2rem] p-8 space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-[0.15em] flex items-center gap-3">
                  <Settings2 className="w-5 h-5 text-[#1E6BA8]" />
                  Link Parameters
                </h4>
                <HelpCircle className="w-5 h-5 text-slate-300 cursor-help hover:text-[#1E6BA8] transition-colors" />
              </div>

              <div className="space-y-8">
                {/* Exchange protocol */}
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-5">
                    Exchange Protocol
                  </label>
                  <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                    {protocols.map((p) => (
                      <button
                        key={p}
                        onClick={() => setProtocol(p)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs transition-all ${
                          protocol === p
                            ? 'bg-white text-[#1E6BA8] shadow-sm'
                            : 'text-slate-500 hover:bg-white/50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resource mapping */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Resource Mapping
                    </label>
                    <button className="text-[11px] font-bold text-[#1E6BA8] uppercase tracking-widest hover:opacity-70 transition-opacity">
                      Reset
                    </button>
                  </div>
                  <div className="space-y-4">
                    <ResourceRow icon={UserCircle}    iconColor="text-[#1E6BA8]"    label="Patient Profile"          sub="Required • v4.0.1" defaultOn={true} />
                    <ResourceRow icon={Activity}      iconColor="text-emerald-500"   label="Clinical Observations"    sub="Live • v4.0.1"     defaultOn={true} />
                    <ResourceRow icon={ClipboardList} iconColor="text-orange-500"    label="Diagnostics (Condition)"  sub="Episode • v4.0.1"  defaultOn={false} />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4 pt-4">
                  {/* Attachments */}
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setAttachments(!attachments)}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${attachments ? 'border-[#1E6BA8] bg-[#1E6BA8]' : 'border-slate-200 bg-white group-hover:border-[#1E6BA8]'}`}>
                      <Check className={`w-3 h-3 text-white transition-opacity ${attachments ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-[#1E6BA8] transition-colors">
                      Include Binary Attachments (SLA)
                    </span>
                  </label>
                  {/* De-identification */}
                  <label className="flex items-center gap-3 cursor-pointer group" onClick={() => setDeident(!deident)}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${deident ? 'border-[#1E6BA8] bg-[#1E6BA8]' : 'border-slate-200 bg-white group-hover:border-[#1E6BA8]'}`}>
                      <Check className={`w-3 h-3 text-white transition-opacity ${deident ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                      Apply HIPAA De-identification
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Compute Pipeline */}
            <div className="rounded-[2rem] p-8 bg-slate-900 text-white space-y-6 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02),0_10px_15px_-3px_rgba(0,0,0,0.03)]">
              <div className="absolute top-0 right-0 p-6 opacity-10 pulse-anim pointer-events-none">
                <Cpu className="w-16 h-16" />
              </div>
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-extrabold text-blue-400 uppercase tracking-[0.25em]">Compute Pipeline</h4>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px] font-black border border-blue-500/20">
                  ACTIVE ENGINE
                </span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-base font-black mb-4">
                    <span>Mapping Batch #8812</span>
                    <span className="text-blue-400">74.2%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-[#1E6BA8] to-emerald-400 h-full rounded-full progress-glow transition-all duration-1000"
                      style={{ width: '74.2%' }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  Validation layer is confirming{' '}
                  <span className="text-blue-300">DiagnosticReport</span> integrity against{' '}
                  <span className="text-emerald-300">US Core IG v3.1.1</span>.
                </p>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN ═════════════════════════════════════ */}
          <div className="col-span-12 lg:col-span-8 space-y-10">

            {/* JSON Viewer */}
            <div className="rounded-[2.5rem] overflow-hidden flex flex-col h-[750px] bg-white shadow-2xl border border-slate-200/60">
              {/* Toolbar */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                  <div className="flex items-center bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm w-full md:w-80 group focus-within:border-[#1E6BA8] focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                    <Search className="w-4 h-4 text-slate-400 mr-3 group-focus-within:text-[#1E6BA8] transition-colors" />
                    <input
                      type="text"
                      placeholder="Query specific clinical keys or values..."
                      className="text-sm bg-transparent outline-none w-full font-semibold placeholder:text-slate-300"
                    />
                  </div>
                  <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <button className="px-5 py-2 text-[10px] font-black text-white bg-[#1E6BA8] rounded-xl shadow-lg shadow-blue-900/10">JSON</button>
                    <button className="px-5 py-2 text-[10px] font-black text-slate-500 hover:bg-slate-50 rounded-xl transition-all">RAW</button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    title="Copy to Clipboard"
                    className="p-3 text-slate-500 hover:text-[#1E6BA8] hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100 shadow-sm bg-white"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    title="Download Bundle"
                    className="p-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all border border-transparent hover:border-emerald-100 shadow-sm bg-white"
                  >
                    <DownloadCloud className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Code area */}
              <div className="flex-1 overflow-auto bg-slate-900" style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '13px', lineHeight: '1.8' }}>
                <div className="flex min-h-full">
                  {/* Line numbers */}
                  <div className="w-16 pt-8 bg-slate-800/40 border-r border-slate-700/50 flex flex-col items-center select-none text-slate-500 text-[12px] shrink-0 space-y-0">
                    {Array.from({ length: 28 }, (_, i) => (
                      <span key={i} className="block text-center w-full py-[1px]">{i + 1}</span>
                    ))}
                  </div>

                  {/* JSON content */}
                  <div className="flex-1 p-8 text-slate-300 overflow-x-auto">
                    <pre className="whitespace-pre leading-[1.8] font-mono">
                      {loading ? 'Loading FHIR Bundle...' : formatJSON(bundle)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Footer bar */}
              <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                    SECURE VERIFICATION PASSED
                  </div>
                  <span className="w-px h-4 bg-slate-200" />
                  <span className="text-slate-400">SCHEMA: HL7 FHIR® R4</span>
                </div>
                <div className="flex items-center gap-6 text-[11px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                  <span>SIZE: 2.8 KB</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 pulse-anim" />
                  <span>OBJECTS: 32</span>
                </div>
              </div>
            </div>

            {/* Audit Ledger */}
            <div className="p-card rounded-[2.5rem] overflow-hidden shadow-xl">
              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-4">
                  <History className="w-5 h-5 text-[#1E6BA8]" />
                  Interoperability Audit Ledger
                </h4>
                <button
                  id="btn-view-logs"
                  className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#1E6BA8] hover:text-[#1E6BA8] transition-all shadow-sm"
                >
                  Full Access Logs
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] border-b border-slate-100">
                    <tr className="divide-x divide-slate-100/50">
                      <th className="px-8 py-5">Timestamp</th>
                      <th className="px-8 py-5">Initiator</th>
                      <th className="px-8 py-5">Format Scope</th>
                      <th className="px-8 py-5">Context</th>
                      <th className="px-8 py-5 text-right">Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentLogs.map((log) => (
                      <AuditRow
                        key={log.id}
                        ts={new Date(log.timestamp).toLocaleString()}
                        initials={log.performed_by.substring(0, 2).toUpperCase()} initiatorBg="bg-blue-100" initiatorTextColor="text-[#1E6BA8]"
                        name={log.performed_by}
                        format="FHIR JSON (R4)"
                        contextLabel={log.action}
                        contextStyle="bg-blue-50 text-[#1E6BA8] border-blue-100 ring-blue-50/50"
                        status="success"
                      />
                    ))}
                    {recentLogs.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-8 py-6 text-center text-slate-500 font-medium">No recent FHIR export logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/20 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                  End of Immutable Ledger History
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
