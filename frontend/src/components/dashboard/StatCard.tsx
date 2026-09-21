import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export type StatColor = "blue" | "emerald" | "violet" | "amber" | "rose" | "indigo";

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  hint?: string;
  color?: StatColor;
  onClick?: () => void;
}

const colorMap: Record<StatColor, { iconBg: string; text: string; border: string }> = {
  blue: {
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
  },
  violet: {
    iconBg: "bg-purple-500/10 dark:bg-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
  },
  amber: {
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  rose: {
    iconBg: "bg-rose-500/10 dark:bg-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
  },
  indigo: {
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "border-indigo-500/20",
  },
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "blue",
  onClick,
}: StatCardProps) {
  const styles = colorMap[color];

  return (
    <Card
      onClick={onClick}
      className={`group relative overflow-hidden border border-border/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        onClick ? "cursor-pointer hover:border-foreground/20" : ""
      }`}
    >
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {hint && (
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{hint}</span>
            </div>
          )}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${styles.iconBg} ${styles.text} ${styles.border} transition-transform group-hover:scale-105`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="border border-border/80">
      <CardContent className="flex items-start justify-between p-5 animate-pulse">
        <div className="space-y-2.5">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-7 w-14 rounded bg-muted" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-muted" />
      </CardContent>
    </Card>
  );
}