import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Activity, Cpu, Database, Globe, ArrowRight, 
  TrendingDown, Zap, Users, Shield, Target
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [userName, setUserName] = useState('User');
  
  // INSTANT NEURAL HYDRATION FROM PERSISTENT MEMORY
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('neural_stats');
    return savedStats ? JSON.parse(savedStats) : {
      avgMatch: 46.4,
      activeEngines: 8,
      totalProcessed: 0,
      reach: 60
    };
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      // 1. SYNC REGISTERED IDENTITY
      try {
        const userRes = await axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserName(userRes.data?.name || 'User');
      } catch (e) {
        setUserName('Rudra'); 
      }

      // 2. FETCH NEURAL HISTORY
      try {
        const response = await axios.get('/api/resume/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data || [];
        setHistory(data);
        
        if (data.length > 0) {
          const totalScore = data.reduce((acc, curr) => acc + (Number(curr.overallScore) || 0), 0);
          const calculatedAvg = Math.round((totalScore / data.length) * 10) / 10;
          
          const uniqueRoles = [...new Set(data.map(item => item.primaryRole))].length;
          
          const updatedStats = {
            avgMatch: calculatedAvg > 0 ? calculatedAvg : 46.4,
            totalProcessed: data.length,
            activeEngines: uniqueRoles > 0 ? uniqueRoles : 8,
            reach: 60
          };
          
          setStats(updatedStats);
          // SAVE TO PERSISTENT MEMORY
          localStorage.setItem('neural_stats', JSON.stringify(updatedStats));
        }
      } catch (err) {
        console.error("Dashboard Sync Failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="dashboard-layout animate-fade-in custom-scroll">
      <div className="dashboard-main-content">
        
        {/* TOP ANALYTICS ROW */}
        <div className="analytics-row" style={{display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '40px'}}>
          
          <div className="glass-card analytics-card" style={{padding: '30px', borderLeft: '2px solid var(--primary)', position: 'relative'}}>
             <div className="stat-label" style={{color: 'var(--primary)', fontSize: '11px', letterSpacing: '2px', marginBottom: '8px'}}>GLOBAL ANALYTICS</div>
             <h2 style={{fontSize: '32px', marginBottom: '20px', color: '#fff'}}>Neural Match</h2>
             
             <div style={{display: 'flex', alignItems: 'flex-end', gap: '15px'}}>
                <div>
                   <div style={{fontSize: '14px', color: 'var(--primary)', opacity: 0.7}}>Avg. Accuracy</div>
                   <div style={{fontSize: '52px', fontWeight: 'bold', lineHeight: '1'}}>{stats.avgMatch}%</div>
                </div>
                <div style={{color: '#ff1744', fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                   <TrendingDown size={18} /> -36.7%
                </div>
             </div>
             
             <div style={{marginTop: '20px', fontSize: '12px', letterSpacing: '1px'}}>
                <span style={{color: 'var(--text-muted)'}}>Reach: {stats.reach} </span>
                <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>OPTIMIZED</span>
             </div>

             <Activity style={{position: 'absolute', right: '30px', bottom: '30px', opacity: 0.3}} size={64} className="pulse-slow" color="var(--primary)" />
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
             <div className="glass-card" style={{padding: '24px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                   <div className="stat-label" style={{color: 'var(--secondary)', fontSize: '11px', letterSpacing: '2px'}}>ACTIVE ENGINES</div>
                   <div style={{fontSize: '48px', fontWeight: 'bold', color: 'var(--secondary)'}}>{stats.activeEngines}</div>
                </div>
                <Cpu size={32} color="var(--secondary)" />
             </div>
             <div className="glass-card" style={{padding: '24px', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                   <div className="stat-label" style={{color: 'var(--primary)', fontSize: '11px', letterSpacing: '2px'}}>PROCESSED</div>
                   <div style={{fontSize: '48px', fontWeight: 'bold'}}>{stats.totalProcessed}</div>
                </div>
                <Database size={32} color="var(--text-muted)" />
             </div>
          </div>
        </div>

        {/* PAST TRAJECTORIES SECTION */}
        <div className="past-trajectories">
          <h2 style={{fontSize: '32px', marginBottom: '30px'}}>Past Trajectories</h2>
          
          <div className="trajectories-grid custom-scroll" style={{maxHeight: '600px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', paddingRight: '15px'}}>
            {history.map((item, i) => (
              <div key={item.id} className="trajectory-card glass-card hover-lift" style={{padding: '28px', border: '1px solid rgba(255,255,255,0.03)', position: 'relative'}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                    <div style={{width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(0, 229, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                       <Activity size={20} color="var(--primary)" />
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end'}}>
                      <div style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--secondary)', background: 'rgba(213, 0, 249, 0.1)', padding: '4px 12px', borderRadius: '4px', letterSpacing: '1px'}}>
                        {item.overallScore || 0}% <span style={{fontSize: '10px', opacity: 0.7}}>MATCH</span>
                      </div>
                      <div style={{fontSize: '10px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '4px', height: 'fit-content', letterSpacing: '1px', fontWeight: 'bold'}}>NEEDS TWEAK</div>
                    </div>
                 </div>
                 <h3 style={{fontSize: '24px', marginBottom: '12px', color: '#fff', lineHeight: '1.2'}}>{item.primaryRole || 'Career Target'}</h3>
                 <div style={{fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '1px'}}>Scanned: {new Date(item.analysisDate).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR - GLOBAL ECOSYSTEM */}
      <div className="ecosystem-sidebar glass-card custom-scroll" style={{width: '380px', padding: '30px', borderLeft: '1px solid rgba(255,255,255,0.05)'}}>
         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
            <h2 style={{fontSize: '28px'}}>Global Ecosystem</h2>
            <span onClick={() => navigate('/usersuse')} style={{color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold'}}>View All</span>
         </div>

         <div className="ecosystem-list" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {history.slice(0, 5).map((node, i) => (
              <div key={i} className="ecosystem-item glass-card animate-slide-up" style={{
                padding: '16px', display: 'flex', alignItems: 'center', gap: '15px', 
                background: 'rgba(255,255,255,0.02)', animationDelay: `${i * 100}ms`
              }}>
                 <div style={{
                    width: '45px', height: '45px', borderRadius: '12px', 
                    border: '1px solid rgba(0, 229, 255, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', color: 'var(--primary)', fontWeight: 'bold'
                 }}>{userName.charAt(0).toUpperCase()}</div>
                 <div style={{flex: 1}}>
                    <div style={{fontSize: '15px', color: '#fff'}}>{userName}</div>
                    <div style={{fontSize: '12px', color: 'var(--primary)', fontWeight: '500'}}>{node.primaryRole || 'Analyzing...'}</div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>{getTimeAgo(node.analysisDate)}</div>
                 </div>
                 <div style={{textAlign: 'right'}}>
                    <div style={{fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)', textShadow: '0 0 10px rgba(0, 229, 255, 0.3)'}}>
                      {node.overallScore || 0}%
                    </div>
                    <div style={{fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px'}}>MATCH</div>
                 </div>
              </div>
            ))}
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-layout { display: flex; gap: 40px; padding: 40px; min-height: 100vh; color: #fff; }
        .dashboard-main-content { flex: 1; }
        .ecosystem-sidebar { height: fit-content; max-height: calc(100vh - 80px); overflow-y: auto; position: sticky; top: 40px; }
        .pulse-slow { animation: pulse 4s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
        
        .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.01); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, var(--primary), var(--secondary)); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: var(--primary); }
        
        .trajectories-grid::-webkit-scrollbar { width: 4px; }
      `}} />
    </div>
  );
}
