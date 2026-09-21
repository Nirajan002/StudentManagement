import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useNavigate } from "react-router-dom";

const DEFAULT_FEATURES = [
  "Role-tailored dashboards for Admin, Teachers, and Students",
  "Real-time class assignments & interactive grading",
  "Automated email verification & secure JWT sessions",
];

interface AuthLayoutProps {
  children: React.ReactNode;
  heroBadgeText?: string;
  heroTitle?: string;
  heroDescription?: string;
  heroFeatures?: string[];
  showPublicNoticesLink?: boolean;
  footerText?: string;
}

/**
 * Shared shell for every auth screen (Login, VerifyEmail, ForgotPassword...):
 * the branded hero panel on the left (desktop only), and a right-hand column
 * with a top bar (logo / links / theme toggle) wrapping whatever form
 * content is passed as `children`.
 */
export default function AuthLayout({
  children,
  heroBadgeText = "Academic Portal v2.0",
  heroTitle = "The smarter way to manage academic excellence.",
  heroDescription = "Access your unified workspace for attendance tracking, coursework submissions, grading, and department insights.",
  heroFeatures = DEFAULT_FEATURES,
  footerText = "Protected by StudentGrid security policy • Session encrypted",
}: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* =========================================================
          LEFT PANEL: Hero Showcase & Branding (lg+ only)
          ========================================================= */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-12 text-white lg:flex">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-green-500/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-600/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative z-10 flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-baseline gap-1 text-2xl font-bold tracking-tight"
          >
            <span>Student</span>
            <span className="text-green-400">Grid</span>
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>{heroBadgeText}</span>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 ring-1 ring-white/10">
            <GraduationCap className="h-4 w-4 text-green-400" />
            Empowering institutions, faculty & students
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white lg:text-5xl">
            {heroTitle}
          </h1>

          <p className="text-base leading-relaxed text-slate-300/90">
            {heroDescription}
          </p>

          <div className="space-y-3 pt-2">
            {heroFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 text-sm text-slate-200"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-400" />
              <span>Enterprise 256-bit SSL encryption</span>
            </div>
            <span>99.9% Portal Uptime</span>
          </div>
        </div>
      </div>

      {/* =========================================================
          RIGHT PANEL: top bar + centered form slot
          ========================================================= */}
      <div className="flex w-full flex-col justify-between p-6 sm:p-10 lg:w-1/2 lg:p-14">
        <div className="flex items-center justify-between">
          <div
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-baseline gap-0.5 text-2xl font-bold tracking-tight lg:hidden"
          >
            <span>Student</span>
            <span className="text-green-500">Grid</span>
            <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-green-500" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto my-auto w-full max-w-md py-8">{children}</div>

        <div className="text-center text-xs text-muted-foreground">
          {footerText}
        </div>
      </div>
    </div>
  );
}