import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileVerificationNoticeProps {
  onVerifyClick: () => void;
}

export default function ProfileVerificationNotice({
  onVerifyClick,
}: ProfileVerificationNoticeProps) {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Email not verified
            </p>
            <p className="mt-1 text-xs text-amber-700/80 dark:text-amber-400/80">
              Verify your email to secure your account and unlock full access.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
              onClick={onVerifyClick}
            >
              Verify Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}