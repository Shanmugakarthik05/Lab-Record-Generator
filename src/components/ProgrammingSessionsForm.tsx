import { useState } from 'react';
import { ProgrammingSession, SubExperiment } from '../App';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Copy, ClipboardPaste, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';

interface ProgrammingSessionsFormProps {
  initialData: ProgrammingSession[];
  onSubmit: (sessions: ProgrammingSession[]) => void;
  onBack: () => void;
}

const isValidURL = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export function ProgrammingSessionsForm({ initialData, onSubmit, onBack }: ProgrammingSessionsFormProps) {
  const { isDark } = useTheme();

  const createEmptySession = (sessionNo: number): ProgrammingSession => ({
    session_no: sessionNo,
    date: '',
    github_url: '',
    marks: '',
    sub_experiments: [
      { label: 'A', date: '', title: '' },
      { label: 'B', date: '', title: '' },
      { label: 'C', date: '', title: '' },
      { label: 'D', date: '', title: '' },
      { label: 'E', date: '', title: '' },
    ]
  });

  const [sessions, setSessions] = useState<ProgrammingSession[]>(
    initialData.length > 0 ? initialData : [createEmptySession(1)]
  );
  const [copiedDate, setCopiedDate] = useState<string>('');

  const addSession = () => {
    setSessions([...sessions, createEmptySession(sessions.length + 1)]);
  };

  const removeSession = (index: number) => {
    const updated = sessions.filter((_, i) => i !== index);
    const renumbered = updated.map((session, i) => ({ ...session, session_no: i + 1 }));
    setSessions(renumbered);
  };

  const moveSessionUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sessions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    // Renumber sessions after moving
    const renumbered = updated.map((session, i) => ({ ...session, session_no: i + 1 }));
    setSessions(renumbered);
    toast.success('Session moved up');
  };

  const moveSessionDown = (index: number) => {
    if (index === sessions.length - 1) return;
    const updated = [...sessions];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    // Renumber sessions after moving
    const renumbered = updated.map((session, i) => ({ ...session, session_no: i + 1 }));
    setSessions(renumbered);
    toast.success('Session moved down');
  };

  const updateSession = (index: number, field: keyof ProgrammingSession, value: string) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Validate URL when github_url field is updated
    if (field === 'github_url' && value) {
      if (!isValidURL(value)) {
        toast.error('Please enter valid URL only');
      }
    }
    
    setSessions(updated);
  };

  const updateSubExperiment = (sessionIndex: number, subIndex: number, field: keyof SubExperiment, value: string) => {
    const updated = [...sessions];
    updated[sessionIndex].sub_experiments[subIndex] = {
      ...updated[sessionIndex].sub_experiments[subIndex],
      [field]: value
    };
    setSessions(updated);
  };

  const removeSubExperiment = (sessionIndex: number, subIndex: number) => {
    const updated = [...sessions];
    updated[sessionIndex].sub_experiments.splice(subIndex, 1);
    setSessions(updated);
  };

  const addSubExperiment = (sessionIndex: number) => {
    const updated = [...sessions];
    const existingLabels = updated[sessionIndex].sub_experiments.map(sub => sub.label);
    const availableLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const nextLabel = availableLabels.find(label => !existingLabels.includes(label)) || 'X';
    
    updated[sessionIndex].sub_experiments.push({
      label: nextLabel,
      date: '',
      title: ''
    });
    setSessions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(sessions);
  };

  const isValid = sessions.length > 0 && sessions.every(session => 
    isValidURL(session.github_url) && session.sub_experiments.length > 0 && session.sub_experiments.every(sub => sub.title)
  );

  const copyDate = (date: string) => {
    setCopiedDate(date);
    toast.success('Date copied!');
  };

  const pasteDate = (sessionIndex: number, subIndex: number) => {
    if (copiedDate) {
      updateSubExperiment(sessionIndex, subIndex, 'date', copiedDate);
      toast.success('Date pasted!');
    } else {
      toast.error('No date copied yet');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
      <h2
        className="text-2xl font-black mb-2 tracking-tight bg-clip-text text-transparent"
        style={{ backgroundImage: isDark ? 'linear-gradient(90deg, #a5b4fc, #c084fc)' : 'linear-gradient(90deg, #3730a3, #6d28d9)' }}
      >
        Programming Sessions
      </h2>
      <p className="mb-8 text-sm" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
        Add sessions with sub-experiments (A through E) and module URLs
      </p>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {sessions.map((session, sessionIndex) => (
          <div
            key={sessionIndex}
            className="p-5 rounded-2xl"
            style={{
              background: isDark ? 'rgba(12,15,38,0.80)' : 'rgba(250,245,255,0.80)',
              border: isDark ? '1px solid rgba(139,92,246,0.20)' : '1px solid rgba(216,180,254,0.35)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveSessionUp(sessionIndex)} disabled={sessionIndex === 0}
                    className="h-6 w-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(147,51,234,0.08)', color: isDark ? '#c4b5fd' : '#7e22ce' }}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => moveSessionDown(sessionIndex)} disabled={sessionIndex === sessions.length - 1}
                    className="h-6 w-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: isDark ? 'rgba(139,92,246,0.12)' : 'rgba(147,51,234,0.08)', color: isDark ? '#c4b5fd' : '#7e22ce' }}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSessionUp(sessionIndex)}
                    disabled={sessionIndex === 0}
                    className="h-6 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveSessionDown(sessionIndex)}
                    disabled={sessionIndex === sessions.length - 1}
                    className="h-6 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
                <GripVertical className="w-4 h-4" style={{ color: isDark ? '#3d4870' : '#9ca3af' }} />
                <span className="text-sm font-bold" style={{ color: isDark ? '#c4b5fd' : '#7e22ce' }}>
                  Session {session.session_no}
                </span>
              </div>
              {sessions.length > 1 && (
                <button type="button" onClick={() => removeSession(sessionIndex)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: isDark ? 'rgba(248,113,113,0.10)' : 'rgba(220,38,38,0.06)', color: isDark ? '#f87171' : '#dc2626' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="mb-4">
              <Label htmlFor={`session-marks-${sessionIndex}`}>Marks</Label>
              <Input
                id={`session-marks-${sessionIndex}`}
                value={session.marks}
                onChange={(e) => updateSession(sessionIndex, 'marks', e.target.value)}
                placeholder="e.g., 95"
              />
            </div>

            <div className="mb-4">
              <Label htmlFor={`session-url-${sessionIndex}`}>Module GitHub URL *</Label>
              <Input
                id={`session-url-${sessionIndex}`}
                value={session.github_url}
                onChange={(e) => updateSession(sessionIndex, 'github_url', e.target.value)}
                placeholder="https://github.com/username/module-repo"
                type="url"
                required
              />
            </div>

            <div className="mt-4 p-4 rounded-xl" style={{ background: isDark ? 'rgba(10,12,30,0.50)' : 'rgba(255,255,255,0.60)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: isDark ? '#c4b5fd' : '#7e22ce' }}>
                  Sub-Experiments
                </span>
                <button
                  type="button" onClick={() => addSubExperiment(sessionIndex)}
                  className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider"
                  style={{ background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(147,51,234,0.08)', color: isDark ? '#c4b5fd' : '#7e22ce' }}
                >
                  <Plus className="w-3 h-3 inline mr-1" /> Add Sub-Exp
                </button>
              </div>
              
              <div className="space-y-2">
              {session.sub_experiments.map((subExp, subIndex) => (
                <div key={subIndex} className="grid md:grid-cols-12 gap-2 items-end p-3 rounded-lg"
                  style={{
                    background: isDark ? 'rgba(15,18,40,0.80)' : '#ffffff',
                    border: isDark ? '1px solid rgba(139,92,246,0.15)' : '1px solid rgba(216,180,254,0.40)'
                  }}
                >
                  <div className="md:col-span-1">
                    <Label className="text-[10px] uppercase font-bold tracking-wider mb-1 block" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>Label</Label>
                    <div className="h-9 flex items-center justify-center rounded-md text-xs font-bold"
                      style={{ background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(147,51,234,0.08)', color: isDark ? '#c4b5fd' : '#7e22ce' }}
                    >
                      {subExp.label}
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <Label htmlFor={`sub-date-${sessionIndex}-${subIndex}`} className="text-[10px] uppercase font-bold tracking-wider mb-1 block" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>Date</Label>
                    <div className="flex gap-1">
                      <Input
                        id={`sub-date-${sessionIndex}-${subIndex}`} type="date"
                        value={subExp.date} onChange={(e) => updateSubExperiment(sessionIndex, subIndex, 'date', e.target.value)}
                        className="h-9 flex-1 px-3 text-xs rounded-md"
                        style={{
                          background: isDark ? 'rgba(12,15,38,0.95)' : 'rgba(255,255,255,0.95)',
                          border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(196,181,253,0.50)',
                          color: isDark ? '#e8e9ff' : '#1e1b4b',
                        }}
                      />
                      <button type="button" onClick={() => copyDate(subExp.date)} disabled={!subExp.date}
                        className="h-9 w-9 flex items-center justify-center rounded-md transition-all disabled:opacity-30"
                        style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.08)', color: isDark ? '#a5b4fc' : '#4f46e5' }} title="Copy date"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button type="button" onClick={() => pasteDate(sessionIndex, subIndex)} disabled={!copiedDate}
                        className="h-9 w-9 flex items-center justify-center rounded-md transition-all disabled:opacity-30"
                        style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.08)', color: isDark ? '#a5b4fc' : '#4f46e5' }} title="Paste date"
                      >
                        <ClipboardPaste className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-6">
                    <Label htmlFor={`sub-title-${sessionIndex}-${subIndex}`} className="text-[10px] uppercase font-bold tracking-wider mb-1 block" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>Title *</Label>
                    <Input id={`sub-title-${sessionIndex}-${subIndex}`} value={subExp.title} onChange={(e) => updateSubExperiment(sessionIndex, subIndex, 'title', e.target.value)} placeholder="Display operator precedence in the infix expression" required
                      className="h-9 text-xs rounded-md"
                      style={{
                        background: isDark ? 'rgba(12,15,38,0.95)' : 'rgba(255,255,255,0.95)',
                        border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(196,181,253,0.50)',
                        color: isDark ? '#e8e9ff' : '#1e1b4b',
                      }}
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <button type="button" onClick={() => removeSubExperiment(sessionIndex, subIndex)}
                      className="h-9 w-full rounded-md flex items-center justify-center transition-all"
                      style={{ background: isDark ? 'rgba(248,113,113,0.10)' : 'rgba(220,38,38,0.06)', color: isDark ? '#f87171' : '#dc2626' }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button" onClick={addSession}
          className="w-full py-3 rounded-2xl text-sm font-semibold border-2 border-dashed transition-all duration-200 hover:scale-[1.01]"
          style={{
            borderColor: isDark ? 'rgba(139,92,246,0.30)' : 'rgba(147,51,234,0.25)',
            color: isDark ? '#c4b5fd' : '#7e22ce',
            background: isDark ? 'rgba(139,92,246,0.05)' : 'rgba(147,51,234,0.04)',
          }}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Another Session
        </button>
      </div>

      <div className="flex gap-3 justify-end mt-6">
        <button
          type="button" onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(79,70,229,0.06)', border: isDark ? '1px solid rgba(99,102,241,0.20)' : '1px solid rgba(79,70,229,0.20)', color: isDark ? '#a5b4fc' : '#4f46e5' }}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit" disabled={!isValid}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          style={{ background: isValid ? (isDark ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)') : isDark ? 'rgba(99,102,241,0.30)' : 'rgba(79,70,229,0.30)' }}
        >
          Generate <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}