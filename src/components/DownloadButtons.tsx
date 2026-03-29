import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import { Button } from './ui/button';
import { Printer, FileText, Share2, Copy, Check } from 'lucide-react';
import { generateWordDocument } from '../utils/wordGenerator';
import { useState } from 'react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DownloadButtonsProps {
  courseInfo: CourseInfo;
  theoryExperiments: TheoryExperiment[];
  programmingSessions: ProgrammingSession[];
  recordId?: string;
  userId?: string;
  userName?: string;
  showShare?: boolean;
}

export function DownloadButtons({ 
  courseInfo, 
  theoryExperiments, 
  programmingSessions,
  recordId,
  userId,
  userName,
  showShare = false,
}: DownloadButtonsProps) {
  const [shareLoading, setShareLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    try {
      await generateWordDocument(courseInfo, theoryExperiments, programmingSessions);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Failed to generate Word document. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!recordId || !userId) {
      toast.error('Cannot share: Record ID or User ID missing');
      return;
    }

    try {
      setShareLoading(true);

      const recordData = {
        courseInfo,
        theoryExperiments,
        programmingSessions,
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-c614a86f/share-record`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            recordId,
            recordData,
            userId,
            userName: userName || courseInfo.student_name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to share record');
      }

      const data = await response.json();
      
      if (data.shareUrl) {
        // Copy link to clipboard
        await navigator.clipboard.writeText(data.shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
        toast.success('Share link copied to clipboard!');
        return data.shareUrl;
      }
    } catch (error: any) {
      console.error('Error sharing record:', error);
      toast.error('Failed to create share link. Please try again.');
    } finally {
      setShareLoading(false);
    }
  };

  const handleShareViaWhatsApp = async () => {
    const shareUrl = await handleShare();
    if (shareUrl) {
      const message = encodeURIComponent(
        `Check out my ${courseInfo.record_type} for ${courseInfo.course_code} - ${courseInfo.course_title}!\n\n${shareUrl}`
      );
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  const handleCopyLink = async () => {
    await handleShare();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
      <Button
        onClick={handleDownloadWord}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6"
      >
        <FileText className="w-5 h-5 mr-2" />
        Download as Word
      </Button>
      <Button
        onClick={handlePrint}
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-6"
      >
        <Printer className="w-5 h-5 mr-2" />
        Print / Save as PDF
      </Button>

      {showShare && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              disabled={shareLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6"
            >
              {linkCopied ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Record
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleShareViaWhatsApp}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share via WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="w-5 h-5 mr-2" />
              Copy Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}