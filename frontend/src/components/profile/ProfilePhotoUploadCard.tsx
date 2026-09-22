import { useRef, type ElementType } from "react";
import { Camera, RotateCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfilePhotoUploadCardProps {
  photoUrl: string;
  fullName: string;
  roleLabel: string;
  roleIcon?: ElementType;
  roleBadgeClassName?: string;
  hasPendingChange: boolean;
  onFileChange: (file: File) => void;
  onReset: () => void;
  guidelines?: string[];
  maxSizeMb?: number;
}

export default function ProfilePhotoUploadCard({
  photoUrl,
  fullName,
  roleLabel,
  roleIcon: RoleIcon,
  roleBadgeClassName = "bg-muted text-muted-foreground border-border",
  hasPendingChange,
  onFileChange,
  onReset,
  guidelines = [
    "Clear, front-facing photo",
    "Square aspect ratio works best",
    "Max file size: 5MB",
  ],
  maxSizeMb = 5,
}: ProfilePhotoUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMb * 1024 * 1024) {
      e.target.value = "";
      return;
    }

    onFileChange(file);
  };

  const handleReset = () => {
    onReset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-base">Profile Photo</CardTitle>
        <CardDescription>Click the avatar to upload a new picture</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-4 border-background shadow-md transition-transform hover:scale-105"
        >
          <img src={photoUrl} alt={fullName} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6" />
            <span className="mt-1 text-[11px] font-medium">Change</span>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {hasPendingChange && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="mt-3 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Revert Photo
          </Button>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm font-semibold">{fullName}</p>
          <Badge variant="outline" className={`mt-1 ${roleBadgeClassName}`}>
            {RoleIcon && <RoleIcon className="mr-1 h-3 w-3" />}
            {roleLabel}
          </Badge>
        </div>

        {guidelines.length > 0 && (
          <div className="mt-6 w-full rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="mb-1 font-medium text-foreground">Photo guidelines:</p>
            <ul className="list-disc space-y-0.5 pl-4">
              {guidelines.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}