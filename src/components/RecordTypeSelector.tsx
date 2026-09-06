import { BookOpen, Code2 } from 'lucide-react';

interface RecordTypeSelectorProps {
  onSelect: (type: 'Theory Record' | 'Programming Record') => void;
}

export function RecordTypeSelector({ onSelect }: RecordTypeSelectorProps) {
  return (
    <div className="text-center">
      <h2 className="mb-6 text-gray-800 dark:text-slate-200 dark:text-slate-200">Select Record Type</h2>
      <p className="mb-8 text-gray-600 dark:text-slate-400 dark:text-slate-400">Choose the type of lab record you want to generate</p>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <button
          onClick={() => onSelect('Theory Record')}
          className="group p-8 border-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-500 transition-colors">
              <BookOpen className="w-12 h-12 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-blue-900 dark:text-blue-100 dark:text-blue-100">Theory Record</h3>
            <p className="text-gray-600 dark:text-slate-400 dark:text-slate-400 text-sm">
              Generate a theory lab record with individual experiments, dates, and GitHub links
            </p>
            <ul className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 text-left space-y-1">
              <li>• Individual experiments with dates</li>
              <li>• QR codes for each experiment</li>
              <li>• Marks and signature columns</li>
            </ul>
          </div>
        </button>

        <button
          onClick={() => onSelect('Programming Record')}
          className="group p-8 border-2 border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-white dark:from-slate-800 dark:to-slate-900"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-500 transition-colors">
              <Code2 className="w-12 h-12 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-purple-900 dark:text-purple-100">Programming Record</h3>
            <p className="text-gray-600 dark:text-slate-400 dark:text-slate-400 text-sm">
              Generate a programming lab record with sessions containing multiple sub-experiments
            </p>
            <ul className="text-sm text-gray-500 dark:text-slate-400 dark:text-slate-400 text-left space-y-1">
              <li>• Sessions with sub-experiments (A-E)</li>
              <li>• One QR code per session</li>
              <li>• Module-based organization</li>
            </ul>
          </div>
        </button>
      </div>
    </div>
  );
}
