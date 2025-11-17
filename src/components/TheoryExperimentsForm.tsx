import { useState } from 'react';
import { TheoryExperiment } from '../App';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Plus, Trash2 } from 'lucide-react';

interface TheoryExperimentsFormProps {
  initialData: TheoryExperiment[];
  onSubmit: (experiments: TheoryExperiment[]) => void;
  onBack: () => void;
}

export function TheoryExperimentsForm({ initialData, onSubmit, onBack }: TheoryExperimentsFormProps) {
  const [experiments, setExperiments] = useState<TheoryExperiment[]>(
    initialData.length > 0 ? initialData : [
      { exp_no: '1', date: '', experiment_title: '', github_url: '', marks: '' }
    ]
  );

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

  const updateExperiment = (index: number, field: keyof TheoryExperiment, value: string | number) => {
    const updated = [...experiments];
    updated[index] = { ...updated[index], [field]: value };
    setExperiments(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(experiments);
  };

  const isValid = experiments.length > 0 && experiments.every(exp => 
    exp.exp_no && exp.experiment_title && exp.github_url
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <h2 className="mb-6 text-gray-800">Theory Record Experiments</h2>
      <p className="mb-6 text-gray-600">Add all experiments with their details and GitHub URLs</p>
      
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
        {experiments.map((exp, index) => (
          <div key={index} className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700">Experiment {exp.exp_no}</h3>
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
                <Input
                  id={`date-${index}`}
                  type="date"
                  value={exp.date}
                  onChange={(e) => updateExperiment(index, 'date', e.target.value)}
                />
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