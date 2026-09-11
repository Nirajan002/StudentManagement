/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface CurrentUserResponse {
  id: any;
  address: string;
  fullName: string;
  email: string;
  gender: string;
  number: string;
  profile: any;
  role: "Admin" | "Teacher" | "Student";
}

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7014/api/Auth",
  credentials: "include",
});

export const AuthApi = createApi({
  reducerPath: "Auth",
  baseQuery,
  refetchOnMountOrArgChange: true,

  tagTypes: ["User", "Teacher", "Student", "CurrentUser"],

  endpoints: (builder) => ({
    // Register Teacher
    registerTeacher: builder.mutation({
      query: (data) => ({
        url: "/TeacherRegister",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Teacher"],
    }),

    // Add Student
    addStudent: builder.mutation({
      query: (data) => ({
        url: "/AddStudent",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Student"],
    }),

    // Login
    login: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    // Refresh token
    refreshToken: builder.mutation({
      query: () => ({
        url: "/refresh",
        method: "POST",
      }),
    }),

    // Unified "who am I" 
    getCurrentUser: builder.query<CurrentUserResponse, void>({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
      providesTags: ["CurrentUser"],
    }),
  }),
});

export const {
  useRegisterTeacherMutation,
  useAddStudentMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
} = AuthApi;