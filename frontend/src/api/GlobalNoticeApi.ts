import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://localhost:7014/api/GlobalNotices",
  credentials: "include",
});

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

    getLastViewedGlobalNotices: builder.query<
      { lastViewedAt: string | null },
      void
    >({
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
