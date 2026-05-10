import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Auth from './features/auth/Auth';
import Analyzer from './features/analyzer/Analyzer';
import ResumeFit from './features/analyzer/ResumeFit';
import Dashboard from './features/dashboard/Dashboard';
import CareerDetail from './features/analyzer/CareerDetail';
import GlobalEcosystem from './features/dashboard/GlobalEcosystem';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import { LogOut, LayoutDashboard, Search, Zap } from 'lucide-react';

import { useAuth } from './features/auth/hooks/useAuth';

function App() {
  const { user, loading } = useAuth();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/auth';
  };

  if (loading) {
    return (
      <div className="neural-container flex-center" style={{height: '100vh', background: '#0a0a12', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="pulse-loader">SYNCING NEURAL NODES...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container" style={{minHeight: '100vh', padding: '24px'}}>
        
        {/* NEURAL NAVIGATION - ONLY SHOW FOR AUTHENTICATED USERS */}
        {token && (
          <nav className="navbar no-print">
            <Link to="/" className="nav-brand" style={{textDecoration: 'none'}}>
              <Zap size={24} />
              <span>ATS INTELLIGENCE</span>
            </Link>
            
            <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
              <Link to="/" style={{color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', letterSpacing: '1px'}}>
                <LayoutDashboard size={18} color="var(--primary)" />
                DASHBOARD
              </Link>
              <Link to="/analyzer" style={{color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', letterSpacing: '1px'}}>
                <Search size={18} color="var(--primary)" />
                NEW SCAN
              </Link>
              <button 
                onClick={handleLogout}
                style={{
                  background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.2)',
                  color: '#ff1744', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold'
                }}
              >
                <LogOut size={16} />
                LOGOUT
              </button>
            </div>
          </nav>
        )}

        <div className="main-content">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />

            {/* PROTECTED ROUTES */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/analyzer" element={<ProtectedRoute><Analyzer token={token} /></ProtectedRoute>} />
            <Route path="/yourresumefit" element={<ProtectedRoute><ResumeFit token={token} /></ProtectedRoute>} />
            <Route path="/details" element={<ProtectedRoute><CareerDetail token={token} /></ProtectedRoute>} />
            <Route path="/usersuse" element={<ProtectedRoute><GlobalEcosystem token={token} /></ProtectedRoute>} />
            
            {/* GLOBAL REDIRECT */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
