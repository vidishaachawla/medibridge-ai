import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import Dashboard from './pages/Dashboard'
import PatientSearch from './pages/PatientSearch'
import PatientDetails from './pages/PatientDetails'
import AIAssistant from './pages/AIAssistant'
import Analytics from './pages/Analytics'
import FHIRExport from './pages/FHIRExport'
import AuditLogs from './pages/AuditLogs'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Main app layout wraps all authenticated pages */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<PatientSearch />} />
        <Route path="/patients/:patientId" element={<PatientDetails />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/fhir-export" element={<FHIRExport />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
