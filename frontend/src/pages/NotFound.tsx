import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Home,
  Compass,
  Users,
  Bell,
  GraduationCap,
  Sparkles,
  HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";
import { useGetCurrentUserQuery } from "../api/AuthApi";

export default function NotFound() {
  const navigate = useNavigate();
  const { data: currentUser } = useGetCurrentUserQuery();

  // Determine home destination based on authentication status and user role
  const getHomeRoute = () => {
    if (!currentUser) return "/Login";
    const role = currentUser.role?.toLowerCase();
    if (role === "admin") return "/AdminIndex";
    if (role === "teacher") return "/TeacherIndex";
    if (role === "student") return "/StudentIndex";
    return "/Login";
  };

  const homeRoute = getHomeRoute();

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-hidden bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Background Decorative Mesh & Radial Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/15" />
        <div className="absolute -bottom-40 right-10 h-[400px] w-[400px] rounded-full bg-teal-500/10 blur-[100px] dark:bg-teal-500/15" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Top Bar with Branding & Theme Switcher */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          to={homeRoute}
          className="flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight sm:text-base leading-none">
              StudentGrid
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              Academic Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main 404 Hero Section */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        {/* Status Pill Badge */}
        <Badge
          variant="outline"
          className="mb-6 gap-1.5 border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 backdrop-blur-md"
        >
          <Compass className="h-3.5 w-3.5" />
          Error 404 • Destination Not Found
        </Badge>

        {/* Large Gradient 404 Number */}
        <div className="relative select-none">
          <span className="bg-gradient-to-b from-foreground via-foreground/80 to-muted-foreground/20 bg-clip-text text-8xl font-black tracking-tighter text-transparent sm:text-9xl">
            404
          </span>
          <div className="absolute inset-x-0 bottom-2 mx-auto h-8 w-48 rounded-full bg-emerald-500/20 blur-xl dark:bg-emerald-500/30" />
        </div>

        {/* Headline & Friendly Explanation */}
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Lost in the hallways?
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base leading-relaxed">
          The page you requested doesn't exist, was moved, or may have had its
          URL mistyped.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="outline"
            size="default"
            className="h-10 gap-2 px-5 text-sm font-medium"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button
            size="default"
            className="h-10 gap-2 bg-emerald-600 px-5 text-sm font-medium text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            onClick={() => navigate(homeRoute)}
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </div>

        {/* Quick Jump Suggestions */}
        <div className="mt-14 w-full max-w-xl">
          <div className="mb-3 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            Popular Destinations
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-left">
            <Link
              to="/GroupsList"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-xs backdrop-blur-xs transition-all hover:border-emerald-500/40 hover:bg-card hover:shadow-md"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-4 w-4" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  Class Groups
                </p>
                <p className="text-[11px] text-muted-foreground">
                  View your courses & feeds
                </p>
              </div>
            </Link>

            <Link
              to="/GlobalNotices"
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-xs backdrop-blur-xs transition-all hover:border-amber-500/40 hover:bg-card hover:shadow-md"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Bell className="h-4 w-4" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  Global Notices
                </p>
                <p className="text-[11px] text-muted-foreground">
                  School bulletins & updates
                </p>
              </div>
            </Link>

            <Link
              to={homeRoute}
              className="group flex flex-col justify-between rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-xs backdrop-blur-xs transition-all hover:border-blue-500/40 hover:bg-card hover:shadow-md"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div className="mt-3">
                <p className="text-xs font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  User Portal
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Access your home account
                </p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>StudentGrid Academic Portal • Need assistance? Contact institutional support.</p>
      </footer>
    </div>
  );
}