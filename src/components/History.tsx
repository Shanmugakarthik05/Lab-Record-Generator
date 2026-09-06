import { useState, useEffect, useRef } from 'react';
import { 
  getDraftRecords, 
  getCompletedRecords, 
  deleteFromHistory, 
  SavedRecord, 
  getSharedRecords, 
  toggleShareRecord,
  getAllPublicRecords,
  subscribeToUserHistory,
  subscribeToPublicRecords,
  getDraftsLocally,
  deleteDraftLocally
} from '../utils/historyManager';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ShareLinkButtons } from './ShareLinkButtons';
import { Trash2, FileText, Clock, CheckCircle, Calendar, Search, Folder, FolderOpen, Share2, Users, Globe, ChevronDown, ChevronRight, Link2, MessageCircle, Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTheme } from '../hooks/useTheme';
import { toast } from 'sonner@2.0.3';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface HistoryProps {
  onLoadRecord: (record: SavedRecord) => void;
  onClose: () => void;
  userId: string;
  userName: string;
  studentProfile?: any;
}

export function History({ onLoadRecord, onClose, userId, userName, studentProfile }: HistoryProps) {
  const { isDark } = useTheme();
  const [draftRecords, setDraftRecords] = useState<SavedRecord[]>([]);
  const [completedRecords, setCompletedRecords] = useState<SavedRecord[]>([]);
  const [sharedRecords, setSharedRecords] = useState<SavedRecord[]>([]);
  const [publicRecords, setPublicRecords] = useState<SavedRecord[]>([]);
  const [categoryView, setCategoryView] = useState<'course' | 'department' | 'type'>('course');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<string | null>(null);
  const deletionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [liveIndicator, setLiveIndicator] = useState(false);
  const [filterMyDept, setFilterMyDept] = useState(false);

  // Real-time listener for user's own records
  useEffect(() => {
    const unsub = subscribeToUserHistory(userId, (allRecords) => {
      setDraftRecords(allRecords.filter(r => r.status === 'draft'));
      setCompletedRecords(allRecords.filter(r => r.status === 'complete'));
      // Shared by others = complete + isShared + not mine
      setSharedRecords(allRecords.filter(r => r.status === 'complete' && r.isShared && r.userId !== userId));
    });
    return unsub;
  }, [userId]);

  // Real-time listener for public community records
  useEffect(() => {
    const unsub = subscribeToPublicRecords((records) => {
      setPublicRecords(records);
      // Flash live indicator briefly on update
      setLiveIndicator(true);
      setTimeout(() => setLiveIndicator(false), 2000);
    });
    return unsub;
  }, []);

  const loadHistory = async () => {
    // Keep for manual refresh of shared records from others
    setSharedRecords(await getSharedRecords(userId));
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  useEffect(() => {
    return () => {
      if (deletionTimeoutRef.current) {
        clearTimeout(deletionTimeoutRef.current);
      }
    };
  }, []);

  const handleDelete = (id: string) => {
    setPendingDeletion(id);
    setDeleteId(null);

    if (deletionTimeoutRef.current) {
      clearTimeout(deletionTimeoutRef.current);
    }

    toast.error('Record deleted', {
      description: 'You have 10 seconds to undo this action',
      duration: 10000,
      action: {
        label: 'Undo',
        onClick: () => handleUndo(id),
      },
    });

    deletionTimeoutRef.current = setTimeout(async () => {
      const recordToDelete = draftRecords.find(r => r.id === id) || completedRecords.find(r => r.id === id);
      if (recordToDelete?.status === 'draft') {
        deleteDraftLocally(id); // Just in case it's a lingering local draft
      }
      await deleteFromHistory(id);
      setPendingDeletion(null);
      await loadHistory();
      toast.success('Record permanently deleted');
    }, 10000);
  };

  const handleUndo = (id: string) => {
    if (deletionTimeoutRef.current) {
      clearTimeout(deletionTimeoutRef.current);
      deletionTimeoutRef.current = null;
    }

    setPendingDeletion(null);
    loadHistory();
    
    toast.success('Deletion cancelled', {
      description: 'Record has been restored',
    });
  };

  const handleLoad = (record: SavedRecord) => {
    onLoadRecord(record);
    onClose();
  };

  const handleShareToggle = async (recordId: string) => {
    const isShared = await toggleShareRecord(recordId, userName);
    // No need to call loadHistory() - real-time listener picks up the change automatically
    if (isShared) {
      toast.success('Record shared to community! 🌐', {
        description: 'Other students can now view and use this record in real-time.',
      });
    } else {
      toast.success('Record unshared', {
        description: 'This record is now private.',
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filterRecords = (records: SavedRecord[]) => {
    if (!searchQuery.trim()) {
      return records.filter(record => record.id !== pendingDeletion);
    }
    
    const query = searchQuery.toLowerCase();
    return records.filter(record => 
      record.id !== pendingDeletion &&
      (record.courseInfo.course_code.toLowerCase().includes(query) ||
      record.courseInfo.course_title.toLowerCase().includes(query) ||
      record.courseInfo.student_name.toLowerCase().includes(query) ||
      record.courseInfo.register_number.toLowerCase().includes(query) ||
      record.courseInfo.department.toLowerCase().includes(query))
    );
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategorizedRecords = () => {
    let filteredPublicRecords = publicRecords;
    if (filterMyDept && studentProfile?.department) {
      filteredPublicRecords = publicRecords.filter(r => r.courseInfo.department === studentProfile.department);
    }
    
    let groupedRecords: Record<string, SavedRecord[]> = {};
    
    switch (categoryView) {
      case 'course':
        filteredPublicRecords.forEach(record => {
          const courseCode = record.courseInfo.course_code;
          if (!groupedRecords[courseCode]) groupedRecords[courseCode] = [];
          groupedRecords[courseCode].push(record);
        });
        break;
      case 'department':
        filteredPublicRecords.forEach(record => {
          const department = record.courseInfo.department;
          if (!groupedRecords[department]) groupedRecords[department] = [];
          groupedRecords[department].push(record);
        });
        break;
      case 'type':
        filteredPublicRecords.forEach(record => {
          const type = record.courseInfo.record_type;
          if (!groupedRecords[type]) groupedRecords[type] = [];
          groupedRecords[type].push(record);
        });
        break;
    }

    const categories = Object.keys(groupedRecords).sort();

    if (categories.length === 0) {
      return (
        <div className="text-center py-12 th-surface rounded-lg">
          <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="th-text-secondary">No community records available yet</p>
          <p className="th-text-muted text-sm mt-2">
            Share your completed records to contribute to the community!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {categories.map((category) => {
          const records = filterRecords(groupedRecords[category]);
          const isExpanded = expandedCategories.has(category);

          if (records.length === 0 && searchQuery) {
            return null; // Hide empty categories when searching
          }

          return (
            <div key={category} className="border-2 th-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="text-left">
                    <h3 className="font-semibold th-text-primary">{category}</h3>
                    <p className="text-sm th-text-secondary">
                      {records.length} {records.length === 1 ? 'record' : 'records'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {groupedRecords[category].some(r => r.courseInfo.record_type === 'Theory Record') && (
                    <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                      Theory
                    </span>
                  )}
                  {groupedRecords[category].some(r => r.courseInfo.record_type === 'Programming Record') && (
                    <span className="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-700">
                      Programming
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 space-y-3 th-card">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className="th-surface rounded-lg border th-border p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                              {record.courseInfo.course_code}
                            </span>
                            <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                              {record.courseInfo.record_type}
                            </span>
                            {record.sharedBy && (
                              <span className="px-2 py-1 rounded text-xs bg-teal-100 text-teal-700">
                                By: {record.sharedBy}
                              </span>
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium th-text-primary">{record.courseInfo.course_title}</h4>
                          </div>
                          
                          <div className="text-sm th-text-secondary space-y-1">
                            <div>
                              <span className="th-text-muted">Student:</span>{' '}
                              {record.courseInfo.student_name} ({record.courseInfo.register_number})
                            </div>
                            <div>
                              <span className="th-text-muted">Department:</span>{' '}
                              {record.courseInfo.department} • {record.courseInfo.semester}
                            </div>
                            {record.courseInfo.record_type === 'Theory Record' && (
                              <div>
                                <span className="th-text-muted">Experiments:</span>{' '}
                                {record.theoryExperiments.length}
                              </div>
                            )}
                            {record.courseInfo.record_type === 'Programming Record' && (
                              <div>
                                <span className="th-text-muted">Sessions:</span>{' '}
                                {record.programmingSessions.length}
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs th-text-muted">
                              <Calendar className="w-3 h-3" />
                              Shared: {formatDateTime(record.savedAt)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleLoad(record)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Load
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderRecordsList = (records: SavedRecord[], emptyMessage: string, showShare: boolean = false, isSharedView: boolean = false) => {
    const filteredRecords = filterRecords(records);
    
    if (filteredRecords.length === 0) {
      return (
        <div className="text-center py-12 th-surface rounded-lg">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="th-text-secondary">{emptyMessage}</p>
          {searchQuery && (
            <p className="th-text-muted text-sm mt-2">
              Try adjusting your search query
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <div
            key={record.id}
            className="th-card rounded-lg border-2 th-border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                    {record.courseInfo.course_code}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                    record.status === 'complete'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {record.status === 'complete' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Draft
                      </>
                    )}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-700">
                    {record.courseInfo.record_type}
                  </span>
                  {record.isShared && (
                    <span className="px-2 py-1 rounded text-xs bg-cyan-100 text-cyan-700 flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      Shared
                    </span>
                  )}
                  {isSharedView && record.sharedBy && (
                    <span className="px-2 py-1 rounded text-xs bg-teal-100 text-teal-700">
                      By: {record.sharedBy}
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="th-text-primary">{record.courseInfo.course_title}</h3>
                </div>
                
                <div className="text-sm th-text-secondary space-y-1">
                  <div>
                    <span className="th-text-muted">Student:</span>{' '}
                    {record.courseInfo.student_name} ({record.courseInfo.register_number})
                  </div>
                  <div>
                    <span className="th-text-muted">Department:</span>{' '}
                    {record.courseInfo.department} • {record.courseInfo.semester}
                  </div>
                  {record.courseInfo.record_type === 'Theory Record' && (
                    <div>
                      <span className="th-text-muted">Experiments:</span>{' '}
                      {record.theoryExperiments.length}
                    </div>
                  )}
                  {record.courseInfo.record_type === 'Programming Record' && (
                    <div>
                      <span className="th-text-muted">Sessions:</span>{' '}
                      {record.programmingSessions.length}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs th-text-muted">
                    <Calendar className="w-3 h-3" />
                    Saved: {formatDateTime(record.savedAt)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleLoad(record)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Load
                </Button>
                {!isSharedView && (
                  <Button
                    onClick={() => setDeleteId(record.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {showShare && !isSharedView && (
                  <Button
                    onClick={() => handleShareToggle(record.id)}
                    size="sm"
                    variant="outline"
                    className={`${
                      record.isShared
                        ? 'text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 border-cyan-300'
                        : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:bg-slate-800 dark:bg-slate-800 border-blue-300'
                    }`}
                  >
                    {record.isShared ? (
                      <>
                        <Users className="w-4 h-4 mr-1" />
                        Unshare
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Share Link Buttons - Show when record is shared */}
            {record.isShared && !isSharedView && (
              <ShareLinkButtons 
                recordId={record.id} 
                courseTitle={record.courseInfo.course_title}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="th-text-primary">History</h2>
          <p className="th-text-secondary">Your saved, draft, and shared lab records</p>
        </div>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by course code, title, student name, register number, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 py-6"
        />
      </div>

      {/* Tabs for Drafts, Completed, Shared, and Community */}
      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Drafts ({draftRecords.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Completed ({completedRecords.length})
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Shared ({sharedRecords.length})
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Community ({publicRecords.length})
            {liveIndicator && (
              <span className="ml-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                <span className="text-xs text-green-600 font-semibold">Live</span>
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts">
          {renderRecordsList(draftRecords, 'No draft records yet', false)}
        </TabsContent>

        <TabsContent value="completed">
          {renderRecordsList(completedRecords, 'No completed records yet', true)}
        </TabsContent>

        <TabsContent value="shared">
          <div className="mb-4 p-4 bg-blue-50 dark:bg-slate-800 dark:bg-slate-800 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <Users className="w-4 h-4 inline mr-2" />
              Browse records shared by other users. You can load and edit them to create your own version.
            </p>
          </div>
          {renderRecordsList(sharedRecords, 'No shared records available', false, true)}
        </TabsContent>

        <TabsContent value="community">
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div>
                <h3 className="font-semibold th-text-primary flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Community Records
                </h3>
                <p className="text-sm th-text-secondary mt-1">
                  Explore lab records shared by all users, organized by category
                </p>
              </div>
              <div className="flex items-center gap-4">
                {studentProfile?.department && (
                  <button
                    onClick={() => setFilterMyDept(!filterMyDept)}
                    className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                      filterMyDept 
                        ? 'bg-blue-600 text-white' 
                        : 'th-card th-text-secondary border th-border hover:th-surface'
                    }`}
                  >
                    My Dept ({studentProfile.department})
                  </button>
                )}
                <Select value={categoryView} onValueChange={(value: any) => setCategoryView(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="course">By Course</SelectItem>
                    <SelectItem value="department">By Department</SelectItem>
                    <SelectItem value="type">By Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderCategorizedRecords()}
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? You'll have 10 seconds to undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}