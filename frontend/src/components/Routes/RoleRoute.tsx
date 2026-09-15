import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { role, isLoading, isError } = useCurrentUser();

  if (isLoading) return null; // or a spinner

  if (isError || !role || !allowedRoles.some((r) => r.toLowerCase() === role.toLowerCase())) {
    return <Navigate to="/Login" replace />;
  }

  return <>{children}</>;
}