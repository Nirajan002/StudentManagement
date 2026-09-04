import {
  LayoutDashboard,
  Users,
  GraduationCap,
  User,
  LogOut,
  Group,
} from "lucide-react";

export const getSlideMenuData = (role?: string) => [
  {
    label: "Dashboard",
    path:
      role?.toLowerCase() === "admin"
        ? "/AdminIndex"
        : "/TeacherIndex",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    path: "/StudentView",
    icon: GraduationCap,
  },
  {
    label: "Teachers",
    path: "/Teachers",
    icon: Users,
  },
  {
    label: "Groups",
    path: "/GroupsList",
    icon: Group,
  },
  {
    label: "Profile",
    path: "/ViewYourProfile",
    icon: User,
  },
  {
    label: "Sign Out",
    path: "signout",
    icon: LogOut,
  },
];