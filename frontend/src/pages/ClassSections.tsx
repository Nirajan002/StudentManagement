import { useState } from "react";
import { GraduationCap, Users, UserCheck, X, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useGetClassSectionsQuery,
  useAssignInstructorMutation,
  type ClassSectionRow,
} from "../api/ClassSectionApi";
import { useGetTeachersQuery } from "../api/TeacherApi";

interface TeacherOption {
  id: string;
  fullName: string;
}

export default function ClassSections() {
  const {
    data: sections,
    isLoading,
    isError,
    refetch,
  } = useGetClassSectionsQuery();

  // Reuses the existing paged teachers endpoint; fine for a school-sized staff list.
  const { data: teachers = [] } = useGetTeachersQuery(1);

  const [assignInstructor] = useAssignInstructorMutation();
  const [savingId, setSavingId] = useState<number | null>(null);

  const handleAssign = async (row: ClassSectionRow, teacherId: string) => {
    setSavingId(row.id);
    try {
      await assignInstructor({
        id: row.id,
        teacherId: teacherId === "none" ? null : teacherId,
      }).unwrap();
      toast.success(
        teacherId === "none"
          ? `Instructor removed from ${row.className} ${row.section}`
          : `Instructor assigned to ${row.className} ${row.section}`
      );
    } catch {
      toast.error("Couldn't update the instructor. Try again.");
    } finally {
      setSavingId(null);
    }
  };

  // Derived stats
  const totalSections = sections?.length ?? 0;
  const assignedSections = sections?.filter((s) => s.instructorName).length ?? 0;
  const totalStudents = sections?.reduce((acc, s) => acc + s.studentCount, 0) ?? 0;

  return (
    <DashboardLayout activeMenu="Class Sections">
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div className="border-b border-border/60 bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6 py-8 dark:from-indigo-950/30 dark:via-background dark:to-purple-950/20">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 shadow-sm ring-1 ring-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Class Sections
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Assign one teacher per section to manage attendance.
              </p>
            </div>
          </div>

          {/* Stats row */}
          {!isLoading && !isError && sections && sections.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: "Total Sections", value: totalSections, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10" },
                { label: "Assigned", value: assignedSections, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Total Students", value: totalStudents, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`flex flex-col items-center justify-center rounded-xl ${stat.bg} px-3 py-3 text-center ring-1 ring-black/5 dark:ring-white/5`}
                >
                  <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
                  <span className="mt-0.5 text-xs font-medium text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl p-4 sm:p-8">
        {/* Loading skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <p className="font-semibold text-foreground">Couldn't load class sections</p>
            <p className="mt-1 text-sm text-muted-foreground">
              There was a problem fetching the data. Please try again.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Try again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && sections && sections.length === 0 && (
          <div className="rounded-2xl border border-dashed py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <GraduationCap className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="font-semibold text-foreground">No class sections yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              A class and section appears here automatically once a student is placed
              into it. Add or edit a student with a class, section and roll number to
              get started.
            </p>
          </div>
        )}

        {/* Section cards */}
        {!isLoading && !isError && sections && sections.length > 0 && (
          <div className="space-y-3">
            {sections.map((row) => (
              <Card
                key={row.id}
                className="group overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  {/* Left — class info */}
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-sm font-bold text-indigo-700 ring-1 ring-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400">
                      {row.className}{row.section}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Class {row.className} — Section {row.section}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {row.studentCount} student{row.studentCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  {/* Right — badge + selector */}
                  <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                    {row.instructorName ? (
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-emerald-700 dark:text-emerald-400"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        {row.instructorName}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-600 dark:text-amber-400"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        Unassigned
                      </Badge>
                    )}

                    <Select
                      value={row.instructorId ?? "none"}
                      onValueChange={(v) => handleAssign(row, v ?? "none")}
                      disabled={savingId === row.id}
                    >
                      <SelectTrigger
                        size="sm"
                        className="w-[180px] text-xs transition-colors focus:ring-indigo-500/50"
                      >
                        <SelectValue placeholder="Assign teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <X className="h-3 w-3" />
                            No instructor
                          </span>
                        </SelectItem>
                        {teachers.map((t: TeacherOption) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}