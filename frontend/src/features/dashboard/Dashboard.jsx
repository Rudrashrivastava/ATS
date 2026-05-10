import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Database, Cpu, Plus, Star } from 'lucide-react';

export default function Dashboard({ token }) {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/resume/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(response.data);
      } catch (err) {
        console.error(err);
        setError('Market history synchronization failed.');
      }
    };
    fetchHistory();
  }, [token]);


  return (
    <div className="neural-container">
      <div className="dashboard-grid">
        {/* LEFT COLUMN: Main Dashboard */}
        <div>
          {/* STATS ROW */}
          <div className="stats-container">
            <div className="stat-card primary">
              <div className="stat-label">Global Analytics</div>
              <h2 style={{fontSize: '20px', marginBottom: '16px'}}>Neural Match</h2>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
                <div>
                  <div style={{fontSize: '12px', color: 'var(--primary)'}}>Avg. Accuracy</div>
                  <div style={{display: 'flex', alignItems: 'baseline'}}>
                    <span className="stat-value">94.8%</span>
                    <span className="stat-trend positive">+2.4%</span>
                  </div>
                </div>
                <Activity size={32} color="var(--primary)" style={{opacity: 0.5}} />
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '24px', flex: 1}}>
              <div className="stat-card" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div>
                  <div className="stat-label">Active Engines</div>
                  <div className="stat-value" style={{color: 'var(--secondary)'}}>12</div>
                </div>
                <Cpu size={24} color="var(--secondary)" />
              </div>
              <div className="stat-card" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <div>
                  <div className="stat-label">Processed</div>
                  <div className="stat-value">1.2k</div>
                </div>
                <Database size={24} color="var(--text-muted)" />
              </div>
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
            <h2>Active Postings</h2>
          </div>
          {error && <div style={{color: 'var(--error)', marginBottom: '16px', background: 'rgba(255, 23, 68, 0.1)', padding: '12px', borderRadius: '8px'}}>{error}</div>}
          
          <div className="jobs-grid">
            {jobs.length > 0 ? jobs.map(result => (
              <div key={result.id} className="glass-card job-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div style={{padding: '8px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '8px', display: 'inline-block', marginBottom: '12px'}}>
                      <Activity size={20} color="var(--primary)" />
                    </div>
                    <h3 style={{fontSize: '18px', marginBottom: '4px'}}>{result.primaryRole || 'General Profile'}</h3>
                    <div className="job-meta"><span>Scanned: {new Date(result.analysisDate).toLocaleDateString()}</span></div>
                  </div>
                  <div className="match-badge" style={{background: result.overallScore > 80 ? 'var(--primary-glow)' : 'rgba(255,255,255,0.1)'}}>
                    {result.overallScore > 80 ? 'OPTIMIZED' : 'NEEDS TWEAK'}
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: '24px', marginTop: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px'}}>
                  <div>
                    <div className="stat-value" style={{fontSize: '24px', color: 'var(--primary)'}}>{result.overallScore}%</div>
                    <div className="stat-label" style={{fontSize: '9px'}}>NEURAL SCORE</div>
                  </div>
                  <div style={{flex: 1}}>
                    <div className="stat-label" style={{fontSize: '9px', marginBottom: '4px'}}>TOP RECOMMENDATION</div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4', maxHeight: '32px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {result.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{textAlign: 'center', gridColumn: '1/-1', padding: '40px', opacity: 0.5}}>
                <Cpu size={48} style={{marginBottom: '16px'}} />
                <p>No historical trajectories detected. Start a new analysis.</p>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
            <h2>Recent Talent Feed</h2>
            <a href="#" style={{color: 'var(--primary)', fontSize: '14px', textDecoration: 'none'}}>View All</a>
          </div>
          
          <div className="talent-feed">
            {[
              {name: 'Elena Rodriguez', role: 'DevOps Engineer', time: '2m ago', score: '98%', img: 'E'},
              {name: 'Marcus Chen', role: 'Lead UX Designer', time: '14m ago', score: '85%', img: 'M'},
              {name: 'Sarah Jenkins', role: 'Product Manager', time: '1h ago', score: '91%', img: 'S'}
            ].map((talent, i) => (
              <div key={i} className="talent-item">
                <div className="talent-avatar">{talent.img}</div>
                <div>
                  <div style={{fontWeight: 600, fontSize: '15px'}}>{talent.name}</div>
                  <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>{talent.role} • {talent.time}</div>
                </div>
                <div style={{marginLeft: 'auto', textAlign: 'right'}}>
                  <div className="talent-score">{talent.score}</div>
                  <div style={{fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'}}>Match Rank</div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={{marginTop: '32px', textAlign: 'right'}}>
            <button className="btn-primary" style={{borderRadius: '50%', width: '56px', height: '56px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
              <Plus size={24} color="#000" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
