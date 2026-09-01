import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7014/api/StudentManagement",
  credentials: "include",
});

export const api = createApi({
  reducerPath: "api",
  baseQuery,

  tagTypes: ["User", "Student"],

  endpoints: (builder) => ({
    // =========================
    // AUTH
    // =========================

    register: builder.mutation({
      query: (data) => ({
        url: "/register",
        method: "POST",
        body: data,
      }),
    }),

    login: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    refreshToken: builder.mutation({
      query: () => ({
        url: "/refresh",
        method: "POST",
      }),
    }),

    getCurrentUser: builder.query({
      query: () => "/me",
      providesTags: ["User"],
    }),

    // =========================
    // STUDENTS
    // =========================

    addStudent: builder.mutation({
      query: (data) => ({
        url: "/AddStudent",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Student"],
    }),

    getStudents: builder.query({
      query: (page = 1) => `/Students?page=${page}`,
      providesTags: ["Student"],
    }),

    getStudent: builder.query({
      query: (id) => `/${id}`,
      providesTags: ["Student"],
    }),

    searchStudents: builder.query({
      query: ({ search, limit = 20 }) =>
        `/search?search=${encodeURIComponent(search)}&limit=${limit}`,
    }),

    updateStudent: builder.mutation({
      query: ({ id, data }) => ({
        url: `/student/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Student"],
    }),

    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Student"],
    }),

    updateUserProfile: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/profile/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,

  useAddStudentMutation,
  useGetStudentsQuery,
  useGetStudentQuery,
  useSearchStudentsQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = api;
