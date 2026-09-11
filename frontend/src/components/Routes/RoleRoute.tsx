import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export default function RoleRoute({
  children,
  allowedRoles,
}: RoleRouteProps) {
  const role = localStorage.getItem("role");

  const hasAccess = allowedRoles.some(
    (allowedRole) =>
      allowedRole.toLowerCase() === role?.toLowerCase()
  );

  if (!hasAccess) {
    return <Navigate to="/Login" replace />;
  }

  return <>{children}</>;
}