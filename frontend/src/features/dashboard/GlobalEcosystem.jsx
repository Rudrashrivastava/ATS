import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Globe, Activity, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GlobalEcosystem({ token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalHistory = async () => {
      try {
        const response = await axios.get('/api/stats/global-history');

        setHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch global history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalHistory();
  }, [token]);

  const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <div className="neural-container animate-fade-in">
      <div style={{marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px'}}>
        <Link to="/dashboard" className="btn-secondary" style={{padding: '10px'}}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-glow-primary">Global Talent Ecosystem</h1>
          <p className="text-muted">Real-time neural trajectory feed from all active nodes.</p>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '100px'}}>
          <Activity className="neon-icon spinning" size={48} />
          <p style={{marginTop: '24px', color: 'var(--primary)'}}>FETCHING GLOBAL NODES...</p>
        </div>
      ) : (
        <div className="glass-card" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{
            display: 'grid', 
            gridTemplateColumns: '80px 2fr 2fr 1fr 1fr', 
            padding: '20px 32px', 
            background: 'rgba(255,255,255,0.05)', 
            borderBottom: '1px solid var(--glass-border)',
            fontSize: '12px',
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 'bold'
          }}>
            <span>NODE</span>
            <span>CANDIDATE</span>
            <span>IDENTIFIED ROLE</span>
            <span>NEURAL SCORE</span>
            <span>TIMESTAMP</span>
          </div>

          <div style={{maxHeight: '70vh', overflowY: 'auto'}}>
            {history.map((item, idx) => (
              <div key={idx} className="ecosystem-row" style={{
                display: 'grid', 
                gridTemplateColumns: '80px 2fr 2fr 1fr 1fr', 
                padding: '24px 32px', 
                borderBottom: '1px solid var(--glass-border)',
                alignItems: 'center',
                transition: 'background 0.3s'
              }}>
                <div className="talent-avatar" style={{width: '36px', height: '36px', fontSize: '14px'}}>
                  {item.name[0]}
                </div>
                <div style={{fontWeight: 600, color: '#fff'}}>{item.name}</div>
                <div style={{color: 'var(--text-muted)'}}>{item.role || 'General Analyst'}</div>
                <div>
                  <span style={{
                    color: item.score > 80 ? 'var(--primary)' : 'var(--secondary)', 
                    fontWeight: 'bold',
                    fontSize: '18px'
                  }}>
                    {item.score}%
                  </span>
                </div>
                <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>
                  {getRelativeTime(item.date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{marginTop: '40px', display: 'flex', gap: '24px', justifyContent: 'center'}}>
        <div className="glass-card" style={{padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <Users size={20} color="var(--primary)" />
          <span>{history.length} ACTIVE TALENT NODES</span>
        </div>
        <div className="glass-card" style={{padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <ShieldCheck size={20} color="var(--secondary)" />
          <span>ENCRYPTED NEURAL SYNC</span>
        </div>
      </div>
    </div>
  );
}
