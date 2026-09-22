import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const roleStyles: Record<string, string> = {
  admin:
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
  teacher:
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  student:
    "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
};

export function RoleBadge({ role }: { role?: string }) {
  const style = roleStyles[role?.toLowerCase() ?? ""] || "bg-muted text-muted-foreground";

  return (
    <Badge variant="outline" className={`px-3 py-1 font-semibold capitalize ${style}`}>
      <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
      {role}
    </Badge>
  );
}

export function UnverifiedBadge() {
  return (
    <Badge
      variant="outline"
      className="px-3 py-1 font-semibold border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
    >
      <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
      Unverified
    </Badge>
  );
}