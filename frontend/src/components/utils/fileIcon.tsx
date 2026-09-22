import { Paperclip, Image as ImageIcon, FileText } from "lucide-react";

export function getFileIcon(filename?: string | null) {
  if (!filename) return <Paperclip className="h-4 w-4 text-emerald-600" />;

  const ext = filename.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
    return <ImageIcon className="h-4 w-4 text-blue-500" />;
  }

  if (["pdf", "doc", "docx"].includes(ext || "")) {
    return <FileText className="h-4 w-4 text-rose-500" />;
  }

  return <Paperclip className="h-4 w-4 text-emerald-600" />;
}