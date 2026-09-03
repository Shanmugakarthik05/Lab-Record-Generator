import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordById, SavedRecord } from '../utils/historyManager';
import { DocumentPreview } from './DocumentPreview';
import { generatePDFDocument } from '../utils/pdfGenerator';
import { generateWordDocument } from '../utils/wordGenerator';

export function PublicViewer() {
  const { encodedId } = useParams<{ encodedId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<SavedRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not-found' | 'private' | 'invalid' | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [dlStatus, setDlStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!encodedId) { setError('invalid'); setLoading(false); return; }
      try {
        let decodedId: string;
        try {
          decodedId = atob(encodedId);
        } catch {
          setError('invalid'); setLoading(false); return;
        }
        const found = await getRecordById(decodedId);
        if (!mounted) return;
        if (!found) { setError('not-found'); }
        else if (!found.isShared) { setError('private'); }
        else { setRecord(found); }
      } catch (e: any) {
        if (!mounted) return;
        // Firestore permission error
        if (e?.code === 'permission-denied') setError('private');
        else setError('not-found');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [encodedId]);

  const handleDownloadPDF = async () => {
    if (!record) return;
    setDownloading(true); setDlStatus('Generating PDF...');
    try {
      await generatePDFDocument(record.courseInfo, record.theoryExperiments, record.programmingSessions);
      setDlStatus('PDF downloaded!');
    } catch { setDlStatus('PDF failed. Try again.'); }
    finally { setDownloading(false); setTimeout(() => setDlStatus(''), 3000); }
  };

  const handleDownloadWord = async () => {
    if (!record) return;
    setDownloading(true); setDlStatus('Generating Word doc...');
    try {
      await generateWordDocument(record.courseInfo, record.theoryExperiments, record.programmingSessions);
      setDlStatus('Word document downloaded!');
    } catch { setDlStatus('Word failed. Try again.'); }
    finally { setDownloading(false); setTimeout(() => setDlStatus(''), 3000); }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
    fontFamily: "'Inter','Segoe UI',sans-serif",
  };

  if (loading) {
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #e0e7ff', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b7280', fontSize: 15 }}>Loading shared record...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (error || !record) {
    const msgs: Record<string, { icon: string; title: string; desc: string }> = {
      'not-found': { icon: '🔍', title: 'Record Not Found', desc: 'This shared record does not exist or may have been deleted by its owner.' },
      'private': { icon: '🔒', title: 'Record is Private', desc: 'The owner has made this record private. It is no longer publicly accessible.' },
      'invalid': { icon: '⚠️', title: 'Invalid Link', desc: 'This link appears to be broken or malformed. Please ask the owner for a new link.' },
    };
    const m = msgs[error ?? 'not-found'];
    return (
      <div style={{ ...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ maxWidth: 440, width: '100%', background: '#fff', borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>{m.icon}</div>
          <h2 style={{ color: '#1e293b', marginBottom: 8, fontSize: 22 }}>{m.title}</h2>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>{m.desc}</p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}
          >
            Go to App →
          </button>
        </div>
      </div>
    );
  }

  const btnBase: React.CSSProperties = {
    padding: '10px 20px', borderRadius: 10, border: 'none', cursor: downloading ? 'not-allowed' : 'pointer',
    fontWeight: 600, fontSize: 13, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
    opacity: downloading ? 0.7 : 1, transition: 'transform 0.15s',
  };

  return (
    <div style={pageStyle}>
      {/* Incognito tip banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        borderBottom: '1px solid #bbf7d0',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 18 }}>🕵️</span>
        <p style={{ margin: 0, fontSize: 13, color: '#166534', textAlign: 'center' }}>
          <strong>Tip:</strong> Want to view another student's shared record without logging in?
          Open the link in an <strong>Incognito / Private tab</strong> — no account needed!
        </p>
      </div>

      {/* Header bar */}
      <div style={{ background: '#fff', boxShadow: '0 1px 0 #e5e7eb', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          {/* Left: info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                {record.courseInfo.course_code} – {record.courseInfo.course_title}
              </h1>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                Shared by <strong>{record.sharedBy || 'Unknown'}</strong> · {record.courseInfo.department} · {record.courseInfo.record_type}
              </p>
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {dlStatus && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 500 }}>{dlStatus}</span>}
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{ ...btnBase, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff' }}
            >
              📄 Download PDF
            </button>
            <button
              onClick={handleDownloadWord}
              disabled={downloading}
              style={{ ...btnBase, background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff' }}
            >
              📝 Download Word
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ ...btnBase, background: '#f1f5f9', color: '#475569' }}
            >
              ← Back to App
            </button>
          </div>
        </div>
      </div>

      {/* Info pills */}
      <div style={{ maxWidth: 960, margin: '20px auto 0', padding: '0 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { label: 'Course', value: record.courseInfo.course_code },
          { label: 'Department', value: record.courseInfo.department },
          { label: 'Semester', value: record.courseInfo.semester },
          { label: 'Type', value: record.courseInfo.record_type },
          { label: record.courseInfo.record_type === 'Theory Record' ? 'Experiments' : 'Sessions',
            value: String(record.courseInfo.record_type === 'Theory Record' ? record.theoryExperiments.length : record.programmingSessions.length) },
        ].map(p => (
          <div key={p.label} style={{ background: '#fff', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: '#475569', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <span style={{ color: '#94a3b8' }}>{p.label}: </span>
            <strong style={{ color: '#1e293b' }}>{p.value}</strong>
          </div>
        ))}
      </div>

      {/* Document preview */}
      <div style={{ maxWidth: 960, margin: '20px auto 40px', padding: '0 24px' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <DocumentPreview
            courseInfo={record.courseInfo}
            theoryExperiments={record.theoryExperiments}
            programmingSessions={record.programmingSessions}
          />
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 20 }}>
          Lab Record Generator · Saveetha Engineering College · Powered by Firebase
        </p>
      </div>
    </div>
  );
}