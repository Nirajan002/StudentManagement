import { useState } from "react";
import { Table2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useGetClassSectionsQuery } from "../../api/ClassSectionApi";
import { useGetAttendanceSheetQuery } from "../../api/AttendanceApi";

// ---------------------------------------------
// Attendance Status Abbreviations
// ---------------------------------------------

const STATUS_ABBR: Record<string, { label: string; className: string }> = {
  Present: {
    label: "P",
    className: "text-emerald-600",
  },
  Absent: {
    label: "A",
    className: "text-red-600",
  },
  Late: {
    label: "L",
    className: "text-amber-600",
  },
  Excused: {
    label: "E",
    className: "text-sky-600",
  },
};

// ---------------------------------------------
// Attendance Sheet Component
// ---------------------------------------------

export default function AttendanceSheet() {
  const { isAdmin } = useCurrentUser();
  const navigate = useNavigate();

  const { data: sections } = useGetClassSectionsQuery();

  // ---------------------------------------------
  // State
  // ---------------------------------------------

  const [classSectionId, setClassSectionId] = useState("");

  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  // ---------------------------------------------
  // Find Selected Class Section
  // ---------------------------------------------

  const selectedSection = (sections ?? []).find(
    (s) => String(s.id) === classSectionId,
  );

  // ---------------------------------------------
  // Fetch Attendance Sheet
  // ---------------------------------------------

  const { data: sheet, isLoading } = useGetAttendanceSheetQuery(
    {
      classSectionId: Number(classSectionId),
      from: from || undefined,
      to: to || undefined,
    },
    {
      skip: !classSectionId,
    },
  );

  // ---------------------------------------------
  // UI
  // ---------------------------------------------

  return (
    <DashboardLayout activeMenu="Attendance Sheet">
      <div className="mx-auto max-w-6xl p-4 sm:p-8">
        {/* Page Header */}

        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20">
            <Table2 className="h-5 w-5" />
          </span>
          Attendance Sheet
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {isAdmin
            ? "View attendance for any class section."
            : "View attendance for any class section you can see."}
        </p>

        {/* Class Section and Date Filters */}

        <Card className="mt-6">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
            {/* Class Section Dropdown */}

            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Class Section
              </label>

              <Select
                value={classSectionId}
                onValueChange={(v) => setClassSectionId(v ?? "")}
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

            {/* From Date */}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                From
              </label>

              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full sm:w-36"
              />
            </div>

            {/* To Date */}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                To
              </label>

              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full sm:w-36"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}

        {classSectionId && isLoading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading attendance sheet...
          </div>
        )}

        {/* Empty State */}

        {classSectionId && sheet && sheet.dates.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">
            No attendance has been taken for this section yet.
          </div>
        )}

        {/* Attendance Table */}

        {classSectionId && sheet && sheet.dates.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl border">
            <table className="w-full border-collapse text-xs">
              {/* Table Header */}

              <thead>
                <tr className="bg-muted/50">
                  <th className="sticky left-0 z-10 min-w-[160px] border-b border-r bg-muted/50 px-3 py-2 text-left font-semibold">
                    Student
                  </th>

                  <th className="border-b px-2 py-2 text-center font-semibold text-muted-foreground">
                    Roll
                  </th>

                  {sheet.dates.map((d) => (
                    <th
                      key={d}
                      className="min-w-[56px] border-b px-2 py-2 text-center font-semibold"
                    >
                      {new Date(d).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </th>
                  ))}

                  <th className="border-b border-l px-2 py-2 text-center font-semibold text-muted-foreground">
                    %
                  </th>
                </tr>
              </thead>

              {/* Table Body */}

              <tbody>
                {sheet.students.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    {/* Student Name */}

                    <td className="sticky left-0 z-10 border-r bg-background px-3 py-2 font-medium">
                      <button
                        type="button"
                        onClick={() => navigate(`/Student/${s.id}`)}
                        className="text-left transition-colors hover:text-primary hover:underline"
                      >
                        {s.fullName}
                      </button>
                    </td>

                    {/* Roll Number */}

                    <td className="border-b px-2 py-2 text-center text-muted-foreground">
                      {s.rollNumber ?? "—"}
                    </td>

                    {/* Attendance Records */}

                    {sheet.dates.map((d) => {
                      const status = s.records[d];

                      const meta = status ? STATUS_ABBR[status] : null;

                      return (
                        <td key={d} className="border-b px-2 py-2 text-center">
                          {meta ? (
                            <span className={`font-semibold ${meta.className}`}>
                              {meta.label}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Attendance Percentage */}

                    <td className="border-b border-l px-2 py-2 text-center font-medium">
                      {s.percentPresent != null ? `${s.percentPresent}%` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Status Legend */}

        {classSectionId && sheet && (
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-emerald-600">P</span> Present
            </span>

            <span>
              <span className="font-semibold text-red-600">A</span> Absent
            </span>

            <span>
              <span className="font-semibold text-amber-600">L</span> Late
            </span>

            <span>
              <span className="font-semibold text-sky-600">E</span> Excused
            </span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
