import {
  LayoutDashboard,
  Users,
  GraduationCap,
  User,
  LogOut,
  Group,
  Megaphone,
  ClipboardList,
} from "lucide-react";

export const getSlideMenuData = (role?: string) => {
  const normalizedRole = role?.toLowerCase();

  // =========================
  // STUDENT MENU
  // =========================
  if (normalizedRole === "student") {
    return [
      {
        label: "Dashboard",
        path: "/StudentIndex",
        icon: LayoutDashboard,
      },
      {
        label: "Groups",
        path: "/GroupsList",
        icon: Group,
      },
      {
        label: "Announcements",
        path: "/GlobalNotices",
        icon: Megaphone,
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
  }

  // =========================
  // ADMIN / TEACHER MENU
  // =========================
  return [
    {
      label: "Dashboard",
      path: normalizedRole === "admin" ? "/AdminIndex" : "/TeacherIndex",
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
      label: "Assignments",
      path: "/MyAssignments",
      icon: ClipboardList,
    },
    {
      label: "Announcements",
      path: "/GlobalNotices",
      icon: Megaphone,
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
};
