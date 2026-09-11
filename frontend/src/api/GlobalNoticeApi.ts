import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

const baseQuery = createBaseQueryWithReauth("GlobalNotices");

export const GlobalNoticeApi = createApi({
  reducerPath: "GlobalNotice",
  baseQuery,
  refetchOnMountOrArgChange: true,

  tagTypes: ["GlobalNotice", "GlobalNoticeReadState"],

  endpoints: (builder) => ({
    getGlobalNotices: builder.query({
      query: () => "/",
      providesTags: ["GlobalNotice"],
    }),

    createGlobalNotice: builder.mutation({
      query: (formData: FormData) => ({
        url: "/",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["GlobalNotice"],
    }),

    deleteGlobalNotice: builder.mutation({
      query: (id: number) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GlobalNotice"],
    }),

    getLastViewedGlobalNotices: builder.query<{ lastViewedAt: string | null }, void>({
      query: () => "/last-viewed",
      providesTags: ["GlobalNoticeReadState"],
    }),

    markGlobalNoticesViewed: builder.mutation<{ lastViewedAt: string }, void>({
      query: () => ({
        url: "/mark-viewed",
        method: "POST",
      }),
      invalidatesTags: ["GlobalNoticeReadState"],
    }),
  }),
});

export const {
  useGetGlobalNoticesQuery,
  useCreateGlobalNoticeMutation,
  useDeleteGlobalNoticeMutation,
  useGetLastViewedGlobalNoticesQuery,
  useMarkGlobalNoticesViewedMutation,
} = GlobalNoticeApi;
