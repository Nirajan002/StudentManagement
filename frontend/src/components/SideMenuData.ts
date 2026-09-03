import {
  LayoutDashboard,
  Users,
  GraduationCap,
  User,
  LogOut,
} from "lucide-react";

export const SlideMenuData = [
  {
    label: "Dashboard",
    path: "/Index",
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