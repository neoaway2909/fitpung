import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onLoginSuccess }) => {
  const { login, register, error, setError } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('โปรดกรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      if (isLoginTab) {
        const loggedInUser = await login(username, password);
        onLoginSuccess(loggedInUser);
      } else {
        if (!email || !name) {
          alert('โปรดกรอกข้อมูลให้ครบทุกช่อง');
          setLoading(false);
          return;
        }
        await register(username, password, email, name);
        alert('สมัครสมาชิกสำเร็จแล้ว! คุณสามารถเข้าสู่ระบบได้ทันที');
        setIsLoginTab(true);
        // Clear registration fields
        setEmail('');
        setName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="page-fade-in container" style={styles.container}>
      <div className="glass-card glow-cyan" style={styles.loginCard}>
        {/* Tab Headers */}
        <div style={styles.tabs}>
          <button
            style={isLoginTab ? styles.tabActive : styles.tab}
            onClick={() => { setIsLoginTab(true); setError(null); }}
          >
            เข้าสู่ระบบ
          </button>
          <button
            style={!isLoginTab ? styles.tabActive : styles.tab}
            onClick={() => { setIsLoginTab(false); setError(null); }}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Error message */}
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {/* Main Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>ชื่อผู้ใช้งาน (Username)</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="กรอกชื่อผู้ใช้งาน"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>รหัสผ่าน (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="กรอกรหัสผ่าน"
              style={styles.input}
            />
          </div>

          {!isLoginTab && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>ชื่อ-นามสกุล (Full Name)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="กรอกชื่อและนามสกุลจริง"
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>อีเมล (Email)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="เช่น example@gmail.com"
                  style={styles.input}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-neon" style={styles.submitBtn} disabled={loading}>
            {loading
              ? 'กำลังดำเนินการ...'
              : isLoginTab
                ? 'เข้าสู่ระบบร้านค้า'
                : 'ลงทะเบียนสมาชิก'}
          </button>
        </form>


      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '6rem 0',
    minHeight: '65vh',
  },
  loginCard: {
    width: '100%',
    maxWidth: '600px',
    padding: '3.5rem 3rem',
  },
  tabs: {
    display: 'flex',
    marginBottom: '2.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  tab: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTop: 'none',
    borderRight: 'none',
    borderLeft: 'none',
    borderBottom: '2px solid transparent',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-title)',
    fontSize: '1.15rem',
    fontWeight: '600',
    cursor: 'pointer',
    paddingBottom: '1rem',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  tabActive: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTop: 'none',
    borderRight: 'none',
    borderLeft: 'none',
    borderBottom: '2px solid var(--primary-glow)',
    color: 'var(--primary-glow)',
    fontFamily: 'var(--font-title)',
    fontSize: '1.15rem',
    fontWeight: '700',
    cursor: 'pointer',
    paddingBottom: '1rem',
    textShadow: '0 0 8px var(--primary-glow)',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--danger)',
    color: '#FCA5A5',
    borderRadius: '8px',
    padding: '1rem',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0F172A',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: '#FFF',
    padding: '0.9rem 1rem',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    ':focus': {
      border: '1px solid var(--primary-glow)',
    }
  },
  submitBtn: {
    width: '100%',
    padding: '1.1rem',
    fontSize: '1.25rem',
    fontWeight: '700',
    marginTop: '0.8rem',
    cursor: 'pointer',
    letterSpacing: '0.05em',
  },
};

export default Login;
