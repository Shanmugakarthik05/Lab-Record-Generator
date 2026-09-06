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
import {
  FileText, History as HistoryIcon, LogOut,
  FileSignature, BookOpen, FlaskConical, Wand2,
  Sun, Moon, Sparkles, Code2,
} from 'lucide-react';
import {
  saveToHistory, getStudentInfo, saveStudentInfo, SavedRecord
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
  const { theme, toggleTheme, isDark } = useTheme();
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

  useEffect(() => {
    checkUser();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) setUser(firebaseUser);
      else navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) setUser(currentUser);
  };

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState({ student_name: '', register_number: '', department: '' });

  useEffect(() => {
    if (user) {
      getStudentInfo(user.uid).then((savedStudentInfo) => {
        if (savedStudentInfo) {
          setStudentProfile(savedStudentInfo);
          setCourseInfo(prev => ({ ...prev, student_name: savedStudentInfo.student_name, register_number: savedStudentInfo.register_number }));
          setProfileForm({ student_name: savedStudentInfo.student_name || '', register_number: savedStudentInfo.register_number || '', department: savedStudentInfo.department || '' });
          if (!savedStudentInfo.student_name || !savedStudentInfo.register_number || !savedStudentInfo.department) setShowProfileSetup(true);
        } else {
          setShowProfileSetup(true);
        }
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profileForm.student_name || !profileForm.register_number || !profileForm.department) {
      toast.error('Please fill in all fields'); return;
    }
    if (user) {
      const updatedProfile = { student_name: profileForm.student_name, register_number: profileForm.register_number, department: profileForm.department, userId: user.uid };
      await saveStudentInfo(updatedProfile);
      setStudentProfile(updatedProfile);
      setCourseInfo(prev => ({ ...prev, student_name: profileForm.student_name, register_number: profileForm.register_number }));
      setShowProfileSetup(false);
      toast.success('Profile saved successfully!');
    }
  };

  useEffect(() => {
    if (user && courseInfo.student_name && courseInfo.register_number) {
      saveStudentInfo({ student_name: courseInfo.student_name, register_number: courseInfo.register_number, department: studentProfile?.department || '', userId: user.uid });
    }
  }, [user, courseInfo.student_name, courseInfo.register_number, studentProfile?.department]);

  useEffect(() => {
    if (user && step >= 2 && courseInfo.course_code && courseInfo.course_title) {
      const timer = setTimeout(() => {
        saveToHistory(currentRecordId, courseInfo, theoryExperiments, programmingSessions, 'draft', user.uid)
          .catch(err => { console.error("Auto-draft save failed:", err); toast.error(`Auto-save failed: ${err.message || 'Unknown error'}`); });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, courseInfo, theoryExperiments, programmingSessions, step, currentRecordId]);

  useEffect(() => {
    if (!user) return;
    const handleBeforeUnload = () => {
      if (courseInfo.course_code && courseInfo.course_title) saveToHistory(currentRecordId, courseInfo, theoryExperiments, programmingSessions, 'draft', user.uid).catch(() => {});
    };
    const handleNetworkChange = () => {
      if (courseInfo.course_code && courseInfo.course_title) {
        saveToHistory(currentRecordId, courseInfo, theoryExperiments, programmingSessions, 'draft', user.uid).catch(() => {});
        if (!navigator.onLine) toast.warning('Network connection lost', { description: 'Your record has been safely auto-drafted.' });
        else toast.success('Back online', { description: 'Your draft has been synced.' });
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

  const handleLogout = async () => { await signOut(auth); navigate('/'); };
  const handleRecordTypeSelect = (type: 'Theory Record' | 'Programming Record') => { setCourseInfo({ ...courseInfo, record_type: type }); setStep(2); };
  const handleCourseInfoSubmit = (info: CourseInfo) => { setCourseInfo(info); setStep(3); };
  const handleExperimentsSubmit = (experiments: TheoryExperiment[]) => { setTheoryExperiments(experiments); setStep(4); };
  const handleSessionsSubmit = (sessions: ProgrammingSession[]) => { setProgrammingSessions(sessions); setStep(4); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleReset = async () => {
    const savedStudentInfo = user ? await getStudentInfo(user.uid) : null;
    setCurrentRecordId(`rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
    setStep(1);
    setCourseInfo({ record_type: '', course_code: '', course_title: '', student_name: savedStudentInfo?.student_name || '', register_number: savedStudentInfo?.register_number || '', department: '', semester: '', academic_year: '', college_name: '', declaration_date: new Date().toLocaleDateString('en-GB'), font_family: 'Times New Roman' });
    setTheoryExperiments([]); setProgrammingSessions([]);
  };

  const handleCreateNewRecord = async () => {
    if (user && courseInfo.course_code && courseInfo.course_title) {
      try {
        await saveToHistory(currentRecordId, courseInfo, theoryExperiments, programmingSessions, 'draft', user.uid);
        toast.success('Current record saved as draft!', { description: 'You can find it in your History.' });
      } catch (err: any) { toast.error(`Failed to save draft: ${err.message || 'Unknown error'}`); }
    }
    handleReset();
  };

  const handleLoadRecord = (record: SavedRecord) => {
    setCurrentRecordId(record.id); setCourseInfo(record.courseInfo);
    setTheoryExperiments(record.theoryExperiments); setProgrammingSessions(record.programmingSessions);
    setStep(4); setViewMode('main');
  };

  const initiateSaveComplete = () => setIsShareDialogOpen(true);

  const handleSaveComplete = async (share: boolean) => {
    if (!user) return;
    try {
      await saveToHistory(currentRecordId, courseInfo, theoryExperiments, programmingSessions, 'complete', user.uid, share);
      import('../utils/historyManager').then(({ deleteDraftLocally }) => { if (deleteDraftLocally) deleteDraftLocally(currentRecordId); });
      toast.success('✅ Record saved as complete! Starting new record...');
      setTimeout(() => handleReset(), 1000);
    } catch (error: any) { console.error("Save complete failed:", error); toast.error(`Failed to save record: ${error.message || 'Unknown error'}`); }
  };

  if (!user) return null;

  const getUserDisplayName = () => user.displayName || user.email?.split('@')[0] || 'User';
  const getUserInitials = () => getUserDisplayName().split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const STEPS = [
    { id: 1, label: 'Type',     icon: FileSignature },
    { id: 2, label: 'Course',   icon: BookOpen },
    { id: 3, label: 'Details',  icon: FlaskConical },
    { id: 4, label: 'Generate', icon: Wand2 },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-300"
      style={{ background: isDark
        ? 'linear-gradient(135deg, #050816 0%, #0c1130 50%, #080d24 100%)'
        : 'linear-gradient(135deg, #eef2ff 0%, #f5f0ff 50%, #e8eeff 100%)'
      }}
    >
      {/* ── Background Blobs ─────────────────────────── */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full filter blur-3xl opacity-60 animate-blob pointer-events-none"
        style={{ background: isDark ? 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(147,197,253,0.45) 0%, transparent 70%)' }}
      />
      <div className="absolute top-10 right-0 w-[450px] h-[450px] rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"
        style={{ background: isDark ? 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(196,181,253,0.45) 0%, transparent 70%)' }}
      />
      <div className="absolute -bottom-10 left-1/3 w-[400px] h-[400px] rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4000 pointer-events-none"
        style={{ background: isDark ? 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(165,180,252,0.40) 0%, transparent 70%)' }}
      />

      {/* ── Sticky Navigation ────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: isDark ? 'rgba(5,8,22,0.85)' : 'rgba(255,255,255,0.82)',
          borderBottom: isDark ? '1px solid rgba(99,102,241,0.18)' : '1px solid rgba(255,255,255,0.70)',
          boxShadow: isDark ? '0 1px 32px rgba(99,102,241,0.15)' : '0 1px 24px rgba(99,102,241,0.08)',
        }}
      >
        <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl blur-sm opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
              />
              <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span
                className="text-xl font-black tracking-tight bg-clip-text text-transparent"
                style={{ backgroundImage: isDark
                  ? 'linear-gradient(90deg, #a5b4fc, #c084fc)'
                  : 'linear-gradient(90deg, #3730a3, #6d28d9)'
                }}
              >
                Lab Record Generator
              </span>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3">
            {/* History Button */}
            <Button
              onClick={() => setViewMode(viewMode === 'main' ? 'history' : 'main')}
              variant="outline"
              className="hidden sm:flex text-sm font-medium transition-all duration-200"
              style={{
                background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(79,70,229,0.06)',
                borderColor: isDark ? 'rgba(129,140,248,0.25)' : 'rgba(79,70,229,0.25)',
                color: isDark ? '#a5b4fc' : '#4f46e5',
              }}
            >
              <HistoryIcon className="w-4 h-4 mr-2" />
              {viewMode === 'main' ? 'History' : 'Back'}
            </Button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group"
              style={{
                background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.08)',
                border: isDark ? '1px solid rgba(129,140,248,0.20)' : '1px solid rgba(79,70,229,0.15)',
              }}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark
                ? <Sun className="w-4.5 h-4.5 text-yellow-300 group-hover:rotate-12 transition-transform" />
                : <Moon className="w-4.5 h-4.5 text-indigo-600 group-hover:-rotate-12 transition-transform" />
              }
            </button>

            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative h-10 w-10 rounded-xl overflow-hidden transition-all duration-200 hover:scale-105"
                  style={{
                    border: isDark ? '2px solid rgba(129,140,248,0.30)' : '2px solid rgba(79,70,229,0.25)',
                    boxShadow: isDark ? '0 0 12px rgba(99,102,241,0.20)' : '0 4px 12px rgba(79,70,229,0.15)',
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL} alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-2xl p-2 backdrop-blur-xl"
                style={{
                  background: isDark ? 'rgba(12,15,40,0.97)' : 'rgba(255,255,255,0.97)',
                  border: isDark ? '1px solid rgba(99,102,241,0.20)' : '1px solid rgba(196,181,253,0.40)',
                  boxShadow: isDark
                    ? '0 8px 40px rgba(0,0,0,0.50), 0 0 0 1px rgba(99,102,241,0.12)'
                    : '0 8px 32px rgba(79,70,229,0.12)',
                }}
              >
                <DropdownMenuLabel className="pb-3">
                  <div className="flex items-center gap-3 p-1">
                    <Avatar className="h-9 w-9 flex-shrink-0">
                      <AvatarImage src={user.photoURL} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: isDark ? '#e8e9ff' : '#1e1b4b' }}>
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs truncate" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
                        {user.email}
                      </p>
                      {studentProfile?.department && (
                        <span className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold w-max"
                          style={{
                            background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(79,70,229,0.08)',
                            color: isDark ? '#a5b4fc' : '#4f46e5',
                            border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(79,70,229,0.20)',
                          }}
                        >
                          {studentProfile.department}
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>

                <div className="sm:hidden mb-2 px-1">
                  <Button
                    onClick={() => setViewMode(viewMode === 'main' ? 'history' : 'main')}
                    variant="secondary"
                    className="w-full justify-start text-sm"
                  >
                    <HistoryIcon className="w-4 h-4 mr-2" />
                    {viewMode === 'main' ? 'History' : 'Generator'}
                  </Button>
                </div>

                <DropdownMenuSeparator style={{ background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(196,181,253,0.30)' }} />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer rounded-xl mt-1 text-sm"
                  style={{ color: isDark ? '#f87171' : '#dc2626' }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* ── Main Container ───────────────────────────── */}
      <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10">

        {/* History View */}
        {viewMode === 'history' ? (
          <div
            className="rounded-3xl p-6 sm:p-8 backdrop-blur-xl"
            style={{
              background: isDark ? 'rgba(15,18,40,0.85)' : 'rgba(255,255,255,0.85)',
              border: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.70)',
              boxShadow: isDark ? '0 8px 40px rgba(0,0,0,0.40)' : '0 8px 40px rgba(99,102,241,0.08)',
            }}
          >
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
            {/* ── Progress Stepper ─────────────────── */}
            <div className="mb-10 max-w-2xl mx-auto px-4">
              <div className="relative flex items-center justify-between">
                {/* Track Background */}
                <div
                  className="absolute left-6 right-6 top-6 h-0.5 rounded-full -z-10"
                  style={{ background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(196,181,253,0.30)' }}
                />
                {/* Progress Fill */}
                <div
                  className="absolute left-6 top-6 h-0.5 rounded-full -z-10 transition-all duration-700 ease-out"
                  style={{
                    width: `calc(${((step - 1) / 3) * 100}% - ${step === 1 ? 0 : 12}px)`,
                    background: isDark
                      ? 'linear-gradient(90deg, #6366f1, #a855f7)'
                      : 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  }}
                />

                {STEPS.map((s) => {
                  const isActive  = step === s.id;
                  const isDone    = step > s.id;
                  const isIdle    = step < s.id;
                  return (
                    <div key={s.id} className="flex flex-col items-center gap-2.5 z-10">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300"
                        style={{
                          background: isActive
                            ? isDark ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                            : isDone
                            ? isDark ? 'rgba(15,18,40,0.95)' : '#ffffff'
                            : isDark ? 'rgba(12,15,38,0.80)' : 'rgba(255,255,255,0.80)',
                          border: isActive
                            ? 'none'
                            : isDone
                            ? isDark ? '2px solid #818cf8' : '2px solid #4f46e5'
                            : isDark ? '2px solid rgba(99,102,241,0.20)' : '2px solid rgba(196,181,253,0.50)',
                          boxShadow: isActive
                            ? isDark ? '0 0 20px rgba(99,102,241,0.40), 0 4px 12px rgba(0,0,0,0.30)' : '0 0 20px rgba(79,70,229,0.30), 0 4px 12px rgba(79,70,229,0.15)'
                            : 'none',
                          transform: isActive ? 'scale(1.1)' : 'scale(1)',
                          color: isActive
                            ? '#ffffff'
                            : isDone
                            ? isDark ? '#818cf8' : '#4f46e5'
                            : isDark ? '#3d4870' : '#9ca3af',
                        }}
                      >
                        <s.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                      </div>
                      <span
                        className="text-xs font-semibold transition-colors"
                        style={{
                          color: isActive
                            ? isDark ? '#a5b4fc' : '#3730a3'
                            : isDone
                            ? isDark ? '#6b7daa' : '#374151'
                            : isDark ? '#3d4870' : '#9ca3af',
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Step Card ─────────────────────────── */}
            <div
              className="rounded-3xl p-6 sm:p-10 backdrop-blur-xl transition-all duration-300"
              style={{
                background: isDark ? 'rgba(15,18,40,0.85)' : 'rgba(255,255,255,0.85)',
                border: isDark ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.70)',
                boxShadow: isDark
                  ? '0 8px 40px rgba(0,0,0,0.40), 0 0 1px rgba(99,102,241,0.08)'
                  : '0 8px 40px rgba(99,102,241,0.08)',
              }}
            >
              {step === 1 && <RecordTypeSelector onSelect={handleRecordTypeSelect} />}
              {step === 2 && <CourseInfoForm initialData={courseInfo} onSubmit={handleCourseInfoSubmit} onBack={handleBack} />}
              {step === 3 && courseInfo.record_type === 'Theory Record' && (
                <TheoryExperimentsForm initialData={theoryExperiments} onSubmit={handleExperimentsSubmit} onBack={handleBack} />
              )}
              {step === 3 && courseInfo.record_type === 'Programming Record' && (
                <ProgrammingSessionsForm initialData={programmingSessions} onSubmit={handleSessionsSubmit} onBack={handleBack} />
              )}
              {step === 4 && (
                <div>
                  <DocumentPreview courseInfo={courseInfo} theoryExperiments={theoryExperiments} programmingSessions={programmingSessions} onEditCourseInfo={() => setStep(2)} onEditExperiments={() => setStep(3)} />
                  <DownloadButtons courseInfo={courseInfo} theoryExperiments={theoryExperiments} programmingSessions={programmingSessions} />
                  <div className="flex gap-4 justify-center mt-6 flex-wrap">
                    <button
                      onClick={handleCreateNewRecord}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
                      style={{ background: isDark ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}
                    >
                      Create New Record
                    </button>
                    <button
                      onClick={initiateSaveComplete}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
                      style={{ background: isDark ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #059669, #34d399)', boxShadow: '0 4px 12px rgba(5,150,105,0.25)' }}
                    >
                      Save as Complete
                    </button>
                  </div>

                  {/* Share Dialog */}
                  <AlertDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                    <AlertDialogContent
                      className="rounded-2xl backdrop-blur-xl"
                      style={{
                        background: isDark ? 'rgba(10,12,30,0.98)' : 'rgba(255,255,255,0.98)',
                        border: isDark ? '1px solid rgba(99,102,241,0.20)' : '1px solid rgba(196,181,253,0.40)',
                        boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.60)' : '0 24px 80px rgba(79,70,229,0.15)',
                      }}
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle style={{ color: isDark ? '#e8e9ff' : '#1e1b4b' }}>
                          Share with Community?
                        </AlertDialogTitle>
                        <AlertDialogDescription style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
                          Do you want to share this completed record with the SEC community? Other students will be able to view and use it as a reference.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => handleSaveComplete(false)} style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
                          No, keep private
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleSaveComplete(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          Yes, share it!
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Auto-save indicator */}
                  <p className="text-center text-xs mt-4 font-medium" style={{ color: isDark ? '#3d4870' : '#9ca3af' }}>
                    ✓ Auto-saved as draft
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Developer Credit ─────────────────────── */}
        <div className="mt-20 pb-12 flex justify-center w-full">
          <div className="relative group cursor-pointer">
            {/* Glow ring on hover */}
            <div
              className="absolute -inset-1 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-700"
              style={{ background: isDark
                ? 'linear-gradient(135deg, #6366f1, #a855f7, #6366f1)'
                : 'linear-gradient(135deg, #4f46e5, #7c3aed, #4f46e5)'
              }}
            />

            <div
              className="relative flex items-center gap-4 py-3.5 px-6 rounded-2xl backdrop-blur-xl transition-all duration-300 transform group-hover:scale-[1.02]"
              style={{
                background: isDark ? 'rgba(15,18,40,0.92)' : 'rgba(255,255,255,0.90)',
                border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.80)',
                boxShadow: isDark
                  ? '0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.04)'
                  : '0 4px 24px rgba(99,102,241,0.08)',
              }}
            >
              {/* Sparkle Icon with Ping */}
              <div className="relative hidden sm:block flex-shrink-0">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: isDark ? 'rgba(10,12,30,0.98)' : 'rgba(255,255,255,0.98)',
                    border: isDark ? '1px solid rgba(99,102,241,0.30)' : '1px solid rgba(196,181,253,0.50)',
                  }}
                >
                  <Sparkles className="w-5 h-5 group-hover:animate-pulse" style={{ color: isDark ? '#818cf8' : '#7c3aed' }} />
                </div>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: isDark ? '#818cf8' : '#7c3aed' }} />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: isDark ? '#818cf8' : '#7c3aed' }} />
                </span>
              </div>

              {/* Text Content */}
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold flex items-center gap-1.5 mb-0.5" style={{ color: isDark ? '#3d4870' : '#9ca3af' }}>
                  <Code2 className="w-2.5 h-2.5" /> System Architect
                </span>
                <span
                  className="text-base font-black tracking-tight bg-clip-text text-transparent"
                  style={{ backgroundImage: isDark
                    ? 'linear-gradient(90deg, #a5b4fc, #c084fc)'
                    : 'linear-gradient(90deg, #3730a3, #6d28d9)'
                  }}
                >
                  SHANMUGAKARTHIK G
                </span>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(79,70,229,0.08)',
                      color: isDark ? '#a5b4fc' : '#4f46e5',
                      border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(79,70,229,0.20)',
                    }}
                  >
                    INFORMATION TECHNOLOGY
                  </span>
                  <span className="hidden sm:block text-[10px] font-medium" style={{ color: isDark ? '#3d4870' : '#9ca3af' }}>
                    Saveetha Engineering College
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile Setup Dialog ─────────────────────── */}
      <AlertDialog open={showProfileSetup} onOpenChange={() => {}}>
        <AlertDialogContent
          className="rounded-2xl backdrop-blur-xl"
          style={{
            background: isDark ? 'rgba(10,12,30,0.98)' : 'rgba(255,255,255,0.98)',
            border: isDark ? '1px solid rgba(99,102,241,0.20)' : '1px solid rgba(196,181,253,0.40)',
            boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.60)' : '0 24px 80px rgba(79,70,229,0.15)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: isDark ? '#e8e9ff' : '#1e1b4b' }}>Complete Your Profile</AlertDialogTitle>
            <AlertDialogDescription style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
              Please enter your details to set up your profile and enable community features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            {[
              { label: 'Full Name', key: 'student_name', placeholder: 'e.g. John Doe', type: 'text' },
              { label: 'Register Number', key: 'register_number', placeholder: 'e.g. 21152012345', type: 'text' },
            ].map(field => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all outline-none"
                  style={{
                    background: isDark ? 'rgba(12,15,38,0.95)' : 'rgba(255,255,255,0.95)',
                    border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(196,181,253,0.50)',
                    color: isDark ? '#e8e9ff' : '#1e1b4b',
                  }}
                  placeholder={field.placeholder}
                  value={(profileForm as any)[field.key]}
                  onChange={e => setProfileForm(p => ({ ...p, [field.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>Department</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all outline-none"
                style={{
                  background: isDark ? 'rgba(12,15,38,0.95)' : 'rgba(255,255,255,0.95)',
                  border: isDark ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(196,181,253,0.50)',
                  color: isDark ? '#e8e9ff' : '#1e1b4b',
                }}
                value={profileForm.department}
                onChange={e => setProfileForm(p => ({ ...p, department: e.target.value }))}
              >
                <option value="">Select Department</option>
                {['IT','CSE','ECE','EEE','MECH','CIVIL','BME','AIDS','AIML'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSaveProfile}
              className="w-full rounded-xl text-white font-semibold text-sm"
              style={{ background: isDark ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              Save Profile & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </div>
  );
}