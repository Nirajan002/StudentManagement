import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

const baseQuery = createBaseQueryWithReauth("Attendance");

export interface AttendanceEntry {
  studentId: string;
  status: "Present" | "Absent" | "Late" | "Excused";
}

export interface RosterStudent {
  id: string;
  fullName: string;
  rollNumber: number | null;
  profile?: string | null;
  status: string | null;
}

export interface RosterResponse {
  classSectionId: number;
  className: string;
  section: string;
  date: string;
  students: RosterStudent[];
}

export interface AttendanceSheetStudent {
  id: string;
  fullName: string;
  rollNumber: number | null;
  records: Record<string, string>;
  presentCount: number;
  totalMarked: number;
  percentPresent: number | null;
}

export interface AttendanceSheetResponse {
  classSectionId: number;
  className: string;
  section: string;
  dates: string[];
  students: AttendanceSheetStudent[];
}

export interface StudentAttendanceRecord {
  id: number;
  date: string;
  status: string;
  classSectionId: number;
  classSectionName: string;
}

export interface StudentAttendanceResponse {
  studentId: string;
  fullName: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentPresent: number | null;
  records: StudentAttendanceRecord[];
}

export const AttendanceApi = createApi({
  reducerPath: "Attendance",
  baseQuery,
  refetchOnMountOrArgChange: true,
  tagTypes: ["Roster", "Sheet", "StudentAttendance"],

  endpoints: (builder) => ({
    markAttendance: builder.mutation<
      { saved: number; skipped: number; date: string },
      { classSectionId: number; date: string; records: AttendanceEntry[] }
    >({
      query: (body) => ({
        url: "/mark",
        method: "POST",
        body: {
          ClassSectionId: body.classSectionId,
          Date: body.date,
          Records: body.records.map((r) => ({ StudentId: r.studentId, Status: r.status })),
        },
      }),
      invalidatesTags: ["Roster", "Sheet", "StudentAttendance"],
    }),

    getRoster: builder.query<RosterResponse, { classSectionId: number; date: string }>({
      query: ({ classSectionId, date }) => `/roster?classSectionId=${classSectionId}&date=${date}`,
      providesTags: ["Roster"],
    }),

    getAttendanceSheet: builder.query<
      AttendanceSheetResponse,
      { classSectionId: number; from?: string; to?: string }
    >({
      query: ({ classSectionId, from, to }) => {
        const params = new URLSearchParams({ classSectionId: String(classSectionId) });
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        return `/sheet?${params.toString()}`;
      },
      providesTags: ["Sheet"],
    }),

    getStudentAttendance: builder.query<
      StudentAttendanceResponse,
      { studentId: string; from?: string; to?: string }
    >({
      query: ({ studentId, from, to }) => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const qs = params.toString();
        return `/student/${studentId}${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["StudentAttendance"],
    }),

    getMyAttendance: builder.query<StudentAttendanceResponse, { from?: string; to?: string } | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.from) params.append("from", args.from);
        if (args?.to) params.append("to", args.to);
        const qs = params.toString();
        return `/my${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["StudentAttendance"],
    }),
  }),
});

export const {
  useMarkAttendanceMutation,
  useGetRosterQuery,
  useGetAttendanceSheetQuery,
  useGetStudentAttendanceQuery,
  useGetMyAttendanceQuery,
} = AttendanceApi;