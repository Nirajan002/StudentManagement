import React from "react";
import Navbar from "../NavBar";
import SideMenu from "../SlideMenu";
import { useGetCurrentUserQuery } from "../../api/AuthApi";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
}

export default function DashboardLayout({
  children,
  activeMenu,
}: DashboardLayoutProps) {
  const { data: user, isLoading } = useGetCurrentUserQuery();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
      <Navbar activeMenu={activeMenu} />

      {user && (
        <>
          {/* Fixed Sidebar */}
          <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r bg-card md:block">
            <SideMenu activeMenu={activeMenu} user={user} />
          </aside>

          {/* Main Content */}
          <main className="ml-64 min-h-[calc(100vh-4rem)] p-4 md:p-6">
            {children}
          </main>
        </>
      )}
    </div>
  );
}