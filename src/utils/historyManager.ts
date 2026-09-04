import { CourseInfo, TheoryExperiment, ProgrammingSession } from '../App';
import { db } from './firebase/config';
import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';

export interface SavedRecord {
  id: string;
  userId: string;
  courseInfo: CourseInfo;
  theoryExperiments: TheoryExperiment[];
  programmingSessions: ProgrammingSession[];
  savedAt: string;
  status: 'draft' | 'complete';
  isShared?: boolean;
  sharedBy?: string;
}

export interface StudentInfo {
  student_name: string;
  register_number: string;
  userId: string;
}

const RECORDS_COLLECTION = 'records';
const USERS_COLLECTION = 'users';
const LOCAL_DRAFTS_KEY = 'lab_generator_drafts';

// --- LOCAL STORAGE DRAFT SYSTEM ---

export function saveDraftLocally(
  recordId: string,
  courseInfo: CourseInfo,
  theoryExperiments: TheoryExperiment[],
  programmingSessions: ProgrammingSession[],
  userId: string
) {
  try {
    const draftsJson = localStorage.getItem(LOCAL_DRAFTS_KEY);
    let drafts: SavedRecord[] = draftsJson ? JSON.parse(draftsJson) : [];
    
    // Remove existing draft if it exists
    drafts = drafts.filter(d => d.id !== recordId);
    
    // Add updated draft
    const newDraft: SavedRecord = {
      id: recordId,
      userId,
      courseInfo,
      theoryExperiments,
      programmingSessions,
      savedAt: new Date().toISOString(),
      status: 'draft',
      isShared: false,
    };
    
    drafts.push(newDraft);
    localStorage.setItem(LOCAL_DRAFTS_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error("Failed to save draft locally", error);
  }
}

export function getDraftsLocally(userId: string): SavedRecord[] {
  try {
    const draftsJson = localStorage.getItem(LOCAL_DRAFTS_KEY);
    if (!draftsJson) return [];
    
    const drafts: SavedRecord[] = JSON.parse(draftsJson);
    return drafts
      .filter(d => d.userId === userId)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch (error) {
    console.error("Failed to get local drafts", error);
    return [];
  }
}

export function deleteDraftLocally(recordId: string) {
  try {
    const draftsJson = localStorage.getItem(LOCAL_DRAFTS_KEY);
    if (!draftsJson) return;
    
    let drafts: SavedRecord[] = JSON.parse(draftsJson);
    drafts = drafts.filter(d => d.id !== recordId);
    localStorage.setItem(LOCAL_DRAFTS_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error("Failed to delete local draft", error);
  }
}

// --- FIREBASE HISTORY SYSTEM ---

export async function saveToHistory(
  recordId: string,
  courseInfo: CourseInfo,
  theoryExperiments: TheoryExperiment[],
  programmingSessions: ProgrammingSession[],
  status: 'draft' | 'complete',
  userId: string,
  isShared: boolean = false
): Promise<void> {
  const record: any = {
    id: recordId,
    userId,
    courseInfo,
    theoryExperiments,
    programmingSessions,
    savedAt: new Date().toISOString(),
    status,
    isShared,
  };
  
  if (isShared) {
    record.sharedBy = courseInfo.student_name;
  }
  
  await setDoc(doc(db, RECORDS_COLLECTION, recordId), record as SavedRecord);
}

export async function getHistory(): Promise<SavedRecord[]> {
  const querySnapshot = await getDocs(collection(db, RECORDS_COLLECTION));
  return querySnapshot.docs.map(doc => doc.data() as SavedRecord);
}

export async function getUserHistory(userId: string): Promise<SavedRecord[]> {
  const q = query(collection(db, RECORDS_COLLECTION), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as SavedRecord).sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export async function getDraftRecords(userId: string): Promise<SavedRecord[]> {
  const history = await getUserHistory(userId);
  return history.filter(record => record.status === 'draft');
}

export async function getCompletedRecords(userId: string): Promise<SavedRecord[]> {
  const history = await getUserHistory(userId);
  return history.filter(record => record.status === 'complete');
}

export async function deleteFromHistory(id: string): Promise<void> {
  await deleteDoc(doc(db, RECORDS_COLLECTION, id));
}

export async function getRecordById(id: string): Promise<SavedRecord | null> {
  const docRef = doc(db, RECORDS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as SavedRecord;
  }
  return null;
}

export async function saveStudentInfo(studentInfo: StudentInfo): Promise<void> {
  await setDoc(doc(db, USERS_COLLECTION, studentInfo.userId), studentInfo);
}

export async function getStudentInfo(userId: string): Promise<StudentInfo | null> {
  const docRef = doc(db, USERS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as StudentInfo;
  }
  return null;
}

export async function clearStudentInfo(userId: string): Promise<void> {
  await deleteDoc(doc(db, USERS_COLLECTION, userId));
}

export async function getSharedRecords(currentUserId: string): Promise<SavedRecord[]> {
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where('status', '==', 'complete'),
    where('isShared', '==', true)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map(doc => doc.data() as SavedRecord)
    .filter(record => record.userId !== currentUserId);
}

export async function toggleShareRecord(recordId: string, userName: string): Promise<boolean> {
  const record = await getRecordById(recordId);
  if (!record) return false;
  
  record.isShared = !record.isShared;
  if (record.isShared) {
    record.sharedBy = userName;
  } else {
    delete (record as any).sharedBy;
  }
  
  await setDoc(doc(db, RECORDS_COLLECTION, recordId), record);
  return record.isShared;
}

export async function isRecordShared(recordId: string): Promise<boolean> {
  const record = await getRecordById(recordId);
  return record?.isShared === true;
}

export async function getAllPublicRecords(): Promise<SavedRecord[]> {
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where('status', '==', 'complete'),
    where('isShared', '==', true)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as SavedRecord);
}

export async function getPublicRecordsByCategory(): Promise<Record<string, SavedRecord[]>> {
  const publicRecords = await getAllPublicRecords();
  const grouped: Record<string, SavedRecord[]> = {};
  
  publicRecords.forEach(record => {
    const courseCode = record.courseInfo.course_code;
    if (!grouped[courseCode]) {
      grouped[courseCode] = [];
    }
    grouped[courseCode].push(record);
  });
  
  return grouped;
}

export async function getPublicRecordsByDepartment(): Promise<Record<string, SavedRecord[]>> {
  const publicRecords = await getAllPublicRecords();
  const grouped: Record<string, SavedRecord[]> = {};
  
  publicRecords.forEach(record => {
    const department = record.courseInfo.department;
    if (!grouped[department]) {
      grouped[department] = [];
    }
    grouped[department].push(record);
  });
  
  return grouped;
}

export async function getPublicRecordsByType(): Promise<Record<string, SavedRecord[]>> {
  const publicRecords = await getAllPublicRecords();
  const grouped: Record<string, SavedRecord[]> = {};
  
  publicRecords.forEach(record => {
    const type = record.courseInfo.record_type;
    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(record);
  });
  
  return grouped;
}

// ─── Real-time subscriptions ──────────────────────────────────────────────

/**
 * Subscribe to a user's records in real-time.
 * Returns an unsubscribe function — call it to stop listening.
 */
export function subscribeToUserHistory(
  userId: string,
  callback: (records: SavedRecord[]) => void
): () => void {
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where('userId', '==', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs
      .map(d => d.data() as SavedRecord)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    callback(records);
  }, (err) => {
    console.error('subscribeToUserHistory error:', err);
    // Let the UI know there's a Firebase rules issue
    if (typeof window !== 'undefined') {
      import('sonner@2.0.3').then(({ toast }) => {
        toast.error(`Database Error: ${err.message}`, {
          description: "Your Firestore rules might be blocking access to read your records.",
          duration: 8000
        });
      });
    }
  });
}

/**
 * Subscribe to ALL public (isShared=true, status=complete) records in real-time.
 * Returns an unsubscribe function.
 */
export function subscribeToPublicRecords(
  callback: (records: SavedRecord[]) => void
): () => void {
  const q = query(
    collection(db, RECORDS_COLLECTION),
    where('status', '==', 'complete'),
    where('isShared', '==', true)
  );
  return onSnapshot(q, (snapshot) => {
    const records = snapshot.docs
      .map(d => d.data() as SavedRecord)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
    callback(records);
  }, (err) => {
    console.error('subscribeToPublicRecords error:', err);
  });
}