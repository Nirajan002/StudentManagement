import { ArrowLeft, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileEditTopBarProps {
  onBack: () => void;
  onDiscard?: () => void;
  onSave: () => void;
  isSaving: boolean;
  canDiscard?: boolean;
  backLabel?: string;
  saveLabel?: string;
}

export default function ProfileEditTopBar({
  onBack,
  onDiscard,
  onSave,
  isSaving,
  canDiscard = false,
  backLabel = "Back",
  saveLabel = "Save Changes",
}: ProfileEditTopBarProps) {
  return (
    <div className="border-b bg-background px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          disabled={isSaving}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Button>

        <div className="flex items-center gap-2">
          {onDiscard && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDiscard}
              disabled={!canDiscard || isSaving}
            >
              Discard
            </Button>
          )}

          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {saveLabel}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}