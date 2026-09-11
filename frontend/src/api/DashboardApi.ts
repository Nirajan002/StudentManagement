import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

const baseQuery = createBaseQueryWithReauth("Dashboard");

export const DashboardApi = createApi({
  reducerPath: "Admin",
  baseQuery,
  refetchOnMountOrArgChange: true,

  tagTypes: ["Dashboard"],

  endpoints: (builder) => ({
    getAdminDashboard: builder.query({
      query: () => "/dashboard",
      providesTags: ["Dashboard"],
    }),

    getTeacherDashboard: builder.query({
      query: () => "/teacher-dashboard",
      providesTags: ["Dashboard"],
    }),

    getStudentDashboard: builder.query({
      query: () => "/student-dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetTeacherDashboardQuery,
  useGetStudentDashboardQuery,
} = DashboardApi;