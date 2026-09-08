import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7014/api/Teacher",
  credentials: "include",
});

export const TeacherApi = createApi({
  reducerPath: "Teacher",
  baseQuery,
  refetchOnMountOrArgChange: true,

  tagTypes: ["Teacher", "Student"],

  endpoints: (builder) => ({
    getCurrentTeacher: builder.query({
      query: () => "/me",
      providesTags: ["Teacher"],
    }),

    updateTeacherProfile: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/profile/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Teacher"],
    }),

    getTeachers: builder.query({
      query: (page = 1) => `/Teachers?page=${page}`,
      providesTags: ["Teacher"],
    }),

    getTeacher: builder.query({
      query: (id) => `/Teacher/${id}`,
      providesTags: ["Teacher"],
    }),

    updateTeacher: builder.mutation({
      query: ({ id, data }) => ({
        url: `/teacher/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Teacher"],
    }),

    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `/teacher/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teacher"],
    }),

    searchTeachers: builder.query({
      query: ({ search, limit = 20 }) =>
        `/searchTeacher?search=${encodeURIComponent(search)}&limit=${limit}`,
    }),
  }),
});

export const {
  useGetCurrentTeacherQuery,
  useUpdateTeacherProfileMutation,
  useGetTeacherQuery,
  useGetTeachersQuery,
  useDeleteTeacherMutation,
  useUpdateTeacherMutation,
  useSearchTeachersQuery,
} = TeacherApi;