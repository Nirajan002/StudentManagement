import { useState } from "react";
import React from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "../NavBar";
import SideMenu from "../SlideMenu";
import { useGetCurrentUserQuery } from "../../api/AuthApi";
import { X } from "lucide-react";
import PageTransition, { type PageTransitionVariant } from "../transitions/PageTransition";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeMenu?: string;
  transitionVariant?: PageTransitionVariant;
}

export default function DashboardLayout({
  children,
  activeMenu,
  transitionVariant = "fade-up",
}: DashboardLayoutProps) {
  const location = useLocation();
  const { data: user, isLoading } = useGetCurrentUserQuery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Shell placeholder while authentication status loads
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Navbar skeleton */}
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          </div>
        </header>

        {/* Sidebar skeleton (desktop) */}
        <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r bg-card p-4 md:block">
          <div className="flex flex-col items-center border-b pb-6">
            <div className="mb-3 h-20 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          </div>
          <div className="mt-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-full animate-pulse rounded-md bg-muted/60"
              />
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-6">
          {children}
        </main>
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
          {/* Desktop sidebar */}
          <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r bg-card md:block">
            <SideMenu
              activeMenu={activeMenu}
              user={user as { profile?: string; fullName?: string; role?: string }}
            />
          </aside>

          {/* Mobile sidebar — slide-in drawer + backdrop */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-black/40 backdrop-blur-xs"
                  onClick={() => setMobileMenuOpen(false)}
                />

                <motion.aside
                  initial={{ x: -280 }}
                  animate={{ x: 0 }}
                  exit={{ x: -280 }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="absolute left-0 top-0 h-full w-64 bg-card shadow-xl"
                >
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
                    user={user as { profile?: string; fullName?: string; role?: string }}
                    onNavigate={() => setMobileMenuOpen(false)}
                  />
                </motion.aside>
              </div>
            )}
          </AnimatePresence>

          {/* Main content with page transition */}
          <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-6">
            <PageTransition key={location.pathname} variant={transitionVariant}>
              {children}
            </PageTransition>
          </main>
        </>
      )}
    </div>
  );
}