import { ClipboardList, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoAssignmentsState({ onGoToGroups }: { onGoToGroups: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed py-16 text-center">
      <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
      <h3 className="font-semibold text-foreground">No assignments found</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        You haven't posted any assignments yet. Visit any of your groups to publish an assignment.
      </p>
      <Button onClick={onGoToGroups} className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
        Go to Groups
      </Button>
    </div>
  );
}

export function NoMatchingAssignmentsState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed py-12 text-center">
      <Filter className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
      <p className="text-sm font-medium text-foreground">No matching assignments</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Try adjusting your search query or switching filters.
      </p>
      <Button variant="outline" size="sm" onClick={onReset} className="mt-3 text-xs">
        Reset Filters
      </Button>
    </div>
  );
}