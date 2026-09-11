import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface StudentRouteProps {
  children: ReactNode;
}

export default function StudentRoute({
  children,
}: StudentRouteProps) {
  const role = localStorage.getItem("role");

  if (role !== "Student") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}