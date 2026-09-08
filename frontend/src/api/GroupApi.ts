import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7014/api/Groups",
  credentials: "include",
});

export const GroupApi = createApi({
  reducerPath: "Group",
  baseQuery,
  refetchOnMountOrArgChange: true,

  tagTypes: ["Group"],

  endpoints: (builder) => ({
    // List groups (Admin sees all, Teacher sees own/managed)
    getGroups: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((g: { id: number }) => ({
                type: "Group" as const,
                id: g.id,
              })),
              { type: "Group", id: "LIST" },
            ]
          : [{ type: "Group", id: "LIST" }],
    }),

    // Get a single group with its members
    getGroupById: builder.query({
      query: (id: number) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Group", id }],
    }),

    // Create a group (optionally with initial members)
    createGroup: builder.mutation({
      query: (data) => ({
        url: "/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Group", id: "LIST" }],
    }),

    // Add students to a group
    addGroupMembers: builder.mutation({
      query: ({ groupId, studentIds }) => ({
        url: `/${groupId}/members`,
        method: "POST",
        body: { studentIds },
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Group", id: groupId },
        { type: "Group", id: "LIST" },
      ],
    }),

    // Remove a student from a group
    removeGroupMember: builder.mutation({
      query: ({ groupId, studentId }) => ({
        url: `/${groupId}/members/${studentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Group", id: groupId },
        { type: "Group", id: "LIST" },
      ],
    }),

    // Soft-delete a group
    deleteGroup: builder.mutation({
      query: (groupId: number) => ({
        url: `/${groupId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Group", id: "LIST" }],
    }),

    // Groups a given student belongs to
    getGroupsForStudent: builder.query({
      query: (studentId: string) => ({
        url: `/student/${studentId}`,
        method: "GET",
      }),
      providesTags: [{ type: "Group", id: "LIST" }],
    }),

    // Add co-teachers (managers) to a group
    addGroupManagers: builder.mutation({
      query: ({ groupId, teacherIds }) => ({
        url: `/${groupId}/managers`,
        method: "POST",
        body: { teacherIds },
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Group", id: groupId },
      ],
    }),

    // Remove a co-teacher (manager) from a group
    removeGroupManager: builder.mutation({
      query: ({ groupId, teacherId }) => ({
        url: `/${groupId}/managers/${teacherId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "Group", id: groupId },
      ],
    }),

    getGroupPosts: builder.query({
      query: (groupId: string) => `/${groupId}/posts`,
      providesTags: (_result, _error, groupId) => [
        { type: "GroupPost", id: groupId },
      ],
    }),

    createGroupPost: builder.mutation({
      query: ({ groupId, formData }) => ({
        url: `/${groupId}/posts`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "GroupPost", id: groupId },
      ],
    }),

    deleteGroupPost: builder.mutation({
      query: ({ groupId, postId }) => ({
        url: `/${groupId}/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { groupId }) => [
        { type: "GroupPost", id: groupId },
      ],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useCreateGroupMutation,
  useAddGroupMembersMutation,
  useRemoveGroupMemberMutation,
  useDeleteGroupMutation,
  useGetGroupsForStudentQuery,
  useAddGroupManagersMutation,
  useRemoveGroupManagerMutation,
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
  useDeleteGroupPostMutation,
} = GroupApi;
