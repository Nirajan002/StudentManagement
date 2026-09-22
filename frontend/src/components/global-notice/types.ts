export interface GlobalNotice {
  id: number;
  title: string;
  content?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  postedByName: string;
  postedAt: string;
  autoDeleteAt?: string | null;
}