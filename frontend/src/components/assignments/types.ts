export interface MyAssignment {
  id: number;
  groupId: number;
  groupName: string;
  title: string;
  originalFileName?: string | null;
  submissionMode?: string;
  dueDate?: string | null;
  postedAt: string;
  isPast: boolean;
  totalStudents: number;
  submittedCount: number;
}