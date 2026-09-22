import { Megaphone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function NoticeListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="pt-2">
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyNoticesStateProps {
  isAdmin: boolean;
  searchQuery: string;
  onClearSearch: () => void;
}

export function EmptyNoticesState({
  isAdmin,
  searchQuery,
  onClearSearch,
}: EmptyNoticesStateProps) {
  return (
    <div className="rounded-2xl border border-dashed py-16 text-center">
      <Megaphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
      <h3 className="font-semibold text-foreground">No announcements found</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {searchQuery
          ? "No announcements matched your search query. Try clearing filters."
          : isAdmin
            ? "Broadcast an announcement to instantly notify all students and staff members."
            : "Check back later for school-wide announcements and notices."}
      </p>
      {searchQuery && (
        <Button variant="outline" size="sm" onClick={onClearSearch} className="mt-4">
          Clear Search
        </Button>
      )}
    </div>
  );
}