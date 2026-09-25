import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut, ChevronRight } from "lucide-react";

import { getSlideMenuData } from "./utils/SideMenuData";
import { DashboardApi } from "@/api/DashboardApi";
import { Button } from "@/components/ui/button";

import { TeacherApi } from "../api/TeacherApi";
import { GroupApi } from "../api/GroupApi";
import { StudentApi } from "../api/StudentApi";
import { useLogoutMutation, AuthApi } from "../api/AuthApi";
import { GlobalNoticeApi } from "../api/GlobalNoticeApi";
import { getUploadUrl } from "@/lib/config";
import { ClassSectionApi } from "../api/ClassSectionApi"; 

interface SideMenuProps {
  activeMenu?: string;
  user: {
    id?: string | number;
    profile?: string;
    fullName?: string;
    role?: string;
  };
  onNavigate?: () => void;
}

export default function SideMenu({ activeMenu, user, onNavigate }: SideMenuProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Filter out "signout" from the main links list (since we pin it in the footer)
  const menuItems = getSlideMenuData(user?.role).filter((item) => item.path !== "signout");

  const [logoutUser] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutUser({}).unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem("fullName");
      localStorage.removeItem("role");

      dispatch(AuthApi.util.resetApiState());
      dispatch(TeacherApi.util.resetApiState());
      dispatch(GroupApi.util.resetApiState());
      dispatch(StudentApi.util.resetApiState());
      dispatch(DashboardApi.util.resetApiState());
      dispatch(GlobalNoticeApi.util.resetApiState());
      dispatch(ClassSectionApi.util.resetApiState());

      navigate("/", { replace: true });
    }
  };

  const handleItemClick = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const profileUrl = typeof user?.profile === "string" ? getUploadUrl(user.profile) : null;

  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div>
        {/* Top: Compact User Identity Card */}
        <div
          onClick={() => handleItemClick("/ViewYourProfile")}
          className="group m-3 flex cursor-pointer items-center gap-3 rounded-xl border bg-muted/30 p-3 transition-colors hover:bg-muted/70"
        >
          {profileUrl ? (
            <img
              src={profileUrl}
              alt={user.fullName || "Profile"}
              className="h-10 w-10 shrink-0 rounded-full object-cover border"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
              {user?.fullName || "User"}
            </h4>
            <span className="text-[11px] capitalize text-muted-foreground block">
              {user?.role || "Member"}
            </span>
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex flex-col gap-1 px-3 py-2">
          {menuItems.map((item, index) => {
            const isActive = activeMenu?.toLowerCase() === item.label.toLowerCase();

            return (
              <button
                key={`menu_${index}`}
                onClick={() => handleItemClick(item.path)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold dark:bg-emerald-950/40 dark:text-emerald-300 shadow-xs"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned Bottom Footer: Sign Out Action */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}