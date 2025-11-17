import { useState } from 'react';
import { RecordTypeSelector } from './components/RecordTypeSelector';
import { CourseInfoForm } from './components/CourseInfoForm';
import { TheoryExperimentsForm } from './components/TheoryExperimentsForm';
import { ProgrammingSessionsForm } from './components/ProgrammingSessionsForm';
import { DocumentPreview } from './components/DocumentPreview';
import { DownloadButtons } from './components/DownloadButtons';
import { FileText, GraduationCap, Building2 } from 'lucide-react';

export interface CourseInfo {
  record_type: 'Theory Record' | 'Programming Record' | '';
  course_code: string;
  course_title: string;
  student_name: string;
  register_number: string;
  department: string;
  semester: string;
  academic_year: string;
  college_name: string;
  declaration_date: string;
  font_family: string;
}

export interface TheoryExperiment {
  exp_no: string;
  date: string;
  experiment_title: string;
  github_url: string;
  marks: string;
}

export interface SubExperiment {
  label: string;
  date: string;
  title: string;
}

export interface ProgrammingSession {
  session_no: number;
  date: string;
  sub_experiments: SubExperiment[];
  github_url: string;
  marks: string;
}

export default function App() {
  const [step, setStep] = useState<number>(1);
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    record_type: '',
    course_code: '',
    course_title: '',
    student_name: '',
    register_number: '',
    department: '',
    semester: '',
    academic_year: '',
    college_name: '',
    declaration_date: new Date().toLocaleDateString('en-GB'),
    font_family: 'Times New Roman',
  });
  const [theoryExperiments, setTheoryExperiments] = useState<TheoryExperiment[]>([]);
  const [programmingSessions, setProgrammingSessions] = useState<ProgrammingSession[]>([]);

  const handleRecordTypeSelect = (type: 'Theory Record' | 'Programming Record') => {
    setCourseInfo({ ...courseInfo, record_type: type });
    setStep(2);
  };

  const handleCourseInfoSubmit = (info: CourseInfo) => {
    setCourseInfo(info);
    setStep(3);
  };

  const handleExperimentsSubmit = (experiments: TheoryExperiment[]) => {
    setTheoryExperiments(experiments);
    setStep(4);
  };

  const handleSessionsSubmit = (sessions: ProgrammingSession[]) => {
    setProgrammingSessions(sessions);
    setStep(4);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(1);
    setCourseInfo({
      record_type: '',
      course_code: '',
      course_title: '',
      student_name: '',
      register_number: '',
      department: '',
      semester: '',
      academic_year: '',
      college_name: '',
      declaration_date: new Date().toLocaleDateString('en-GB'),
      font_family: 'Times New Roman',
    });
    setTheoryExperiments([]);
    setProgrammingSessions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-12 h-12 text-blue-600" />
            <h1 className="text-blue-900">Lab Record Generator</h1>
          </div>
          <p className="text-gray-600">
            Generate professional lab records for Saveetha Engineering College with QR codes and exports
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    step >= s
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-12 h-1 ${
                      step > s ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-16 mt-2 text-sm text-gray-600">
            <span>Type</span>
            <span>Course Info</span>
            <span>Experiments</span>
            <span>Generate</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {step === 1 && <RecordTypeSelector onSelect={handleRecordTypeSelect} />}
          
          {step === 2 && (
            <CourseInfoForm
              initialData={courseInfo}
              onSubmit={handleCourseInfoSubmit}
              onBack={handleBack}
            />
          )}
          
          {step === 3 && courseInfo.record_type === 'Theory Record' && (
            <TheoryExperimentsForm
              initialData={theoryExperiments}
              onSubmit={handleExperimentsSubmit}
              onBack={handleBack}
            />
          )}
          
          {step === 3 && courseInfo.record_type === 'Programming Record' && (
            <ProgrammingSessionsForm
              initialData={programmingSessions}
              onSubmit={handleSessionsSubmit}
              onBack={handleBack}
            />
          )}
          
          {step === 4 && (
            <div>
              <DocumentPreview
                courseInfo={courseInfo}
                theoryExperiments={theoryExperiments}
                programmingSessions={programmingSessions}
                onEditCourseInfo={() => setStep(2)}
                onEditExperiments={() => setStep(3)}
              />
              <DownloadButtons
                courseInfo={courseInfo}
                theoryExperiments={theoryExperiments}
                programmingSessions={programmingSessions}
              />
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Record
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 mb-8">
          <div className="bg-gray-50 rounded-lg shadow-sm py-8 px-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <GraduationCap className="w-8 h-8 text-gray-500" />
              <p className="text-gray-600 text-sm">Developed by <span className="font-semibold text-gray-900">SHANMUGAKARTHIK G</span></p>
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                <span>🎓 B. TECH - INFORMATION TECHNOLOGY</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>SAVEETHA ENGINEERING COLLEGE</span>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-2">© 2025 SK TECH. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}