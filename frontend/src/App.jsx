import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, Activity } from 'lucide-react';

import Auth from './features/auth/Auth';
import Dashboard from './features/dashboard/Dashboard';
import Analyzer from './features/analyzer/Analyzer';
import ResumeFit from './features/analyzer/ResumeFit';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <Router>
      <div className="app-container">
        {token && (
          <nav className="navbar">
            <div className="nav-brand">
              <Activity className="neon-icon" size={24} />
              ATS ANALYZER
            </div>
            <div style={{display: 'flex', gap: '16px'}}>
              <Link to="/" className="btn-secondary">Dashboard</Link>
              <Link to="/analyzer" className="btn-secondary">Neural ATS</Link>
              <button onClick={logout} className="btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '8px', borderStyle: 'dashed'}}>
                <LogOut size={16} /> Disconnect
              </button>
            </div>
          </nav>
        )}
        <div className="main-content">
          <Routes>
            <Route path="/auth" element={!token ? <Auth setToken={setToken} /> : <Navigate to="/" />} />
            <Route path="/" element={token ? <Dashboard token={token} /> : <Navigate to="/auth" />} />
            <Route path="/analyzer" element={token ? <Analyzer token={token} /> : <Navigate to="/auth" />} />
            <Route path="/yourresumefit" element={token ? <ResumeFit token={token} /> : <Navigate to="/auth" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
