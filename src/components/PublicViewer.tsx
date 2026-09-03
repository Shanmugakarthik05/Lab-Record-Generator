import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecordById, SavedRecord } from '../utils/historyManager';
import { DocumentPreview } from './DocumentPreview';
import { Button } from './ui/button';
import { ArrowLeft, Download, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { generatePDFDocument } from '../utils/pdfGenerator';
import { generateWordDocument } from '../utils/wordGenerator';
import { toast } from 'sonner@2.0.3';

export function PublicViewer() {
  const { encodedId } = useParams<{ encodedId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<SavedRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const loadRecord = async () => {
      if (encodedId) {
        try {
          const decodedId = atob(encodedId);
          const foundRecord = await getRecordById(decodedId);
          
          if (isMounted) {
            if (foundRecord && foundRecord.isShared) {
              setRecord(foundRecord);
            } else {
              setRecord(null);
            }
          }
        } catch (error) {
          console.error('Error loading shared record:', error);
          if (isMounted) setRecord(null);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
    };
    
    loadRecord();
    
    return () => {
      isMounted = false;
    };
  }, [encodedId]);

  const handleDownloadPDF = async () => {
    if (!record) return;
    
    setDownloading(true);
    try {
      await generatePDFDocument(
        record.courseInfo,
        record.theoryExperiments,
        record.programmingSessions
      );
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadWord = async () => {
    if (!record) return;
    
    setDownloading(true);
    try {
      await generateWordDocument(
        record.courseInfo,
        record.theoryExperiments,
        record.programmingSessions
      );
      toast.success('Word document downloaded successfully!');
    } catch (error) {
      console.error('Error generating Word:', error);
      toast.error('Failed to download Word document');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared record...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Record Not Found</strong>
              <p className="mt-2">
                This shared record does not exist or is no longer available. The owner may have unshared it or deleted it.
              </p>
            </AlertDescription>
          </Alert>
          
          <Button
            onClick={() => navigate('/')}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900 text-xl font-bold">Shared Lab Record</h1>
                <p className="text-gray-600 text-sm">
                  Shared by <strong>{record.sharedBy || 'Unknown'}</strong>
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={handleDownloadWord}
                disabled={downloading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Word
              </Button>
            </div>
          </div>
          
          {/* Record Info */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Course:</span>
                <span className="ml-2 font-semibold text-gray-800">
                  {record.courseInfo.course_code} - {record.courseInfo.course_title}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Department:</span>
                <span className="ml-2 font-semibold text-gray-800">
                  {record.courseInfo.department}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-semibold text-gray-800">
                  {record.courseInfo.record_type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Preview */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <DocumentPreview
            courseInfo={record.courseInfo}
            theoryExperiments={record.theoryExperiments}
            programmingSessions={record.programmingSessions}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}