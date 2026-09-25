import {
  LayoutDashboard,
  Users,
  GraduationCap,
  User,
  LogOut,
  Group,
  Megaphone,
  ClipboardList,
  School,
  CalendarCheck,
  ClipboardCheck,
  Table2,
} from "lucide-react";

export const getSlideMenuData = (role?: string) => {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === "student") {
    return [
      { label: "Dashboard", path: "/StudentIndex", icon: LayoutDashboard },
      { label: "Groups", path: "/GroupsList", icon: Group },
      { label: "My Attendance", path: "/MyAttendance", icon: CalendarCheck },
      { label: "Announcements", path: "/GlobalNotices", icon: Megaphone },
      { label: "Profile", path: "/ViewYourProfile", icon: User },
      { label: "Sign Out", path: "signout", icon: LogOut },
    ];
  }

  return [
    {
      label: "Dashboard",
      path: normalizedRole === "admin" ? "/AdminIndex" : "/TeacherIndex",
      icon: LayoutDashboard,
    },
    { label: "Students", path: "/StudentView", icon: GraduationCap },
    { label: "Teachers", path: "/Teachers", icon: Users },
    // NEW — admin only
    ...(normalizedRole === "admin"
      ? [{ label: "Classes", path: "/ClassSections", icon: School }]
      : []),
    { label: "Take Attendance", path: "/TakeAttendance", icon: ClipboardCheck },
    { label: "Attendance Sheet", path: "/AttendanceSheet", icon: Table2 },
    { label: "Groups", path: "/GroupsList", icon: Group },
    { label: "Assignments", path: "/MyAssignments", icon: ClipboardList },
    { label: "Announcements", path: "/GlobalNotices", icon: Megaphone },
    { label: "Profile", path: "/ViewYourProfile", icon: User },
    { label: "Sign Out", path: "signout", icon: LogOut },
  ];
};
