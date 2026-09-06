import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import QRCode from 'react-qr-code';
import collegeHeader from 'figma:asset/b4febb2531b296d5e7d0e8087088780a9a2db377.png';
import { formatDate } from '../utils/dateFormatter';
import { ensureHttpsPrefix } from '../utils/urlFormatter';
import { Edit } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface DocumentPreviewProps {
  courseInfo: CourseInfo;
  theoryExperiments: TheoryExperiment[];
  programmingSessions: ProgrammingSession[];
  onEditCourseInfo?: () => void;
  onEditExperiments?: () => void;
}

export function DocumentPreview({ courseInfo, theoryExperiments, programmingSessions, onEditCourseInfo, onEditExperiments }: DocumentPreviewProps) {
  const { isDark } = useTheme();
  const isTheory = courseInfo.record_type === 'Theory Record';
  const fontFamily = courseInfo.font_family || 'Times New Roman';

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h2
            className="text-2xl font-black mb-1 tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: isDark ? 'linear-gradient(90deg, #a5b4fc, #c084fc)' : 'linear-gradient(90deg, #3730a3, #6d28d9)' }}
          >
            Document Preview
          </h2>
          <p className="text-sm font-medium" style={{ color: isDark ? '#6b7daa' : '#6b7280' }}>
            Review your lab record before generating PDF
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={onEditCourseInfo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.08)', color: isDark ? '#93c5fd' : '#2563eb', border: isDark ? '1px solid rgba(59,130,246,0.30)' : '1px solid rgba(37,99,235,0.20)' }}
          >
            <Edit className="w-3.5 h-3.5" /> Course Info
          </button>
          <button
            onClick={onEditExperiments}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(147,51,234,0.08)', color: isDark ? '#c4b5fd' : '#7e22ce', border: isDark ? '1px solid rgba(139,92,246,0.30)' : '1px solid rgba(147,51,234,0.20)' }}
          >
            <Edit className="w-3.5 h-3.5" /> Experiments
          </button>
        </div>
      </div>
      
      <div
        id="document-preview"
        className="p-8 max-h-[600px] overflow-y-auto rounded-xl shadow-2xl mx-auto transition-all duration-300"
        style={{
          fontFamily,
          background: '#ffffff', // Document is always white paper
          color: '#000000', // Document text is always black
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.2)' : '0 12px 40px rgba(0,0,0,0.1)',
          maxWidth: '850px' // A4 paper rough width scale
        }}
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
                        <a 
                          href={ensureHttpsPrefix(exp.github_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 break-all underline hover:text-blue-800"
                        >
                          {exp.github_url}
                        </a>
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
                              <a 
                                href={ensureHttpsPrefix(session.github_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 break-all underline hover:text-blue-800"
                              >
                                {session.github_url}
                              </a>
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
              <div className="mt-2">Learner Signature: ___________________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}