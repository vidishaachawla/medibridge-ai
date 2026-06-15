import React, { useState, useEffect } from 'react';
import { Calendar, FileText, ChevronRight, Activity, Search } from 'lucide-react';
import { ClinicalService } from '../api/services';
import { Link } from 'react-router-dom';

export default function ConsultationHistory() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchConsultations();
  }, [page]);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const data = await ClinicalService.getAllConsultations(page * 50, 50);
      setConsultations(data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = consultations.filter(c => 
    c.symptoms.toLowerCase().includes(search.toLowerCase()) || 
    (c.icd10_description && c.icd10_description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">Global Consultation History</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Review all clinical interactions across the patient population</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search symptoms or conditions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#1E6BA8] focus:ring-1 focus:ring-[#1E6BA8]"
            />
          </div>
          <div className="flex gap-2">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              disabled={consultations.length < 50}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading consultations...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Patient ID</th>
                  <th className="px-6 py-4 text-left">Primary Symptoms</th>
                  <th className="px-6 py-4 text-left">Diagnosis Code</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(c.consultation_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[#1E6BA8]">
                      <Link to={`/patients/${c.patient_id}`}>#{c.patient_id}</Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">
                      {c.symptoms}
                    </td>
                    <td className="px-6 py-4">
                      {c.icd10_code ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800">{c.icd10_code}</span>
                          <span className="text-[11px] text-slate-500">{c.icd10_description}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/patients/${c.patient_id}`} className="inline-flex items-center gap-1 text-sm font-bold text-[#1E6BA8] hover:text-blue-700">
                        View <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No consultations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
