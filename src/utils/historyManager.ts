import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';

export interface SavedRecord {
  id: string;
  userId: string; // Add user ID to identify record owner
  courseInfo: CourseInfo;
  theoryExperiments: TheoryExperiment[];
  programmingSessions: ProgrammingSession[];
  savedAt: string;
  status: 'draft' | 'complete';
}

export interface StudentInfo {
  student_name: string;
  register_number: string;
  userId: string; // Add user ID to identify student info owner
}

const HISTORY_KEY = 'lab_records_history';
const STUDENT_INFO_KEY = 'student_info';

export function saveToHistory(
  courseInfo: CourseInfo,
  theoryExperiments: TheoryExperiment[],
  programmingSessions: ProgrammingSession[],
  status: 'draft' | 'complete',
  userId: string // Add userId parameter
): void {
  const history = getHistory();
  
  // Create a unique ID based on course code and timestamp
  const id = `${courseInfo.course_code}_${Date.now()}`;
  
  const record: SavedRecord = {
    id,
    userId, // Store the user ID with the record
    courseInfo,
    theoryExperiments,
    programmingSessions,
    savedAt: new Date().toISOString(),
    status,
  };
  
  // Check if there's already a draft for this course by this user
  const existingDraftIndex = history.findIndex(
    (r) => 
      r.userId === userId && // Check user ID
      r.courseInfo.course_code === courseInfo.course_code &&
      r.courseInfo.course_title === courseInfo.course_title &&
      r.status === 'draft'
  );
  
  if (existingDraftIndex !== -1 && status === 'draft') {
    // Update existing draft
    history[existingDraftIndex] = { ...record, id: history[existingDraftIndex].id };
  } else {
    // Add new record
    history.unshift(record);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getHistory(): SavedRecord[] {
  try {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
}

// Get records for a specific user
export function getUserHistory(userId: string): SavedRecord[] {
  return getHistory().filter(record => record.userId === userId);
}

export function getDraftRecords(userId: string): SavedRecord[] {
  return getUserHistory(userId).filter(record => record.status === 'draft');
}

export function getCompletedRecords(userId: string): SavedRecord[] {
  return getUserHistory(userId).filter(record => record.status === 'complete');
}

export function deleteFromHistory(id: string): void {
  const history = getHistory();
  const updatedHistory = history.filter((record) => record.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
}

export function getRecordById(id: string): SavedRecord | null {
  const history = getHistory();
  return history.find((record) => record.id === id) || null;
}

export function saveStudentInfo(studentInfo: StudentInfo): void {
  localStorage.setItem(STUDENT_INFO_KEY, JSON.stringify(studentInfo));
}

export function getStudentInfo(userId: string): StudentInfo | null {
  try {
    const info = localStorage.getItem(STUDENT_INFO_KEY);
    if (!info) return null;
    
    const parsedInfo = JSON.parse(info);
    
    // Return student info only if it belongs to the current user
    if (parsedInfo.userId === userId) {
      return parsedInfo;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading student info:', error);
    return null;
  }
}

export function clearStudentInfo(): void {
  localStorage.removeItem(STUDENT_INFO_KEY);
}