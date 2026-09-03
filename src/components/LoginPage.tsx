import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../utils/firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';

// ─── Floating particle canvas ────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      hue: Math.random() > 0.5 ? 210 : 270,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.8)`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Google SVG ───────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ─── Eye icons ────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function GlassInput({
  id, type, placeholder, value, onChange, icon, rightSlot,
}: {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ReactNode;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(150,170,255,0.7)', display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        style={{
          width: '100%',
          padding: '13px 44px 13px 44px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(120,150,255,0.25)',
          borderRadius: 12,
          color: '#e8eaff',
          fontSize: 14,
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(100,140,255,0.7)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(100,140,255,0.15)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(120,150,255,0.25)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {rightSlot && (
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(150,170,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {rightSlot}
        </span>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // ── Auth state listener + redirect result handler ──────────────────────────
  useEffect(() => {
    // Handle redirect result from Google Sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) navigate('/dashboard');
      })
      .catch((err) => {
        if (err.code !== 'auth/no-auth-event') {
          setError('Google sign-in failed. Please try again.');
        }
      });

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/dashboard');
      } else {
        setCheckingAuth(false);
      }
    });
    return unsub;
  }, [navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err: any) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); 
    if (signupPassword !== signupConfirm) return setError('Passwords do not match.');
    if (signupPassword.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      await updateProfile(cred.user, { displayName: signupName });
      navigate('/dashboard');
    } catch (err: any) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError(''); setLoading(true);
    signInWithRedirect(auth, googleProvider).catch((err: any) => {
      setError(getFriendlyError(err.code));
      setLoading(false);
    });
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccess('Reset email sent! Check your inbox.');
      setResetEmail('');
    } catch (err: any) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyError = (code: string) => {
    const map: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'This email is already registered.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password is too weak.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
      'auth/cancelled-popup-request': '',
      'auth/popup-closed-by-user': '',
    };
    return map[code] || 'Something went wrong. Please try again.';
  };

  if (checkingAuth) return null;

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #060b1f 0%, #0d0f2e 40%, #120830 70%, #06091e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      position: 'relative' as const,
      overflow: 'hidden',
      padding: '20px',
    },
    bgOrb1: {
      position: 'absolute' as const,
      top: '-15%', left: '-10%',
      width: 500, height: 500,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
      filter: 'blur(40px)',
      pointerEvents: 'none' as const,
    },
    bgOrb2: {
      position: 'absolute' as const,
      bottom: '-15%', right: '-10%',
      width: 600, height: 600,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)',
      filter: 'blur(50px)',
      pointerEvents: 'none' as const,
    },
    card: {
      position: 'relative' as const,
      zIndex: 1,
      display: 'flex',
      width: '100%',
      maxWidth: 920,
      minHeight: 560,
      borderRadius: 24,
      overflow: 'hidden',
      background: 'rgba(12, 16, 42, 0.7)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(100, 140, 255, 0.2)',
      boxShadow: '0 25px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
    },
    left: {
      flex: '0 0 42%',
      background: 'linear-gradient(145deg, rgba(37,99,235,0.3), rgba(109,40,217,0.3))',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 36px',
      borderRight: '1px solid rgba(100,140,255,0.15)',
      gap: 24,
    },
    right: {
      flex: 1,
      padding: '40px 44px',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      gap: 8,
    },
    icon: {
      fontSize: 72,
      lineHeight: 1,
      filter: 'drop-shadow(0 0 30px rgba(99,162,255,0.8))',
      animation: 'floatAnim 4s ease-in-out infinite',
    },
    appName: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: '-0.5px',
      textAlign: 'center' as const,
      background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    tagline: {
      color: 'rgba(180,200,255,0.7)',
      fontSize: 13,
      textAlign: 'center' as const,
      lineHeight: 1.6,
    },
    badge: {
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(100,140,255,0.2)',
      borderRadius: 100,
      padding: '6px 16px',
      color: 'rgba(180,200,255,0.7)',
      fontSize: 11,
      letterSpacing: '0.5px',
      textTransform: 'uppercase' as const,
    },
    tabRow: {
      display: 'flex',
      gap: 4,
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      padding: 4,
      marginBottom: 8,
    },
    tab: (active: boolean) => ({
      flex: 1,
      padding: '9px 0',
      borderRadius: 9,
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      transition: 'all 0.2s',
      background: active ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'transparent',
      color: active ? '#fff' : 'rgba(180,200,255,0.6)',
      boxShadow: active ? '0 4px 15px rgba(99,102,241,0.4)' : 'none',
    }),
    heading: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 4,
    },
    sub: {
      color: 'rgba(160,180,255,0.65)',
      fontSize: 13,
      marginBottom: 12,
    },
    formCol: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 12,
    },
    label: {
      color: 'rgba(180,200,255,0.8)',
      fontSize: 12,
      fontWeight: 500,
      marginBottom: 4,
      display: 'block',
    },
    primaryBtn: {
      width: '100%',
      padding: '13px',
      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
      border: 'none',
      borderRadius: 12,
      color: '#fff',
      fontWeight: 700,
      fontSize: 14,
      cursor: 'pointer',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
      transition: 'transform 0.15s, box-shadow 0.15s',
    },
    googleBtn: {
      width: '100%',
      padding: '12px',
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(120,150,255,0.3)',
      borderRadius: 12,
      color: '#e8eaff',
      fontWeight: 600,
      fontSize: 14,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.2s, border-color 0.2s',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '4px 0',
    },
    divLine: {
      flex: 1,
      height: 1,
      background: 'rgba(120,150,255,0.2)',
    },
    divText: {
      color: 'rgba(160,180,255,0.5)',
      fontSize: 11,
      fontWeight: 500,
      whiteSpace: 'nowrap' as const,
    },
    alert: (isErr: boolean) => ({
      padding: '10px 14px',
      borderRadius: 10,
      fontSize: 13,
      background: isErr ? 'rgba(220,38,38,0.15)' : 'rgba(34,197,94,0.15)',
      border: `1px solid ${isErr ? 'rgba(220,38,38,0.3)' : 'rgba(34,197,94,0.3)'}`,
      color: isErr ? '#fca5a5' : '#86efac',
    }),
    linkBtn: {
      background: 'none',
      border: 'none',
      color: '#818cf8',
      cursor: 'pointer',
      fontSize: 12,
      padding: 0,
      fontFamily: 'inherit',
    },
  };

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes floatAnim {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(150,170,255,0.4); }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0px 1000px #0e1335 inset !important; -webkit-text-fill-color: #e8eaff !important; }
      `}</style>

      <ParticleCanvas />
      <div style={S.bgOrb1} />
      <div style={S.bgOrb2} />

      <div style={S.card}>
        {/* ── Left panel ── */}
        <div style={S.left}>
          <div style={S.icon}>📋</div>
          <div style={S.appName}>Lab Record Generator</div>
          <div style={S.tagline}>
            Generate professional lab records with QR codes, PDF exports, and cloud sync — built for Saveetha Engineering College.
          </div>
          <div style={S.badge}>🔒 Secured by Firebase</div>
        </div>

        {/* ── Right panel ── */}
        <div style={S.right}>

          {/* Alert */}
          {(error || success) && (
            <div style={S.alert(!!error)}>
              {error || success}
            </div>
          )}

          {/* ── Reset password view ── */}
          {tab === 'reset' ? (
            <>
              <div style={S.heading}>Reset Password</div>
              <div style={S.sub}>Enter your email and we'll send a reset link.</div>
              <form onSubmit={handleReset} style={S.formCol}>
                <div>
                  <label style={S.label}>Email Address</label>
                  <GlassInput id="reset-email" type="email" placeholder="your@email.com" value={resetEmail} onChange={setResetEmail}
                    icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
                  />
                </div>
                <button type="submit" disabled={loading} style={S.primaryBtn}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <button type="button" style={S.linkBtn} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>
                    ← Back to Login
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Tabs */}
              <div style={S.tabRow}>
                <button type="button" style={S.tab(tab === 'login')} onClick={() => { setTab('login'); setError(''); setSuccess(''); }}>Login</button>
                <button type="button" style={S.tab(tab === 'signup')} onClick={() => { setTab('signup'); setError(''); setSuccess(''); }}>Sign Up</button>
              </div>

              {tab === 'login' ? (
                <>
                  <div style={S.heading}>Welcome back 👋</div>
                  <div style={S.sub}>Sign in to access your lab records.</div>
                  <form onSubmit={handleLogin} style={S.formCol}>
                    <div>
                      <label style={S.label} htmlFor="l-email">Email</label>
                      <GlassInput id="l-email" type="email" placeholder="your@email.com" value={loginEmail} onChange={setLoginEmail}
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
                      />
                    </div>
                    <div>
                      <label style={S.label} htmlFor="l-pwd">Password</label>
                      <GlassInput id="l-pwd" type={showPwd ? 'text' : 'password'} placeholder="Enter your password" value={loginPassword} onChange={setLoginPassword}
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                        rightSlot={<span onClick={() => setShowPwd(!showPwd)}><EyeIcon open={showPwd} /></span>}
                      />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button type="button" style={S.linkBtn} onClick={() => { setTab('reset'); setError(''); setSuccess(''); }}>
                        Forgot password?
                      </button>
                    </div>
                    <button type="submit" disabled={loading} style={S.primaryBtn}>
                      {loading ? 'Signing in...' : 'Sign In →'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div style={S.heading}>Create account ✨</div>
                  <div style={S.sub}>Join and start generating lab records.</div>
                  <form onSubmit={handleSignup} style={{ ...S.formCol, gap: 10 }}>
                    <div>
                      <label style={S.label} htmlFor="s-name">Full Name</label>
                      <GlassInput id="s-name" type="text" placeholder="John Doe" value={signupName} onChange={setSignupName}
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                      />
                    </div>
                    <div>
                      <label style={S.label} htmlFor="s-email">Email</label>
                      <GlassInput id="s-email" type="email" placeholder="your@email.com" value={signupEmail} onChange={setSignupEmail}
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>}
                      />
                    </div>
                    <div>
                      <label style={S.label} htmlFor="s-pwd">Password</label>
                      <GlassInput id="s-pwd" type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters" value={signupPassword} onChange={setSignupPassword}
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                        rightSlot={<span onClick={() => setShowPwd(!showPwd)}><EyeIcon open={showPwd} /></span>}
                      />
                    </div>
                    <div>
                      <label style={S.label} htmlFor="s-confirm">Confirm Password</label>
                      <GlassInput id="s-confirm" type={showPwd ? 'text' : 'password'} placeholder="Repeat password" value={signupConfirm} onChange={setSignupConfirm}
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                      />
                    </div>
                    <button type="submit" disabled={loading} style={S.primaryBtn}>
                      {loading ? 'Creating...' : 'Create Account →'}
                    </button>
                  </form>
                </>
              )}

              {/* Google divider */}
              <div style={S.divider}>
                <div style={S.divLine} />
                <span style={S.divText}>or continue with</span>
                <div style={S.divLine} />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                style={S.googleBtn}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(150,180,255,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(120,150,255,0.3)'; }}
              >
                <GoogleIcon />
                {loading ? 'Redirecting to Google...' : 'Continue with Google'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 4 }}>
                <span style={{ color: 'rgba(150,170,255,0.5)', fontSize: 11 }}>
                  Developed by SHANMUGAKARTHIK G · Saveetha Engineering College
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}