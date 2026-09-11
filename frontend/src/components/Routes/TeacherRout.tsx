import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface TeacherRouteProps {
  children: ReactNode;
}

export default function TeacherRoute({
  children,
}: TeacherRouteProps) {
  const role = localStorage.getItem("role");

  if (role !== "Teacher") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}