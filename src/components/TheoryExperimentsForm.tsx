import { useState } from 'react';
import { TheoryExperiment } from '../App';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Copy, ClipboardPaste } from 'lucide-react';
import { toast } from 'sonner';

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
      <h2 className="mb-6 text-gray-800">Theory Record Experiments</h2>
      <p className="mb-6 text-gray-600">Add all experiments with their details and GitHub URLs</p>
      
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {experiments.map((exp, index) => (
          <div key={index} className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveExperimentUp(index)}
                    disabled={index === 0}
                    className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveExperimentDown(index)}
                    disabled={index === experiments.length - 1}
                    className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
                <GripVertical className="w-5 h-5 text-gray-400" />
                <h3 className="text-gray-700">Experiment {exp.exp_no}</h3>
              </div>
              {experiments.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperiment(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
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

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={addExperiment}
          className="w-full border-dashed border-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Experiment
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