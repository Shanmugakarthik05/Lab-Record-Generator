import { useState } from 'react';
import { CourseInfo } from '../App';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTheme } from '../hooks/useTheme';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface CourseInfoFormProps {
  initialData: CourseInfo;
  onSubmit: (data: CourseInfo) => void;
  onBack: () => void;
}

const FONT_OPTIONS = [
  { value: 'Times New Roman', label: 'Times New Roman (Default)' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Cambria', label: 'Cambria' },
];

export function CourseInfoForm({ initialData, onSubmit, onBack }: CourseInfoFormProps) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<CourseInfo>(initialData);

  const handleChange = (field: keyof CourseInfo, value: string) => setFormData({ ...formData, [field]: value });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); };
  const isValid = formData.course_code && formData.course_title && formData.student_name && formData.register_number;

  const inputStyle = {
    background: isDark ? 'rgba(12,15,38,0.95)' : 'rgba(255,255,255,0.95)',
    border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(196,181,253,0.50)',
    color: isDark ? '#e8e9ff' : '#1e1b4b',
    borderRadius: '0.75rem',
    padding: '0.625rem 0.875rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    fontWeight: 500,
  };

  const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: isDark ? '#6b7daa' : '#6b7280',
    marginBottom: '0.375rem',
    display: 'block',
  };

  const sectionStyle = {
    background: isDark ? 'rgba(12,15,38,0.60)' : 'rgba(240,244,255,0.70)',
    border: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(196,181,253,0.30)',
    borderRadius: '1rem',
    padding: '1.25rem',
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <h2
        className="text-2xl font-black mb-2 tracking-tight bg-clip-text text-transparent"
        style={{ backgroundImage: isDark ? 'linear-gradient(90deg, #a5b4fc, #c084fc)' : 'linear-gradient(90deg, #3730a3, #6d28d9)' }}
      >
        Course &amp; Student Info
      </h2>
      <p className="text-sm mb-8" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
        Fill in your course and personal details
      </p>

      <div className="space-y-5">
        {/* Required Fields */}
        <div style={sectionStyle}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: isDark ? '#818cf8' : '#4f46e5' }}>
            Required Fields
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Course Code *</label>
              <input style={inputStyle} id="course_code" value={formData.course_code} onChange={e => handleChange('course_code', e.target.value)} placeholder="e.g., 19AI408" required />
            </div>
            <div>
              <label style={labelStyle}>Course Title *</label>
              <input style={inputStyle} id="course_title" value={formData.course_title} onChange={e => handleChange('course_title', e.target.value)} placeholder="e.g., DATA STRUCTURES" required />
            </div>
            <div>
              <label style={labelStyle}>Student Name *</label>
              <input style={inputStyle} id="student_name" value={formData.student_name} onChange={e => handleChange('student_name', e.target.value)} placeholder="e.g., KUTTY" required />
            </div>
            <div>
              <label style={labelStyle}>Register Number *</label>
              <input style={inputStyle} id="register_number" value={formData.register_number} onChange={e => handleChange('register_number', e.target.value)} placeholder="e.g., 21222322" required />
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div style={{ ...sectionStyle, background: isDark ? 'rgba(10,12,30,0.50)' : 'rgba(248,250,255,0.70)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: isDark ? '#6b7daa' : '#9ca3af' }}>
            Optional Fields
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Semester</label>
              <input style={inputStyle} id="semester" value={formData.semester} onChange={e => handleChange('semester', e.target.value)} placeholder="e.g., IV" />
            </div>
            <div>
              <label style={labelStyle}>Academic Year</label>
              <input style={inputStyle} id="academic_year" value={formData.academic_year} onChange={e => handleChange('academic_year', e.target.value)} placeholder="e.g., 2023-2024" />
            </div>
            <div>
              <label style={labelStyle}>College Name</label>
              <input style={inputStyle} id="college_name" value={formData.college_name} onChange={e => handleChange('college_name', e.target.value)} placeholder="Saveetha Engineering College" />
            </div>
            <div>
              <label style={labelStyle}>Font Style</label>
              <Select value={formData.font_family} onValueChange={value => handleChange('font_family', value)}>
                <SelectTrigger
                  id="font_family"
                  className="rounded-xl text-sm font-medium"
                  style={{
                    background: isDark ? 'rgba(12,15,38,0.95)' : 'rgba(255,255,255,0.95)',
                    border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(196,181,253,0.50)',
                    color: isDark ? '#e8e9ff' : '#1e1b4b',
                  }}
                >
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl text-sm"
                  style={{
                    background: isDark ? 'rgba(12,15,40,0.97)' : 'rgba(255,255,255,0.97)',
                    border: isDark ? '1px solid rgba(99,102,241,0.20)' : '1px solid rgba(196,181,253,0.40)',
                  }}
                >
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end mt-8">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
          style={{
            background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(79,70,229,0.06)',
            border: isDark ? '1px solid rgba(99,102,241,0.20)' : '1px solid rgba(79,70,229,0.20)',
            color: isDark ? '#a5b4fc' : '#4f46e5',
          }}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          style={{
            background: isValid
              ? isDark ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)'
              : isDark ? 'rgba(99,102,241,0.30)' : 'rgba(79,70,229,0.30)',
            boxShadow: isValid ? '0 4px 12px rgba(79,70,229,0.25)' : 'none',
          }}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}