import { useState, useEffect } from 'react';
import { getDraftRecords, getCompletedRecords, deleteFromHistory, SavedRecord } from '../utils/historyManager';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, FileText, Clock, CheckCircle, Calendar, Search, Folder, FolderOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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

interface HistoryProps {
  onLoadRecord: (record: SavedRecord) => void;
  onClose: () => void;
  userId: string; // Add userId prop
}

export function History({ onLoadRecord, onClose, userId }: HistoryProps) {
  const [draftRecords, setDraftRecords] = useState<SavedRecord[]>([]);
  const [completedRecords, setCompletedRecords] = useState<SavedRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadHistory = () => {
    setDraftRecords(getDraftRecords(userId)); // Pass userId
    setCompletedRecords(getCompletedRecords(userId)); // Pass userId
  };

  useEffect(() => {
    loadHistory();
  }, [userId]); // Add userId to dependencies

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    loadHistory();
    setDeleteId(null);
  };

  const handleLoad = (record: SavedRecord) => {
    onLoadRecord(record);
    onClose();
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
    if (!searchQuery.trim()) return records;
    
    const query = searchQuery.toLowerCase();
    return records.filter(record => 
      record.courseInfo.course_code.toLowerCase().includes(query) ||
      record.courseInfo.course_title.toLowerCase().includes(query) ||
      record.courseInfo.student_name.toLowerCase().includes(query) ||
      record.courseInfo.register_number.toLowerCase().includes(query) ||
      record.courseInfo.department.toLowerCase().includes(query)
    );
  };

  const renderRecordsList = (records: SavedRecord[], emptyMessage: string) => {
    const filteredRecords = filterRecords(records);
    
    if (filteredRecords.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">{emptyMessage}</p>
          {searchQuery && (
            <p className="text-gray-500 text-sm mt-2">
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
            className="bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-md transition-shadow"
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
                </div>
                
                <div>
                  <h3 className="text-gray-800">{record.courseInfo.course_title}</h3>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="text-gray-500">Student:</span>{' '}
                    {record.courseInfo.student_name} ({record.courseInfo.register_number})
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>{' '}
                    {record.courseInfo.department} • {record.courseInfo.semester}
                  </div>
                  {record.courseInfo.record_type === 'Theory Record' && (
                    <div>
                      <span className="text-gray-500">Experiments:</span>{' '}
                      {record.theoryExperiments.length}
                    </div>
                  )}
                  {record.courseInfo.record_type === 'Programming Record' && (
                    <div>
                      <span className="text-gray-500">Sessions:</span>{' '}
                      {record.programmingSessions.length}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
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
                <Button
                  onClick={() => setDeleteId(record.id)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-800">History</h2>
          <p className="text-gray-600">Your saved and draft lab records</p>
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

      {/* Tabs for Completed and Draft */}
      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="drafts" className="flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Drafts ({draftRecords.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Completed ({completedRecords.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts">
          {renderRecordsList(draftRecords, 'No draft records yet')}
        </TabsContent>

        <TabsContent value="completed">
          {renderRecordsList(completedRecords, 'No completed records yet')}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this record? This action cannot be undone.
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