import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DocumentPreview } from './DocumentPreview';
import { DownloadButtons } from './DownloadButtons';
import { Button } from './ui/button';
import { ArrowLeft, Loader2, AlertCircle, Share2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Toaster } from './ui/sonner';
import type { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import { getRecordById } from '../utils/historyManager';
export function RecordViewer() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordData, setRecordData] = useState<{
    courseInfo: CourseInfo;
    theoryExperiments: TheoryExperiment[];
    programmingSessions: ProgrammingSession[];
    sharedBy?: string;
    sharedAt?: string;
  } | null>(null);

  useEffect(() => {
    if (recordId) {
      fetchSharedRecord(recordId);
    }
  }, [recordId]);

  const fetchSharedRecord = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const foundRecord = await getRecordById(id);

      if (!foundRecord || !foundRecord.isShared) {
        throw new Error('Record not found or has been removed');
      }

      setRecordData(foundRecord);
    } catch (err: any) {
      console.error('Error fetching shared record:', err);
      setError(err.message || 'Failed to load shared record');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading shared record...</p>
        </div>
      </div>
    );
  }

  if (error || !recordData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-300 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error || 'Record not found'}
            </AlertDescription>
          </Alert>
          <Button
            onClick={() => navigate('/')}
            className="w-full mt-4"
            variant="outline"
          >
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Login
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900">Shared Lab Record</h1>
                </div>
                {recordData.sharedBy && (
                  <p className="text-sm text-gray-500 mt-1">
                    Shared by {recordData.sharedBy}
                    {recordData.sharedAt && (
                      <> on {new Date(recordData.sharedAt).toLocaleDateString()}</>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Record Info */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {recordData.courseInfo.course_code} - {recordData.courseInfo.course_title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm opacity-90">
            <p>Student: {recordData.courseInfo.student_name}</p>
            <p>Register Number: {recordData.courseInfo.register_number}</p>
            <p>Department: {recordData.courseInfo.department}</p>
            <p>Semester: {recordData.courseInfo.semester}</p>
          </div>
        </div>

        {/* Download Buttons */}
        <DownloadButtons
          courseInfo={recordData.courseInfo}
          theoryExperiments={recordData.theoryExperiments}
          programmingSessions={recordData.programmingSessions}
        />

        {/* Document Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <DocumentPreview
            courseInfo={recordData.courseInfo}
            theoryExperiments={recordData.theoryExperiments}
            programmingSessions={recordData.programmingSessions}
          />
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}