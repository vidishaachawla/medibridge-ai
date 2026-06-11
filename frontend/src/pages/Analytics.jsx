/**
 * pages/Analytics.jsx
 * ────────────────────
 * Premium Clinical Analytics dashboard – converted from MediBridge AI Superdesign prototype.
 * Icons  : lucide-react (already installed)
 * Styling: Tailwind v4 utility classes + scoped keyframe animations
 *
 * AppLayout already supplies Sidebar + TopBar; this renders page body only.
 */
import { useState, useEffect } from 'react'
import { AnalyticsService } from '../api/services'
import {
  Share2,
  Download,
  Calendar,
  Hospital,
  RefreshCw,
  Timer,
  HeartHandshake,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  UserPlus,
  User,
  UserCheck,
  Heart,
  Brain,
  Building2,
} from 'lucide-react'

/* ─── shared primitives ──────────────────────────────────── */

/** Premium card with hover lift */
function PremiumCard({ children, className = '' }) {
  return (
    <div
      className={`
        bg-white border border-slate-200/70 rounded-[24px]
        shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_10px_20px_-5px_rgba(0,0,0,0.03)]
        transition-all duration-400 ease-out
        hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.04)]
        hover:border-[#1E6BA8]/20
        ${className}
      `}
    >
      {children}
    </div>
  )
}

/** A single KPI card */
function KpiCard({ icon: Icon, iconBg, iconColor, borderColor, bgGradient, label, value, unit, badge, badgeStyle }) {
  return (
    <div
      className={`
        rounded-[24px] p-7 border-t-4 ${borderColor} ${bgGradient}
        bg-white border border-slate-200/70
        shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_10px_20px_-5px_rgba(0,0,0,0.03)]
        transition-all duration-400 ease-out
        hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.04)]
        hover:border-[#1E6BA8]/20 animate-entrance
      `}
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center ${iconColor} border border-current/10`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex flex-col items-end">
          <div className={`flex items-center gap-1 font-bold text-sm px-2 py-0.5 rounded-lg ${badgeStyle}`}>
            {badge}
          </div>
          <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{label.sub}</span>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label.main}</p>
      <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
        {value}<span className="text-2xl font-bold text-slate-300 ml-1">{unit}</span>
      </h3>
    </div>
  )
}

/** Single age-group stacked bar row */
function AgeBar({ icon: Icon, iconBg, iconColor, label, sublabel, highPct, highColor, barLow, barMid, barHigh }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-slate-700">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{sublabel}</span>
          <span className={`text-lg font-black ${highColor} tracking-tighter`}>
            {highPct}% <span className="text-xs text-slate-400">HIGH</span>
          </span>
        </div>
      </div>
      <div className="w-full h-4 bg-slate-100 rounded-full flex overflow-hidden border border-slate-50 shadow-inner group">
        <div className="bg-[#1E6BA8] bar-grow transition-all group-hover:brightness-110" style={{ width: `${barLow}%` }} />
        <div className="bg-slate-400 bar-grow transition-all group-hover:brightness-110" style={{ width: `${barMid}%`, animationDelay: '0.1s' }} />
        <div className="bg-red-500 bar-grow transition-all group-hover:brightness-110" style={{ width: `${barHigh}%`, animationDelay: '0.2s' }} />
      </div>
    </div>
  )
}

/** Departmental table row */
function DeptRow({ icon: Icon, iconBg, iconColor, name, sub, caseLoad, riskValue, riskStyle, utilPct, utilBar }) {
  return (
    <tr className="hover:bg-blue-50/30 transition-all group border-l-4 border-transparent hover:border-l-[#1E6BA8]">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 ${iconBg} ${iconColor} rounded-2xl flex items-center justify-center border border-current/10 group-hover:scale-110 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">{name}</p>
            <p className="text-[10px] font-bold text-slate-400">{sub}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-6 font-black text-slate-900">{caseLoad}</td>
      <td className="px-8 py-6">
        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-tighter border ${riskStyle}`}>
          {riskValue} COMPOSITE
        </span>
      </td>
      <td className="px-8 py-6 text-right">
        <div className="flex items-center justify-end gap-3">
          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${utilBar} rounded-full`} style={{ width: `${utilPct}%` }} />
          </div>
          <span className="text-xs font-black text-slate-700">{utilPct}%</span>
        </div>
      </td>
    </tr>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function Analytics() {
  const [data, setData] = useState({
    summary: null,
    risk: null,
    age: null,
    loading: true
  })

  useEffect(() => {
    Promise.all([
      AnalyticsService.getSummary(),
      AnalyticsService.getRiskDistribution(),
      AnalyticsService.getAgeRiskBuckets()
    ]).then(([summary, risk, age]) => {
      setData({ summary, risk, age, loading: false })
    }).catch(console.error)
  }, [])

  // Calculate donut offsets
  const total = data.risk?.total || 1
  const lowPct = (data.risk?.low || 0) / total
  const medPct = (data.risk?.medium || 0) / total
  const highPct = (data.risk?.high || 0) / total

  const lowCirc = lowPct * 264
  const medCirc = medPct * 264
  const highCirc = highPct * 264

  // Helper for age buckets
  const getAgeBucket = (group) => {
    if (!data.age) return { count: 0, avg_risk_score: 0 }
    return data.age.find(a => a.age_group === group) || { count: 0, avg_risk_score: 0 }
  }

  return (
    <>
      {/* Scoped keyframes */}
      <style>{`
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        .chart-curve {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2s ease-out forwards;
        }
        @keyframes fadeInSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-entrance {
          animation: fadeInSlideUp 0.6s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        @keyframes scaleXGrow {
          to { transform: scaleX(1); }
        }
        .bar-grow {
          transform-origin: left;
          transform: scaleX(0);
          animation: scaleXGrow 1s cubic-bezier(0.4,0,0.2,1) forwards;
        }
      `}</style>

      <div className="p-8 max-w-[1600px] mx-auto" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.015em' }}>

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 animate-entrance">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-blue-50 text-[#1E6BA8] text-[10px] font-bold rounded uppercase tracking-wider border border-blue-100">
                Real-time Intelligence
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Population Health Analytics</h2>
            <p className="text-slate-500 mt-1 max-w-2xl">
              Aggregated clinical performance data across {data.loading ? '...' : data.summary?.total_patients} patients with AI-driven risk distribution and operational unit metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="btn-share"
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              id="btn-export"
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button
              id="btn-date"
              className="px-6 py-2.5 bg-[#1E6BA8] text-white rounded-xl text-sm font-bold hover:bg-[#165a8e] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Last 30 Days
            </button>
          </div>
        </div>

        {/* ── KPI Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            icon={UserCheck}
            iconBg="bg-blue-50"
            iconColor="text-[#1E6BA8]"
            borderColor="border-t-[#1E6BA8]"
            bgGradient="bg-gradient-to-br from-white to-blue-50/30"
            label={{ main: 'Total Patients', sub: 'Registry Size' }}
            value={data.summary?.total_patients || 0}
            unit=""
            badge="LIVE"
            badgeStyle="text-emerald-600 bg-emerald-50"
          />
          <KpiCard
            icon={Brain}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-500"
            borderColor="border-t-indigo-500"
            bgGradient="bg-gradient-to-br from-white to-indigo-50/20"
            label={{ main: 'Avg Risk Score', sub: 'Composite' }}
            value={data.summary?.avg_risk_score || 0}
            unit="/100"
            badge="UPDATED"
            badgeStyle="text-indigo-600 bg-indigo-50"
          />
          <KpiCard
            icon={AlertTriangle}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            borderColor="border-t-red-500"
            bgGradient="bg-gradient-to-br from-white to-red-50/20"
            label={{ main: 'High Risk %', sub: 'Critical Sector' }}
            value={data.summary?.high_risk_pct || 0}
            unit="%"
            badge="MONITOR"
            badgeStyle="text-red-600 bg-red-50"
          />
          <KpiCard
            icon={HeartHandshake}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            borderColor="border-t-emerald-500"
            bgGradient="bg-gradient-to-br from-white to-emerald-50/20"
            label={{ main: 'Consultations', sub: 'Encounters' }}
            value={data.summary?.total_consultations || 0}
            unit=""
            badge="ACTIVE"
            badgeStyle="text-emerald-600 bg-emerald-50"
          />
        </div>

        {/* ── Main Charts ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Trend Line Chart – 2 cols */}
          <PremiumCard className="lg:col-span-2 p-8 animate-entrance">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">Clinical Risk Score Trends <span className="text-sm font-bold text-slate-400 ml-2 border border-slate-200 px-2 py-1 rounded-md bg-slate-50">(Demo Data)</span></h4>
                <p className="text-sm text-slate-500 mt-1">Aggregate risk evolution for the Chronic Patient Cohort</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl border border-slate-100">
                <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-xs font-bold text-[#1E6BA8]">Risk Score</button>
                <button className="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600">Prevalence</button>
              </div>
            </div>

            {/* SVG area chart */}
            <div className="h-80 w-full relative pt-4">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] font-black text-slate-300 pr-4">
                {['100','80','60','40','20','0'].map((v) => <span key={v}>{v}</span>)}
              </div>

              {/* Grid lines */}
              <div className="absolute left-10 right-0 top-0 bottom-8 border-l border-slate-100 flex flex-col justify-between">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-full h-px bg-slate-50" />
                ))}
              </div>

              {/* SVG */}
              <div className="absolute left-10 right-0 top-0 bottom-8">
                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full overflow-visible drop-shadow-2xl">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1E6BA8" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#1E6BA8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path
                    d="M0,85 C100,80 200,65 300,68 C400,72 500,55 600,45 C700,32 800,45 900,28 L1000,15 L1000,100 L0,100 Z"
                    fill="url(#areaGrad)"
                  />
                  {/* Animated line */}
                  <path
                    className="chart-curve"
                    d="M0,85 C100,80 200,65 300,68 C400,72 500,55 600,45 C700,32 800,45 900,28 L1000,15"
                    fill="none"
                    stroke="#1E6BA8"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Data points */}
                  {[[0,85],[300,68],[600,45],[900,28]].map(([cx,cy]) => (
                    <circle key={cx} cx={cx} cy={cy} r="5" fill="white" stroke="#1E6BA8" strokeWidth="3" />
                  ))}
                  {/* Active endpoint */}
                  <circle cx="1000" cy="15" r="7" fill="#1E6BA8" stroke="white" strokeWidth="3" className="cursor-pointer" />
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="absolute left-10 right-0 bottom-0 flex justify-between px-2">
                {['Jan','Feb','Mar','Apr','May'].map((m) => (
                  <span key={m} className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{m}</span>
                ))}
                <span className="text-[11px] font-black text-[#1E6BA8] uppercase tracking-widest">Jun</span>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-10 flex items-center justify-center gap-8">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-[#1E6BA8] shadow-[0_0_10px_#1E6BA8]" />
                <span className="text-xs font-extrabold text-slate-600">Chronic Cohort</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-slate-100" />
                <span className="text-xs font-extrabold text-slate-400">Regional Benchmark</span>
              </div>
            </div>
          </PremiumCard>

          {/* Population Risk Donut – 1 col */}
          <PremiumCard className="p-8 flex flex-col animate-entrance">
            <div className="mb-8">
              <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">Population Risk</h4>
              <p className="text-sm text-slate-500 mt-1">Severity distribution model</p>
            </div>

            {/* Donut */}
            <div className="relative flex-1 flex items-center justify-center mb-8">
              <div className="absolute inset-0 flex items-center justify-center flex-col z-10 pointer-events-none">
                <span className="text-4xl font-black text-slate-900 tracking-tighter">{data.loading ? '...' : (data.risk?.total || 0)}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Patients</span>
              </div>
              <svg viewBox="0 0 100 100" className="w-full max-w-[240px] -rotate-90 drop-shadow-xl">
                {/* Track */}
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                {/* Low risk */}
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="#1E6BA8" strokeWidth="12"
                  strokeDasharray={`${lowCirc} 264`} strokeDashoffset="0" className="transition-all duration-1000" />
                {/* Moderate */}
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="#94A3B8" strokeWidth="12"
                  strokeDasharray={`${medCirc} 264`} strokeDashoffset={`-${lowCirc}`} className="transition-all duration-1000" />
                {/* High */}
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="#EF4444" strokeWidth="12"
                  strokeDasharray={`${highCirc} 264`} strokeDashoffset={`-${lowCirc + medCirc}`} className="transition-all duration-1000" />
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-4">
              {[
                { dot: 'bg-[#1E6BA8] shadow-[0_0_8px_#1E6BA8]', label: 'Low Risk',     pct: `${(lowPct*100).toFixed(1)}%`, hover: 'hover:bg-blue-50',  pctColor: 'group-hover:text-[#1E6BA8]' },
                { dot: 'bg-slate-400',                            label: 'Moderate',     pct: `${(medPct*100).toFixed(1)}%`, hover: 'hover:bg-slate-200', pctColor: 'group-hover:text-slate-600' },
                { dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]',   label: 'Critical High', pct: `${(highPct*100).toFixed(1)}%`, hover: 'hover:bg-red-50',   pctColor: 'text-red-600' },
              ].map(({ dot, label, pct, hover, pctColor }) => (
                <div key={label} className={`flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 group transition-all ${hover}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${dot}`} />
                    <span className="text-xs font-bold text-slate-700">{label}</span>
                  </div>
                  <span className={`text-xs font-black text-slate-900 ${pctColor}`}>{pct}</span>
                </div>
              ))}
            </div>
          </PremiumCard>
        </div>

        {/* ── Bottom Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Age-Based Risk Profiles */}
          <PremiumCard className="p-8 animate-entrance" style={{ animationDelay: '0.2s' }}>
            <div className="mb-10">
              <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">Age-Based Risk Profiles</h4>
              <p className="text-sm text-slate-500 mt-1">Demographic vulnerability mapping across clinical specialties</p>
            </div>
            <div className="space-y-12">
              <AgeBar
                icon={UserPlus}
                iconBg="bg-red-50"   iconColor="text-red-500"
                label="Elderly (65+)"    sublabel={`Avg Risk: ${getAgeBucket('65+').avg_risk_score}`}
                highPct={getAgeBucket('65+').avg_risk_score}             highColor="text-red-600"
                barLow={20}  barMid={100 - getAgeBucket('65+').avg_risk_score - 20} barHigh={getAgeBucket('65+').avg_risk_score}
              />
              <AgeBar
                icon={User}
                iconBg="bg-blue-50"  iconColor="text-[#1E6BA8]"
                label="Adults (50-64)"   sublabel={`Avg Risk: ${getAgeBucket('50-64').avg_risk_score}`}
                highPct={getAgeBucket('50-64').avg_risk_score}             highColor="text-slate-800"
                barLow={45}  barMid={100 - getAgeBucket('50-64').avg_risk_score - 45} barHigh={getAgeBucket('50-64').avg_risk_score}
              />
              <AgeBar
                icon={UserCheck}
                iconBg="bg-emerald-50" iconColor="text-emerald-500"
                label="Adults (35-49)" sublabel={`Avg Risk: ${getAgeBucket('35-49').avg_risk_score}`}
                highPct={getAgeBucket('35-49').avg_risk_score}              highColor="text-emerald-600"
                barLow={60}  barMid={100 - getAgeBucket('35-49').avg_risk_score - 60} barHigh={getAgeBucket('35-49').avg_risk_score}
              />
              <AgeBar
                icon={UserCheck}
                iconBg="bg-emerald-50" iconColor="text-emerald-500"
                label="Young Adults (18-34)" sublabel={`Avg Risk: ${getAgeBucket('18-34').avg_risk_score}`}
                highPct={getAgeBucket('18-34').avg_risk_score}              highColor="text-emerald-600"
                barLow={75}  barMid={100 - getAgeBucket('18-34').avg_risk_score - 75} barHigh={getAgeBucket('18-34').avg_risk_score}
              />
            </div>
          </PremiumCard>

          {/* Departmental Capacity Table */}
          <div
            className="
              bg-white border border-slate-200/70 rounded-[24px] overflow-hidden
              shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_10px_20px_-5px_rgba(0,0,0,0.03)]
              transition-all duration-400 ease-out
              hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.04)]
              hover:border-[#1E6BA8]/20 animate-entrance
            "
            style={{ animationDelay: '0.3s' }}
          >
            {/* Card header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">Departmental Capacity <span className="text-sm font-bold text-slate-400 ml-2 border border-slate-200 px-2 py-1 rounded-md bg-slate-50">(Demo Data)</span></h4>
                <p className="text-sm text-slate-500 mt-1">Cross-specialty operational performance</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button className="px-4 py-1.5 bg-white text-xs font-black text-[#1E6BA8] rounded-lg shadow-sm">Grid</button>
                <button className="px-4 py-1.5 text-xs font-black text-slate-400">List</button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                    <th className="px-8 py-5 text-left">Clinical Unit</th>
                    <th className="px-8 py-5 text-left">Case Load</th>
                    <th className="px-8 py-5 text-left">Risk Index</th>
                    <th className="px-8 py-5 text-right">Ops Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <DeptRow
                    icon={Heart}
                    iconBg="bg-blue-50"    iconColor="text-[#1E6BA8]"
                    name="Cardiology"      sub="Surgical/Outpatient"
                    caseLoad={842}
                    riskValue="42.8"
                    riskStyle="bg-orange-100 text-orange-700 border-orange-200"
                    utilPct={85}
                    utilBar="bg-[#1E6BA8] shadow-[0_0_10px_#1E6BA8]"
                  />
                  <DeptRow
                    icon={Brain}
                    iconBg="bg-indigo-50"  iconColor="text-indigo-600"
                    name="Neurology"       sub="Cognitive/Trauma"
                    caseLoad={321}
                    riskValue="28.4"
                    riskStyle="bg-emerald-100 text-emerald-700 border-emerald-200"
                    utilPct={62}
                    utilBar="bg-[#1E6BA8]"
                  />
                  <DeptRow
                    icon={Building2}
                    iconBg="bg-red-50"     iconColor="text-red-600"
                    name="Oncology"        sub="Acute/Chemo"
                    caseLoad={194}
                    riskValue="68.1"
                    riskStyle="bg-red-100 text-red-700 border-red-200"
                    utilPct={94}
                    utilBar="bg-red-500 shadow-[0_0_10px_#ef4444]"
                  />
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-50 bg-white text-center">
              <button className="text-xs font-black text-[#1E6BA8] hover:underline uppercase tracking-widest">
                View Complete Operational Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
