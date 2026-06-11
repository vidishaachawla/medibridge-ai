/**
 * pages/AIAssistant.jsx
 * ──────────────────────
 * Ultra-Premium Clinical AI Assistant – converted from MediBridge AI Superdesign prototype.
 * Icons  : lucide-react (already installed)
 * Styling: Tailwind v4 utility classes
 *
 * AppLayout already supplies Sidebar + TopBar; this file renders the page body only.
 */
import { useState, useEffect } from 'react'
import { PatientService, ClinicalService } from '../api/services'
import {
  Sparkles,
  RefreshCw,
  FileCheck2,
  Shuffle,
  CheckCircle2,
  X,
  Plus,
  Zap,
  AlertCircle,
  Hash,
  Database,
  ClipboardList,
  Gauge,
  Scan,
  Pill,
  Thermometer,
  AlertTriangle,
  MessageSquareText,
  ArrowRight,
  BookOpenCheck,
  Loader2,
} from 'lucide-react'

/* ─── tiny shared primitives ─────────────────────────────── */

/** Card with the premium shadow + hover lift used throughout */
function PremiumCard({ children, className = '' }) {
  return (
    <div
      className={`
        bg-white border border-slate-100 rounded-[2.5rem]
        shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03),0_12px_24px_rgba(0,0,0,0.02)]
        ${className}
      `}
    >
      {children}
    </div>
  )
}

/** Removable symptom chip */
function SymptomChip({ label, onRemove }) {
  return (
    <div
      className="
        flex items-center gap-3 rounded-xl py-2 px-4
        bg-gradient-to-br from-white to-slate-100
        border border-slate-200
        transition-all duration-300 ease-out
        hover:border-[#1E6BA8] hover:-translate-y-px hover:scale-[1.02]
        hover:shadow-[0_4px_12px_rgba(30,107,168,0.1)]
      "
    >
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <button
        onClick={onRemove}
        className="w-5 h-5 rounded-full flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

/* ─── main component ─────────────────────────────────────── */
export default function AIAssistant() {
  const [patient, setPatient] = useState(null)
  const [isPatientLoading, setIsPatientLoading] = useState(true)

  const [symptoms, setSymptoms] = useState(['Persistent Cough', 'Chest Tightness', 'Dyspnea'])
  const [newSymptom, setNewSymptom] = useState('')
  const [chronology, setChronology] = useState('Sub-acute (2-7 days)')

  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    PatientService.getPatients(0, 1)
      .then(data => {
        if(data && data.length > 0) setPatient(data[0])
      })
      .finally(() => setIsPatientLoading(false))
  }, [])

  function removeSymptom(label) {
    setSymptoms((prev) => prev.filter((s) => s !== label))
  }

  function addSymptom(e) {
    e.preventDefault()
    const trimmed = newSymptom.trim()
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms((prev) => [...prev, trimmed])
    }
    setNewSymptom('')
  }

  const handleSwitchPatient = (e) => {
    e?.preventDefault()
    setIsPatientLoading(true)
    const randomSkip = Math.floor(Math.random() * 900)
    PatientService.getPatients(randomSkip, 1)
      .then(data => {
        if(data && data.length > 0) {
            setPatient(data[0])
            setAnalysisResult(null)
        }
      })
      .finally(() => setIsPatientLoading(false))
  }

  const handleAnalyze = async () => {
    if(!patient || symptoms.length === 0) return
    setAnalysisLoading(true)
    setError(null)
    try {
      const res = await ClinicalService.submitSymptomCheck(patient.id, symptoms.join(', '))
      setAnalysisResult(res)
      setPatient(prev => ({
        ...prev,
        risk_score: res.updated_patient_risk_score,
        risk_classification: res.updated_patient_risk_classification
      }))
    } catch(err) {
      setError("Failed to generate intelligence. Please try again.")
    } finally {
      setAnalysisLoading(false)
    }
  }

  const handleClear = () => {
    setSymptoms([])
    setAnalysisResult(null)
    setError(null)
  }

  return (
    <>
      {/* Page-scoped keyframes */}
      <style>{`
        @keyframes progressLoad {
          from { width: 0; }
        }
        .animate-progress-load {
          animation: progressLoad 1.5s ease-out forwards;
        }
        .glow-btn { position: relative; overflow: hidden; }
        .glow-btn::after {
          content: '';
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .glow-btn:hover::after { opacity: 1; }
      `}</style>

      <div className="p-10 max-w-[1600px] mx-auto" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.015em' }}>

        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1E6BA8] border border-blue-100 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI Clinical Assistant</h2>
            </div>
            <p className="text-slate-500 text-lg font-medium">Cognitive decision support for precision diagnostics.</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="btn-reset-session"
              onClick={handleClear}
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]"
            >
              <RefreshCw className="w-4 h-4" />
              Clear Analysis
            </button>
            <button
              id="btn-export-ehr"
              className="glow-btn px-6 py-3 bg-[#1E6BA8] text-white rounded-2xl text-sm font-bold hover:brightness-110 shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              Sync to Clinical Record
            </button>
          </div>
        </div>

        {/* ── Main Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-12 gap-10">

          {/* ═══ LEFT PANEL ════════════════════════════════════ */}
          <div className="col-span-12 xl:col-span-4 space-y-8">

            {/* Patient Intelligence Context */}
            <PremiumCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-[0.2em]">Patient Profile</h3>
                <a
                  id="cta-change-subject"
                  href="#"
                  onClick={handleSwitchPatient}
                  className="text-[10px] font-bold text-[#1E6BA8] hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 uppercase tracking-widest"
                >
                  Switch <Shuffle className="w-3 h-3" />
                </a>
              </div>

              {/* Dark patient card */}
              <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-1 overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient ? patient.first_name : 'Loading'}`}
                      alt="Patient Avatar"
                      className="rounded-xl w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-white tracking-tight">
                        {isPatientLoading ? 'Loading...' : `${patient?.first_name} ${patient?.last_name}`}
                      </p>
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-blue-200/70 text-sm font-medium">
                      {isPatientLoading ? '...' : `${new Date().getFullYear() - new Date(patient?.date_of_birth).getFullYear()} Years • ID: MB-${patient?.id}`}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 text-[10px] font-bold rounded-lg border border-red-500/30 tracking-widest uppercase">
                    {patient?.risk_classification || 'UNKNOWN'} RISK
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-lg border border-blue-500/30 tracking-widest">ABHA VERIFIED</span>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { cap: 'Blood Type', val: 'O Positive' },
                  { cap: 'Gender',  val: patient?.gender || '-' },
                ].map(({ cap, val }) => (
                  <div key={cap} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{cap}</p>
                    <p className="text-base font-bold text-slate-700">{val}</p>
                  </div>
                ))}
              </div>
            </PremiumCard>

            {/* Diagnostic Intake */}
            <PremiumCard className="p-8">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.2em] mb-8">Clinical Observation</h3>

              <div className="space-y-8">
                {/* Symptom chips + input */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-4 tracking-widest">
                    Presenting Symptoms
                  </label>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {symptoms.map((s) => (
                      <SymptomChip key={s} label={s} onRemove={() => removeSymptom(s)} />
                    ))}
                  </div>

                  <form onSubmit={addSymptom} className="relative group">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1E6BA8] transition-colors" />
                    <input
                      type="text"
                      value={newSymptom}
                      onChange={(e) => setNewSymptom(e.target.value)}
                      placeholder="Enter finding or symptom..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-[#1E6BA8]/20 focus:border-[#1E6BA8] outline-none transition-all placeholder:text-slate-400"
                    />
                  </form>
                </div>

                {/* Chronology */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-3 tracking-widest">
                    Symptom Chronology
                  </label>
                  <select
                    value={chronology}
                    onChange={(e) => setChronology(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1E6BA8]/20 transition-all"
                  >
                    <option>Sub-acute (2-7 days)</option>
                    <option>Acute (&lt; 48 hours)</option>
                    <option>Chronic (&gt; 4 weeks)</option>
                  </select>
                </div>

                {/* CTA */}
                <button
                  id="cta-initiate-analysis"
                  onClick={handleAnalyze}
                  disabled={analysisLoading || isPatientLoading}
                  className="w-full py-5 bg-gradient-to-r from-[#1E6BA8] to-[#2563EB] text-white rounded-[1.5rem] font-extrabold text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {analysisLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  {analysisLoading ? 'ANALYZING...' : 'GENERATE INTELLIGENCE'}
                </button>
              </div>
            </PremiumCard>
          </div>

          {/* ═══ RIGHT PANEL ═══════════════════════════════════ */}
          <div className="col-span-12 xl:col-span-8 space-y-10">

            {/* Differential Diagnosis */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-[0.2em]">Differential Intelligence</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 uppercase">Real-time Inference</span>
                </div>
              </div>

              {(!analysisResult && !analysisLoading && !error) && (
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-center text-slate-400 font-medium">
                  Awaiting symptom input to generate differential intelligence...
                </div>
              )}

              {analysisLoading && (
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-12 text-center text-slate-500 font-bold flex flex-col items-center gap-6 mt-6">
                  <Loader2 className="w-10 h-10 animate-spin text-[#1E6BA8]" />
                  <p>Analyzing clinical parameters using AI Inference Engine...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-8 text-center text-red-500 font-bold flex flex-col items-center gap-4 mt-6">
                  <AlertCircle className="w-8 h-8" />
                  {error}
                </div>
              )}

              {analysisResult && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1 – Primary (active) */}
                  <div
                    className="
                      bg-white rounded-[2rem] p-8 relative overflow-hidden
                      border-l-[6px] border-[#1E6BA8]
                      shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03),0_12px_24px_rgba(0,0,0,0.02)]
                      transition-all duration-400 ease-out
                      hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.02)]
                      group
                    "
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">AI Confidence</span>
                          <span className="text-sm font-extrabold text-[#1E6BA8]">HIGH</span>
                        </div>
                        <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="animate-progress-load h-full bg-gradient-to-r from-[#1E6BA8] to-blue-400 rounded-full"
                            style={{ width: '92.5%' }}
                          />
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-lg border flex items-center gap-1 ${
                        analysisResult.urgency_level === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {analysisResult.urgency_level === 'CRITICAL' && <AlertCircle className="w-3 h-3" />} {analysisResult.urgency_level}
                      </span>
                    </div>

                    <h4 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">{analysisResult.primary_concern}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
                      {analysisResult.clinical_summary}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">ICD-10-CM</p>
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 text-blue-400" />
                          <span className="font-mono text-sm font-bold text-slate-700">{analysisResult.icd10_code || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">SNOMED CT</p>
                        <div className="flex items-center gap-2">
                          <Database className="w-3 h-3 text-slate-400" />
                          <span className="font-mono text-sm font-bold text-slate-700">{analysisResult.snomed_code || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 – Secondary */}
                  <div
                    className="
                      bg-white/50 rounded-[2rem] p-8
                      border border-dashed border-slate-200
                      opacity-80 hover:opacity-100
                      grayscale-[0.5] hover:grayscale-0
                      transition-all duration-400 ease-out
                      hover:-translate-y-1 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.02)]
                    "
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">Secondary DX</span>
                          <span className="text-sm font-extrabold text-slate-500">Evaluating</span>
                        </div>
                        <div className="w-40 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="animate-progress-load h-full bg-slate-400 rounded-full"
                            style={{ width: '0%' }}
                          />
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-lg border border-amber-100">
                        PENDING
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Awaiting Data</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">
                      The AI engine has isolated a single primary diagnostic pathway. Secondary differentials may emerge upon additional vital inputs.
                    </p>
                    <div className="flex gap-4">
                      <span className="text-[11px] font-bold text-slate-400">ICD: <span className="text-slate-600 font-mono">--</span></span>
                      <span className="text-[11px] font-bold text-slate-400">SCT: <span className="text-slate-600 font-mono">--</span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guidance & Narrative grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

              {/* Care Directives */}
              <PremiumCard className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E6BA8]">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Care Directives</h3>
                </div>

                <div className="space-y-8">
                  {/* Investigations */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Investigations</p>
                    <div className="space-y-3">
                      {[
                        { icon: Gauge, label: 'Peak Flow Measurement' },
                        { icon: Scan,  label: 'Chest X-Ray (PA View)' },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-4 group">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-bold text-slate-700">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Intervention protocol */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Intervention Protocol</p>
                    <ul className="space-y-3">
                      {[
                        { icon: Pill,        text: 'SABA via MDI (Salbutamol 200mcg)' },
                        { icon: Thermometer, text: 'Oral Corticosteroids (Prednisolone)' },
                      ].map(({ icon: Icon, text }) => (
                        <li
                          key={text}
                          className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 flex items-center gap-3 hover:bg-white hover:border-[#1E6BA8]/30 transition-all cursor-default"
                        >
                          <Icon className="w-4 h-4 text-[#1E6BA8]" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Safety alert */}
                  <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-[2rem] ring-4 ring-red-500/5">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-red-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-500/20">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-extrabold text-red-700 uppercase tracking-widest mb-1">Safety Alert</p>
                        <p className="text-xs text-red-600/80 leading-relaxed font-semibold italic">
                          Patient is on Beta-blockers (Propranolol). Direct antagonism risk with bronchodilators detected.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </PremiumCard>

              {/* Case Reasoning */}
              <PremiumCard className="p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E6BA8]">
                    <MessageSquareText className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Case Reasoning</h3>
                </div>

                <div className="space-y-10">
                  {/* Narrative */}
                  <div className="relative pl-4">
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-100 rounded-full" />
                    <div className="space-y-4">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Analysis Narrative</p>
                      <p className="text-sm text-slate-600 leading-[1.8] font-medium">
                        {analysisResult ? analysisResult.clinical_summary : 'Awaiting clinical narrative generation based on symptoms and patient history...'}
                      </p>
                    </div>
                  </div>

                  {/* Next steps */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Strategic Next Steps</p>
                    <div className="space-y-4">
                      {/* Step 01 – active */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:border-[#1E6BA8] border border-transparent rounded-[1.5rem] transition-all cursor-pointer group shadow-sm hover:shadow-md">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-[#1E6BA8] flex items-center justify-center font-extrabold text-sm group-hover:bg-[#1E6BA8] group-hover:text-white group-hover:border-[#1E6BA8] transition-all">
                            01
                          </div>
                          <p className="text-sm font-extrabold text-slate-700 tracking-tight">Execute Spirometry</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1E6BA8] translate-x-0 group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Step 02 – muted */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white border border-transparent rounded-[1.5rem] transition-all cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center font-extrabold text-sm">
                            02
                          </div>
                          <p className="text-sm font-bold text-slate-500 tracking-tight">Review Action Plan</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GINA guidelines link */}
                  <div className="pt-4 border-t border-slate-50">
                    <a
                      id="cta-view-guidelines"
                      href="#"
                      className="flex items-center justify-center gap-2 py-3 bg-blue-50/50 text-[#1E6BA8] rounded-2xl text-[11px] font-extrabold uppercase tracking-widest hover:bg-blue-50 transition-colors"
                    >
                      <BookOpenCheck className="w-4 h-4" />
                      Examine GINA 2023 Pathways
                    </a>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
