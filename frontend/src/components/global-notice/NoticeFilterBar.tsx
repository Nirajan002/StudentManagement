import { Search, Paperclip } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NoticeFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterWithFile: boolean;
  onToggleFilterWithFile: () => void;
  resultCount: number;
}

export default function NoticeFilterBar({
  searchQuery,
  onSearchChange,
  filterWithFile,
  onToggleFilterWithFile,
  resultCount,
}: NoticeFilterBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search announcements by title, content, or author..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={filterWithFile ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleFilterWithFile}
          className="gap-1.5 text-xs"
        >
          <Paperclip className="h-3.5 w-3.5" />
          With Attachments
        </Button>
        <Badge variant="outline" className="px-2.5 py-1 text-xs text-muted-foreground">
          {resultCount} {resultCount === 1 ? "Notice" : "Notices"}
        </Badge>
      </div>
    </div>
  );
}