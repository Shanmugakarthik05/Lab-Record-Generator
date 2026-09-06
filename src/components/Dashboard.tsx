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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { History } from './History';
import { FileText, GraduationCap, Building2, History as HistoryIcon, LogOut, FileSignature, BookOpen, FlaskConical, Wand2, ChevronRight, Sun, Moon, Heart, Sparkles, Code2 } from 'lucide-react';
import {
  saveToHistory,
  getStudentInfo,
  saveStudentInfo,
  SavedRecord
} from '../utils/historyManager';
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
import { useTheme } from '../hooks/useTheme';

export function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'main' | 'history'>('main');
  const [currentRecordId, setCurrentRecordId] = useState<string>(() => `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
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

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState({
    student_name: '',
    register_number: '',
    department: '',
  });

  // Load student info when user is set
  useEffect(() => {
    if (user) {
      getStudentInfo(user.uid).then((savedStudentInfo) => {
        if (savedStudentInfo) {
          setStudentProfile(savedStudentInfo);
          setCourseInfo(prev => ({
            ...prev,
            student_name: savedStudentInfo.student_name,
            register_number: savedStudentInfo.register_number,
          }));
          setProfileForm({
            student_name: savedStudentInfo.student_name || '',
            register_number: savedStudentInfo.register_number || '',
            department: savedStudentInfo.department || ''
          });
          if (!savedStudentInfo.student_name || !savedStudentInfo.register_number || !savedStudentInfo.department) {
            setShowProfileSetup(true);
          }
        } else {
          setShowProfileSetup(true);
        }
      });
    }
  }, [user]);

  // Handle Profile Setup Save
  const handleSaveProfile = async () => {
    if (!profileForm.student_name || !profileForm.register_number || !profileForm.department) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (user) {
      const updatedProfile = {
        student_name: profileForm.student_name,
        register_number: profileForm.register_number,
        department: profileForm.department,
        userId: user.uid,
      };
      await saveStudentInfo(updatedProfile);
      setStudentProfile(updatedProfile);
      setCourseInfo(prev => ({
        ...prev,
        student_name: profileForm.student_name,
        register_number: profileForm.register_number,
      }));
      setShowProfileSetup(false);
      toast.success('Profile saved successfully!');
    }
  };

  // Auto-save student info whenever name or register number changes
  useEffect(() => {
    if (user && courseInfo.student_name && courseInfo.register_number) {
      saveStudentInfo({
        student_name: courseInfo.student_name,
        register_number: courseInfo.register_number,
        department: studentProfile?.department || '',
        userId: user.uid,
      });
    }
  }, [user, courseInfo.student_name, courseInfo.register_number, studentProfile?.department]);

  // Auto-save draft whenever data changes (after step 2)
  useEffect(() => {
    if (user && step >= 2 && courseInfo.course_code && courseInfo.course_title) {
      const timer = setTimeout(() => {
        saveToHistory(
          currentRecordId,
          courseInfo,
          theoryExperiments,
          programmingSessions,
          'draft',
          user.uid
        ).catch(err => {
          console.error("Auto-draft save failed:", err);
          toast.error(`Auto-save failed: ${err.message || 'Unknown error'}`);
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, courseInfo, theoryExperiments, programmingSessions, step, currentRecordId]);

  // Save on page unload or network reconnect/disconnect
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      if (courseInfo.course_code && courseInfo.course_title) {
        saveToHistory(
          currentRecordId,
          courseInfo,
          theoryExperiments,
          programmingSessions,
          'draft',
          user.uid
        ).catch(() => {});
      }
    };

    const handleNetworkChange = () => {
      if (courseInfo.course_code && courseInfo.course_title) {
        saveToHistory(
          currentRecordId,
          courseInfo,
          theoryExperiments,
          programmingSessions,
          'draft',
          user.uid
        ).catch(() => {});
        if (!navigator.onLine) {
          toast.warning('Network connection lost', {
            description: 'Your record has been safely auto-drafted to your device.',
          });
        } else {
          toast.success('Back online', {
            description: 'Your draft has been synced to the cloud.',
          });
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
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
    const savedStudentInfo = user ? await getStudentInfo(user.uid) : null;
    setCurrentRecordId(`rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
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

  const handleCreateNewRecord = async () => {
    // Explicitly save the current work as a draft before resetting
    if (user && courseInfo.course_code && courseInfo.course_title) {
      try {
        await saveToHistory(
          currentRecordId,
          courseInfo,
          theoryExperiments,
          programmingSessions,
          'draft',
          user.uid
        );
        toast.success('Current record saved as draft!', {
          description: 'You can find it in your History later.',
        });
      } catch (err: any) {
        toast.error(`Failed to save draft: ${err.message || 'Unknown error'}`);
      }
    }
    handleReset();
  };

  const handleLoadRecord = (record: SavedRecord) => {
    setCurrentRecordId(record.id);
    setCourseInfo(record.courseInfo);
    setTheoryExperiments(record.theoryExperiments);
    setProgrammingSessions(record.programmingSessions);
    setStep(4);
    setViewMode('main');
  };

  const initiateSaveComplete = () => {
    setIsShareDialogOpen(true);
  };

  const handleSaveComplete = async (share: boolean) => {
    if (!user) return;
    try {
      await saveToHistory(
        currentRecordId,
        courseInfo,
        theoryExperiments,
        programmingSessions,
        'complete',
        user.uid,
        share // Pass user's choice to share
      );
      // Clean up the local draft if it existed
      import('../utils/historyManager').then(({ deleteDraftLocally }) => {
        if (deleteDraftLocally) deleteDraftLocally(currentRecordId);
      });
      toast.success('✅ Record saved as complete! Starting new record...');
      // Reset and start a new record after a short delay
      setTimeout(() => {
        handleReset();
      }, 1000);
    } catch (error: any) {
      console.error("Save complete failed:", error);
      toast.error(`Failed to save record: ${error.message || 'Unknown error'}`);
    }
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
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden transition-colors duration-500">
      {/* Decorative blurred background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-8 left-40 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/60 border-b border-white/40 dark:border-white/10 shadow-sm transition-colors duration-500">
        <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Lab Record Generator
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setViewMode(viewMode === 'main' ? 'history' : 'main')}
              variant="outline"
              className="hidden sm:flex border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 backdrop-blur-sm transition-all shadow-sm"
            >
              <HistoryIcon className="w-4 h-4 mr-2" />
              {viewMode === 'main' ? 'View History' : 'Back to Generator'}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-white shadow-md hover:shadow-lg transition-all">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL} alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl border-white/50 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-2 transition-colors duration-500">
                <DropdownMenuLabel className="pb-4">
                  <div className="flex flex-col space-y-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    {studentProfile?.department && (
                      <span className="mt-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 w-max border border-blue-100 dark:border-blue-800/50">
                        Dept: {studentProfile.department}
                      </span>
                    )}
                  </div>
                </DropdownMenuLabel>
                
                <div className="sm:hidden mb-2 px-2">
                  <Button
                    onClick={() => setViewMode(viewMode === 'main' ? 'history' : 'main')}
                    variant="secondary"
                    className="w-full justify-start"
                  >
                    <HistoryIcon className="w-4 h-4 mr-2" />
                    {viewMode === 'main' ? 'History' : 'Generator'}
                  </Button>
                </div>

                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer rounded-lg mt-1">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">
        {/* Main Content or History */}
        {viewMode === 'history' ? (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8 transition-colors duration-500">
            <History 
              onLoadRecord={handleLoadRecord} 
              onClose={() => setViewMode('main')} 
              userId={user.uid} 
              userName={getUserDisplayName()}
              studentProfile={studentProfile}
            />
          </div>
        ) : (
          <>
            {/* Modern Progress Indicator */}
            <div className="mb-10 max-w-3xl mx-auto">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200/60 dark:bg-slate-800 -z-10 rounded-full transform -translate-y-1/2 transition-colors"></div>
                <div 
                  className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 -z-10 rounded-full transform -translate-y-1/2 transition-all duration-500 ease-out"
                  style={{ width: `${((step - 1) / 3) * 100}%` }}
                ></div>
                
                {[
                  { id: 1, label: 'Type', icon: FileSignature },
                  { id: 2, label: 'Course', icon: BookOpen },
                  { id: 3, label: 'Details', icon: FlaskConical },
                  { id: 4, label: 'Generate', icon: Wand2 },
                ].map((s) => (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                        step === s.id
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-110'
                          : step > s.id
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500'
                          : 'bg-white/80 dark:bg-slate-800/80 text-gray-400 dark:text-slate-500 border-2 border-gray-100 dark:border-slate-700 backdrop-blur-sm'
                      }`}
                    >
                      <s.icon className={`w-5 h-5 ${step === s.id ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className={`text-xs font-medium transition-colors ${
                      step === s.id ? 'text-blue-700 dark:text-blue-400' : step > s.id ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-10 transition-all duration-500">
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
                      onClick={handleCreateNewRecord}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create New Record
                    </button>
                    <button
                      onClick={initiateSaveComplete}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save as Complete
                    </button>
                  </div>
                  
                  {/* Share Dialog */}
                  <AlertDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Share with Community?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Do you want to share this completed record with the SEC community? Other students will be able to view and use it as a reference.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => handleSaveComplete(false)}>
                          No, keep private
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleSaveComplete(true)} className="bg-green-600 hover:bg-green-700">
                          Yes, share it!
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {/* Auto-save indicator */}
                  <p className="text-center text-sm text-gray-500 mt-4">
                    ✓ Auto-saved as draft
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Creative Developer Credit Footer */}
        <div className="mt-20 pb-12 flex justify-center w-full">
          <div className="relative group cursor-pointer">
            {/* Glowing background effect that expands on hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            
            {/* The main card */}
            <div className="relative flex items-center gap-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 py-3 px-5 sm:py-4 sm:px-6 rounded-2xl shadow-xl transition-all duration-300 transform group-hover:scale-[1.02]">
              
              {/* Left Side: Avatar/Icon */}
              <div className="relative hidden sm:block">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[11px] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-500 group-hover:animate-pulse" />
                  </div>
                </div>
                {/* Ping animation dot */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
              </div>

              {/* Right Side: Details */}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mb-0.5 flex items-center gap-1">
                  <Code2 className="w-3 h-3" /> System Architect
                </span>
                <span className="text-lg font-black bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-500">
                  SHANMUGAKARTHIK G
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    INFORMATION TECHNOLOGY
                  </span>
                  <span className="hidden sm:inline text-xs text-gray-400 dark:text-slate-500">
                    Saveetha Engineering College
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Setup Dialog */}
      <AlertDialog open={showProfileSetup} onOpenChange={() => {}}>
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-white/50 dark:border-slate-800 text-gray-900 dark:text-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Profile</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
              Please enter your details to set up your profile and enable community features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                placeholder="e.g. John Doe"
                value={profileForm.student_name}
                onChange={e => setProfileForm(p => ({ ...p, student_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Register Number</label>
              <input 
                type="text" 
                className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                placeholder="e.g. 21152012345"
                value={profileForm.register_number}
                onChange={e => setProfileForm(p => ({ ...p, register_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                value={profileForm.department}
                onChange={e => setProfileForm(p => ({ ...p, department: e.target.value }))}
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="CSE">CSE</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="BME">BME</option>
                <option value="AIDS">AIDS</option>
                <option value="AIML">AI&ML</option>
              </select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleSaveProfile} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Save Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </div>
  );
}