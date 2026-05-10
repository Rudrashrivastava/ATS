import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Rocket, Briefcase, TrendingUp, CheckCircle2, 
  Zap, DollarSign, Target, Award, ShieldCheck, 
  BookOpen, Code2, Terminal, ExternalLink, Download
} from 'lucide-react';

export default function CareerDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;
  
  // 1. DEEP MEMORY RECOVERY: Recover AI data if refresh lost the state
  const [ai, setAi] = useState(() => {
    if (location.state?.aiAnalysis) return location.state.aiAnalysis;
    
    // Fallback: Check Neural Cache
    const activeData = JSON.parse(sessionStorage.getItem('active_trajectory') || '{}');
    const persistentId = activeData.id || activeData.fileId || 'default';
    const cached = localStorage.getItem(`neural_sync_${persistentId}`);
    if (cached) {
      return JSON.parse(cached).ai || {};
    }
    return {};
  });

  if (!job) {
    return (
      <div className="neural-container flex-center" style={{height: '80vh'}}>
        <div style={{textAlign: 'center'}}>
          <h2 className="neon-text">Mission Data Lost</h2>
          <Link to="/analyzer" className="btn-primary" style={{marginTop: '20px', display: 'inline-block'}}>RE-INITIALIZE SCAN</Link>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    window.print();
  };

  const renderResource = (text) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => (
      urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="neon-link">
          {part.replace('https://', '').replace('www.', '').substring(0, 30)}... <ExternalLink size={12} style={{display: 'inline'}} />
        </a>
      ) : <span key={i}>{part}</span>
    ));
  };

  return (
    <div className="neural-container animate-fade-in" style={{maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px'}}>
      
      {/* NEURAL STEP NAVIGATOR */}
      <div className="no-print" style={{display: 'flex', justifyContent: 'center', marginBottom: '40px', gap: '8px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5}} onClick={() => navigate('/analyzer')}>
          <div style={{width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer'}}>01</div>
          <span style={{fontSize: '11px', letterSpacing: '1px'}}>UPLOAD</span>
        </div>
        <div style={{width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)', alignSelf: 'center'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5}} onClick={() => navigate(-1)}>
          <div style={{width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', cursor: 'pointer'}}>02</div>
          <span style={{fontSize: '11px', letterSpacing: '1px'}}>MARKET SYNC</span>
        </div>
        <div style={{width: '40px', height: '1px', background: 'rgba(255,255,255,0.2)', alignSelf: 'center'}} />
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'}}>03</div>
          <span style={{fontSize: '11px', letterSpacing: '1px', color: 'var(--secondary)', fontWeight: 'bold'}}>DOSSIER</span>
        </div>
      </div>

      {/* UI HEADER */}
      <div className="no-print" style={{marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
          <button onClick={() => navigate(-1)} className="btn-secondary" style={{padding: '12px', borderRadius: '50%'}}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-glow-primary" style={{fontSize: '32px', marginBottom: '4px'}}>{job.title}</h1>
            <p className="text-muted" style={{fontSize: '18px'}}>{job.company} • <span className="neon-text">{job.location}</span></p>
          </div>
        </div>
        <button onClick={handleDownloadPDF} className="btn-primary" style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 24px', borderRadius: '8px', background: 'var(--secondary)', border: 'none', cursor: 'pointer'}}>
          <Download size={20} /> DOWNLOAD MASTER DOSSIER (PDF)
        </button>
      </div>

      {/* PRINT-ONLY MASTER DOSSIER (EXHAUSTIVE DETAIL) */}
      <div className="print-only dossier-pdf-layout">
        <header style={{textAlign: 'center', borderBottom: '6px solid #000', paddingBottom: '20px', marginBottom: '40px'}}>
          <h1 style={{fontSize: '36px'}}>MASTER TECHNICAL DOSSIER</h1>
          <p style={{fontSize: '18px'}}>Official Trajectory Strategy for {job.title}</p>
        </header>
        <section style={{marginBottom: '50px'}}>
          <h2 style={{borderBottom: '2px solid #333', paddingBottom: '5px'}}>01. TECHNICAL MASTERCLASS</h2>
          <div style={{whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6'}}>
            {ai.dossier || "Generating exhaustive technical trajectory..."}
          </div>
        </section>
        <section>
          <h2 style={{borderBottom: '2px solid #333', paddingBottom: '5px'}}>02. STEP-WISE EXECUTION PLAN</h2>
          {Array.isArray(ai.roadmap) && ai.roadmap.map((s, i) => (
            <p key={i} style={{marginBottom: '10px'}}><b>Step {i+1}:</b> {s}</p>
          ))}
        </section>
      </div>

      <div className="neural-grid no-print" style={{gridTemplateColumns: '1.4fr 0.6fr', gap: '40px'}}>
        
        {/* LEFT COLUMN */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
          
          <section className="glass-card" style={{padding: '32px', borderLeft: '4px solid var(--primary)', background: 'rgba(0, 229, 255, 0.02)'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
              <ShieldCheck className="neon-icon" size={28} />
              <h2 className="neon-text" style={{fontSize: '20px'}}>AI PREPARATION STRATEGY (GAP ANALYSIS)</h2>
            </div>
            <div style={{fontSize: '15px', lineHeight: '1.8', color: '#e0e0e0', whiteSpace: 'pre-wrap', maxHeight: 'none'}}>
              {ai.strategy || job.matchReason || "Analyzing neural gaps between resume and JD..."}
            </div>
          </section>

          <section className="glass-card" style={{padding: '40px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px'}}>
              <Rocket className="neon-icon-alt" size={32} />
              <h2 className="neon-text" style={{fontSize: '24px'}}>TECHNICAL ROADMAP</h2>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              {Array.isArray(ai.roadmap) ? ai.roadmap.map((step, i) => (
                <div key={i} style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                  <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,229,255,0.1)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold', minWidth: '32px'}}>
                    {i + 1}
                  </div>
                  <div style={{fontSize: '15px', color: '#fff'}}>{step}</div>
                </div>
              )) : <p className="text-muted">Analyzing roadmap nodes...</p>}
            </div>
          </section>

          <section className="glass-card" style={{padding: '40px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px'}}>
              <Code2 className="neon-icon" size={32} />
              <h2 className="neon-text" style={{fontSize: '24px'}}>AI PROJECT BLUEPRINTS</h2>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
              {Array.isArray(ai.projects) ? ai.projects.map((proj, i) => (
                <div key={i} className="glass-card" style={{padding: '24px', background: 'rgba(0,0,0,0.2)'}}>
                  <h4 style={{color: 'var(--primary)', fontSize: '18px', marginBottom: '8px'}}>{proj.title}</h4>
                  <p style={{fontSize: '14px', color: '#aaa', marginBottom: '16px'}}>{proj.architecture}</p>
                  <div style={{background: '#050505', padding: '16px', borderRadius: '8px', border: '1px solid #222'}}>
                    <div style={{color: '#00ff00', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <Terminal size={14} /> SETUP COMMANDS
                    </div>
                    <code style={{color: '#00ff00', fontSize: '13px', opacity: 0.8, whiteSpace: 'pre-wrap'}}>{proj.setupCommands}</code>
                  </div>
                </div>
              )) : <p className="text-muted">Generating blueprints...</p>}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '32px'}}>
          <section className="glass-card" style={{padding: '32px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
              <BookOpen className="neon-icon-alt" size={24} />
              <h2 className="neon-text" style={{fontSize: '18px'}}>CLICKABLE RESOURCES</h2>
            </div>
            <ul style={{listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px'}}>
              {Array.isArray(ai.resources) ? ai.resources.map((res, i) => (
                <li key={i} style={{fontSize: '13px', color: '#ccc'}}>
                  {renderResource(res)}
                </li>
              )) : <p className="text-muted">Indexing learning nodes...</p>}
            </ul>
          </section>

          <section className="glass-card" style={{padding: '32px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px'}}>
              <Target size={24} color="var(--primary)" />
              <h2 className="neon-text" style={{fontSize: '18px'}}>SALARY SPECTRUM</h2>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px'}}>
                <span style={{fontSize: '12px'}}>ENTRY</span>
                <b style={{color: '#fff'}}>{ai.salary?.low || 'Calculating...'}</b>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'rgba(0,229,255,0.05)', borderRadius: '6px', border: '1px solid var(--primary)'}}>
                <span style={{fontSize: '12px', color: 'var(--primary)'}}>MARKET AVG</span>
                <b style={{color: 'var(--primary)', fontSize: '20px'}}>{ai.salary?.average || 'Analyzing...'}</b>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px'}}>
                <span style={{fontSize: '12px'}}>EXECUTIVE</span>
                <b style={{color: '#fff'}}>{ai.salary?.high || 'Projecting...'}</b>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .print-only { display: none; }
        .neon-link { color: var(--primary); text-decoration: none; border-bottom: 1px dashed var(--primary); padding-bottom: 2px; }
        .neon-link:hover { color: #fff; border-bottom: 1px solid #fff; }
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: #fff !important; color: #000 !important; }
        }
      `}} />
    </div>
  );
}
