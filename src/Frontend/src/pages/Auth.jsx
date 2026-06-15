import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plane, Lock, Mail, User } from 'lucide-react';

export const Auth = () => {
  const { login, register, error: authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('User'); // Default role
  
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    // Form validations
    if (!email.includes('@')) {
      setLocalError('Molimo unesite ispravnu email adresu.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Lozinka mora imati najmanje 6 karaktera.');
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setLocalError('Ime je obavezno.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Lozinke se ne podudaraju.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role);
      }
    } catch (err) {
      // Errors handled by context, but we catch to stop loading
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel animate-scale" style={styles.card}>
        <div style={styles.logoBlock}>
          <Plane size={36} color="var(--primary)" style={{ transform: 'rotate(-45deg)' }} />
          <h2 style={styles.logoText}>Voyager Travel</h2>
          <p style={styles.logoSubtitle}>Vaš inteligentni planer putovanja</p>
        </div>

        <h3 style={styles.title}>{isLogin ? 'Prijava na nalog' : 'Registracija naloga'}</h3>

        {(localError || authError) && (
          <div className="badge badge-danger" style={styles.errorAlert}>
            {localError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Ime i prezime</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={styles.inputField} 
                  placeholder="Marko Marković"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email adresa</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input 
                type="email" 
                required 
                className="form-input" 
                style={styles.inputField} 
                placeholder="marko@email.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Lozinka</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input 
                type="password" 
                required 
                className="form-input" 
                style={styles.inputField} 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Potvrdite lozinku</label>
                <div style={styles.inputWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input 
                    type="password" 
                    required 
                    className="form-input" 
                    style={styles.inputField} 
                    placeholder="••••••••"
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Uloga</label>
                <select 
                  className="form-input" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  style={{ appearance: 'none', background: 'rgba(25, 20, 45, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', padding: '12px 16px' }}
                >
                  <option value="User">Standardni korisnik</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Molimo sačekajte...' : (isLogin ? 'Prijavi se' : 'Registruj se')}
          </button>
        </form>

        <div style={styles.toggleText}>
          {isLogin ? 'Nemate korisnički nalog?' : 'Već imate korisnički nalog?'}
          <button 
            style={styles.toggleBtn} 
            onClick={() => {
              setIsLogin(!isLogin);
              setLocalError('');
            }}
          >
            {isLogin ? 'Registrujte se ovde' : 'Prijavite se ovde'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 70px)',
    padding: '24px'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    padding: '32px',
    backgroundColor: 'rgba(20, 15, 38, 0.8)'
  },
  logoBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '24px'
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginTop: '8px'
  },
  logoSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '20px',
    textAlign: 'center'
  },
  errorAlert: {
    width: '100%',
    padding: '10px 14px',
    marginBottom: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '0.8rem',
    textTransform: 'none'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)'
  },
  inputField: {
    paddingLeft: '44px'
  },
  submitBtn: {
    width: '100%',
    marginTop: '10px'
  },
  toggleText: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '24px'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: '6px',
    fontSize: '0.85rem'
  }
};

export default Auth;
