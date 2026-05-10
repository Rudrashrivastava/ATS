import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, Briefcase, Globe, 
  MapPin, Rocket, ShieldCheck, Zap, Target
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CareerDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const trajectory = state?.trajectory;
  
  const [steps, setSteps] = useState([]);
  const [alignmentRoadmap, setAlignmentRoadmap] = useState([]);

  useEffect(() => {
    if (trajectory) {
      try {
        const parsedSteps = trajectory.trajectoryJson ? JSON.parse(trajectory.trajectoryJson) : [];
        const parsedOpps = trajectory.opportunitiesJson ? JSON.parse(trajectory.opportunitiesJson) : [];
        
        setSteps(parsedSteps);
        // Use opportunities data as the "Alignment Roadmap" for the specific JD
        setAlignmentRoadmap(parsedOpps);
      } catch (e) {
        console.error("Neural Decoding Failed", e);
      }
    }
  }, [trajectory]);

  if (!trajectory) return <div className="p-10">Initializing neural data...</div>;

  return (
    <div className="career-detail-container animate-fade-in custom-scroll">
      
      <div style={{marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '24px'}}>
        <button onClick={() => navigate('/')} className="glass-card hover-lift" style={{padding: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)'}}>
          <ArrowLeft size={20} color="var(--primary)" />
        </button>
        <div>
          <h1 style={{fontSize: '32px', color: '#fff', fontWeight: 'bold'}}>{trajectory.primaryRole || 'Career Node'}</h1>
          <p style={{color: 'var(--text-muted)', fontSize: '14px', letterSpacing: '2px'}}>AI STRATEGIST DOSSIER</p>
        </div>
      </div>

      <div className="detail-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px'}}>
        
        {/* REPLACED: JOB ALIGNMENT ROADMAP (INSTEAD OF OPPORTUNITIES) */}
        <div className="glass-card" style={{padding: '40px', background: 'rgba(255,255,255,0.01)', borderLeft: '4px solid var(--primary)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px'}}>
            <Target size={24} color="var(--primary)" />
            <h2 style={{fontSize: '24px', fontWeight: 'bold'}}>Job Alignment Roadmap</h2>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {alignmentRoadmap.length > 0 ? alignmentRoadmap.map((item, i) => (
              <div key={i} className="roadmap-node glass-card" style={{padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                   <div style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)'}}></div>
                   <h3 style={{fontSize: '16px', color: '#fff', fontWeight: 'bold'}}>{item.title}</h3>
                </div>
                <p style={{fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6'}}>{item.desc}</p>
              </div>
            )) : (
              <div style={{padding: '40px', textAlign: 'center', opacity: 0.5}}>
                <ShieldCheck size={48} style={{marginBottom: '16px'}} color="var(--primary)" />
                <p>Decoding alignment strategy...</p>
              </div>
            )}
          </div>

          <div style={{marginTop: '40px', padding: '32px', background: 'rgba(0, 229, 255, 0.05)', borderRadius: '16px', border: '1px solid var(--primary-glow)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                 <Zap size={20} color="var(--primary)" />
                 <span style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '2px'}}>STRATEGIC OVERVIEW</span>
              </div>
              <p style={{fontSize: '14px', color: '#fff', lineHeight: '1.6', fontWeight: '400'}}>
                {trajectory.recommendation?.replace(/\*\*/g, '')}
              </p>
          </div>
        </div>

        {/* GLOBAL CAREER TRAJECTORY */}
        <div className="glass-card" style={{padding: '40px', background: 'rgba(255,255,255,0.01)'}}>
           <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px'}}>
              <Rocket size={24} color="var(--secondary)" />
              <h2 style={{fontSize: '24px', fontWeight: 'bold'}}>Evolution Strategy</h2>
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
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .career-detail-container { padding: 40px; min-height: 100vh; background: #0a0a12; color: #fff; margin-top: 70px; }
        .roadmap-node:hover { border-color: var(--primary); transform: translateX(10px); }
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }
      `}} />
    </div>
  );
}
