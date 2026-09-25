import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  Loader2,
  Save,
  Users,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useCurrentUser } from "@/hooks/useCurrentUser";

import {
  useGetClassSectionsQuery,
  useGetMyClassSectionsQuery,
} from "../../api/ClassSectionApi";

import {
  useGetRosterQuery,
  useMarkAttendanceMutation,
  type AttendanceEntry,
} from "../../api/AttendanceApi";

import { initials } from "@/components/utils/initials";
import { getUploadUrl } from "@/lib/config";

// ---------------------------------------------
// Attendance status options
// ---------------------------------------------

const STATUS_OPTIONS: {
  value: AttendanceEntry["status"];
  label: string;
  className: string;
}[] = [
  {
    value: "Present",
    label: "P",
    className: "bg-emerald-600 text-white border-emerald-600",
  },
  {
    value: "Absent",
    label: "A",
    className: "bg-red-600 text-white border-red-600",
  },
  {
    value: "Late",
    label: "L",
    className: "bg-amber-500 text-white border-amber-500",
  },
  {
    value: "Excused",
    label: "E",
    className: "bg-sky-500 text-white border-sky-500",
  },
];

// ---------------------------------------------
// Today's date
// ---------------------------------------------

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------
// Take Attendance Component
// ---------------------------------------------

export default function TakeAttendance() {
  const { isAdmin } = useCurrentUser();
  const navigate = useNavigate();

  // ---------------------------------------------
  // Fetch class sections
  // ---------------------------------------------

  const { data: allSections } = useGetClassSectionsQuery(undefined, {
    skip: !isAdmin,
  });

  const { data: mySections } = useGetMyClassSectionsQuery(undefined, {
    skip: isAdmin,
  });

  const sections = isAdmin ? allSections : mySections;

  // ---------------------------------------------
  // State
  // ---------------------------------------------

  const [classSectionId, setClassSectionId] = useState("");

  const [date, setDate] = useState(todayIso());

  const [draft, setDraft] = useState<Record<string, AttendanceEntry["status"]>>(
    {},
  );

  // ---------------------------------------------
  // Find selected class section
  // ---------------------------------------------

  const selectedSection = (sections ?? []).find(
    (s) => String(s.id) === classSectionId,
  );

  // ---------------------------------------------
  // Fetch roster
  // ---------------------------------------------

  const { data: roster, isLoading: isLoadingRoster } = useGetRosterQuery(
    {
      classSectionId: Number(classSectionId),
      date,
    },
    {
      skip: !classSectionId,
    },
  );

  // ---------------------------------------------
  // Mark attendance mutation
  // ---------------------------------------------

  const [markAttendance, { isLoading: isSaving }] = useMarkAttendanceMutation();

  // ---------------------------------------------
  // Get current attendance status
  // ---------------------------------------------

  const statusFor = (
    studentId: string,
    existing: string | null,
  ): AttendanceEntry["status"] =>
    draft[studentId] ??
    (existing as AttendanceEntry["status"] | null) ??
    "Present";

  // ---------------------------------------------
  // Set individual student status
  // ---------------------------------------------

  const setStatus = (studentId: string, status: AttendanceEntry["status"]) => {
    setDraft((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // ---------------------------------------------
  // Mark all students
  // ---------------------------------------------

  const markAll = (status: AttendanceEntry["status"]) => {
    if (!roster) return;

    const next: Record<string, AttendanceEntry["status"]> = {};

    roster.students.forEach((s) => {
      next[s.id] = status;
    });

    setDraft(next);
  };

  // ---------------------------------------------
  // Save attendance
  // ---------------------------------------------

  const handleSave = async () => {
    if (!roster || !classSectionId) return;

    const records: AttendanceEntry[] = roster.students.map((s) => ({
      studentId: s.id,
      status: statusFor(s.id, s.status),
    }));

    try {
      await markAttendance({
        classSectionId: Number(classSectionId),
        date,
        records,
      }).unwrap();

      toast.success("Attendance saved.");

      setDraft({});
    } catch {
      toast.error("Couldn't save attendance. Try again.");
    }
  };

  // ---------------------------------------------
  // Attendance summary
  // ---------------------------------------------

  const summary = useMemo(() => {
    if (!roster) return null;

    const counts = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Excused: 0,
    };

    roster.students.forEach((s) => {
      counts[statusFor(s.id, s.status)]++;
    });

    return counts;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, draft]);

  // ---------------------------------------------
  // UI
  // ---------------------------------------------

  return (
    <DashboardLayout activeMenu="Take Attendance">
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        {/* Page Header */}

        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          Take Attendance
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "Mark attendance for any class section."
            : "Mark attendance for the class sections assigned to you."}
        </p>

        {/* Class Section and Date */}

        <Card className="mt-6">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            {/* Class Section Dropdown */}

            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Class Section
              </label>

              <Select
                value={classSectionId}
                onValueChange={(v) => {
                  setClassSectionId(v ?? "");
                  setDraft({});
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a class section">
                    {selectedSection
                      ? `Class ${selectedSection.className} — Section ${selectedSection.section}`
                      : "Select a class section"}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {(sections ?? []).map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      Class {s.className} — Section {s.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}

            <div className="space-y-1.5">
              <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                Date
              </label>

              <Input
                type="date"
                value={date}
                max={todayIso()}
                onChange={(e) => {
                  setDate(e.target.value);
                  setDraft({});
                }}
                className="w-full sm:w-40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}

        {!classSectionId && (sections ?? []).length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            {isAdmin
              ? "No class sections exist yet."
              : "You haven't been assigned to any class sections. Ask an admin to assign you one."}
          </div>
        )}

        {/* Loading Skeleton */}

        {classSectionId && isLoadingRoster && (
          <div className="mt-6 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Roster */}

        {classSectionId && roster && (
          <>
            {/* Summary and Actions */}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {roster.students.length} students
                {summary && (
                  <span className="ml-2 text-xs">
                    ·{" "}
                    <span className="font-medium text-emerald-600">
                      {summary.Present} present
                    </span>
                    {" · "}
                    <span className="font-medium text-red-600">
                      {summary.Absent} absent
                    </span>
                    {" · "}
                    <span className="font-medium text-amber-600">
                      {summary.Late} late
                    </span>
                    {" · "}
                    <span className="font-medium text-sky-600">
                      {summary.Excused} excused
                    </span>
                  </span>
                )}
              </div>

              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => markAll("Present")}
                >
                  Mark all present
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => markAll("Absent")}
                >
                  Mark all absent
                </Button>
              </div>
            </div>

            {/* Student List */}

            <div className="mt-3 space-y-2">
              {roster.students.map((s) => {
                const current = statusFor(s.id, s.status);

                const profileUrl = getUploadUrl(s.profile);

                return (
                  <Card key={s.id} className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      {/* Student Information */}

                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0 border">
                          {profileUrl && (
                            <AvatarImage src={profileUrl} alt={s.fullName} />
                          )}

                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {initials(s.fullName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => navigate(`/Student/${s.id}`)}
                            className="truncate text-left text-sm font-medium transition-colors hover:text-primary hover:underline"
                          >
                            {s.fullName}
                          </button>

                          {s.rollNumber != null && (
                            <p className="text-xs text-muted-foreground">
                              Roll {s.rollNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Attendance Buttons */}

                      <div className="flex shrink-0 gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setStatus(s.id, opt.value)}
                            className={`flex h-8 w-8 items-center justify-center rounded-md border text-xs font-semibold transition-colors ${
                              current === opt.value
                                ? opt.className
                                : "border-input bg-background text-muted-foreground hover:bg-muted"
                            }`}
                            title={opt.value}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Save Button */}

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Attendance
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
