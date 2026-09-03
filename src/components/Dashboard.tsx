import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { RecordTypeSelector } from './RecordTypeSelector';
import { CourseInfoForm } from './CourseInfoForm';
import { TheoryExperimentsForm } from './TheoryExperimentsForm';
import { ProgrammingSessionsForm } from './ProgrammingSessionsForm';
import { DocumentPreview } from './DocumentPreview';
import { DownloadButtons } from './DownloadButtons';
import { History } from './History';
import { FileText, GraduationCap, Building2, History as HistoryIcon, LogOut } from 'lucide-react';
import { saveToHistory, getStudentInfo, saveStudentInfo, SavedRecord } from '../utils/historyManager';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import type { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';

export function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'main' | 'history'>('main');
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

  // Check authentication status on mount
  useEffect(() => {
    checkUser();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        navigate('/');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  const checkUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }
  };

  // Load student info when user is set
  useEffect(() => {
    if (user) {
      getStudentInfo(user.id).then((savedStudentInfo) => {
        if (savedStudentInfo) {
          setCourseInfo(prev => ({
            ...prev,
            student_name: savedStudentInfo.student_name,
            register_number: savedStudentInfo.register_number,
          }));
        }
      });
    }
  }, [user]);

  // Auto-save student info whenever name or register number changes
  useEffect(() => {
    if (user && courseInfo.student_name && courseInfo.register_number) {
      saveStudentInfo({
        student_name: courseInfo.student_name,
        register_number: courseInfo.register_number,
        userId: user.id, // Add user ID
      });
    }
  }, [user, courseInfo.student_name, courseInfo.register_number]);

  // Auto-save draft whenever data changes (after step 2)
  useEffect(() => {
    if (user && step >= 2 && courseInfo.course_code && courseInfo.course_title) {
      const timer = setTimeout(() => {
        saveToHistory(
          courseInfo,
          theoryExperiments,
          programmingSessions,
          'draft', // Always auto-save as draft
          user.id // Pass user ID
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, courseInfo, theoryExperiments, programmingSessions, step]);

  // Save on page unload or network reconnect
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      if (courseInfo.course_code && courseInfo.course_title) {
        saveToHistory(
          courseInfo,
          theoryExperiments,
          programmingSessions,
          'draft', // Always auto-save as draft
          user.id // Pass user ID
        );
      }
    };

    const handleOnline = () => {
      if (courseInfo.course_code && courseInfo.course_title) {
        saveToHistory(
          courseInfo,
          theoryExperiments,
          programmingSessions,
          'draft', // Always auto-save as draft
          user.id // Pass user ID
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
    };
  }, [user, courseInfo, theoryExperiments, programmingSessions, step]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

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

  const handleReset = async () => {
    const savedStudentInfo = user ? await getStudentInfo(user.id) : null;
    setStep(1);
    setCourseInfo({
      record_type: '',
      course_code: '',
      course_title: '',
      student_name: savedStudentInfo?.student_name || '',
      register_number: savedStudentInfo?.register_number || '',
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

  const handleLoadRecord = (record: SavedRecord) => {
    setCourseInfo(record.courseInfo);
    setTheoryExperiments(record.theoryExperiments);
    setProgrammingSessions(record.programmingSessions);
    setStep(4);
    setViewMode('main');
  };

  const handleSaveComplete = () => {
    if (!user) return;
    saveToHistory(
      courseInfo,
      theoryExperiments,
      programmingSessions,
      'complete',
      user.id // Pass user ID
    );
    toast.success('✅ Record saved as complete! Starting new record...');
    // Reset and start a new record after a short delay
    setTimeout(() => {
      handleReset();
    }, 1000);
  };

  if (!user) {
    return null; // Show nothing while checking auth
  }

  const getUserDisplayName = () => {
    if (user.displayName) return user.displayName;
    return user.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-12 h-12 text-blue-600" />
                <h1 className="text-blue-900">Lab Record Generator</h1>
              </div>
              <p className="text-gray-600 text-center">
                Generate professional lab records for Saveetha Engineering College with QR codes and exports
              </p>
            </div>
            
            {/* User Profile in Top Right */}
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p>{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* History Button */}
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => setViewMode(viewMode === 'main' ? 'history' : 'main')}
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <HistoryIcon className="w-4 h-4 mr-2" />
              {viewMode === 'main' ? 'View History' : 'Back to Generator'}
            </Button>
          </div>
        </div>

        {/* Main Content or History */}
        {viewMode === 'history' ? (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <History 
              onLoadRecord={handleLoadRecord} 
              onClose={() => setViewMode('main')} 
              userId={user.id} 
              userName={getUserDisplayName()}
            />
          </div>
        ) : (
          <>
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
                    <button
                      onClick={handleSaveComplete}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save as Complete
                    </button>
                  </div>
                  
                  {/* Auto-save indicator */}
                  <p className="text-center text-sm text-gray-500 mt-4">
                    ✓ Auto-saved as draft
                  </p>
                </div>
              )}
            </div>
          </>
        )}

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
      <Toaster />
    </div>
  );
}