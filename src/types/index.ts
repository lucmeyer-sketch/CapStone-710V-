export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'administrator' | 'director' | 'psychologist' | 'student';
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  lastName: string;
  email: string;
  grade: string;
  section: string;
  attendance: AttendanceRecord[];
  grades: Grade[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  maxScore: number;
  date: string;
  type: 'exam' | 'quiz' | 'homework' | 'project';
}

export interface Report {
  id: string;
  title: string;
  type: 'attendance' | 'academic' | 'institutional';
  generatedDate: string;
  data: any;
  downloadUrl?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: string;
  type: 'direct' | 'group' | 'announcement';
}

export interface DashboardMetrics {
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
  averageGrade: number;
  activeUsers: number;
  reportsGenerated: number;
}