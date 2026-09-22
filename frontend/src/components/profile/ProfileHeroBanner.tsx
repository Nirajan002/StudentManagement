import { Copy, Check } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";
import { RoleBadge, UnverifiedBadge } from "./RoleBadge";
import { useCopyToClipboard } from "./useCopyToClipboard";

interface ProfileHeroBannerProps {
  profile?: string | null;
  fullName: string;
  email: string;
  role?: string;
  /** Omit entirely to hide verification UI (e.g. viewing someone else's profile) */
  emailVerified?: boolean;
}

export default function ProfileHeroBanner({
  profile,
  fullName,
  email,
  role,
  emailVerified,
}: ProfileHeroBannerProps) {
  const { copiedKey, copy } = useCopyToClipboard();
  const showVerification = emailVerified !== undefined;

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="h-36 w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 sm:h-44 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
      </div>

      <div className="relative px-6 pb-6 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20 gap-4">
          <ProfileAvatar
            profile={profile}
            fullName={fullName}
            shape="square"
            size="lg"
          />

          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={role} />
            {showVerification && !emailVerified && <UnverifiedBadge />}
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {fullName}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{email}</span>
            <button
              onClick={() => copy(email, "hero-email")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Copy Email"
            >
              {copiedKey === "hero-email" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}