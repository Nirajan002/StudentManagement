import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";

import { useGetStudentsQuery } from "../../api/StudentApi";
import { useGetCurrentTeacherQuery } from "../../api/TeacherApi";

import StudentTable from "@/components/layouts/StudentTable";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function StudentView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page")) || 1;

  // CURRENT USER
  const {
    data: currentUser,
  } = useGetCurrentTeacherQuery(undefined);

  const isAdmin = currentUser?.role === "Admin";

  // GET STUDENTS
  const {
    data: students = [],
    isLoading: isStudentsLoading,
    isFetching,
    isError: isStudentsError,
    refetch,
  } = useGetStudentsQuery(page, {
    refetchOnMountOrArgChange: true,
  });

  // PAGE CHANGE
  const goToPreviousPage = () => {
    if (page > 1) {
      setSearchParams({
        page: String(page - 1),
      });
    }
  };

  const goToNextPage = () => {
    if (students.length >= 10) {
      setSearchParams({
        page: String(page + 1),
      });
    }
  };

  return (
    <DashboardLayout activeMenu="Students">
      <div className="p-6">
        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage student profiles, enrollments, and details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button onClick={() => navigate("/AddStudents")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            )}
          </div>
        </div>

        {/* =========================
            LOADING SKELETON STATE
        ========================= */}
        {isStudentsLoading && (
          <TableSkeleton rows={8} />
        )}

        {/* =========================
            ERROR STATE
        ========================= */}
        {!isStudentsLoading && isStudentsError && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h3 className="mt-3 text-base font-semibold text-foreground">
              Failed to load students
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              We encountered an issue fetching student records. Please try again.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* =========================
            TABLE & PAGINATION
        ========================= */}
        {!isStudentsLoading && !isStudentsError && (
          <>
            <StudentTable
              students={students}
              refetch={refetch}
              page={page}
            />

            {/* PAGINATION */}
            <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
              <p className="text-xs text-muted-foreground">
                Showing page <span className="font-semibold text-foreground">{page}</span>
                {isFetching && (
                  <span className="ml-2 inline-flex items-center text-xs text-muted-foreground">
                    (Updating...)
                  </span>
                )}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={page === 1 || isFetching}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={students.length < 10 || isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}