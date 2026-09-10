import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7014/api/Dashboard",
  credentials: "include",
});

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