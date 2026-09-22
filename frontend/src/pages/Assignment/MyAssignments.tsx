import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Users2 } from "lucide-react";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import AssignmentCard from "@/components/assignments/AssignmentCard";
import AssignmentStatsBar from "@/components/assignments/AssignmentStatsBar";
import AssignmentFilterBar, { type AssignmentTab } from "@/components/assignments/AssignmentFilterBar";
import { NoAssignmentsState, NoMatchingAssignmentsState } from "@/components/assignments/AssignmentEmptyStates";
import type { MyAssignment } from "@/components/assignments/types";

import { useGetMyAssignmentsQuery } from "../../api/GroupApi";

export default function MyAssignments() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetMyAssignmentsQuery(undefined);

  const [activeTab, setActiveTab] = useState<AssignmentTab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  const uniqueGroups = useMemo(() => {
    if (!data) return [];
    const groupMap = new Map<number, string>();
    data.forEach((a: MyAssignment) => {
      if (a.groupId && a.groupName) groupMap.set(a.groupId, a.groupName);
    });
    return Array.from(groupMap.entries()).map(([id, name]) => ({ id, name }));
  }, [data]);

  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return { activeCount: 0, pastCount: 0, rate: 0 };
    }
    const active = data.filter((a: MyAssignment) => !a.isPast);
    const past = data.filter((a: MyAssignment) => a.isPast);
    const totalStudents = data.reduce((sum: number, a: MyAssignment) => sum + (a.totalStudents || 0), 0);
    const submitted = data.reduce((sum: number, a: MyAssignment) => sum + (a.submittedCount || 0), 0);
    const rate = totalStudents > 0 ? Math.round((submitted / totalStudents) * 100) : 0;

    return { activeCount: active.length, pastCount: past.length, rate };
  }, [data]);

  const filteredAssignments = useMemo(() => {
    if (!data) return [];
    return data.filter((a: MyAssignment) => {
      if (activeTab === "active" && a.isPast) return false;
      if (activeTab === "past" && !a.isPast) return false;
      if (selectedGroup !== "all" && String(a.groupId) !== selectedGroup) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = a.title.toLowerCase().includes(query);
        const matchesGroup = a.groupName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesGroup) return false;
      }

      return true;
    });
  }, [data, activeTab, selectedGroup, searchQuery]);

  return (
    <DashboardLayout activeMenu="Assignments">
      <div className="mx-auto max-w-5xl p-4 sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
                <ClipboardList className="h-5 w-5" />
              </span>
              Assignment Manager
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor submissions, grade student work, and manage coursework across all your classes.
            </p>
          </div>

          <Button
            onClick={() => navigate("/GroupsList")}
            variant="outline"
            className="self-start sm:self-auto gap-2 text-xs"
          >
            <Users2 className="h-4 w-4" />
            Go to Groups to Post
          </Button>
        </div>

        {!isLoading && data && data.length > 0 && (
          <AssignmentStatsBar
            activeCount={stats.activeCount}
            pastCount={stats.pastCount}
            rate={stats.rate}
          />
        )}

        <AssignmentFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCount={stats.activeCount}
          pastCount={stats.pastCount}
          totalCount={data?.length || 0}
          groups={uniqueGroups}
          selectedGroup={selectedGroup}
          onGroupChange={setSelectedGroup}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full rounded-full" />
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              Couldn't load assignments. Please refresh or try again later.
            </p>
          </div>
        )}

        {!isLoading && data && data.length === 0 && (
          <NoAssignmentsState onGoToGroups={() => navigate("/GroupsList")} />
        )}

        {!isLoading && data && data.length > 0 && filteredAssignments.length === 0 && (
          <NoMatchingAssignmentsState
            onReset={() => {
              setSearchQuery("");
              setSelectedGroup("all");
            }}
          />
        )}

        {!isLoading && filteredAssignments.length > 0 && (
          <div className="space-y-4">
            {filteredAssignments.map((assignment: MyAssignment) => (
              <AssignmentCard key={assignment.id} item={assignment} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}