import { BookOpen, Code2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface RecordTypeSelectorProps {
  onSelect: (type: 'Theory Record' | 'Programming Record') => void;
}

export function RecordTypeSelector({ onSelect }: RecordTypeSelectorProps) {
  const { isDark } = useTheme();

  return (
    <div className="text-center">
      <h2
        className="text-2xl font-black mb-3 tracking-tight bg-clip-text text-transparent"
        style={{ backgroundImage: isDark ? 'linear-gradient(90deg, #a5b4fc, #c084fc)' : 'linear-gradient(90deg, #3730a3, #6d28d9)' }}
      >
        Select Record Type
      </h2>
      <p className="mb-10 text-sm font-medium" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
        Choose the type of lab record you want to generate
      </p>

      <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {/* Theory Record */}
        <button
          onClick={() => onSelect('Theory Record')}
          className="group p-7 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(15,18,40,0.80) 100%)'
              : 'linear-gradient(135deg, rgba(219,234,254,0.70) 0%, rgba(255,255,255,0.90) 100%)',
            border: isDark ? '1px solid rgba(59,130,246,0.20)' : '1px solid rgba(147,197,253,0.50)',
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.03)'
              : '0 4px 20px rgba(59,130,246,0.08)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))'
                  : 'linear-gradient(135deg, rgba(219,234,254,0.90), rgba(199,210,254,0.90))',
                border: isDark ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(147,197,253,0.40)',
              }}
            >
              <BookOpen
                className="w-8 h-8 transition-colors"
                style={{ color: isDark ? '#93c5fd' : '#2563eb' }}
              />
            </div>
            <h3
              className="text-lg font-black"
              style={{ color: isDark ? '#bfdbfe' : '#1d4ed8' }}
            >
              Theory Record
            </h3>
            <p className="text-sm text-center leading-relaxed" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
              Generate a theory lab record with individual experiments, dates, and GitHub links
            </p>
            <ul className="text-xs text-left space-y-1.5 w-full" style={{ color: isDark ? '#4b6aa0' : '#9ca3af' }}>
              <li className="flex items-center gap-2">
                <span style={{ color: isDark ? '#818cf8' : '#7c3aed' }}>→</span>
                Individual experiments with dates
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: isDark ? '#818cf8' : '#7c3aed' }}>→</span>
                QR codes for each experiment
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: isDark ? '#818cf8' : '#7c3aed' }}>→</span>
                Marks and signature columns
              </li>
            </ul>
          </div>
        </button>

        {/* Programming Record */}
        <button
          onClick={() => onSelect('Programming Record')}
          className="group p-7 rounded-2xl text-left transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(15,18,40,0.80) 100%)'
              : 'linear-gradient(135deg, rgba(237,233,254,0.70) 0%, rgba(255,255,255,0.90) 100%)',
            border: isDark ? '1px solid rgba(139,92,246,0.20)' : '1px solid rgba(196,181,253,0.50)',
            boxShadow: isDark
              ? '0 4px 20px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.03)'
              : '0 4px 20px rgba(139,92,246,0.08)',
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(168,85,247,0.15))'
                  : 'linear-gradient(135deg, rgba(237,233,254,0.90), rgba(221,214,254,0.90))',
                border: isDark ? '1px solid rgba(139,92,246,0.25)' : '1px solid rgba(196,181,253,0.40)',
              }}
            >
              <Code2
                className="w-8 h-8 transition-colors"
                style={{ color: isDark ? '#c4b5fd' : '#7c3aed' }}
              />
            </div>
            <h3
              className="text-lg font-black"
              style={{ color: isDark ? '#ddd6fe' : '#6d28d9' }}
            >
              Programming Record
            </h3>
            <p className="text-sm text-center leading-relaxed" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
              Generate a programming lab record with sessions containing multiple sub-experiments
            </p>
            <ul className="text-xs text-left space-y-1.5 w-full" style={{ color: isDark ? '#4b6aa0' : '#9ca3af' }}>
              <li className="flex items-center gap-2">
                <span style={{ color: isDark ? '#818cf8' : '#7c3aed' }}>→</span>
                Sessions with sub-experiments (A–E)
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: isDark ? '#818cf8' : '#7c3aed' }}>→</span>
                One QR code per session
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: isDark ? '#818cf8' : '#7c3aed' }}>→</span>
                Module-based organization
              </li>
            </ul>
          </div>
        </button>
      </div>
    </div>
  );
}
