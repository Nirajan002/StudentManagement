import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface TeacherRouteProps {
  children: ReactNode;
}

export default function TeacherRoute({ children }: TeacherRouteProps) {
  const { isTeacher, isLoading, isError } = useCurrentUser();

  if (isLoading) return null;

  if (isError || !isTeacher) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}