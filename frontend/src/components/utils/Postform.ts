import {
  computeAutoDeleteAt,
  type AutoDeleteOption,
} from "./Autodelete";

import type { PostType, SubmissionModeOption } from "./SubmitType";

export interface NewPostDraft {
  type: PostType;
  title: string;
  content: string;
  file: File | null;
  dueDate: string;
  submissionMode: SubmissionModeOption;
  autoDeleteOption: AutoDeleteOption;
  autoDeleteCustom: string;
}

export function createEmptyPostDraft(): NewPostDraft {
  return {
    type: "Notice",
    title: "",
    content: "",
    file: null,
    dueDate: "",
    submissionMode: "Physical",
    autoDeleteOption: "never",
    autoDeleteCustom: "",
  };
}

/**
 * Returns the first problem with the draft, or null when it's ready to
 * publish. Pure — no React, no DOM.
 */
export function validatePostDraft(draft: NewPostDraft): string | null {
  if (!draft.title.trim()) {
    return "Title is required.";
  }

  if (draft.type === "Notice" && !draft.content.trim()) {
    return "Notice content is required.";
  }

  if (draft.type === "Assignment" && !draft.file) {
    return "Please attach a file for the assignment.";
  }

  if (draft.autoDeleteOption === "custom" && !draft.autoDeleteCustom) {
    return "Pick an auto-delete date, or choose a different option.";
  }

  return null;
}

/**
 * Maps a validated draft onto the multipart body the API expects.
 * Assignment-only fields are omitted for notices.
 */
export function buildPostFormData(
  draft: NewPostDraft,
  now: Date = new Date(),
): FormData {
  const formData = new FormData();

  formData.append("Type", draft.type);
  formData.append("Title", draft.title.trim());

  if (draft.content.trim()) {
    formData.append("Content", draft.content.trim());
  }

  if (draft.file) {
    formData.append("File", draft.file);
  }

  if (draft.type === "Assignment") {
    if (draft.dueDate) {
      formData.append("DueDate", new Date(draft.dueDate).toISOString());
    }

    formData.append("SubmissionMode", draft.submissionMode);
  }

  const autoDeleteAt = computeAutoDeleteAt(
    draft.autoDeleteOption,
    draft.autoDeleteCustom,
    now,
  );

  if (autoDeleteAt) {
    formData.append("AutoDeleteAt", autoDeleteAt);
  }

  return formData;
}