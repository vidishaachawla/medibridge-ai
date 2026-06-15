/**
 * pages/Dashboard.jsx
 * ───────────────────
 * Clinical Dashboard (Pro Edition)
 * Connected to live FastAPI Backend via Axios.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  Plus,
  Users,
  TrendingUp,
  HeartPulse,
  Activity,
  CalendarCheck,
  ChevronRight,
  History,
  Video,
  Stethoscope,
  FileText,
  ShieldCheck,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { AnalyticsService, AuditService } from '../api/services'
import NewConsultationModal from '../components/ui/NewConsultationModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [cohorts, setCohorts] = useState(null)
  const [highRisk, setHighRisk] = useState([])
  const [recentLogs, setRecentLogs] = useState([])
  const [ageRisk, setAgeRisk] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [dateRange, setDateRange] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = dateRange ? { start_date: dateRange.start, end_date: dateRange.end } : {}
      
      const [summaryData, cohortsData, highRiskData, logsData, ageRiskData] = await Promise.all([
        AnalyticsService.getSummary(params),
        AnalyticsService.getConditionCohorts(params),
        AnalyticsService.getHighRiskPatients(5, params),
        AuditService.getAuditLogs({ limit: 5 }), // Audit logs keep their own query
        AnalyticsService.getAgeRiskBuckets(params)
      ])
      
      setSummary(summaryData)
      setCohorts(cohortsData)
      setHighRisk(highRiskData)
      setRecentLogs(logsData)
      setAgeRisk(ageRiskData)
      setError(null)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load live dashboard data. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  const toggleDateRange = () => {
    if (dateRange) {
      setDateRange(null)
    } else {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      setDateRange({ start: start.toISOString(), end: end.toISOString() })
    }
  }

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-[#1E6BA8] animate-spin" />
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Loading Clinical Intelligence...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 m-8 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center gap-3">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <div>
          <h3 className="font-bold text-red-900 text-lg">Connection Error</h3>
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .premium-card {
          background: linear-gradient(135deg, #FFFFFF 0%, rgba(240, 249, 255, 0.3) 100%);
          border: 1px solid rgba(30, 107, 168, 0.08);
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04), 0 6px 16px rgba(15, 23, 42, 0.06);
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 20px;
        }

        .premium-card:hover {
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08), 0 12px 24px rgba(15, 23, 42, 0.08);
          transform: translateY(-2px);
        }

        .btn-primary {
          background-color: #1E6BA8;
          box-shadow: 0 4px 12px rgba(30, 107, 168, 0.2);
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          height: 44px;
        }

        .btn-primary:hover {
          filter: brightness(1.1);
          transform: scale(1.02);
        }

        .btn-primary:active {
          transform: scale(0.96);
        }

        .chart-grid-line {
          stroke: rgba(226, 232, 240, 0.8);
          stroke-dasharray: 4 4;
        }

        .table-row-hover {
          transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 3px solid transparent;
        }

        .table-row-hover:hover {
          background-color: rgba(241, 245, 249, 0.5);
          border-left-color: #1E6BA8;
        }

        .risk-bar-gradient-red { background: linear-gradient(90deg, #EF4444 0%, #B91C1C 100%); }
        .risk-bar-gradient-amber { background: linear-gradient(90deg, #F59E0B 0%, #D97706 100%); }
      `}</style>

      <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">Clinical Intelligence Dashboard</h2>
            <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Platform health: <span className="text-emerald-600 font-semibold">Live connection active</span> • Syncing {summary?.total_patients} nodes
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDateRange}
              className={`h-[44px] px-5 border rounded-xl text-sm font-semibold transition-all flex items-center gap-3
                ${dateRange ? 'bg-blue-50 border-blue-200 text-[#1E6BA8]' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
            >
              <CalendarDays className={`w-5 h-5 ${dateRange ? 'text-[#1E6BA8]' : 'text-slate-400'}`} />
              {dateRange ? 'Clear Date Filter' : 'Last 30 Days'}
            </button>
            <button 
              onClick={() => setIsConsultationModalOpen(true)}
              className="btn-primary px-6 text-white rounded-xl text-sm font-bold flex items-center gap-3"
            >
              <Plus className="w-5 h-5" />
              New Consultation
            </button>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card: Total Patients */}
          <div className="premium-card p-6 border-t-4 border-t-[#1E6BA8] cursor-pointer hover:bg-slate-50" onClick={() => navigate('/patients')}>
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 rounded-full bg-[#1E6BA8]/10 flex items-center justify-center text-[#1E6BA8]">
                <Users className="w-6 h-6" />
              </div>
              <div className="bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp className="text-emerald-600 w-3 h-3" />
                <span className="text-emerald-700 text-[11px] font-bold">+Live</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Patient Population</p>
            <h3 className="text-4xl font-bold text-slate-900 mt-1">{summary?.total_patients}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-2">Active records in database</p>
          </div>

          {/* Card: High Risk */}
          <div className="premium-card p-6 border-t-4 border-t-red-500 cursor-pointer hover:bg-slate-50" onClick={() => navigate('/patients?risk=high')}>
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="text-red-600 text-[11px] font-bold uppercase tracking-tighter bg-red-50 px-2 py-1 rounded-lg">Critical Review</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">High Risk Cohort</p>
            <h3 className="text-4xl font-bold text-slate-900 mt-1">{summary?.high_risk_count}</h3>
            <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${summary?.high_risk_pct || 0}%` }}></div>
            </div>
          </div>

          {/* Card: Avg Risk */}
          <div className="premium-card p-6 border-t-4 border-t-amber-500 cursor-pointer hover:bg-slate-50" onClick={() => navigate('/analytics')}>
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-slate-400 text-[11px] font-bold uppercase">Stable</span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Avg Severity Score</p>
            <h3 className="text-4xl font-bold text-slate-900 mt-1">{summary?.avg_risk_score?.toFixed(1) || '0.0'}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-2">Within target range (&lt; 40.0)</p>
          </div>

          {/* Card: Today's Consults */}
          <div className="premium-card p-6 border-t-4 border-t-emerald-500 cursor-pointer hover:bg-slate-50" onClick={() => navigate('/consultations')}>
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-700 text-[11px] font-bold uppercase">Active</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total Consultations</p>
            <h3 className="text-4xl font-bold text-slate-900 mt-1">{summary?.total_consultations || 0}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-2">Historic clinical interactions</p>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Age vs Risk Chart */}
          <div className="lg:col-span-2 premium-card p-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">Age vs Cardiovascular Risk</h4>
                <p className="text-sm text-slate-500 font-medium">Average risk score by age demographic</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-xs font-semibold text-slate-600">Avg Risk %</span>
                </div>
              </div>
            </div>

            <div className="relative h-[320px] w-full flex items-end justify-around pb-6 pt-10">
               {/* Background grid lines */}
               <div className="absolute inset-0 z-0 flex flex-col justify-between pb-6 pt-10">
                 <div className="border-t border-slate-200 border-dashed w-full h-0"></div>
                 <div className="border-t border-slate-200 border-dashed w-full h-0"></div>
                 <div className="border-t border-slate-200 border-dashed w-full h-0"></div>
                 <div className="border-t border-slate-200 border-dashed w-full h-0"></div>
                 <div className="border-t border-slate-200 w-full h-0"></div>
               </div>
               
               {/* Dynamic Bars */}
               {ageRisk?.map((bucket, idx) => (
                 <div key={idx} className="relative z-10 flex flex-col items-center justify-end h-full w-16 group">
                   <div className="text-[10px] font-bold text-slate-500 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     {bucket.avg_risk_score}%
                   </div>
                   <div 
                     className="w-full bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all duration-1000 shadow-sm"
                     style={{ height: `${bucket.avg_risk_score}%` }}
                   ></div>
                   <div className="absolute -bottom-8 text-[11px] font-bold text-slate-500 whitespace-nowrap">
                     {bucket.age_group}
                   </div>
                 </div>
               ))}
               {!ageRisk || ageRisk.length === 0 ? (
                 <div className="absolute inset-0 z-20 flex items-center justify-center">
                   <p className="text-slate-400 text-sm font-medium">No risk data available for this period.</p>
                 </div>
               ) : null}
            </div>
          </div>

          {/* Clinical Prevalence */}
          <div className="premium-card p-8 flex flex-col">
            <h4 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Clinical Prevalence</h4>
            <p className="text-sm text-slate-500 font-medium mb-8">Disease breakdown by population</p>
            
            {loading ? (
              <div className="space-y-8 flex-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-2 bg-slate-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-8 flex-1">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-700">Hypertension (HTN)</span>
                    <span className="text-sm font-bold text-[#1E6BA8]">{cohorts?.hypertension_pct?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1E6BA8] rounded-full transition-all duration-1000" style={{ width: `${cohorts?.hypertension_pct || 0}%`}}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-700">Type 2 Diabetes</span>
                    <span className="text-sm font-bold text-[#1E6BA8]">{cohorts?.diabetes_pct?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1E6BA8] rounded-full transition-all duration-1000" style={{ width: `${cohorts?.diabetes_pct || 0}%`}}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-700">Smoker History</span>
                    <span className="text-sm font-bold text-[#1E6BA8]">{cohorts?.smoker_pct?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1E6BA8] rounded-full transition-all duration-1000" style={{ width: `${cohorts?.smoker_pct || 0}%`}}></div>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={() => navigate('/analytics')}
              className="w-full py-3.5 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:border-[#1E6BA8]/20 hover:text-[#1E6BA8] hover:bg-blue-50 transition-all mt-8"
            >
              View Comprehensive Analytics
            </button>
          </div>
        </div>

        {/* Bottom Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* High Risk Registry Table */}
          <div className="premium-card overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">High Risk Registry</h4>
                <p className="text-xs text-slate-500 font-medium">Priority clinical monitoring required</p>
              </div>
              <button 
                onClick={() => navigate('/fhir-export')}
                className="text-[11px] font-bold text-[#1E6BA8] hover:bg-blue-50 px-4 py-2 rounded-lg transition-all uppercase tracking-widest"
              >
                Export Registry
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4 text-left">Patient</th>
                    <th className="px-6 py-4 text-left">Risk Metric</th>
                    <th className="px-6 py-4 text-left">Conditions</th>
                    <th className="px-6 py-4 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {highRisk?.map(patient => (
                    <tr key={patient.id} className="table-row-hover group cursor-pointer" onClick={() => navigate(`/patients/${patient.id}`)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 shrink-0">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.first_name}`} className="w-full h-full object-cover" alt={patient.first_name} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{patient.first_name} {patient.last_name}</p>
                            <p className="text-[11px] text-slate-500">{patient.gender === 'Male' ? 'M' : 'F'} • {patient.abha_number ? 'ABHA Verified' : 'No ABHA'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="w-24 h-[6px] bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full risk-bar-gradient-red rounded-full" style={{ width: `${Math.min(patient.risk_score, 100)}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-red-600">CRITICAL {patient.risk_score.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                           {patient.diabetes_status && <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-100">T2DM</span>}
                           {patient.hypertension_status && <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[9px] font-bold border border-red-100">HTN</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-[#1E6BA8] transition-colors ml-auto">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!highRisk || highRisk.length === 0) && (
                     <tr>
                       <td colSpan={4} className="px-6 py-8 text-center text-sm font-medium text-slate-400">No high risk patients found.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Consultations Timeline */}
          <div className="premium-card">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">Live Activity</h4>
                <p className="text-xs text-slate-500 font-medium">Real-time system audit monitoring</p>
              </div>
              <button 
                onClick={() => navigate('/audit-logs')}
                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#1E6BA8] transition-all"
              >
                <History className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 divide-y divide-slate-50">
              
              {recentLogs.map((log) => {
                // Determine icon and color based on action type
                let IconType = FileText;
                let colorClass = "bg-slate-100 text-slate-500 group-hover:bg-[#1E6BA8]";
                let badgeClass = "bg-slate-100 text-slate-500 border-slate-200";
                
                if (log.action.includes('SYMPTOM')) {
                  IconType = Stethoscope;
                  colorClass = "bg-emerald-50 text-emerald-600 group-hover:bg-[#1E6BA8]";
                  badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                } else if (log.action.includes('EXPORT')) {
                  IconType = Video;
                  colorClass = "bg-blue-50 text-[#1E6BA8] group-hover:bg-[#1E6BA8]";
                  badgeClass = "bg-blue-50 text-blue-700 border-blue-100";
                }

                return (
                  <div key={log.id} onClick={() => log.patient_id ? navigate(`/patients/${log.patient_id}`) : navigate('/audit-logs')} className="p-4 flex items-center justify-between hover:bg-slate-50/50 rounded-2xl transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:text-white shrink-0 ${colorClass}`}>
                        <IconType className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 truncate max-w-[200px]">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-[11px] text-slate-500 font-medium">Patient #{log.patient_id || 'Sys'} • {new Date(log.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold border truncate max-w-[100px] ${badgeClass}`}>
                      {log.performed_by.split(' ')[0].toUpperCase()}
                    </span>
                  </div>
                )
              })}

              {(!recentLogs || recentLogs.length === 0) && (
                <div className="p-8 text-center text-sm font-medium text-slate-400">
                  No recent activity found.
                </div>
              )}
              
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Activity className="text-slate-400 w-5 h-5" />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">MediBridge AI Clinical v2.4.0 • Enterprise Cloud</p>
          </div>
          <div className="flex items-center gap-8">
             <button className="text-[11px] font-bold text-slate-400 hover:text-[#1E6BA8] uppercase tracking-widest transition-all">Documentation</button>
             <button className="text-[11px] font-bold text-slate-400 hover:text-[#1E6BA8] uppercase tracking-widest transition-all">Privacy & Compliance</button>
             <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
               <ShieldCheck className="w-4 h-4" />
               SOC2 Type II Certified
             </div>
          </div>
        </footer>

      </div>
      
      <NewConsultationModal 
        isOpen={isConsultationModalOpen} 
        onClose={() => setIsConsultationModalOpen(false)}
        onSuccess={fetchData}
      />
    </>
  )
}
