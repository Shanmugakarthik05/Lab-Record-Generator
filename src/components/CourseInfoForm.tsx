import { useState } from 'react';
import { CourseInfo } from '../App';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
  const [formData, setFormData] = useState<CourseInfo>(initialData);

  const handleChange = (field: keyof CourseInfo, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isValid = formData.course_code && formData.course_title && 
                  formData.student_name && formData.register_number;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <h2 className="mb-6 text-gray-800">Course & Student Information</h2>
      
      <div className="space-y-6">
        {/* Required Fields */}
        <div className="p-6 bg-blue-50 rounded-lg space-y-4">
          <h3 className="text-blue-900 mb-4">Required Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course_code">Course Code *</Label>
              <Input
                id="course_code"
                value={formData.course_code}
                onChange={(e) => handleChange('course_code', e.target.value)}
                placeholder="e.g., 19AI408"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="course_title">Course Title *</Label>
              <Input
                id="course_title"
                value={formData.course_title}
                onChange={(e) => handleChange('course_title', e.target.value)}
                placeholder="e.g., DATA STRUCTURES"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="student_name">Student Name *</Label>
            <Input
              id="student_name"
              value={formData.student_name}
              onChange={(e) => handleChange('student_name', e.target.value)}
              placeholder="e.g., KUTTY"
              required
            />
          </div>

          <div>
            <Label htmlFor="register_number">Register Number *</Label>
            <Input
              id="register_number"
              value={formData.register_number}
              onChange={(e) => handleChange('register_number', e.target.value)}
              placeholder="e.g., 21222322"
              required
            />
          </div>
        </div>

        {/* Optional Fields */}
        <div className="p-6 bg-gray-50 rounded-lg space-y-4">
          <h3 className="text-gray-700 mb-4">Optional Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </div>
            
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                value={formData.semester}
                onChange={(e) => handleChange('semester', e.target.value)}
                placeholder="e.g., III"
              />
            </div>

            <div>
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input
                id="academic_year"
                value={formData.academic_year}
                onChange={(e) => handleChange('academic_year', e.target.value)}
                placeholder="e.g., 2024-2025"
              />
            </div>

            <div>
              <Label htmlFor="declaration_date">Declaration Date</Label>
              <Input
                id="declaration_date"
                type="date"
                value={formData.declaration_date}
                onChange={(e) => handleChange('declaration_date', e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="college_name">College Name</Label>
              <Input
                id="college_name"
                value={formData.college_name}
                onChange={(e) => handleChange('college_name', e.target.value)}
                placeholder="e.g., Anna University"
              />
            </div>

            <div>
              <Label htmlFor="font_family">Font Style</Label>
              <Select
                value={formData.font_family}
                onValueChange={(value) => handleChange('font_family', value)}
              >
                <SelectTrigger id="font_family">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-end mt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" disabled={!isValid}>
          Next: Add Experiments
        </Button>
      </div>
    </form>
  );
}