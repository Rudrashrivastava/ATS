import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Briefcase, TrendingUp, Zap, ShieldCheck, 
  ArrowLeft, ArrowRight, Globe, MapPin, Loader2, AlertCircle
} from 'lucide-react';

export default function ResumeFit() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // 1. SELF-HEALING HYDRATION: Prevents white screen if sessionStorage is corrupted
  const [analysisData, setAnalysisData] = useState(() => {
    try {
      if (location.state?.analysisData) {
        sessionStorage.setItem('active_trajectory', JSON.stringify(location.state.analysisData));
        return location.state.analysisData;
      }
      const saved = sessionStorage.getItem('active_trajectory');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Neural Hydration Failed - Resetting Session", e);
      sessionStorage.removeItem('active_trajectory');
      return null;
    }
  });

  const query = analysisData?.primaryRole || 'Technology Roles';

  const [jobs, setJobs] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agentEvaluating, setAgentEvaluating] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!analysisData || !token) {
        setLoading(false);
        return;
      }

      const persistentId = analysisData.id || analysisData.fileId || 'default';
      const cacheKey = `neural_sync_${persistentId}`;
      
      // 1. NEURAL MEMORY LOCK: If we have it, USE IT and STOP.
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { jobs: cJobs, ai: cAi } = JSON.parse(cached);
          if (cJobs && cJobs.length > 0) {
            setJobs(cJobs);
            setAiAnalysis(cAi || analysisData);
            setLoading(false);
            return; // EXIT EARLY - NO FLICKER
          }
        }
      } catch (e) { console.warn("Cache recovery failed", e); }

      // 2. Only if no cache, then we show loading and fetch
      setLoading(true);
      try {
        let recommendations = analysisData.marketRecommendations || analysisData;
        if (!analysisData.marketRecommendations && !analysisData.roadmap) {
          const aiRes = await axios.post('/api/market/recommendations', analysisData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          recommendations = aiRes.data;
        }
        setAiAnalysis(recommendations);

        let rawMarketJobs = [];
        try {
          const marketRes = await axios.get(`/api/jobs/suggestions?query=${encodeURIComponent(query)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          rawMarketJobs = marketRes.data || [];
        } catch (mErr) { console.error("Market search failed", mErr); }

        setAgentEvaluating(true);
        const evalRes = await axios.post('/api/market/evaluate', {
          marketJobs: rawMarketJobs,
          analysisData: analysisData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let raw = evalRes.data;
        let parsedData = {};
        
        try {
          if (typeof raw === 'string') {
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsedData = JSON.parse(jsonMatch[0]);
          } else {
            parsedData = raw;
          }
        } catch (pErr) { console.error("JSON Parse failed", pErr); }

        const evaluatedJobs = parsedData.opportunities || [];
        setJobs(evaluatedJobs);
        
        const enrichedAi = { 
          ...(recommendations || {}), 
          ...(parsedData || {}) 
        };
        setAiAnalysis(enrichedAi);
        
        localStorage.setItem(cacheKey, JSON.stringify({ 
          jobs: evaluatedJobs, 
          ai: enrichedAi
        }));

      } catch (err) {
        console.error('Global failure', err);
        setApiError("Neural Link unstable. Using local nodes.");
      } finally {
        setLoading(false);
        setAgentEvaluating(false);
      }
    };

    fetchData();
  }, [analysisData, token, query]);

  if (loading) return (
    <div className="neural-container flex-center" style={{height: '80vh', background: '#0a0b10'}}>
      <div style={{textAlign: 'center'}}>
        <Loader2 className="spinning" size={48} color="var(--primary)" />
        <p className="neon-text" style={{marginTop: '20px', letterSpacing: '4px'}}>SYNCHRONIZING NEURAL NODES...</p>
      </div>
    </div>
  );

  if (!analysisData) return (
    <div className="neural-container flex-center" style={{height: '80vh', background: '#0a0b10'}}>
      <div className="glass-card" style={{padding: '60px', textAlign: 'center'}}>
        <AlertCircle size={64} color="var(--secondary)" style={{marginBottom: '20px'}} />
        <h2 className="text-glow-secondary">No Active Trajectory</h2>
        <p style={{margin: '20px 0'}}>Please upload a resume to begin neural synchronization.</p>
        <Link to="/analyzer" className="btn-primary">GO TO ANALYZER</Link>
      </div>
    </div>
  );

  return (
    <div className="neural-container animate-fade-in" style={{minHeight: '100vh', background: '#0a0b10'}}>
      
      {/* NEURAL STEP NAVIGATOR */}
      <div className="no-print" style={{display: 'flex', justifyContent: 'center', marginBottom: '40px', gap: '8px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5, cursor: 'pointer'}} onClick={() => navigate('/analyzer')}>
          <div style={{width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'}}>01</div>
          <span style={{fontSize: '11px', letterSpacing: '1px'}}>UPLOAD</span>
        </div>
        <div style={{width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)', alignSelf: 'center'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'}}>02</div>
          <span style={{fontSize: '11px', letterSpacing: '1px', color: 'var(--primary)', fontWeight: 'bold', cursor: 'default'}}>MARKET SYNC</span>
        </div>
        <div style={{width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)', alignSelf: 'center'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', opacity: jobs.length > 0 ? 0.5 : 0.3, cursor: jobs.length > 0 ? 'pointer' : 'not-allowed'}} onClick={() => jobs.length > 0 && navigate('/details', { state: { job: jobs[0], aiAnalysis } })}>
          <div style={{width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'}}>03</div>
          <span style={{fontSize: '11px', letterSpacing: '1px'}}>DOSSIER</span>
        </div>
      </div>

      <div style={{marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <Link to="/analyzer" className="btn-secondary" style={{padding: '8px 12px'}}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-glow-primary" style={{fontSize: '28px'}}>Neural Market Synchronization</h1>
            <p className="text-muted" style={{fontSize: '12px', letterSpacing: '2px'}}>TARGETING: {query.toUpperCase()}</p>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          {jobs.length > 0 && (
            <button 
              onClick={() => navigate('/details', { state: { job: jobs[0], aiAnalysis } })}
              className="btn-secondary animate-pulse" 
              style={{padding: '8px 12px', borderColor: 'var(--primary)', color: 'var(--primary)'}}
            >
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>

      {apiError && <div className="error-card" style={{marginBottom: '20px'}}>{apiError}</div>}

      <div className="dashboard-grid">
        <section className="glass-card" style={{minHeight: '500px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <Briefcase color="var(--primary)" size={24} />
              <h2 style={{fontSize: '18px', letterSpacing: '1px'}}>AGENT-VERIFIED OPPORTUNITIES</h2>
            </div>
            {agentEvaluating && <Zap className="spinning" size={18} color="var(--primary)" />}
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {jobs.length > 0 ? jobs.map((job, i) => (
              <div key={i} className="glass-card animate-slide-up" style={{
                padding: '20px', 
                borderLeft: '4px solid var(--primary)',
                background: 'rgba(255,255,255,0.02)',
                transition: 'transform 0.3s ease'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                  <div>
                    <h3 style={{fontSize: '18px', color: '#fff', marginBottom: '4px'}}>{job.title}</h3>
                    <div style={{display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)'}}>
                      <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><Globe size={14} /> {job.company}</span>
                      <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><MapPin size={14} /> {job.location}</span>
                    </div>
                  </div>
                  <div style={{background: 'rgba(0, 229, 255, 0.1)', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold'}}>
                    {job.salary?.Average || job.salary?.average || 'COMPETITIVE'}
                  </div>
                </div>
                <p style={{fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', marginBottom: '16px'}}>
                  {job.matchReason}
                </p>
                <button 
                  onClick={() => navigate('/details', { state: { job, aiAnalysis } })}
                  className="btn-primary" 
                  style={{width: '100%', fontSize: '12px', padding: '10px'}}
                >
                  VIEW FULL TRAJECTORY
                </button>
              </div>
            )) : (
              <div style={{padding: '100px 20px', textAlign: 'center', opacity: 0.5}}>
                <ShieldCheck size={48} style={{marginBottom: '16px'}} />
                <p>Searching for high-fidelity matches...</p>
              </div>
            )}
          </div>
        </section>

        <section className="glass-card">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
            <TrendingUp color="var(--secondary)" size={24} />
            <h2 style={{fontSize: '18px', letterSpacing: '1px'}}>GLOBAL CAREER TRAJECTORY</h2>
          </div>

          {aiAnalysis?.roadmap ? (
            <div className="roadmap-container animate-fade-in">
              {aiAnalysis.roadmap.map((step, i) => (
                <div key={i} className="roadmap-step" style={{display: 'flex', gap: '20px', marginBottom: '24px', position: 'relative'}}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'rgba(0, 229, 255, 0.1)', border: '1px solid var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)', zIndex: 2
                  }}>
                    {i + 1}
                  </div>
                  <div className="glass-card" style={{padding: '16px', flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'}}>
                    <h4 style={{fontSize: '14px', color: '#fff', fontWeight: '500'}}>{step}</h4>
                  </div>
                  {i < aiAnalysis.roadmap.length - 1 && (
                    <div style={{
                      position: 'absolute', left: '16px', top: '32px', 
                      width: '1px', height: '24px', background: 'linear-gradient(to bottom, var(--primary), transparent)'
                    }} />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{padding: '100px 40px', textAlign: 'center', opacity: 0.5}}>
              <Zap size={32} style={{marginBottom: '16px'}} className="animate-pulse" />
              <p className="neon-text" style={{fontSize: '12px', letterSpacing: '2px'}}>SYNTHESIZING CAREER NODES...</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
