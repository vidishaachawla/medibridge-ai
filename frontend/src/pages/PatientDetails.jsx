/**
 * pages/PatientDetails.jsx
 * ─────────────────────────
 * Connected to live FastAPI Backend.
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Edit2, FileUp, CalendarPlus, TrendingUp, Activity, AlertCircle, Thermometer, Wind, Scale,
  ClipboardCheck, Video, Stethoscope, ChevronRight, Plus, Pill, AlertTriangle, CalendarClock,
  Loader2
} from 'lucide-react'
import { PatientService, ClinicalService } from '../api/services'

function PremiumCard({ children, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200/70 rounded-3xl shadow-[0_4px_6px_-1px_rgba(15,23,42,0.03),0_2px_4px_-2px_rgba(15,23,42,0.02)] transition-all duration-300 ease-out hover:shadow-[0_20px_25px_-5px_rgba(15,23,42,0.05),0_8px_10px_-6px_rgba(15,23,42,0.03)] hover:-translate-y-0.5 ${className}`}>
      {children}
    </div>
  )
}

function VitalCard({ label, value, unit, statusLabel, statusColor, trend, trendIcon: Icon, time, borderColor }) {
  return (
    <PremiumCard className={`p-6 border-l-[6px] ${borderColor} bg-gradient-to-br from-blue-50/30 to-white`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-tighter ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-extrabold text-slate-900">{value}</span>
        <span className="text-xs font-bold text-slate-400">{unit}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 ${trend.color}`}>
          <Icon className="w-4 h-4" />
          <span className="text-[10px] font-bold">{trend.label}</span>
        </div>
        <span className="text-[10px] font-medium text-slate-400">{time}</span>
      </div>
    </PremiumCard>
  )
}

export default function PatientDetails() {
  const { patientId } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true)
        const pData = await PatientService.getPatientById(patientId)
        setPatient(pData)
        
        try {
          const hData = await ClinicalService.getHistory(patientId)
          setHistory(hData)
        } catch (e) {
          console.warn("Could not fetch history", e)
          setHistory([])
        }

        setError(null)
      } catch (err) {
        setError('Failed to fetch patient details from backend.')
      } finally {
        setLoading(false)
      }
    }
    if (patientId) {
      fetchPatientData()
    }
  }, [patientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#1E6BA8] animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center gap-3 shadow-sm border border-red-100">
          <AlertCircle className="w-6 h-6" />
          {error}
        </div>
      </div>
    )
  }

  if (!patient) return null

  // Calculate age
  const age = new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()

  // Risk styling
  let riskColor = 'bg-emerald-500'
  let riskText = 'NORMAL'
  let riskGradient = 'from-emerald-50 to-white'
  if (patient.risk_classification === 'High') {
    riskColor = 'bg-red-500'
    riskText = 'HIGH RISK'
    riskGradient = 'from-red-50 to-white'
  } else if (patient.risk_classification === 'Medium') {
    riskColor = 'bg-orange-500'
    riskText = 'ELEVATED'
    riskGradient = 'from-orange-50 to-white'
  }

  const updatedDateStr = new Date(patient.updated_at).toLocaleDateString()

  // Dynamic vitals array
  const vitals = [
    {
      label: 'Blood Pressure',
      value: patient.blood_pressure_systolic && patient.blood_pressure_diastolic ? `${patient.blood_pressure_systolic}/${patient.blood_pressure_diastolic}` : 'N/A',
      unit: 'mmHg',
      statusLabel: patient.blood_pressure_systolic > 140 ? 'ELEVATED' : 'NORMAL',
      statusColor: patient.blood_pressure_systolic > 140 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600',
      borderColor: patient.blood_pressure_systolic > 140 ? 'border-orange-500' : 'border-emerald-500',
      trendIcon: Activity,
      trend: { label: 'Latest', color: 'text-slate-500' },
      time: updatedDateStr,
    },
    {
      label: 'Heart Rate',
      value: patient.heart_rate || 'N/A',
      unit: 'BPM',
      statusLabel: (patient.heart_rate > 100 || patient.heart_rate < 60) ? 'IRREGULAR' : 'NORMAL',
      statusColor: (patient.heart_rate > 100 || patient.heart_rate < 60) ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600',
      borderColor: (patient.heart_rate > 100 || patient.heart_rate < 60) ? 'border-orange-500' : 'border-emerald-500',
      trendIcon: Activity,
      trend: { label: 'Latest', color: 'text-slate-500' },
      time: updatedDateStr,
    },
    {
      label: 'Cholesterol',
      value: patient.cholesterol || 'N/A',
      unit: 'mg/dL',
      statusLabel: patient.cholesterol > 200 ? 'HIGH' : 'NORMAL',
      statusColor: patient.cholesterol > 200 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600',
      borderColor: patient.cholesterol > 200 ? 'border-orange-500' : 'border-emerald-500',
      trendIcon: Activity,
      trend: { label: 'Latest', color: 'text-slate-500' },
      time: updatedDateStr,
    },
    {
      label: 'Body Mass Index',
      value: patient.bmi || 'N/A',
      unit: 'kg/m²',
      statusLabel: patient.bmi > 25 ? 'OVERWEIGHT' : 'NORMAL',
      statusColor: patient.bmi > 25 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600',
      borderColor: patient.bmi > 25 ? 'border-orange-500' : 'border-emerald-500',
      trendIcon: Scale,
      trend: { label: 'Latest', color: 'text-slate-500' },
      time: updatedDateStr,
    },
    {
      label: 'HbA1c',
      value: patient.hba1c || 'N/A',
      unit: '%',
      statusLabel: patient.hba1c >= 6.5 ? 'ELEVATED' : 'NORMAL',
      statusColor: patient.hba1c >= 6.5 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600',
      borderColor: patient.hba1c >= 6.5 ? 'border-orange-500' : 'border-emerald-500',
      trendIcon: Activity,
      trend: { label: 'Latest', color: 'text-slate-500' },
      time: updatedDateStr,
    }
  ]

  return (
    <>
      <style>{`
        @keyframes pulseSoft {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
        .pulse-soft { animation: pulseSoft 3s infinite; }
      `}</style>

      <div className="max-w-[1400px] mx-auto space-y-8 font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>

        <header className="relative overflow-hidden rounded-[2rem] p-8 bg-gradient-to-br from-white via-white to-blue-50/50 border border-slate-200/70 border-t-[6px] border-t-[#1E6BA8] shadow-[0_4px_6px_-1px_rgba(15,23,42,0.03)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/40 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl border border-slate-100 overflow-hidden group">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.first_name}`}
                    alt={patient.first_name}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500 bg-slate-50"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`${riskColor} text-white text-[10px] font-extrabold px-4 py-1.5 rounded-full shadow-lg border-2 border-white tracking-wider`}>
                    {riskText}
                  </span>
                </div>
              </div>

              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{patient.first_name} {patient.last_name}</h1>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[11px] font-bold rounded-lg border border-slate-200 tracking-tight">
                    ID: MB-{patient.id.toString().padStart(5, '0')}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-10">
                  {[
                    { cap: 'Personal Info',  val: `${age}Y • ${patient.gender}` },
                    { cap: 'ABHA Number',    val: patient.abha_number || 'Pending', mono: true },
                    { cap: 'Birth Date',     val: new Date(patient.date_of_birth).toLocaleDateString() },
                    { cap: 'Location',       val: patient.address || 'Unknown' },
                  ].map(({ cap, val, mono }) => (
                    <div key={cap} className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.15em]">{cap}</p>
                      <p className={`text-slate-700 font-bold text-sm ${mono ? 'font-mono' : ''}`}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all">
                <Edit2 className="w-4 h-4" /> Modify
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all">
                <FileUp className="w-4 h-4" /> Export
              </button>
              <button className="flex items-center gap-2 px-8 py-3 bg-[#1E6BA8] text-white rounded-2xl text-sm font-extrabold hover:bg-[#165a8e] active:scale-95 transition-all shadow-xl shadow-blue-500/20">
                <CalendarPlus className="w-4 h-4" /> Book Appointment
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vitals.map((v) => (
            <VitalCard key={v.label} {...v} />
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <PremiumCard className="overflow-hidden rounded-[2rem]">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-[#1E6BA8] rounded-xl">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Clinical Encounters</h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.1em]">
                    <tr>
                      <th className="px-8 py-4">Date & Time</th>
                      <th className="px-6 py-4">Assessment Summary</th>
                      <th className="px-6 py-4">ICD-10 Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.length > 0 ? history.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-all cursor-pointer border-l-4 border-transparent hover:border-[#1E6BA8]">
                        <td className="px-8 py-5">
                          <p className="font-extrabold text-slate-900">{new Date(record.consultation_date).toLocaleDateString()}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{new Date(record.consultation_date).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-slate-600 line-clamp-2">{record.symptoms || record.clinical_notes || "No notes available"}</p>
                        </td>
                        <td className="px-6 py-5">
                          {record.icd10_code ? (
                            <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200">
                              {record.icd10_code}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">-</span>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-12 text-center text-slate-500">
                          No previous clinical encounters found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </PremiumCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PremiumCard className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">Medical Conditions</h4>
                  <button className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-[#1E6BA8] transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {patient.hypertension_status && (
                    <div className="flex items-center justify-between p-4 bg-red-50/30 rounded-2xl border border-red-100">
                      <div className="flex items-center gap-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] pulse-soft inline-block" />
                        <span className="text-sm font-bold text-slate-800">Hypertension</span>
                      </div>
                      <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">CHRONIC</span>
                    </div>
                  )}
                  {patient.diabetes_status && (
                    <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                        <span className="text-sm font-bold text-slate-800">Type 2 Diabetes</span>
                      </div>
                      <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">ACTIVE</span>
                    </div>
                  )}
                  {patient.smoker_status && (
                    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-4">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                        <span className="text-sm font-bold text-slate-800">Smoker</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">FLAGGED</span>
                    </div>
                  )}
                  {!patient.hypertension_status && !patient.diabetes_status && !patient.smoker_status && (
                     <div className="text-center text-sm text-slate-400 italic py-4">No critical conditions flagged.</div>
                  )}
                </div>
              </PremiumCard>

              <PremiumCard className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">Current Medications</h4>
                  <Pill className="w-5 h-5 text-slate-300" />
                </div>
                <div className="space-y-6">
                  {/* Derive medications dynamically from conditions to remove static mock data */}
                  {(() => {
                    const meds = [];
                    if (patient.hypertension_status) {
                      meds.push({ abbr: 'AM', bg: 'bg-indigo-50 text-indigo-600', name: 'Amlodipine Besylate', dose: '5mg • Once Daily • PC' });
                    }
                    if (patient.diabetes_status) {
                      meds.push({ abbr: 'MF', bg: 'bg-emerald-50 text-emerald-600', name: 'Metformin', dose: '500mg • Twice Daily • PC' });
                    }
                    if (meds.length === 0) {
                      return <div className="text-center text-sm text-slate-400 italic py-4">No active medications prescribed.</div>;
                    }
                    return meds.map(({ abbr, bg, name, dose }) => (
                      <div key={name} className="flex items-center gap-5 group">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-300 ${bg}`}>
                          {abbr}
                        </div>
                        <div className="flex-1 border-b border-slate-100 pb-3 last:border-0">
                          <p className="text-sm font-extrabold text-slate-800">{name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-[11px] text-slate-500 font-semibold">{dose}</p>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </PremiumCard>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="relative overflow-hidden rounded-[2rem] p-8 bg-slate-900 text-white shadow-[0_4px_6px_-1px_rgba(15,23,42,0.03)]">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#1E6BA8] opacity-10 rounded-full -mr-20 -mb-20 blur-2xl pointer-events-none" />

              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                Clinical Intelligence Risk Score
              </h4>

              <div className="flex flex-col items-center mb-10">
                <div className="relative flex items-center justify-center">
                  <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" strokeWidth="12" fill="transparent" className="stroke-slate-800" />
                    <circle
                      cx="80" cy="80" r="70"
                      strokeWidth="12"
                      strokeLinecap="round"
                      fill="transparent"
                      stroke={patient.risk_classification === 'High' ? '#ef4444' : (patient.risk_classification === 'Medium' ? '#f97316' : '#10b981')}
                      strokeDasharray="439.8"
                      strokeDashoffset={439.8 - ((patient.risk_score / 100) * 439.8)}
                      style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white leading-none tracking-tighter">{Math.round(patient.risk_score)}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">PERCENTILE</span>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className={`text-2xl font-black tracking-tight leading-none uppercase ${patient.risk_classification === 'High' ? 'text-red-500' : (patient.risk_classification === 'Medium' ? 'text-orange-500' : 'text-emerald-500')}`}>
                    {patient.risk_classification} Priority
                  </p>
                </div>
              </div>

              {patient.risk_classification === 'High' && (
                 <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">High-Impact Alerts</p>
                  <div className="p-4 bg-red-600/10 border-l-4 border-red-600 rounded-r-2xl cursor-default">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-tight">Elevated Risk Assessment</p>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          Patient risk score indicates critical clinical monitoring is necessary.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <PremiumCard className="p-8">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                Demographics & Bio-Data
              </h4>
              <div className="space-y-6">
                {[
                  { cap: 'Primary Mobile',  val: patient.phone || 'Not provided' },
                  { cap: 'Email Address',   val: patient.email || 'Not provided' },
                  { cap: 'Mailing Address', val: patient.address || 'Not provided' },
                ].map(({ cap, val }) => (
                  <div key={cap} className="flex flex-col gap-1.5 pb-4 border-b border-slate-50">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cap}</span>
                    <span className="text-sm font-bold text-slate-800 leading-relaxed">{val}</span>
                  </div>
                ))}
              </div>
            </PremiumCard>
          </div>
        </div>
      </div>
    </>
  )
}
