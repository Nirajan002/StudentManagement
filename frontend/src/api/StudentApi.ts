import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7014/api/Student",
  credentials: "include",
});

export const StudentApi = createApi({
  reducerPath: "Student",
  baseQuery,

  tagTypes: ["User", "Student"],

  endpoints: (builder) => ({
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
  }),
});

export const {
  useAddStudentMutation,
  useGetStudentsQuery,
  useGetStudentQuery,
  useSearchStudentsQuery,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
} = StudentApi;
