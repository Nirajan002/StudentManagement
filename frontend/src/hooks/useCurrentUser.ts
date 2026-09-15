import { useGetCurrentUserQuery } from "../api/AuthApi";

export function useCurrentUser() {
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();

  return {
    user,
    role: user?.role,
    isAdmin: user?.role === "Admin",
    isTeacher: user?.role === "Teacher",
    isStudent: user?.role === "Student",
    isLoading,
    isError,
    isLoggedIn: !!user,
  };
}