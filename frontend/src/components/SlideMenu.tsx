import React from "react";

import { useNavigate } from "react-router-dom";

import { SlideMenuData } from "./SideMenuData";

import { Button } from "@/components/ui/button";

import { useGetCurrentTeacherQuery } from "../api/TeacherApi";

import { useLogoutMutation } from "../api/AuthApi";

interface SideMenuProps {
  activeMenu?: string;
}

export default function SideMenu({ activeMenu }: SideMenuProps) {
  const navigate = useNavigate();

  // =========================
  // CURRENT USER
  // =========================
  const { data: user } = useGetCurrentTeacherQuery();

  // =========================
  // LOGOUT
  // =========================
  const [logoutUser] = useLogoutMutation();

  const handleClick = async (route: string) => {
    if (route === "signout") {
      try {
        await logoutUser().unwrap();
      } catch (error) {
        console.error("Logout failed:", error);
      } finally {
        // Clear client-side login data
        localStorage.removeItem("fullName");
        localStorage.removeItem("role");
        localStorage.removeItem("token");

        // Go to login page
        navigate("/Login");
      }

      return;
    }

    navigate(route);
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Profile */}
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

      {/* Menu */}
      <div className="flex flex-col gap-1 p-3">
        {SlideMenuData.map((item, index) => {
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