import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { PublicViewer } from './components/PublicViewer';

export interface CourseInfo {
  record_type: 'Theory Record' | 'Programming Record' | '';
  course_code: string;
  course_title: string;
  student_name: string;
  register_number: string;
  department: string;
  semester: string;
  academic_year: string;
  college_name: string;
  declaration_date: string;
  font_family: string;
}

export interface TheoryExperiment {
  exp_no: string;
  date: string;
  experiment_title: string;
  github_url: string;
  marks: string;
}

export interface SubExperiment {
  label: string;
  date: string;
  title: string;
}

export interface ProgrammingSession {
  session_no: number;
  date: string;
  sub_experiments: SubExperiment[];
  github_url: string;
  marks: string;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/view/:encodedId" element={<PublicViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}