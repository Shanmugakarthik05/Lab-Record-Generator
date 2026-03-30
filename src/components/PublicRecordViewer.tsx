import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordById, SavedRecord } from '../utils/historyManager';
import { Button } from './ui/button';
import { ArrowLeft, FileText, Calendar, User, GraduationCap } from 'lucide-react';
import { DocumentPreview } from './DocumentPreview';

export function PublicRecordViewer() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<SavedRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (recordId) {
      const foundRecord = getRecordById(recordId);
      if (foundRecord && foundRecord.isShared) {
        setRecord(foundRecord);
      }
      setLoading(false);
    }
  }, [recordId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading record...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Record Not Found</h2>
          <p className="text-gray-600 mb-6">
            This record may have been removed or is no longer shared.
          </p>
          <Button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Shared Lab Record</h1>
                <p className="text-sm text-gray-600">View only - Sign in to create your own</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                  {record.courseInfo.course_title}
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Course Code:</span> {record.courseInfo.course_code}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {record.courseInfo.record_type}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Shared by: <span className="font-medium">{record.sharedBy}</span></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap className="w-4 h-4" />
                <span>{record.courseInfo.department} • {record.courseInfo.semester}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Shared: {new Date(record.savedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Preview */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <DocumentPreview
            courseInfo={record.courseInfo}
            theoryExperiments={record.theoryExperiments}
            programmingSessions={record.programmingSessions}
          />
        </div>
      </div>
    </div>
  );
}