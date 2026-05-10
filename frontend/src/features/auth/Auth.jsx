import { useState } from 'react';
import axios from 'axios';
import { Lock, Mail, User, ShieldAlert } from 'lucide-react';

export default function Auth({ setToken }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(endpoint, formData);
      
      if (isLogin) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          setToken(res.data.token);
        }
      } else {
        setSuccess('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      if (err.response?.status === 504 || err.code === 'ERR_NETWORK') {
         setError('Cannot connect to the neural core. Is the backend running?');
      } else {
         setError(err.response?.data?.message || err.response?.data || 'Authentication failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="neural-panel auth-card">
        
        <div className="auth-tabs">
          <div className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Login</div>
          <div className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Register</div>
        </div>

        <h1 style={{fontSize: '28px', marginBottom: '8px'}}>{isLogin ? 'Welcome Back' : 'Initialize Node'}</h1>
        <p className="text-muted" style={{marginBottom: '32px'}}>
          {isLogin ? 'Access your recruitment neural engine.' : 'Register a new operator profile.'}
        </p>

        {error && (
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', marginBottom: '24px', fontSize: '14px', background: 'rgba(255, 23, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 23, 68, 0.3)'}}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}
        {success && (
          <div style={{color: 'var(--primary)', marginBottom: '24px', fontSize: '14px', background: 'rgba(0, 229, 255, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.3)'}}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Operator Name</label>
              <div style={{position: 'relative'}}>
                <User size={18} color="var(--text-muted)" style={{position: 'absolute', top: '12px', left: '16px'}} />
                <input type="text" className="glass-input" style={{paddingLeft: '44px'}} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required={!isLogin} placeholder="John Doe" />
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Email Address</label>
            <div style={{position: 'relative'}}>
              <Mail size={18} color="var(--text-muted)" style={{position: 'absolute', top: '12px', left: '16px'}} />
              <input type="email" className="glass-input" style={{paddingLeft: '44px'}} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="recruiter@neural.io" />
            </div>
          </div>
          
          <div className="form-group">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <label style={{margin: 0}}>Password</label>
              {isLogin && <a href="#" style={{fontSize: '12px', color: 'var(--primary)', textDecoration: 'none'}}>Forgot Password?</a>}
            </div>
            <div style={{position: 'relative'}}>
              <Lock size={18} color="var(--text-muted)" style={{position: 'absolute', top: '12px', left: '16px'}} />
              <input type="password" className="glass-input" style={{paddingLeft: '44px'}} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="••••••••" />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{width: '100%', marginTop: '24px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span>{loading ? 'PROCESSING...' : isLogin ? 'INITIALIZE SESSION' : 'ESTABLISH LINK'}</span>
            <span>&rarr;</span>
          </button>
        </form>

        <div style={{textAlign: 'center', marginTop: '32px', borderTop: '1px dashed var(--glass-border)', paddingTop: '24px'}}>
          <span className="text-muted" style={{fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px'}}>Neural Bridge Connect</span>
          <div className="social-login">
            <div className="social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12a10 10 0 1 0-1.8 5.7M12 2v10l5 5"/></svg>
              <span>Google</span>
            </div>
            <div className="social-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              <span>LinkedIn</span>
            </div>
          </div>
        </div>

        <div style={{marginTop: '32px', textAlign: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px'}}>
            <div style={{width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)'}}></div>
            <span className="neon-text" style={{fontSize: '10px'}}>CORE ENGINE: OPERATIONAL</span>
          </div>
        </div>

      </div>
    </div>
  );
}
