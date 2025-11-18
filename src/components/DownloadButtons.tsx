import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import { Button } from './ui/button';
import { Printer, FileText } from 'lucide-react';
import { generateWordDocument } from '../utils/wordGenerator';

interface DownloadButtonsProps {
  courseInfo: CourseInfo;
  theoryExperiments: TheoryExperiment[];
  programmingSessions: ProgrammingSession[];
}

export function DownloadButtons({ courseInfo, theoryExperiments, programmingSessions }: DownloadButtonsProps) {
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
    </div>
  );
}