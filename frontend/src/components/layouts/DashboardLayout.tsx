import { useState } from "react";
import React from "react";
import Navbar from "../NavBar";
import SideMenu from "../SlideMenu";
import { useGetCurrentUserQuery } from "../../api/AuthApi";
import { X } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
}

export default function DashboardLayout({
  children,
  activeMenu,
}: DashboardLayoutProps) {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        activeMenu={activeMenu}
        onMenuButtonClick={() => setMobileMenuOpen(true)}
        showMenuButton={!!user}
      />

      {user && (
        <>
          {/* Desktop sidebar — unchanged */}
          <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r bg-card md:block">
            <SideMenu activeMenu={activeMenu} user={user} />
          </aside>

          {/* Mobile sidebar — slide-in drawer + backdrop */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileMenuOpen(false)}
              />

              <aside className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl">
                <div className="flex justify-end p-2">
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md p-2 hover:bg-muted"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <SideMenu
                  activeMenu={activeMenu}
                  user={user}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </aside>
            </div>
          )}

          {/* Main content — no left margin on mobile */}
          <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-6">
            {children}
          </main>
        </>
      )}
    </div>
  );
}