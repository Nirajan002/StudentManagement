export type PostType = "Notice" | "Assignment";

export type SubmissionModeOption = "Physical" | "Online" | "Both";

export interface GroupPost {
  id: number;
  type: PostType;
  title: string;
  content?: string | null;
  postedAt: string;
  postedById: string;
  postedByName: string;
  dueDate?: string | null;
  fileName?: string | null;
  originalFileName?: string | null;
  autoDeleteAt?: string | null;
  submissionMode?: SubmissionModeOption | null;

  // Set by the API for the requesting user. Always false for teachers,
  // admins and notices.
  hasSubmitted?: boolean;
}

/**
 * Assignments created before submission modes existed have no mode saved,
 * so they fall back to the original behaviour.
 */
export function resolveSubmissionMode(
  post: Pick<GroupPost, "submissionMode">,
): SubmissionModeOption {
  return post.submissionMode ?? "Physical";
}