import { useState } from 'react';
import { TheoryExperiment } from '../App';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Copy, ClipboardPaste, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';

interface TheoryExperimentsFormProps {
  initialData: TheoryExperiment[];
  onSubmit: (experiments: TheoryExperiment[]) => void;
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

export function TheoryExperimentsForm({ initialData, onSubmit, onBack }: TheoryExperimentsFormProps) {
  const { isDark } = useTheme();
  const [experiments, setExperiments] = useState<TheoryExperiment[]>(
    initialData.length > 0 ? initialData : [
      { exp_no: '1', date: '', experiment_title: '', github_url: '', marks: '' }
    ]
  );
  const [copiedDate, setCopiedDate] = useState<string>('');

  const addExperiment = () => {
    setExperiments([
      ...experiments,
      { 
        exp_no: String(experiments.length + 1), 
        date: '', 
        experiment_title: '', 
        github_url: '', 
        marks: '' 
      }
    ]);
  };

  const removeExperiment = (index: number) => {
    const updated = experiments.filter((_, i) => i !== index);
    setExperiments(updated);
  };

  const moveExperimentUp = (index: number) => {
    if (index === 0) return;
    const updated = [...experiments];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    
    // Auto-renumber experiments after moving
    const renumbered = updated.map((exp, i) => ({
      ...exp,
      exp_no: String(i + 1)
    }));
    
    setExperiments(renumbered);
    toast.success('Experiment moved up and renumbered');
  };

  const moveExperimentDown = (index: number) => {
    if (index === experiments.length - 1) return;
    const updated = [...experiments];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    
    // Auto-renumber experiments after moving
    const renumbered = updated.map((exp, i) => ({
      ...exp,
      exp_no: String(i + 1)
    }));
    
    setExperiments(renumbered);
    toast.success('Experiment moved down and renumbered');
  };

  const updateExperiment = (index: number, field: keyof TheoryExperiment, value: string | number) => {
    const updated = [...experiments];
    updated[index] = { ...updated[index], [field]: value };
    
    // Validate URL when github_url field is updated
    if (field === 'github_url' && value && typeof value === 'string') {
      if (!isValidURL(value)) {
        toast.error('Please enter valid URL only');
      }
    }
    
    setExperiments(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(experiments);
  };

  const isValid = experiments.length > 0 && experiments.every(exp => 
    exp.exp_no && exp.experiment_title && isValidURL(exp.github_url)
  );

  const copyDate = (date: string) => {
    setCopiedDate(date);
    toast.success('Date copied!');
  };

  const pasteDate = (index: number) => {
    if (copiedDate) {
      updateExperiment(index, 'date', copiedDate);
      toast.success('Date pasted!');
    } else {
      toast.error('No date copied yet');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <h2
        className="text-2xl font-black mb-2 tracking-tight bg-clip-text text-transparent"
        style={{ backgroundImage: isDark ? 'linear-gradient(90deg, #a5b4fc, #c084fc)' : 'linear-gradient(90deg, #3730a3, #6d28d9)' }}
      >
        Theory Experiments
      </h2>
      <p className="mb-8 text-sm" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
        Add all experiments with their details and GitHub URLs
      </p>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {experiments.map((exp, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl"
            style={{
              background: isDark ? 'rgba(12,15,38,0.80)' : 'rgba(240,244,255,0.80)',
              border: isDark ? '1px solid rgba(99,102,241,0.20)' : '1px solid rgba(196,181,253,0.35)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveExperimentUp(index)} disabled={index === 0}
                    className="h-6 w-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.08)', color: isDark ? '#a5b4fc' : '#4f46e5' }}
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button type="button" onClick={() => moveExperimentDown(index)} disabled={index === experiments.length - 1}
                    className="h-6 w-6 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.08)', color: isDark ? '#a5b4fc' : '#4f46e5' }}
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                <GripVertical className="w-4 h-4" style={{ color: isDark ? '#3d4870' : '#9ca3af' }} />
                <span className="text-sm font-bold" style={{ color: isDark ? '#a5b4fc' : '#4f46e5' }}>
                  Experiment {exp.exp_no}
                </span>
              </div>
              {experiments.length > 1 && (
                <button type="button" onClick={() => removeExperiment(index)}
                  className="h-7 w-7 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: isDark ? 'rgba(248,113,113,0.10)' : 'rgba(220,38,38,0.06)', color: isDark ? '#f87171' : '#dc2626' }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`exp-no-${index}`}>Exp No. *</Label>
                <Input
                  id={`exp-no-${index}`}
                  value={exp.exp_no}
                  onChange={(e) => updateExperiment(index, 'exp_no', e.target.value)}
                  placeholder="e.g., 1, 1a, 1b"
                  required
                />
              </div>

              <div>
                <Label htmlFor={`date-${index}`}>Date</Label>
                <div className="flex gap-1">
                  <Input
                    id={`date-${index}`}
                    type="date"
                    value={exp.date}
                    onChange={(e) => updateExperiment(index, 'date', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyDate(exp.date)}
                    disabled={!exp.date}
                    className="px-2"
                    title="Copy date"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => pasteDate(index)}
                    disabled={!copiedDate}
                    className="px-2"
                    title="Paste date"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor={`marks-${index}`}>Marks</Label>
                <Input
                  id={`marks-${index}`}
                  value={exp.marks}
                  onChange={(e) => updateExperiment(index, 'marks', e.target.value)}
                  placeholder="e.g., 95"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor={`title-${index}`}>Experiment Title *</Label>
              <Input
                id={`title-${index}`}
                value={exp.experiment_title}
                onChange={(e) => updateExperiment(index, 'experiment_title', e.target.value)}
                placeholder="e.g., DDL Commands"
                required
              />
            </div>

            <div className="mt-4">
              <Label htmlFor={`github-${index}`}>GitHub URL *</Label>
              <Input
                id={`github-${index}`}
                value={exp.github_url}
                onChange={(e) => updateExperiment(index, 'github_url', e.target.value)}
                placeholder="https://github.com/username/repo"
                type="url"
                required
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={addExperiment}
          className="w-full py-3 rounded-2xl text-sm font-semibold border-2 border-dashed transition-all duration-200 hover:scale-[1.01]"
          style={{
            borderColor: isDark ? 'rgba(99,102,241,0.30)' : 'rgba(79,70,229,0.25)',
            color: isDark ? '#818cf8' : '#4f46e5',
            background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(79,70,229,0.04)',
          }}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Add Another Experiment
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