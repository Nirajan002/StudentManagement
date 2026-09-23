import { useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import {
  useGetMySubmissionQuery,
  useSubmitOnlineWorkMutation,
} from "../../api/GroupApi";
import { API_URL } from "@/lib/config";

interface OnlineSubmissionUploadProps {
  groupId: string;
  postId: number;
  disabled?: boolean;
}

export default function OnlineSubmissionUpload({
  groupId,
  postId,
  disabled = false,
}: OnlineSubmissionUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useGetMySubmissionQuery({
    groupId,
    postId: String(postId),
  });

  const [submitWork, { isLoading: isUploading }] = useSubmitOnlineWorkMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      await submitWork({ groupId, postId: String(postId), file }).unwrap();
    } catch {
      setError("Couldn't upload your file. Try again.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) return null;

  const hasSubmitted = !!data?.originalFileName;

  return (
    <div className="mt-2 rounded-md border border-dashed p-2">
      {hasSubmitted ? (
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Submitted: {data.originalFileName}
          </p>
          
          <a  href={`${API_URL}/Groups/${groupId}/posts/${postId}/submissions/online/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            View
          </a>
        </div>
      ) : (
        <p className="mb-1 text-xs text-muted-foreground">
          {disabled
            ? "Submission window closed — the due date has passed."
            : "No online submission yet."}
        </p>
      )}

      {!disabled && (
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
          className="mt-1 block w-full text-xs text-muted-foreground file:mr-2 file:rounded-md file:border file:border-input file:bg-background file:px-2 file:py-1 file:text-xs file:font-medium hover:file:bg-muted"
        />
      )}

      {isUploading && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Uploading...
        </p>
      )}

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {hasSubmitted && !disabled && (
        <p className="mt-1 text-[11px] text-muted-foreground">
          Uploading again will replace your current submission.
        </p>
      )}
    </div>
  );
}