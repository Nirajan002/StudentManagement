import { useSearchParams, useNavigate } from "react-router-dom";

import { useGetTeachersQuery } from "../../api/TeacherApi";
import { useGetCurrentTeacherQuery } from "../../api/TeacherApi";

import TeacherTable from "@/components/layouts/TeacherTable";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function Teachers() {
  // =========================
  // PAGE
  // =========================

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page")) || 1;

  // =========================
  // GET CURRENT USER
  // =========================

  const {
    data: currentUser,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetCurrentTeacherQuery();

  // Role comes from database through /me
  const isAdmin = currentUser?.role === "Admin";

  // =========================
  // GET TEACHERS
  // =========================

  const {
    data: users,
    isLoading: isTeachersLoading,
    isError: isTeachersError,
    refetch,
  } = useGetTeachersQuery(page, {
    refetchOnMountOrArgChange: true,
  });

  // =========================
  // PAGE CHANGE
  // =========================

  const handlePrevious = () => {
    if (page > 1) {
      setSearchParams({
        page: String(page - 1),
      });
    }
  };

  const handleNext = () => {
    if (users && users.length === 10) {
      setSearchParams({
        page: String(page + 1),
      });
    }
  };

  // =========================
  // LOADING
  // =========================

  if (isUserLoading || isTeachersLoading) {
    return (
      <DashboardLayout activeMenu="Teachers">
        <div className="flex min-h-screen items-center justify-center">
          <h2>Loading teachers...</h2>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (isUserError || isTeachersError) {
    return (
      <DashboardLayout activeMenu="Teachers">
        <div className="flex min-h-screen items-center justify-center">
          <h2 className="text-destructive">
            Failed to load teachers.
          </h2>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <DashboardLayout activeMenu="Teachers">
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 py-8">

          {/* =========================
              HEADER
          ========================= */}

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Teacher Management
              </h1>

              <p className="text-sm text-muted-foreground">
                Manage all registered teachers
              </p>
            </div>

            {/* =========================
                ADD TEACHER - ADMIN ONLY
            ========================= */}

            {isAdmin && (
              <button
                onClick={() => navigate("/RegisterTeacher")}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                + Add Teacher
              </button>
            )}
          </div>

          {/* =========================
              TABLE
          ========================= */}

          <div className="rounded-lg border bg-card">
            <TeacherTable
              users={users ?? []}
              refetch={refetch}
              isAdmin={isAdmin}
            />
          </div>

          {/* =========================
              PAGINATION
          ========================= */}

          <div className="mt-6 flex items-center justify-between">

            <button
              onClick={handlePrevious}
              disabled={page === 1}
              className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-muted-foreground">
              Page {page}
            </span>

            <button
              onClick={handleNext}
              disabled={!users || users.length < 10}
              className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
            >
              Next
            </button>

          </div>

        </main>
      </div>
    </DashboardLayout>
  );
}