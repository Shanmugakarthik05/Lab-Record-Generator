import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import { Printer, FileText } from 'lucide-react';
import { generateWordDocument } from '../utils/wordGenerator';
import { useTheme } from '../hooks/useTheme';

interface DownloadButtonsProps {
  courseInfo: CourseInfo;
  theoryExperiments: TheoryExperiment[];
  programmingSessions: ProgrammingSession[];
}

export function DownloadButtons({ courseInfo, theoryExperiments, programmingSessions }: DownloadButtonsProps) {
  const { isDark } = useTheme();

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

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
      <button
        onClick={handleDownloadWord}
        className="flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105"
        style={{
          background: isDark ? 'linear-gradient(135deg, #2563eb, #3b82f6)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
          boxShadow: isDark ? '0 8px 32px rgba(37,99,235,0.4)' : '0 8px 24px rgba(37,99,235,0.25)',
        }}
      >
        <FileText className="w-5 h-5 mr-2" />
        Download as Word
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:scale-105"
        style={{
          background: isDark ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #047857, #059669)',
          boxShadow: isDark ? '0 8px 32px rgba(16,185,129,0.4)' : '0 8px 24px rgba(16,185,129,0.25)',
        }}
      >
        <Printer className="w-5 h-5 mr-2" />
        Print / Save as PDF
      </button>
    </div>
  );
}