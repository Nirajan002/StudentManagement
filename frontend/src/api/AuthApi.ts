import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7014/api/Auth",
  credentials: "include",
});

export const AuthApi = createApi({
  reducerPath: "Auth",
  baseQuery,

  tagTypes: ["User", "Teacher", "Student"],

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
  }),
});

export const {
  useRegisterTeacherMutation,
  useAddStudentMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
} = AuthApi;