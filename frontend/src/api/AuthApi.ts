import { createApi } from "@reduxjs/toolkit/query/react";
import { createBaseQueryWithReauth } from "./baseQueryWithReauth";

interface CurrentUserResponse {
  id: string | number;
  address: string;
  fullName: string;
  email: string;
  gender: string;
  number: string;
  profile: unknown;
  role: "Admin" | "Teacher" | "Student";
  emailVerified: boolean;
}
const baseQuery = createBaseQueryWithReauth("Auth");

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
      providesTags: ["CurrentUser", "User"],
    }),

    sendVerificationEmail: builder.mutation({
      query: () => ({ url: "/verification/send", method: "POST" }),
    }),
    changePendingEmail: builder.mutation({
      query: (data: { newEmail: string }) => ({
        url: "/verification/change-email",
        method: "POST",
        body: data,
      }),
    }),
    confirmEmailVerification: builder.mutation({
      query: (data: { code: string }) => ({
        url: "/verification/confirm",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["CurrentUser"],
    }),
    forgotPassword: builder.mutation({
      query: (data: { email: string }) => ({
        url: "/password/forgot",
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data: { email: string; code: string; newPassword: string }) => ({
        url: "/password/reset",
        method: "POST",
        body: data,
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
  useGetCurrentUserQuery,
  useSendVerificationEmailMutation,
  useChangePendingEmailMutation,
  useConfirmEmailVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = AuthApi;
