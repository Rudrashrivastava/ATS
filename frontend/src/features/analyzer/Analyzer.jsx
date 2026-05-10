import { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, CheckCircle2, FileText, Activity } from 'lucide-react';

export default function Analyzer({ token }) {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setProgress(0);
    
    // Simulate extraction progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    const formData = new FormData();
    formData.append('file', file);
    if (jobDesc) formData.append('jobDescription', jobDesc);

    try {
      const endpoint = jobDesc ? '/api/resume/analyze-with-job' : '/api/resume/analyze';
      const res = await axios.post(endpoint, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      clearInterval(interval);
      setProgress(100);
      setResult(res.data);
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      console.error(err);
      if (err.response && err.response.data && err.response.data.error) {
        alert('Error: ' + err.response.data.error);
      } else {
        alert('Analysis failed. Did you paste your API Key in application.properties?');
      }
    }
    setLoading(false);
  };

  return (
    <div className="neural-container">
      <div className="neural-grid">
        {/* LEFT PANEL: INGESTION */}
        <div className="neural-panel">
          <div className="panel-header">
            <Activity className="neon-icon" size={20} />
            <h2 className="neon-text">SYSTEM ACTIVE</h2>
          </div>
          <h1 style={{fontSize: '28px', margin: '8px 0 24px'}}>Neural Ingestion</h1>
          <p className="text-muted" style={{marginBottom: '24px'}}>Initiate the bridge to synchronize your professional trajectory with our neural core.</p>

          <div className="dropzone">
            <UploadCloud size={48} color="var(--primary)" style={{marginBottom: '16px'}} />
            <h3 style={{marginBottom: '8px'}}>Neural Bridge</h3>
            <p className="text-muted" style={{marginBottom: '16px'}}>TAP TO UPLOAD OR DRAG RESUME</p>
            <input type="file" id="fileUpload" accept=".pdf" style={{display: 'none'}} onChange={e => setFile(e.target.files[0])} />
            <button className="btn-primary" onClick={() => document.getElementById('fileUpload').click()}>
              SELECT FILE
            </button>
            {file && <div style={{marginTop: '12px', fontSize: '14px', color: 'var(--secondary)'}}>{file.name}</div>}
          </div>

          <div style={{marginTop: '24px'}}>
            <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-muted)'}}>Job Description (Optional Context)</label>
            <textarea rows="4" className="glass-input" value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Provide target job parameters..."></textarea>
          </div>

          <button onClick={handleAnalyze} className="btn-primary" disabled={loading || !file} style={{width: '100%', marginTop: '24px'}}>
            {loading ? 'INITIALIZING BRIDGE...' : 'START INGESTION'}
          </button>

          {loading && (
            <div className="ingestion-queue glass-card" style={{marginTop: '32px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                <span className="text-muted">Ingestion Queue</span>
                <span className="neon-text">1 Active Task</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <FileText size={32} color="var(--text-muted)" />
                <div style={{flex: 1}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                    <span>{file.name}</span>
                    <span className="neon-text">{progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${progress}%`}}></div>
                  </div>
                  <div style={{fontSize: '12px', color: 'var(--primary)', marginTop: '8px'}}>
                    {progress < 100 ? 'Extracting Semantic Nodes...' : 'Analysis Complete'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: RESULTS */}
        <div className="neural-panel">
          <div className="panel-header">
            <CheckCircle2 className="neon-icon" size={20} />
            <h2 className="neon-text">CORE ENGINE: OPERATIONAL</h2>
          </div>
          
          {result ? (
            <div className="results-container">
              <div style={{display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px'}}>
                <div className="score-circle-large">
                  <div className="score-value">{result.score}<span style={{fontSize: '24px'}}>%</span></div>
                  <div className="score-label">NEURAL SCORE</div>
                </div>
                <div>
                  <h2 style={{color: 'var(--primary)', marginBottom: '8px'}}>Analysis Complete</h2>
                  <p className="text-muted">{result.recommendation}</p>
                </div>
              </div>

              <div className="results-grid">
                <div className="result-card">
                  <h3 className="text-glow-primary" style={{marginBottom: '16px'}}>System Strengths</h3>
                  <ul className="custom-list primary-list">
                    {result.strengths && result.strengths.length > 0 ? (
                      result.strengths.map((s, i) => <li key={i}>{s}</li>)
                    ) : (<li>No specific strengths identified.</li>)}
                  </ul>
                </div>
                
                <div className="result-card">
                  <h3 className="text-glow-secondary" style={{marginBottom: '16px'}}>Identified Anomalies</h3>
                  <ul className="custom-list secondary-list">
                    {result.weaknesses && result.weaknesses.length > 0 ? (
                      result.weaknesses.map((s, i) => <li key={i}>{s}</li>)
                    ) : (<li>No major anomalies detected.</li>)}
                  </ul>
                </div>
              </div>
              
              <div className="result-card" style={{marginTop: '24px'}}>
                <h3 className="text-glow-primary" style={{marginBottom: '16px'}}>Category Mapping</h3>
                <div style={{display: 'flex', flexWrap: 'wrap', gap: '16px'}}>
                  {Object.entries(result.categoryScores || {}).map(([key, value]) => (
                    <div key={key} className="category-badge">
                      <span className="cat-name">{key.toUpperCase()}</span>
                      <span className="cat-score">{value} pts</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="empty-state">
              <Activity size={64} style={{opacity: 0.2, marginBottom: '24px'}} />
              <h3>Awaiting Input</h3>
              <p className="text-muted">Upload a profile to begin neural analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
