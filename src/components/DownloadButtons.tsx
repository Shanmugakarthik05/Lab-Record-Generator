import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import { Button } from './ui/button';
import { Printer } from 'lucide-react';

interface DownloadButtonsProps {
  courseInfo: CourseInfo;
  theoryExperiments: TheoryExperiment[];
  programmingSessions: ProgrammingSession[];
}

export function DownloadButtons({ courseInfo, theoryExperiments, programmingSessions }: DownloadButtonsProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
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
