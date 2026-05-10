import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Auth from './features/auth/Auth';
import Analyzer from './features/analyzer/Analyzer';
import ResumeFit from './features/analyzer/ResumeFit';
import Dashboard from './features/dashboard/Dashboard';
import CareerDetail from './features/analyzer/CareerDetail';
import GlobalEcosystem from './features/dashboard/GlobalEcosystem';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import { LogOut, LayoutDashboard, Search, Zap, Activity } from 'lucide-react';

import { useAuth } from './features/auth/hooks/useAuth';

function App() {
  const { token, user, loading, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/auth';
  };

  return (
    <Router>
      <div className="app-container" style={{minHeight: '100vh', padding: '24px'}}>
        
        {/* 1. PERMANENT NAV: SHOWS INSTANTLY IF TOKEN EXISTS */}
        {token && (
          <nav className="navbar no-print animate-fade-in" style={{position: 'sticky', top: '0', zIndex: '2000', boxShadow: '0 0 20px rgba(0, 229, 255, 0.1)', background: '#1a1d27'}}>
            <Link to="/" className="nav-brand" style={{textDecoration: 'none'}}>
              <Zap size={24} color="var(--primary)" />
              <span>ATS INTELLIGENCE</span>
            </Link>
            
            <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
              <Link to="/" style={{color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', letterSpacing: '1px'}}>
                <LayoutDashboard size={18} color="var(--primary)" />
                DASHBOARD
              </Link>
              <Link to="/analyzer" style={{color: 'var(--text-main)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', letterSpacing: '1px'}}>
                <Search size={18} color="var(--primary)" />
                NEW SCAN
              </Link>
              <div style={{height: '24px', width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 10px'}}></div>
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontSize: '12px', fontWeight: 'bold', color: '#fff'}}>{user?.name || 'SYNCING...'}</div>
                  <div style={{fontSize: '9px', color: 'var(--primary)', letterSpacing: '1px'}}>OPERATOR</div>
                </div>
                <button 
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.2)',
                    color: '#ff1744', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </nav>
        )}

        <div className="main-content">
          {/* 2. LOADING GUARD: ONLY APPLIES TO CONTENT, NOT THE NAV */}
          {loading && token ? (
            <div style={{height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'}}>
              <Activity size={48} className="pulse-slow" />
              <p style={{marginTop: '24px', letterSpacing: '4px', fontSize: '12px', fontWeight: 'bold'}}>RE-ESTABLISHING NEURAL LINK...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analyzer" element={<ProtectedRoute><Analyzer token={token} /></ProtectedRoute>} />
              <Route path="/yourresumefit" element={<ProtectedRoute><ResumeFit token={token} /></ProtectedRoute>} />
              <Route path="/details" element={<ProtectedRoute><CareerDetail token={token} /></ProtectedRoute>} />
              <Route path="/usersuse" element={<ProtectedRoute><GlobalEcosystem token={token} /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .pulse-slow { animation: pulse 3s infinite ease-in-out; }
        @keyframes pulse { 0%, 100% { opacity: 0.4; transform: scale(0.95); } 50% { opacity: 1; transform: scale(1.05); } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </Router>
  );
}

export default App;
