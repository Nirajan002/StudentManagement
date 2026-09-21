import { useSearchParams, useNavigate } from "react-router-dom";
import { Plus, AlertCircle, RefreshCw } from "lucide-react";

import { useGetTeachersQuery } from "../../api/TeacherApi";
import { useGetCurrentTeacherQuery } from "../../api/TeacherApi";

import TeacherTable from "@/components/layouts/TeacherTable";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function Teachers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page")) || 1;

  // CURRENT USER
  const {
    data: currentUser,
  } = useGetCurrentTeacherQuery(undefined);

  const isAdmin = currentUser?.role === "Admin";

  // GET TEACHERS
  const {
    data: users,
    isLoading: isTeachersLoading,
    isFetching,
    isError: isTeachersError,
    refetch,
  } = useGetTeachersQuery(page, {
    refetchOnMountOrArgChange: true,
  });

  // PAGE CHANGE
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

  return (
    <DashboardLayout activeMenu="Teachers">
      <div className="p-6">
        {/* =========================
            HEADER
        ========================= */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Teacher Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage all registered teachers and faculty members.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button onClick={() => navigate("/RegisterTeacher")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            )}
          </div>
        </div>

        {/* =========================
            LOADING SKELETON
        ========================= */}
        {isTeachersLoading && (
          <TableSkeleton rows={8} />
        )}

        {/* =========================
            ERROR STATE
        ========================= */}
        {!isTeachersLoading && isTeachersError && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h3 className="mt-3 text-base font-semibold text-foreground">
              Failed to load teachers
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              We encountered an issue fetching faculty records. Please try again.
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
        {!isTeachersLoading && !isTeachersError && (
          <>
            <TeacherTable
              users={users ?? []}
              refetch={refetch}
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
                  onClick={handlePrevious}
                  disabled={page === 1 || isFetching}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!users || users.length < 10 || isFetching}
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