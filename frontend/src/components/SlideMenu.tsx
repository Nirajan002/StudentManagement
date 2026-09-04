import React from "react";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { getSlideMenuData } from "./utils/SideMenuData";

import { Button } from "@/components/ui/button";

import { TeacherApi } from "../api/TeacherApi";
import { GroupApi } from "../api/GroupApi";
import { StudentApi } from "../api/StudentApi";

import { useLogoutMutation, AuthApi } from "../api/AuthApi";

interface SideMenuProps {
  activeMenu?: string;
  user: any;
}

export default function SideMenu({
  activeMenu,
  user,
}: SideMenuProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // =========================
  // MENU ITEMS
  // =========================
  const menuItems = getSlideMenuData(user?.role);

  // =========================
  // LOGOUT
  // =========================
  const [logoutUser] = useLogoutMutation();

  const handleClick = async (route: string) => {
    if (route === "signout") {
      try {
        // Logout from backend
        await logoutUser().unwrap();
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        // Clear local storage
        localStorage.removeItem("fullName");
        localStorage.removeItem("role");
        localStorage.removeItem("token");

        // Clear every RTK Query cache so the next login starts clean.
        // NOTE: add a line here whenever a new api slice is created —
        // otherwise its cache will leak across accounts the same way
        // GroupApi's did.
        dispatch(AuthApi.util.resetApiState());
        dispatch(TeacherApi.util.resetApiState());
        dispatch(GroupApi.util.resetApiState());
        dispatch(StudentApi.util.resetApiState());

        // Go to Login
        navigate("/Login", { replace: true });
      }

      return;
    }

    navigate(route);
  };

  return (
    <div className="flex h-full w-full flex-col">

      {/* =========================
          PROFILE
      ========================= */}
      <div className="flex flex-col items-center border-b px-4 py-6">

        {user?.profile ? (
          <img
            src={`https://localhost:7014/uploads/${user.profile}`}
            alt={user.fullName || "Profile"}
            className="mb-3 h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold">
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
        )}

        <h5 className="text-center text-sm font-semibold">
          {user?.fullName || "User"}
        </h5>
      </div>

      {/* =========================
          MENU
      ========================= */}
      <div className="flex flex-col gap-1 p-3">
        {menuItems.map((item, index) => {
          const isActive = activeMenu === item.label;

          return (
            <Button
              key={`menu_${index}`}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : ""
              }`}
              onClick={() => handleClick(item.path)}
            >
              <item.icon className="h-5 w-5" />

              <span>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}