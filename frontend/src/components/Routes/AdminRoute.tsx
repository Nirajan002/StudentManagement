import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, isLoading, isError } = useCurrentUser();

  if (isLoading) return null;

  if (isError || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}