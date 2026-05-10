import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowLeft, Globe, Activity, ShieldCheck, Users, Filter, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function GlobalEcosystem({ token }) {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Java', 'Python', 'React', 'Full-Stack', 'Security', 'Data'];

  useEffect(() => {
    const fetchGlobalHistory = async () => {
      try {
        const response = await axios.get('/api/stats/global-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data);
        setFilteredHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch global history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalHistory();
  }, [token]);

  useEffect(() => {
    let result = history;

    // Filter by Score
    if (scoreFilter > 0) {
      result = result.filter(item => item.score >= scoreFilter);
    }

    // Filter by Category (Keyword in role)
    if (categoryFilter !== 'All') {
      result = result.filter(item => 
        item.role && item.role.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    // Filter by Search (Normalized for fuzzy matching)
    if (search) {
      const normalizedSearch = search.toLowerCase().replace(/\s+/g, '');
      result = result.filter(item => {
        const normalizedName = item.name.toLowerCase().replace(/\s+/g, '');
        const normalizedRole = (item.role || '').toLowerCase().replace(/\s+/g, '');
        
        return normalizedName.includes(normalizedSearch) || 
               normalizedRole.includes(normalizedSearch) ||
               // Handle common abbreviations
               (normalizedSearch === 'juniorit' && normalizedRole.includes('juniorit'));
      });
    }

    setFilteredHistory(result);
  }, [search, scoreFilter, categoryFilter, history]);

  const getRelativeTime = (date) => {
    if (!date) return 'Just now';
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
      <div style={{marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <Link to="/" className="btn-secondary" style={{padding: '10px'}}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-glow-primary">Global Talent Ecosystem</h1>
            <p className="text-muted">Filtering all active neural nodes across the market.</p>
          </div>
        </div>
        
        <div className="glass-card" style={{padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px'}}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search candidate or role..." 
            className="glass-input" 
            style={{border: 'none', background: 'none', width: '200px', padding: '8px'}}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={{display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap'}}>
        <div className="glass-card" style={{padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', flex: 1}}>
          <Filter size={18} color="var(--primary)" />
          <span style={{fontSize: '12px', color: 'var(--text-muted)', marginRight: '8px'}}>THRESHOLD:</span>
          {[0, 50, 60, 70, 80, 90].map(val => (
            <button 
              key={val}
              onClick={() => setScoreFilter(val)}
              className={`filter-btn ${scoreFilter === val ? 'active' : ''}`}
              style={{
                background: scoreFilter === val ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: scoreFilter === val ? '#000' : '#fff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: 'bold',
                minWidth: '45px'
              }}
            >
              {val === 0 ? 'ALL' : `${val}%+`}
            </button>
          ))}
        </div>

        <div className="glass-card" style={{padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', flex: 2}}>
          <Globe size={18} color="var(--secondary)" />
          <span style={{fontSize: '12px', color: 'var(--text-muted)', marginRight: '8px'}}>CATEGORY:</span>
          <div style={{display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px'}}>
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                style={{
                  background: categoryFilter === cat ? 'var(--secondary)' : 'rgba(255,255,255,0.05)',
                  color: categoryFilter === cat ? '#000' : '#fff',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '100px'}}>
          <Activity className="neon-icon spinning" size={48} />
          <p style={{marginTop: '24px', color: 'var(--primary)'}}>RECONSTRUCTING DATA NODES...</p>
        </div>
      ) : (
        <div className="glass-card" style={{padding: 0, overflow: 'hidden'}}>
          <div style={{
            display: 'grid', 
            gridTemplateColumns: '80px 2fr 2fr 1fr 1fr', 
            padding: '20px 32px', 
            background: 'rgba(255,255,255,0.05)', 
            borderBottom: '1px solid var(--glass-border)',
            fontSize: '11px',
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: 'bold'
          }}>
            <span>NODE</span>
            <span>CANDIDATE</span>
            <span>IDENTIFIED ROLE</span>
            <span>NEURAL SCORE</span>
            <span>TIME SYNC</span>
          </div>

          <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
            {filteredHistory.length > 0 ? filteredHistory.map((item, idx) => (
              <div key={idx} className="ecosystem-row" style={{
                display: 'grid', 
                gridTemplateColumns: '80px 2fr 2fr 1fr 1fr', 
                padding: '20px 32px', 
                borderBottom: '1px solid var(--glass-border)',
                alignItems: 'center',
                transition: 'background 0.3s',
                background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
              }}>
                <div className="talent-avatar" style={{
                  width: '36px', 
                  height: '36px', 
                  fontSize: '14px', 
                  background: 'rgba(0, 229, 255, 0.1)',
                  border: '1px solid rgba(0, 229, 255, 0.2)'
                }}>
                  {item.name[0]}
                </div>
                <div style={{fontWeight: 600, color: '#fff', fontSize: '15px'}}>{item.name}</div>
                <div style={{color: 'var(--text-muted)', fontSize: '13px'}}>{item.role || 'Career Analyst'}</div>
                <div>
                  <span style={{
                    color: item.score > 80 ? 'var(--primary)' : 'var(--secondary)', 
                    fontWeight: '800',
                    fontSize: '18px',
                    textShadow: `0 0 10px ${item.score > 80 ? 'var(--primary-glow)' : 'var(--secondary-glow)'}`
                  }}>
                    {item.score}%
                  </span>
                </div>
                <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>
                  {getRelativeTime(item.date)}
                </div>
              </div>
            )) : (
              <div style={{padding: '60px', textAlign: 'center', opacity: 0.5}}>
                <Activity size={48} style={{marginBottom: '16px'}} />
                <p>No nodes match current filter parameters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{marginTop: '32px', display: 'flex', gap: '24px', justifyContent: 'center'}}>
        <div className="glass-card" style={{padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px'}}>
          <Users size={18} color="var(--primary)" />
          <span style={{letterSpacing: '1px'}}>{filteredHistory.length} MATCHING NODES</span>
        </div>
        <div className="glass-card" style={{padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px'}}>
          <ShieldCheck size={18} color="var(--secondary)" />
          <span style={{letterSpacing: '1px'}}>SECURE NEURAL FILTERING</span>
        </div>
      </div>
    </div>
  );
}
