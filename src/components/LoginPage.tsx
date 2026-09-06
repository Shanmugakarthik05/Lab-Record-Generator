import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../utils/firebase/config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  getRedirectResult,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { useTheme } from '../hooks/useTheme';

/* ─── Constellation canvas ──────────────────────────────────────────────── */
function ConstellationBg({ isDark }: { isDark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = canvasRef.current!;
    const ctx = cvs.getContext('2d')!;
    let raf: number;
    const resize = () => { cvs.width = window.innerWidth; cvs.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * (isDark ? 1.5 : 2.5) + 0.3,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.015,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      stars.forEach(s => { s.twinkle += s.speed; });

      // Draw constellation lines between nearby stars
      stars.forEach((a, i) => {
        const ax = a.x * cvs.width, ay = a.y * cvs.height;
        stars.slice(i + 1).forEach(b => {
          const bx = b.x * cvs.width, by = b.y * cvs.height;
          const d = Math.hypot(bx - ax, by - ay);
          if (d < 140) {
            ctx.beginPath();
            ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
            ctx.strokeStyle = isDark 
              ? `rgba(100,200,255,${0.06 * (1 - d / 140)})`
              : `rgba(99,102,241,${0.08 * (1 - d / 140)})`; // Indigo line in light mode
            ctx.lineWidth = isDark ? 0.6 : 1;
            ctx.stroke();
          }
        });
      });

      // Draw stars
      stars.forEach(s => {
        const alpha = (isDark ? 0.3 : 0.4) + (isDark ? 0.5 : 0.6) * ((Math.sin(s.twinkle) + 1) / 2);
        const x = s.x * cvs.width, y = s.y * cvs.height;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(200,230,255,${alpha})` : `rgba(79,70,229,${alpha})`;
        if (isDark) {
          ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(100,200,255,0.8)';
        } else {
          ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(79,70,229,0.4)';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, [isDark]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
}

/* ─── Floating geometric shapes ─────────────────────────────────────────── */
function FloatingShapes({ isDark }: { isDark: boolean }) {
  const shapes = [
    { type: 'hex', size: 28, top: '12%', left: '8%', color: isDark ? '#00ffa3' : '#10b981', delay: 0, dur: 7 },
    { type: 'tri', size: 20, top: '70%', left: '5%', color: isDark ? '#b44aff' : '#8b5cf6', delay: 1.5, dur: 9 },
    { type: 'hex', size: 18, top: '20%', right: '7%', color: isDark ? '#00d4ff' : '#0ea5e9', delay: 0.8, dur: 8 },
    { type: 'tri', size: 24, top: '75%', right: '8%', color: isDark ? '#ff44aa' : '#ec4899', delay: 2, dur: 6 },
    { type: 'hex', size: 14, top: '45%', left: '3%', color: isDark ? '#00ffa3' : '#10b981', delay: 3, dur: 10 },
    { type: 'tri', size: 16, top: '35%', right: '4%', color: isDark ? '#b44aff' : '#8b5cf6', delay: 0.3, dur: 11 },
    { type: 'hex', size: 22, top: '88%', left: '20%', color: isDark ? '#00d4ff' : '#0ea5e9', delay: 1, dur: 8 },
    { type: 'tri', size: 12, top: '5%', right: '25%', color: isDark ? '#ff44aa' : '#ec4899', delay: 2.5, dur: 7 },
  ];

  return (
    <>
      {shapes.map((s, i) => (
        <div key={i} style={{
          position: 'fixed',
          top: s.top, left: (s as any).left, right: (s as any).right,
          zIndex: 0, pointerEvents: 'none',
          animation: `floatShape ${s.dur}s ease-in-out ${s.delay}s infinite alternate`,
          opacity: isDark ? 0.6 : 0.8,
        }}>
          {s.type === 'hex' ? (
            <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" stroke={s.color} strokeWidth="1.5" fill={`${s.color}${isDark ? '18' : '33'}`} />
            </svg>
          ) : (
            <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill="none">
              <polygon points="12,3 22,20 2,20" stroke={s.color} strokeWidth="1.5" fill={`${s.color}${isDark ? '18' : '33'}`} />
            </svg>
          )}
        </div>
      ))}
    </>
  );
}

/* ─── Atom icon ─────────────────────────────────────────────────────────── */
function AtomIcon({ isDark }: { isDark: boolean }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ 
      filter: isDark ? 'drop-shadow(0 0 20px #00d4ff) drop-shadow(0 0 40px #b44aff)' : 'drop-shadow(0 10px 15px rgba(99,102,241,0.3)) drop-shadow(0 4px 6px rgba(99,102,241,0.2))', 
      animation: 'spinAtom 12s linear infinite' 
    }}>
      <circle cx="32" cy="32" r="5" fill={isDark ? "#00d4ff" : "#4f46e5"} />
      <ellipse cx="32" cy="32" rx="28" ry="10" stroke={isDark ? "#00ffa3" : "#10b981"} strokeWidth={isDark ? "1.5" : "2.5"} fill="none" />
      <ellipse cx="32" cy="32" rx="28" ry="10" stroke={isDark ? "#b44aff" : "#8b5cf6"} strokeWidth={isDark ? "1.5" : "2.5"} fill="none" transform="rotate(60 32 32)" />
      <ellipse cx="32" cy="32" rx="28" ry="10" stroke={isDark ? "#ff44aa" : "#ec4899"} strokeWidth={isDark ? "1.5" : "2.5"} fill="none" transform="rotate(120 32 32)" />
      <circle cx="60" cy="32" r="3" fill={isDark ? "#00ffa3" : "#10b981"} />
      <circle cx="46" cy="56.6" r="3" fill={isDark ? "#b44aff" : "#8b5cf6"} />
      <circle cx="18" cy="56.6" r="3" fill={isDark ? "#ff44aa" : "#ec4899"} />
    </svg>
  );
}

/* ─── Google icon ───────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10, flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ─── Neon input ────────────────────────────────────────────────────────── */
function ThemeInput({ id, type, placeholder, value, onChange, label, icon, right, isDark }: {
  id: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; label: string; icon: string; right?: React.ReactNode; isDark: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <label htmlFor={id} style={{
        display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 600,
        letterSpacing: '1.5px', textTransform: 'uppercase',
        color: focused ? (isDark ? '#00d4ff' : '#4f46e5') : (isDark ? 'rgba(180,220,255,0.5)' : '#6b7280'),
        transition: 'color 0.2s',
      }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, userSelect: 'none' }}>{icon}</span>
        <input
          id={id} type={type} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          required
          style={{
            width: '100%', padding: '13px 44px 13px 42px',
            background: isDark 
              ? (focused ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.04)')
              : (focused ? '#ffffff' : 'rgba(255,255,255,0.6)'),
            border: isDark
              ? `1px solid ${focused ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.1)'}`
              : `1px solid ${focused ? '#6366f1' : 'rgba(209,213,219,0.8)'}`,
            borderRadius: 10, 
            color: isDark ? '#f0f8ff' : '#111827', 
            fontSize: 14,
            outline: 'none', boxSizing: 'border-box',
            boxShadow: focused 
              ? (isDark ? '0 0 0 3px rgba(0,212,255,0.12), inset 0 1px 0 rgba(0,212,255,0.1)' : '0 0 0 4px rgba(99,102,241,0.15)') 
              : (isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.02)'),
            transition: 'all 0.25s',
            fontFamily: 'inherit',
          }}
        />
        {right && <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: isDark ? 'rgba(180,220,255,0.5)' : '#6b7280' }}>{right}</span>}
      </div>
    </div>
  );
}

/* ─── Theme submit button ────────────────────────────────────────────────── */
function ThemeButton({ loading, label, loadingLabel, isDark }: { loading: boolean; label: string; loadingLabel: string; isDark: boolean }) {
  return (
    <button type="submit" disabled={loading} style={{
      width: '100%', padding: '14px', borderRadius: 12, border: 'none',
      background: isDark ? 'linear-gradient(135deg, #0072ff, #7c00ff)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
      color: '#fff', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
      letterSpacing: '0.5px', fontFamily: 'inherit',
      boxShadow: isDark 
        ? '0 4px 30px rgba(0,114,255,0.4), 0 0 60px rgba(124,0,255,0.2)'
        : '0 8px 25px rgba(79,70,229,0.3)',
      transition: 'transform 0.15s, box-shadow 0.15s',
      opacity: loading ? 0.7 : 1,
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { if (!loading) { 
        e.currentTarget.style.transform = 'translateY(-2px)'; 
        e.currentTarget.style.boxShadow = isDark 
          ? '0 6px 40px rgba(0,114,255,0.6), 0 0 80px rgba(124,0,255,0.3)'
          : '0 12px 30px rgba(79,70,229,0.4)';
      } }}
      onMouseLeave={e => { 
        e.currentTarget.style.transform = 'translateY(0)'; 
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 30px rgba(0,114,255,0.4), 0 0 60px rgba(124,0,255,0.2)'
          : '0 8px 25px rgba(79,70,229,0.3)';
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export function LoginPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPwd, setLoginPwd] = useState('');
  const [sName, setSName] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPwd, setSPwd] = useState('');
  const [sConfirm, setSConfirm] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  /* 3D tilt on mouse move */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -8, y: dx * 8 });
  }, []);
  const handleMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  /* Firebase auth */
  useEffect(() => {
    getRedirectResult(auth).then(r => { if (r?.user) navigate('/dashboard'); }).catch(() => { });
    const unsub = onAuthStateChanged(auth, u => { if (u) navigate('/dashboard'); else setCheckingAuth(false); });
    return unsub;
  }, [navigate]);

  const err = (msg: string) => { setError(msg); setSuccess(''); };
  const ok = (msg: string) => { setSuccess(msg); setError(''); };

  const getFriendly = (code: string) => ({
    'auth/user-not-found': 'No account with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'Email already registered.',
    'auth/invalid-email': 'Please enter a valid email.',
    'auth/weak-password': 'Password is too weak.',
    'auth/too-many-requests': 'Too many attempts. Try later.',
    'auth/invalid-credential': 'Invalid email or password.',
  }[code] || 'Something went wrong. Try again.');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPwd); navigate('/dashboard'); }
    catch (e: any) { err(getFriendly(e.code)); }
    finally { setLoading(false); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (sPwd !== sConfirm) return err('Passwords do not match.');
    if (sPwd.length < 8) return err('Password must be at least 8 characters.');
    setLoading(true);
    try {
      const c = await createUserWithEmailAndPassword(auth, sEmail, sPwd);
      await updateProfile(c.user, { displayName: sName });
      navigate('/dashboard');
    } catch (e: any) { err(getFriendly(e.code)); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (e: any) {
      err(getFriendly(e.code));
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await sendPasswordResetEmail(auth, resetEmail); ok('Reset link sent! Check your inbox.'); setResetEmail(''); }
    catch (e: any) { err(getFriendly(e.code)); }
    finally { setLoading(false); }
  };

  if (checkingAuth) return null;

  const eyeBtn = (
    <span onClick={() => setShowPwd(!showPwd)} style={{ display: 'flex', alignItems: 'center', fontSize: 16 }}>
      {showPwd ? '🙈' : '👁️'}
    </span>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark 
        ? 'radial-gradient(ellipse at 20% 30%, #0d0a2e 0%, #000510 40%, #050215 100%)'
        : 'radial-gradient(ellipse at 20% 30%, #f0f9ff 0%, #e0e7ff 40%, #f3f4f6 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter','Segoe UI',sans-serif", position: 'relative', overflow: 'hidden', padding: 20,
      transition: 'background 0.5s ease'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes auroraShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes floatShape { from{transform:translateY(0) rotate(0deg)} to{transform:translateY(-20px) rotate(10deg)} }
        @keyframes spinAtom { to{transform:rotate(360deg)} }
        @keyframes holoBorder { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 40px rgba(0,212,255,0.15),0 0 80px rgba(180,74,255,0.1),0 50px 120px rgba(0,0,0,0.8)} 50%{box-shadow:0 0 60px rgba(0,212,255,0.25),0 0 120px rgba(180,74,255,0.2),0 50px 120px rgba(0,0,0,0.8)} }
        @keyframes pulseGlowLight { 0%,100%{box-shadow:0 0 40px rgba(99,102,241,0.1),0 0 80px rgba(168,85,247,0.1),0 30px 60px rgba(0,0,0,0.1)} 50%{box-shadow:0 0 60px rgba(99,102,241,0.15),0 0 120px rgba(168,85,247,0.15),0 30px 60px rgba(0,0,0,0.1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        input::placeholder{color:${isDark ? 'rgba(180,210,255,0.3)' : 'rgba(107,114,128,0.5)'};font-size:13px}
        input:-webkit-autofill{-webkit-box-shadow:0 0 0 1000px ${isDark ? '#05091a' : '#ffffff'} inset!important;-webkit-text-fill-color:${isDark ? '#f0f8ff' : '#111827'}!important}
        *{box-sizing:border-box}
      `}</style>

      {/* Aurora background layers */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: isDark ? 'radial-gradient(ellipse 80% 50% at 10% 20%, rgba(0,100,255,0.12) 0%, transparent 60%)' : 'radial-gradient(ellipse 80% 50% at 10% 20%, rgba(59,130,246,0.1) 0%, transparent 60%)', animation: 'holoBorder 6s ease-in-out infinite' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: isDark ? 'radial-gradient(ellipse 60% 40% at 90% 80%, rgba(180,74,255,0.12) 0%, transparent 60%)' : 'radial-gradient(ellipse 60% 40% at 90% 80%, rgba(168,85,247,0.1) 0%, transparent 60%)', animation: 'holoBorder 8s ease-in-out 2s infinite' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: isDark ? 'radial-gradient(ellipse 50% 30% at 50% 10%, rgba(0,255,163,0.07) 0%, transparent 60%)' : 'radial-gradient(ellipse 50% 30% at 50% 10%, rgba(16,185,129,0.05) 0%, transparent 60%)', animation: 'holoBorder 10s ease-in-out 1s infinite' }} />

      <ConstellationBg isDark={isDark} />
      <FloatingShapes isDark={isDark} />

      {/* Holographic card */}
      <div ref={cardRef} style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 460,
        transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.1s ease-out',
        animation: 'fadeUp 0.8s ease-out both',
      }}>
        {/* Rainbow border glow layer */}
        <div style={{
          position: 'absolute', inset: -1, borderRadius: 24, zIndex: -1,
          background: isDark 
            ? 'linear-gradient(135deg, #00ffa3, #00d4ff, #b44aff, #ff44aa, #00ffa3)'
            : 'linear-gradient(135deg, #3b82f6, #a855f7, #ec4899, #3b82f6)',
          backgroundSize: '300% 300%',
          animation: 'auroraShift 4s linear infinite',
          opacity: isDark ? 0.7 : 0.4, filter: isDark ? 'blur(1px)' : 'blur(4px)',
        }} />

        {/* Card body */}
        <div style={{
          borderRadius: 24, overflow: 'hidden',
          background: isDark ? 'rgba(5,9,26,0.88)' : 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.6)',
          animation: isDark ? 'pulseGlow 4s ease-in-out infinite' : 'pulseGlowLight 4s ease-in-out infinite',
          padding: '44px 40px 36px',
        }}>
          {/* Atom header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-block', marginBottom: 16 }}>
              <AtomIcon isDark={isDark} />
            </div>
            <h1 style={{
              margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.5px',
              background: isDark 
                ? 'linear-gradient(90deg, #00ffa3, #00d4ff, #b44aff)'
                : 'linear-gradient(90deg, #2563eb, #7c3aed, #db2777)',
              backgroundSize: '200%', WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite',
            }}>Lab Record Generator</h1>
            <p style={{ margin: '6px 0 0', color: isDark ? 'rgba(180,210,255,0.5)' : '#6b7280', fontSize: 12, letterSpacing: '0.5px' }}>
              Saveetha Engineering College
            </p>
          </div>

          {/* Alert */}
          {(error || success) && (
            <div style={{
              marginBottom: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13,
              background: error 
                ? (isDark ? 'rgba(255,68,100,0.12)' : 'rgba(254,226,226,0.8)') 
                : (isDark ? 'rgba(0,255,163,0.1)' : 'rgba(209,250,229,0.8)'),
              border: `1px solid ${error 
                ? (isDark ? 'rgba(255,68,100,0.4)' : 'rgba(252,165,165,0.8)') 
                : (isDark ? 'rgba(0,255,163,0.3)' : 'rgba(110,231,183,0.8)')}`,
              color: error ? (isDark ? '#ff9fb5' : '#b91c1c') : (isDark ? '#80ffcc' : '#047857'),
            }}>
              {error || success}
            </div>
          )}

          {/* Reset password view */}
          {tab === 'reset' ? (
            <>
              <p style={{ color: isDark ? 'rgba(180,210,255,0.6)' : '#4b5563', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>
                Enter your email to receive a reset link.
              </p>
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <ThemeInput isDark={isDark} id="r-email" type="email" placeholder="your@email.com" value={resetEmail} onChange={setResetEmail} label="Email Address" icon="📧" />
                <ThemeButton isDark={isDark} loading={loading} label="Send Reset Link" loadingLabel="Sending..." />
                <button type="button" onClick={() => { setTab('login'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: isDark ? 'rgba(0,212,255,0.7)' : '#4f46e5', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0, textAlign: 'center', fontWeight: 600 }}>
                  ← Back to Login
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Tabs */}
              <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderRadius: 12, padding: 3, marginBottom: 24, border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)' }}>
                {(['login', 'signup'] as const).map(t => (
                  <button key={t} type="button" onClick={() => { setTab(t); setError(''); setSuccess(''); }} style={{
                    flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'inherit',
                    transition: 'all 0.25s',
                    background: tab === t 
                      ? (isDark ? 'linear-gradient(135deg, rgba(0,212,255,0.25), rgba(180,74,255,0.25))' : '#ffffff') 
                      : 'transparent',
                    color: tab === t ? (isDark ? '#fff' : '#111827') : (isDark ? 'rgba(180,210,255,0.4)' : '#6b7280'),
                    boxShadow: tab === t 
                      ? (isDark ? '0 0 20px rgba(0,212,255,0.15)' : '0 2px 8px rgba(0,0,0,0.1)') 
                      : 'none',
                    textTransform: 'uppercase',
                  }}>
                    {t === 'login' ? 'Login' : 'Sign Up'}
                  </button>
                ))}
              </div>

              {tab === 'login' ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <ThemeInput isDark={isDark} id="l-email" type="email" placeholder="your@email.com" value={loginEmail} onChange={setLoginEmail} label="Email Address" icon="📧" />
                  <ThemeInput isDark={isDark} id="l-pwd" type={showPwd ? 'text' : 'password'} placeholder="Your password" value={loginPwd} onChange={setLoginPwd} label="Password" icon="🔑" right={eyeBtn} />
                  <div style={{ textAlign: 'right', marginTop: -8 }}>
                    <button type="button" onClick={() => { setTab('reset'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: isDark ? 'rgba(0,212,255,0.6)' : '#4f46e5', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', padding: 0, fontWeight: 600 }}>
                      Forgot password?
                    </button>
                  </div>
                  <ThemeButton isDark={isDark} loading={loading} label="Access System →" loadingLabel="Authenticating..." />
                </form>
              ) : (
                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <ThemeInput isDark={isDark} id="s-name" type="text" placeholder="Your full name" value={sName} onChange={setSName} label="Full Name" icon="👤" />
                  <ThemeInput isDark={isDark} id="s-email" type="email" placeholder="your@email.com" value={sEmail} onChange={setSEmail} label="Email Address" icon="📧" />
                  <ThemeInput isDark={isDark} id="s-pwd" type={showPwd ? 'text' : 'password'} placeholder="Min. 8 characters" value={sPwd} onChange={setSPwd} label="Password" icon="🔑" right={eyeBtn} />
                  <ThemeInput isDark={isDark} id="s-confirm" type={showPwd ? 'text' : 'password'} placeholder="Repeat password" value={sConfirm} onChange={setSConfirm} label="Confirm Password" icon="🛡️" />
                  <ThemeButton isDark={isDark} loading={loading} label="Create Account →" loadingLabel="Creating..." />
                </form>
              )}

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: isDark ? 'linear-gradient(90deg, transparent, rgba(0,212,255,0.2))' : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2))' }} />
                <span style={{ color: isDark ? 'rgba(180,210,255,0.35)' : '#9ca3af', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', fontWeight: 600 }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: isDark ? 'linear-gradient(90deg, rgba(0,212,255,0.2), transparent)' : 'linear-gradient(90deg, rgba(99,102,241,0.2), transparent)' }} />
              </div>

              {/* Google button */}
              <button type="button" onClick={handleGoogle} disabled={loading} style={{
                width: '100%', padding: '13px', borderRadius: 12,
                background: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(209,213,219,0.8)',
                color: isDark ? '#e8f4ff' : '#374151', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit', transition: 'all 0.2s',
                boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.05)',
              }}
                onMouseEnter={e => { 
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : '#f9fafb'; 
                  e.currentTarget.style.borderColor = isDark ? 'rgba(0,212,255,0.3)' : '#d1d5db'; 
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : '#ffffff'; 
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(209,213,219,0.8)'; 
                }}
              >
                <GoogleIcon />
                {loading ? 'Redirecting to Google...' : 'Continue with Google'}
              </button>
            </>
          )}

          {/* Footer */}
          <p style={{ textAlign: 'center', color: isDark ? 'rgba(150,180,255,0.3)' : '#9ca3af', fontSize: 10, marginTop: 24, marginBottom: 0, letterSpacing: '0.3px', fontWeight: 500 }}>
            Developed by SHANMUGAKARTHIK G · IT · Saveetha Engineering College
          </p>
        </div>
      </div>
    </div>
  );
}