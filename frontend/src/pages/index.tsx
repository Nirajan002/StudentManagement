import { Link } from "react-router-dom";
import {
  Bell,
  BookOpenCheck,
  Megaphone,
  ShieldCheck,
  Users,
  LayoutDashboard,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Groups as classrooms",
    text: "Create a group, add students, invite a co-teacher and give it a cover image. Removing a student keeps the history.",
  },
  {
    icon: BookOpenCheck,
    title: "Assignments, start to finish",
    text: "Post work with a due date, accept online or paper submissions, tick them off and send feedback.",
  },
  {
    icon: Bell,
    title: "Instant notifications",
    text: "New posts, submissions and feedback reach the right people the moment they happen. No refresh needed.",
  },
  {
    icon: Megaphone,
    title: "School-wide announcements",
    text: "Admins reach every student and teacher at once, with optional attachments and automatic expiry.",
  },
  {
    icon: LayoutDashboard,
    title: "A dashboard for every role",
    text: "Each person sees what matters to them: pending work, upcoming deadlines and recent activity.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    text: "Protected sign-in, email verification, hashed passwords and rate-limited login attempts.",
  },
];

const roles = [
  {
    name: "Admins",
    points: [
      "See the whole school at a glance",
      "Post announcements to everyone",
      "Spot groups without a co-teacher",
    ],
  },
  {
    name: "Teachers",
    points: [
      "Run groups and co-manage with colleagues",
      "Post notices and assignments",
      "Track submissions and give feedback",
    ],
  },
  {
    name: "Students",
    points: [
      "See what is due and what is done",
      "Submit work online from any device",
      "Read teacher feedback as soon as it arrives",
    ],
  },
];

const darkGradient = "linear-gradient(160deg, #060F24 0%, #08192E 45%, #0B3D2B 100%)";
const gridOverlay =
  "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)";

function Logo() {
  return (
    <Link to="/" className="text-2xl tracking-tight text-white" aria-label="StudentGrid home">
      <span className="font-bold">Student</span>
      <span className="font-extrabold text-green-500"> Grid</span>
      <span className="text-green-500">.</span>
    </Link>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
      <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-2xl shadow-black/30">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Grade 10 Science</p>
            <p className="text-xs text-slate-500">24 students · 2 teachers</p>
          </div>
          <span className="relative rounded-full bg-slate-100 p-2">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </span>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Chapter 5: Forces and motion</p>
              <p className="mt-0.5 text-xs text-slate-500">Assignment · Due Friday, 5:00 PM</p>
            </div>
            <span className="shrink-0 rounded-md bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
              2 days left
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            Submitted online
          </div>
        </div>

        <div className="mt-3 rounded-xl bg-green-50 p-4">
          <p className="text-xs font-medium text-green-800">Feedback from Ms. Rai</p>
          <p className="mt-1 text-sm text-slate-700">Good work. Check the calculation on page 2.</p>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-white/10 bg-[#0B1F35] px-4 py-3 shadow-lg shadow-black/30 sm:block">
        <p className="text-xs text-slate-400">New announcement</p>
        <p className="text-sm font-medium text-white">Holiday schedule posted</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-700 antialiased">
      {/* Hero, with header on top of it */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundImage: `${gridOverlay}, ${darkGradient}`,
          backgroundSize: "40px 40px, 40px 40px, 100% 100%",
        }}
      >
        <header className="relative z-10">
          <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
            <Logo />
            <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex" aria-label="Main">
              <a href="#features" className="hover:text-white">Features</a>
              <a href="#roles" className="hover:text-white">Who it's for</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </nav>
            <Link
              to="/Login"
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
            >
              Log in
            </Link>
          </div>
        </header>

        <section className="relative">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-24 pt-12 md:pt-20 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-sm text-green-300">
                <GraduationCap className="h-4 w-4" />
                Built for institutions, faculty and students
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Every class, assignment and announcement in one place.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
                StudentGrid helps schools run their classrooms. Teachers post work and give
                feedback, students see what is due, and admins keep everyone informed.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Link
                  to="/Login"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-green-900/30 transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
                >
                  Log in to StudentGrid
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#features" className="text-base font-medium text-green-400 hover:text-green-300">
                  See what it does
                </a>
              </div>
              <p className="mt-6 text-sm text-slate-400">
                Accounts are created by your school. Contact your administrator if you can't sign in.
              </p>
            </div>
            <ProductPreview />
          </div>
        </section>
      </div>

      <main>
        {/* Features */}
        <section id="features" className="scroll-mt-4 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900">
              Everything a class needs to stay on track
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Built around how schools actually work, from the first notice to the final feedback.
            </p>

            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section id="roles" className="scroll-mt-4 border-y border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-900">
              One platform, three views
            </h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              After you log in, StudentGrid opens the workspace that fits your role.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {roles.map((role) => (
                <div key={role.name} className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{role.name}</h3>
                  <ul className="mt-4 space-y-3">
                    {role.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* CTA + footer on dark gradient */}
      <div
        style={{
          backgroundImage: `${gridOverlay}, ${darkGradient}`,
          backgroundSize: "40px 40px, 40px 40px, 100% 100%",
        }}
      >
        <section className="py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Ready to pick up where you left off?
              </h2>
              <p className="mt-2 text-slate-300">Log in to see your groups, deadlines and messages.</p>
            </div>
            <Link
              to="/Login"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
            >
              Log in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <footer id="contact" className="border-t border-white/10 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 text-sm text-slate-400 sm:flex-row sm:items-center">
            <Logo />
            <p>Need an account or help signing in? Contact your school administrator.</p>
            <p>© {new Date().getFullYear()} StudentGrid</p>
          </div>
        </footer>
      </div>
    </div>
  );
}