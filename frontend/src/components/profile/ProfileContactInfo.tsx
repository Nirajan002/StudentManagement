import type { ReactNode, ElementType } from "react";
import { Mail, Phone, MapPin, User, CheckCircle2, ShieldAlert, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCopyToClipboard } from "./useCopyToClipboard";

export interface ExtraProfileField {
  label: string;
  value: ReactNode;
  icon?: ElementType;
  iconClassName?: string;
}

interface InfoTileProps {
  icon: ElementType;
  iconClassName: string;
  label: string;
  value: ReactNode;
  span2?: boolean;
}

function InfoTile({ icon: Icon, iconClassName, label, value, span2 }: InfoTileProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3.5 bg-muted/10 ${
        span2 ? "sm:col-span-2" : ""
      }`}
    >
      <div className={`rounded-lg p-2 ${iconClassName}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{value}</div>
      </div>
    </div>
  );
}

interface ProfileContactInfoProps {
  fullName?: string;
  email?: string;
  number?: string | number | null;
  address?: string | null;
  /** Omit entirely to hide the verified/unverified icon on the email tile */
  emailVerified?: boolean;
  /** Extra tiles appended after the standard four (e.g. Class/Section for students) */
  extraFields?: ExtraProfileField[];
}

export default function ProfileContactInfo({
  fullName,
  email,
  number,
  address,
  emailVerified,
  extraFields = [],
}: ProfileContactInfoProps) {
  const { copiedKey, copy } = useCopyToClipboard();
  const showVerification = emailVerified !== undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <User className="h-4 w-4 text-emerald-600" />
          Contact & Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoTile
            icon={User}
            iconClassName="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
            label="Full Name"
            value={fullName || "Not provided"}
          />

          <InfoTile
            icon={Mail}
            iconClassName="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
            label="Email Address"
            value={
              <span className="flex items-center gap-2">
                <span className="truncate">{email}</span>
                {email && (
                  <button
                    onClick={() => copy(email, "card-email")}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    {copiedKey === "card-email" ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                )}
                {showVerification &&
                  (emailVerified ? (
                    <span title="Verified" className="shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </span>
                  ) : (
                    <span title="Unverified" className="shrink-0">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    </span>
                  ))}
              </span>
            }
          />

          <InfoTile
            icon={Phone}
            iconClassName="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
            label="Phone Number"
            value={
              number || (
                <span className="italic font-normal text-muted-foreground">Not provided</span>
              )
            }
          />

          <InfoTile
            icon={MapPin}
            iconClassName="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
            label="Physical Address"
            value={
              address || (
                <span className="italic font-normal text-muted-foreground">
                  No address provided yet
                </span>
              )
            }
            span2
          />

          {extraFields.map((field, i) => (
            <InfoTile
              key={i}
              icon={field.icon ?? User}
              iconClassName={
                field.iconClassName ??
                "bg-slate-100 text-slate-600 dark:bg-slate-900/50 dark:text-slate-400"
              }
              label={field.label}
              value={field.value}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}