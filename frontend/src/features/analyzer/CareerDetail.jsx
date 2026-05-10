import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, Briefcase, Globe, 
  MapPin, Rocket, ShieldCheck, Zap 
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CareerDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const trajectory = state?.trajectory;
  
  const [steps, setSteps] = useState([]);
  const [opportunities, setOpportunities] = useState([]);

  useEffect(() => {
    if (trajectory) {
      try {
        // PARSE REAL AI RESPONSE FROM NEURAL REPOSITORY
        const parsedSteps = trajectory.trajectoryJson ? JSON.parse(trajectory.trajectoryJson) : [];
        const parsedOpps = trajectory.opportunitiesJson ? JSON.parse(trajectory.opportunitiesJson) : [];
        
        setSteps(parsedSteps);
        setOpportunities(parsedOpps);
      } catch (e) {
        console.error("Neural Decoding Failed", e);
      }
    }
  }, [trajectory]);

  if (!trajectory) return <div className="p-10">Initializing neural data...</div>;

  return (
    <div className="career-detail-container animate-fade-in custom-scroll">
      
      {/* HEADER SECTION */}
      <div style={{marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '24px'}}>
        <button onClick={() => navigate('/')} className="glass-card hover-lift" style={{padding: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)'}}>
          <ArrowLeft size={20} color="var(--primary)" />
        </button>
        <div>
          <h1 style={{fontSize: '32px', color: '#fff', fontWeight: 'bold'}}>{trajectory.primaryRole || 'Career Node'}</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '1px'}}>IDENTIFIED BY AI STRATEGIST</p>
        </div>
      </div>

      <div className="detail-grid" style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px'}}>
        
        {/* AGENT-VERIFIED OPPORTUNITIES (REAL AI DATA) */}
        <div className="glass-card" style={{padding: '40px', background: 'rgba(255,255,255,0.01)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px'}}>
            <Briefcase size={24} color="var(--primary)" />
            <h2 style={{fontSize: '24px', fontWeight: 'bold'}}>Agent-Verified Opportunities</h2>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {opportunities.length > 0 ? opportunities.map((opp, i) => (
              <div key={i} className="opp-card glass-card hover-lift" style={{padding: '30px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0, 229, 255, 0.1)', borderLeft: '4px solid var(--primary)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                  <h3 style={{fontSize: '20px', color: '#fff'}}>{opp.title}</h3>
                  <span className="badge-neural">COMPETITIVE</span>
                </div>
                <div style={{display: 'flex', gap: '20px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-muted)'}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><Globe size={14} /> {opp.company}</span>
                  <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><MapPin size={14} /> {opp.location}</span>
                </div>
                <p style={{fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6'}}>{opp.desc}</p>
                <button className="btn-primary" style={{marginTop: '24px', width: '100%', fontSize: '12px'}}>VIEW FULL TRAJECTORY</button>
              </div>
            )) : (
              <p style={{color: 'var(--text-muted)'}}>No specific opportunities identified for this node.</p>
            )}
          </div>
        </div>

        {/* GLOBAL CAREER TRAJECTORY (REAL AI STEPS) */}
        <div className="glass-card" style={{padding: '40px', background: 'rgba(255,255,255,0.01)'}}>
           <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px'}}>
              <Rocket size={24} color="var(--secondary)" />
              <h2 style={{fontSize: '24px', fontWeight: 'bold'}}>Global Career Trajectory</h2>
           </div>

           <div className="trajectory-stepper">
              {steps.length > 0 ? steps.map((step, i) => (
                <div key={i} style={{display: 'flex', gap: '24px', marginBottom: '32px', position: 'relative'}}>
                   {i < steps.length - 1 && <div style={{position: 'absolute', top: '40px', left: '19px', bottom: '-16px', width: '2px', background: 'linear-gradient(to bottom, var(--primary), transparent)'}}></div>}
                   <div style={{width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: 'var(--primary)', flexShrink: 0, background: 'rgba(0,229,255,0.05)'}}>
                      {i + 1}
                   </div>
                   <div className="glass-card" style={{padding: '20px', flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'}}>
                      <p style={{fontSize: '14px', lineHeight: '1.5', color: '#fff'}}>{step}</p>
                   </div>
                </div>
              )) : (
                <p style={{color: 'var(--text-muted)'}}>AI Strategist is still mapping your roadmap...</p>
              )}
           </div>

           <div style={{marginTop: '40px', padding: '24px', background: 'rgba(0, 229, 255, 0.05)', borderRadius: '16px', border: '1px solid var(--primary-glow)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                 <ShieldCheck size={20} color="var(--primary)" />
                 <span style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px'}}>NEURAL RECOMMENDATION</span>
              </div>
              <p style={{fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6'}}>{trajectory.recommendation}</p>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .career-detail-container { padding: 40px; min-height: 100vh; background: #0a0a12; color: #fff; }
        .opp-card:hover { border-color: var(--primary); box-shadow: 0 0 30px rgba(0, 229, 255, 0.1); }
        .badge-neural { background: rgba(0, 229, 255, 0.1); color: var(--primary); padding: 5px 12px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }
      `}} />
    </div>
  );
}
