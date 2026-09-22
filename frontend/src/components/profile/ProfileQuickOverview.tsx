import { Copy, Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCopyToClipboard } from "./useCopyToClipboard";

interface ProfileQuickOverviewProps {
  id: string | number;
  role?: string;
  gender?: string;
  /** Omit entirely to hide the Account Status row */
  emailVerified?: boolean;
}

export default function ProfileQuickOverview({
  id,
  role,
  gender,
  emailVerified,
}: ProfileQuickOverviewProps) {
  const { copiedKey, copy } = useCopyToClipboard();
  const showVerification = emailVerified !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          Quick Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-center justify-between border-b pb-3">
          <span className="text-muted-foreground">User ID</span>
          <div className="flex items-center gap-1 font-mono font-medium">
            <span>#{id}</span>
            <button
              onClick={() => copy(String(id), "quick-id")}
              className="text-muted-foreground hover:text-foreground"
            >
              {copiedKey === "quick-id" ? (
                <Check className="h-3 w-3 text-emerald-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b pb-3">
          <span className="text-muted-foreground">Role</span>
          <span className="font-medium capitalize">{role}</span>
        </div>

        {showVerification && (
          <div className="flex items-center justify-between border-b pb-3">
            <span className="text-muted-foreground">Account Status</span>
            <span
              className={`inline-flex items-center gap-1 font-medium ${
                emailVerified ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  emailVerified ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {emailVerified ? "Verified" : "Pending Verification"}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Gender</span>
          <span className="font-medium capitalize">{gender || "Not specified"}</span>
        </div>
      </CardContent>
    </Card>
  );
}