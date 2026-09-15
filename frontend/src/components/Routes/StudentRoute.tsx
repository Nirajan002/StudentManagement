import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface StudentRouteProps {
  children: ReactNode;
}

export default function StudentRoute({ children }: StudentRouteProps) {
  const { isStudent, isLoading, isError } = useCurrentUser();

  if (isLoading) return null;

  if (isError || !isStudent) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}