import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

const baseQuery = createBaseQueryWithReauth("ClassSections");

export interface ClassSectionRow {
  id: number;
  className: string;
  section: string;
  studentCount: number;
  instructorId: string | null;
  instructorName: string | null;
  instructorEmail: string | null;
}

export const ClassSectionApi = createApi({
  reducerPath: "ClassSection",
  baseQuery,
  refetchOnMountOrArgChange: true,

  tagTypes: ["ClassSection"],

  endpoints: (builder) => ({
    getClassSections: builder.query<ClassSectionRow[], void>({
      query: () => "/",
      providesTags: ["ClassSection"],
    }),

    assignInstructor: builder.mutation<
      unknown,
      { id: number; teacherId: string | null }
    >({
      query: ({ id, teacherId }) => ({
        url: `/${id}/instructor`,
        method: "PUT",
        body: { TeacherId: teacherId },
      }),
      invalidatesTags: ["ClassSection"],
    }),

    getMyClassSections: builder.query<
      {
        id: number;
        className: string;
        section: string;
        studentCount: number;
      }[],
      void
    >({
      query: () => "/mine",
      providesTags: ["ClassSection"],
    }),
  }),
});

export const {
  useGetClassSectionsQuery,
  useAssignInstructorMutation,
  useGetMyClassSectionsQuery,
} = ClassSectionApi;
