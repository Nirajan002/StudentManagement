import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type AssignmentTab = "active" | "past" | "all";

interface GroupOption {
  id: number;
  name: string;
}

interface AssignmentFilterBarProps {
  activeTab: AssignmentTab;
  onTabChange: (tab: AssignmentTab) => void;
  activeCount: number;
  pastCount: number;
  totalCount: number;
  groups: GroupOption[];
  selectedGroup: string;
  onGroupChange: (groupId: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function AssignmentFilterBar({
  activeTab,
  onTabChange,
  activeCount,
  pastCount,
  totalCount,
  groups,
  selectedGroup,
  onGroupChange,
  searchQuery,
  onSearchChange,
}: AssignmentFilterBarProps) {
  const tabs: { key: AssignmentTab; label: string; count: number }[] = [
    { key: "active", label: "Active", count: activeCount },
    { key: "past", label: "Past Due", count: pastCount },
    { key: "all", label: "All", count: totalCount },
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border bg-muted/40 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {groups.length > 1 && (
          <div className="flex items-center gap-2 sm:w-60">
            <Select value={selectedGroup} onValueChange={(value) => onGroupChange(value ?? "all")}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups & Classes</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search assignments by title or class name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>
    </div>
  );
}