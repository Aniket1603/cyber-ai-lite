import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'

// Pages
import Login           from './pages/Login'
import Register        from './pages/Register'
import Dashboard       from './pages/Dashboard'
import URLScanner      from './pages/URLScanner'
import EmailAnalyzer   from './pages/EmailAnalyzer'
import DeepfakeDetector from './pages/DeepfakeDetector'
import Reports         from './pages/Reports'

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1b2e',
              color: '#fff',
              border: '1px solid #0f2544',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#00ff88', secondary: '#0d1b2e' } },
            error:   { iconTheme: { primary: '#ff003c', secondary: '#0d1b2e' } },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/"            element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/url-scanner" element={<URLScanner />} />
            <Route path="/email"       element={<EmailAnalyzer />} />
            <Route path="/deepfake"    element={<DeepfakeDetector />} />
            <Route path="/reports"     element={<Reports />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
