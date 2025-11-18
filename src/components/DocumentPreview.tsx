import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import QRCode from 'react-qr-code';
import collegeHeader from 'figma:asset/b4febb2531b296d5e7d0e8087088780a9a2db377.png';
import { formatDate } from '../utils/dateFormatter';
import { ensureHttpsPrefix } from '../utils/urlFormatter';
import { Button } from './ui/button';
import { Edit } from 'lucide-react';

interface DocumentPreviewProps {
  courseInfo: CourseInfo;
  theoryExperiments: TheoryExperiment[];
  programmingSessions: ProgrammingSession[];
  onEditCourseInfo?: () => void;
  onEditExperiments?: () => void;
}

export function DocumentPreview({ courseInfo, theoryExperiments, programmingSessions, onEditCourseInfo, onEditExperiments }: DocumentPreviewProps) {
  const isTheory = courseInfo.record_type === 'Theory Record';
  const fontFamily = courseInfo.font_family || 'Times New Roman';

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-gray-800">Document Preview</h2>
          <p className="text-gray-600">Review your lab record before printing</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button
            onClick={onEditCourseInfo}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit Course Info
          </Button>
          <Button
            onClick={onEditExperiments}
            variant="outline"
            size="sm"
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit Experiments
          </Button>
        </div>
      </div>
      
      <div 
        id="document-preview" 
        className="bg-white border-2 border-gray-300 p-8 max-h-[600px] overflow-y-auto shadow-inner"
        style={{ fontFamily }}
      >
        {/* Header with College Logo */}
        <div className="mb-6 pb-4 border-b border-gray-300">
          <div className="flex justify-center mb-4">
            <img src={collegeHeader} alt="College Header" className="max-w-full h-auto" style={{ maxHeight: '80px' }} />
          </div>
        </div>

        {/* Course Title */}
        <div className="text-center mb-6">
          <h2 className="mb-4">{courseInfo.course_code} - {courseInfo.course_title}</h2>
          <h3 className="mb-2">TABLE OF CONTENTS</h3>
        </div>

        {/* Table of Contents - Theory */}
        {isTheory && theoryExperiments.length > 0 && (
          <div className="mb-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-white">
                    <th className="border border-black p-2 text-center">Exp.<br/>No</th>
                    <th className="border border-black p-2 text-center">Date</th>
                    <th className="border border-black p-2 text-center">Experiment Title</th>
                    <th className="border border-black p-2 text-center">QR Code</th>
                    <th className="border border-black p-2 text-center">Marks</th>
                    <th className="border border-black p-2 text-center">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {theoryExperiments.map((exp, index) => (
                    <tr key={exp.exp_no}>
                      <td className="border border-black p-3 text-center align-top">{exp.exp_no}</td>
                      <td className="border border-black p-3 text-center align-top">{formatDate(exp.date)}</td>
                      <td className="border border-black p-3 align-top">
                        <div className="mb-2">{exp.experiment_title}</div>
                        <div className="text-xs text-blue-600 break-all">
                          {exp.github_url}
                        </div>
                      </td>
                      <td className="border border-black p-2 text-center align-middle">
                        <div className="flex justify-center items-center h-full">
                          <QRCode value={ensureHttpsPrefix(exp.github_url)} size={64} />
                        </div>
                      </td>
                      <td className="border border-black p-3 text-center align-top">{exp.marks}</td>
                      <td className="border border-black p-3 align-top"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Table of Contents - Programming */}
        {!isTheory && programmingSessions.length > 0 && (
          <div className="mb-8">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-white">
                    <th className="border border-black p-2 text-center text-sm">S.NO</th>
                    <th className="border border-black p-2 text-center text-sm">DATE</th>
                    <th className="border border-black p-2 text-center text-sm">LIST OF EXPERIMENTS</th>
                    <th className="border border-black p-2 text-center text-sm">QR CODE</th>
                    <th className="border border-black p-2 text-center text-sm">MARKS</th>
                    <th className="border border-black p-2 text-center text-sm">SIGN</th>
                  </tr>
                </thead>
                <tbody>
                  {programmingSessions.map((session, sessionIndex) => {
                    const subExperimentsCount = session.sub_experiments.length;
                    return session.sub_experiments.map((sub, idx) => (
                      <tr key={`${session.session_no}-${sub.label}`}>
                        {/* S.NO - only show in first row, rowspan for all sub-experiments */}
                        {idx === 0 && (
                          <td 
                            className="border border-black p-3 text-center align-top" 
                            rowSpan={subExperimentsCount}
                          >
                            {session.session_no}
                          </td>
                        )}
                        
                        {/* DATE - individual cell for each sub-experiment */}
                        <td className="border border-black p-3 text-center text-sm">
                          {sub.date && formatDate(sub.date)}
                        </td>
                        
                        {/* LIST OF EXPERIMENTS - individual cell for each sub-experiment */}
                        <td className="border border-black p-3 text-sm">
                          {sub.label}. {sub.title}
                          {/* Show URL only in the last row */}
                          {idx === subExperimentsCount - 1 && (
                            <div className="text-xs mt-3 pt-2 border-t border-gray-300">
                              <span className="text-gray-600">URL: </span>
                              <div className="text-blue-600 break-all">
                                {session.github_url}
                              </div>
                            </div>
                          )}
                        </td>
                        
                        {/* QR CODE - only show in first row, rowspan for all sub-experiments */}
                        {idx === 0 && (
                          <td 
                            className="border border-black p-2 text-center align-middle" 
                            rowSpan={subExperimentsCount}
                          >
                            <div className="flex justify-center items-center h-full">
                              <QRCode value={ensureHttpsPrefix(session.github_url)} size={64} />
                            </div>
                          </td>
                        )}
                        
                        {/* MARKS - only show in first row, rowspan for all sub-experiments */}
                        {idx === 0 && (
                          <td 
                            className="border border-black p-3 text-center align-top" 
                            rowSpan={subExperimentsCount}
                          >
                            {session.marks}
                          </td>
                        )}
                        
                        {/* SIGN - only show in first row, rowspan for all sub-experiments */}
                        {idx === 0 && (
                          <td 
                            className="border border-black p-3 align-top" 
                            rowSpan={subExperimentsCount}
                          >
                          </td>
                        )}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Declaration */}
        <div className="mt-8 pt-4">
          <p className="mb-6">
            I confirm that the experiments and GitHub links provided are entirely my own work.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div>Name: {courseInfo.student_name}</div>
              <div className="mt-2">Date:</div>
            </div>
            <div>
              <div>Register Number: {courseInfo.register_number}</div>
              <div className="mt-2">Learner Signature:</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}