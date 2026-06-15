import client from './client'

export const PatientService = {
  getPatients: (skip = 0, limit = 50) => 
    client.get('/api/patients/', { params: { skip, limit } }).then(res => res.data),
  
  getPatientById: (id) => 
    client.get(`/api/patients/${id}`).then(res => res.data),
  
  searchByAbha: (abha_number) => 
    client.get('/api/patients/search/abha', { params: { abha_number } }).then(res => res.data),

  createPatient: (data) => 
    client.post('/api/patients/', data).then(res => res.data),
}

export const AnalyticsService = {
  getSummary: (params = {}) => 
    client.get('/api/analytics/summary', { params }).then(res => res.data),
  
  getRiskDistribution: (params = {}) => 
    client.get('/api/analytics/risk-distribution', { params }).then(res => res.data),
  
  getVitalsAverages: (params = {}) => 
    client.get('/api/analytics/vitals-averages', { params }).then(res => res.data),
  
  getConditionCohorts: (params = {}) => 
    client.get('/api/analytics/condition-cohorts', { params }).then(res => res.data),
  
  getHighRiskPatients: (limit = 20, params = {}) => 
    client.get('/api/analytics/high-risk-patients', { params: { limit, ...params } }).then(res => res.data),
  
  getTopConditions: (limit = 10, params = {}) => 
    client.get('/api/analytics/top-conditions', { params: { limit, ...params } }).then(res => res.data),
  
  getAgeRiskBuckets: (params = {}) => 
    client.get('/api/analytics/age-risk-buckets', { params }).then(res => res.data),
}

export const ClinicalService = {
  submitSymptomCheck: (patient_id, symptoms) => 
    client.post('/api/clinical/symptom-check', { patient_id, symptoms }).then(res => res.data),
  
  getHistory: (patient_id) => 
    client.get(`/api/clinical/history/${patient_id}`).then(res => res.data),
    
  getAllConsultations: (skip = 0, limit = 50) =>
    client.get('/api/clinical/consultations', { params: { skip, limit } }).then(res => res.data),
}

export const FhirService = {
  getPatient: (id) => client.get(`/api/fhir/Patient/${id}`).then(res => res.data),
  getRiskScore: (id) => client.get(`/api/fhir/Observation/risk-score/${id}`).then(res => res.data),
  getEncounter: (id) => client.get(`/api/fhir/Encounter/${id}`).then(res => res.data),
  getCondition: (id) => client.get(`/api/fhir/Condition/${id}`).then(res => res.data),
  getBundle: (id) => client.get(`/api/fhir/Patient/${id}/bundle`).then(res => res.data),
}

export const AuditService = {
  getAuditLogs: (params) => 
    client.get('/api/audit/', { params }).then(res => res.data),
}
