import { useState } from 'react';
import { ProgrammingSession, SubExperiment } from '../App';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { DateSelect } from './DateSelect';
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Copy, ClipboardPaste } from 'lucide-react';
import { toast } from 'sonner';

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
      <h2 className="mb-6 text-gray-800">Programming Record Sessions</h2>
      <p className="mb-6 text-gray-600">Add sessions with sub-experiments (A through E) and module URLs</p>
      
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {sessions.map((session, sessionIndex) => (
          <div key={sessionIndex} className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
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
                <GripVertical className="w-5 h-5 text-purple-400" />
                <h3 className="text-purple-900">Session {session.session_no}</h3>
              </div>
              {sessions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSession(sessionIndex)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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

            <div className="space-y-3 bg-white p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-purple-800">Sub-Experiments</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSubExperiment(sessionIndex)}
                  className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Sub-Exp
                </Button>
              </div>
              {session.sub_experiments.map((subExp, subIndex) => (
                <div key={subIndex} className="grid md:grid-cols-12 gap-2 items-end p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="md:col-span-1">
                    <Label className="text-xs">Label</Label>
                    <div className="h-10 flex items-center justify-center bg-purple-100 rounded-md">
                      <span>{subExp.label}</span>
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <Label htmlFor={`sub-date-${sessionIndex}-${subIndex}`} className="text-xs">Date</Label>
                    <div className="flex gap-1">
                      <DateSelect
                        id={`sub-date-${sessionIndex}-${subIndex}`}
                        value={subExp.date}
                        onChange={(val) => updateSubExperiment(sessionIndex, subIndex, 'date', val)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => copyDate(subExp.date)}
                        disabled={!subExp.date}
                        className="px-2 h-10"
                        title="Copy date"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pasteDate(sessionIndex, subIndex)}
                        disabled={!copiedDate}
                        className="px-2 h-10"
                        title="Paste date"
                      >
                        <ClipboardPaste className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-6">
                    <Label htmlFor={`sub-title-${sessionIndex}-${subIndex}`} className="text-xs">Title *</Label>
                    <Input
                      id={`sub-title-${sessionIndex}-${subIndex}`}
                      value={subExp.title}
                      onChange={(e) => updateSubExperiment(sessionIndex, subIndex, 'title', e.target.value)}
                      placeholder="Display operator precedence in the infix expression"
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubExperiment(sessionIndex, subIndex)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={addSession}
          className="w-full border-dashed border-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Session
        </Button>
      </div>

      <div className="flex gap-4 justify-end mt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={!isValid}>
          Generate Document
        </Button>
      </div>
    </form>
  );
}