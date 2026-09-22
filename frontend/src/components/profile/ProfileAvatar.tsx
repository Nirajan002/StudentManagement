import { getUploadUrl } from "@/lib/config";

interface ProfileAvatarProps {
  profile?: string | null;
  fullName?: string;
  /** "circle" for compact detail pages, "square" for the hero banner style */
  shape?: "circle" | "square";
  size?: "md" | "lg";
  className?: string;
}

const dimensionClasses: Record<string, string> = {
  md: "h-24 w-24 text-2xl",
  lg: "h-28 w-28 sm:h-32 sm:w-32 text-4xl",
};

export default function ProfileAvatar({
  profile,
  fullName,
  shape = "circle",
  size = "lg",
  className = "",
}: ProfileAvatarProps) {
  const profileUrl = getUploadUrl(profile);
  const initial = fullName?.charAt(0).toUpperCase() || "U";
  const dims = dimensionClasses[size];

  const shapeClasses =
    shape === "square"
      ? "rounded-2xl border-4 border-background shadow-lg"
      : "rounded-full border border-border shadow-xs";

  const fallbackBg =
    shape === "square"
      ? "bg-gradient-to-br from-emerald-500 to-teal-700 text-white"
      : "bg-muted text-foreground";

  return (
    <div className={`relative inline-block ${className}`}>
      {profileUrl ? (
        <img
          src={profileUrl}
          alt={fullName || "Profile"}
          className={`${dims} ${shapeClasses} object-cover`}
        />
      ) : (
        <div
          className={`flex ${dims} items-center justify-center font-bold ${shapeClasses} ${fallbackBg}`}
        >
          {initial}
        </div>
      )}
    </div>
  );
}