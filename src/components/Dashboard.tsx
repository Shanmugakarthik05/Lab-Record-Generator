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
import { FileText, GraduationCap, Building2, History as HistoryIcon, LogOut, FileSignature, BookOpen, FlaskConical, Wand2, ChevronRight } from 'lucide-react';
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

export function Dashboard() {
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
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Decorative blurred background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-8 left-40 w-96 h-96 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/40 shadow-sm">
        <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                Lab Record Generator
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setViewMode(viewMode === 'main' ? 'history' : 'main')}
              variant="outline"
              className="hidden sm:flex border-purple-200 text-purple-700 hover:bg-purple-100/50 backdrop-blur-sm transition-all shadow-sm"
            >
              <HistoryIcon className="w-4 h-4 mr-2" />
              {viewMode === 'main' ? 'View History' : 'Back to Generator'}
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
              <DropdownMenuContent align="end" className="w-64 rounded-xl shadow-xl border-white/50 bg-white/95 backdrop-blur-xl p-2">
                <DropdownMenuLabel className="pb-4">
                  <div className="flex flex-col space-y-1">
                    <p className="font-semibold text-gray-800">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {studentProfile?.department && (
                      <span className="mt-2 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 w-max border border-blue-100">
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
          <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-8">
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
                <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200/60 -z-10 rounded-full transform -translate-y-1/2"></div>
                <div 
                  className="absolute left-0 top-1/2 h-1 bg-gradient-to-r from-blue-600 to-purple-600 -z-10 rounded-full transform -translate-y-1/2 transition-all duration-500 ease-out"
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
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                          : step > s.id
                          ? 'bg-white text-blue-600 border-2 border-blue-600'
                          : 'bg-white/80 text-gray-400 border-2 border-gray-100 backdrop-blur-sm'
                      }`}
                    >
                      <s.icon className={`w-5 h-5 ${step === s.id ? 'animate-pulse' : ''}`} />
                    </div>
                    <span className={`text-xs font-medium transition-colors ${
                      step === s.id ? 'text-blue-700' : step > s.id ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-6 sm:p-10 transition-all duration-300">
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

        {/* Footer */}
        <div className="mt-12 pb-8 flex justify-center">
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-full py-3 px-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span className="font-medium">B. TECH IT</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-medium">SAVEETHA ENGINEERING COLLEGE</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full hidden sm:block"></div>
              <span className="hidden sm:block text-gray-500 font-medium">By SHANMUGAKARTHIK G</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Setup Dialog */}
      <AlertDialog open={showProfileSetup} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Your Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter your details to set up your profile and enable community features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md"
                placeholder="e.g. John Doe"
                value={profileForm.student_name}
                onChange={e => setProfileForm(p => ({ ...p, student_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Register Number</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-md"
                placeholder="e.g. 21152012345"
                value={profileForm.register_number}
                onChange={e => setProfileForm(p => ({ ...p, register_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <select 
                className="w-full p-2 border rounded-md bg-white"
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