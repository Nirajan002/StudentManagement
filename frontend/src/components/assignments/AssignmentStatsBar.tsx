import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AssignmentStatsBarProps {
  activeCount: number;
  pastCount: number;
  rate: number;
}

export default function AssignmentStatsBar({
  activeCount,
  pastCount,
  rate,
}: AssignmentStatsBarProps) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Card className="p-4 bg-card/60">
        <span className="text-xs text-muted-foreground font-medium">Open Assignments</span>
        <p className="mt-1 text-2xl font-bold text-foreground">{activeCount}</p>
      </Card>

      <Card className="p-4 bg-card/60">
        <span className="text-xs text-muted-foreground font-medium">Submission Rate</span>
        <div className="mt-1 flex items-baseline gap-1.5">
          <p className="text-2xl font-bold text-emerald-600">{rate}%</p>
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
        </div>
      </Card>

      <Card className="p-4 bg-card/60">
        <span className="text-xs text-muted-foreground font-medium">Past Deadlines</span>
        <p className="mt-1 text-2xl font-bold text-foreground">{pastCount}</p>
      </Card>
    </div>
  );
}