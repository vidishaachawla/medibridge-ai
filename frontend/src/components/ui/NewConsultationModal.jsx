import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PatientService, ClinicalService } from '../../api/services';

export default function NewConsultationModal({ isOpen, onClose, onSuccess }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setSelectedPatientId('');
      setSymptoms('');
      setError('');
      setSuccess(false);
      setLoading(true);
      // Fetch patients to populate dropdown
      PatientService.getPatients(0, 100)
        .then(data => {
          setPatients(data.items || data);
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load patients.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || symptoms.length < 10) {
      setError('Please select a patient and enter at least 10 characters of symptoms.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await ClinicalService.submitSymptomCheck(parseInt(selectedPatientId), symptoms);
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to submit consultation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">New Consultation</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500" />
              <p className="text-lg font-bold text-slate-900">Consultation Created</p>
              <p className="text-sm text-slate-500">Risk metrics and dashboards updated.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-sm font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-[#1E6BA8] focus:ring-1 focus:ring-[#1E6BA8] transition-all"
                >
                  <option value="" className="text-slate-500">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id} className="text-slate-900">{p.full_name || p.first_name + ' ' + p.last_name} (ID: {p.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Clinical Symptoms</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Enter detailed symptoms..."
                  className="w-full min-h-[120px] p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#1E6BA8] focus:ring-1 focus:ring-[#1E6BA8] transition-all resize-y"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1E6BA8] hover:bg-[#155a90] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Consultation
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
