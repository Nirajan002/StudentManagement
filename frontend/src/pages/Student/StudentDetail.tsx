import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";

import {
  useGetStudentQuery,
  useDeleteStudentMutation,
} from "../../api/StudentApi";

import { useGetCurrentTeacherQuery } from "../../api/TeacherApi";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getUploadUrl } from "@/lib/config";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const page = searchParams.get("page") || "1";

  const {
    data: student,
    isLoading,
    isError,
    refetch,
  } = useGetStudentQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const { data: currentUser } = useGetCurrentTeacherQuery(undefined);

  const [deleteStudent, { isLoading: isDeleting }] =
    useDeleteStudentMutation();

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  const handleDelete = async () => {
    if (!id) {
      toast.error("Student ID is missing");
      return;
    }

    if (!isAdmin) {
      toast.error("Only administrators can delete students.");
      return;
    }

    try {
      await deleteStudent(id).unwrap();

      toast.success("Student deleted successfully!");

      setTimeout(() => {
        navigate(`/StudentView?page=${page}`);
      }, 500);
    } catch (error: unknown) {
      console.error("Delete student error:", error);

      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Failed to delete student";

      toast.error(message);
    }
  };

  return (
    <DashboardLayout activeMenu="Students">
      <div className="min-h-[calc(100vh-4rem)] bg-muted/20 px-4 py-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(`/StudentView?page=${page}`)}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Students
          </Button>

          {/* SKELETON STATE */}
          {isLoading && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader className="text-center">
                <Skeleton className="mx-auto h-7 w-44" />
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <Skeleton className="h-28 w-28 rounded-full" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ERROR STATE */}
          {!isLoading && (isError || !student) && (
            <Card className="border-destructive/20 bg-destructive/5 p-8 text-center">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <h2 className="mt-3 text-lg font-semibold text-foreground">
                  Student Record Not Found
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The student you are looking for may have been removed or cannot be loaded.
                </p>
                <div className="mt-5 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/StudentView?page=${page}`)}
                  >
                    Return to List
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="mr-1.5 h-4 w-4" />
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* LOADED DETAIL CARD */}
          {!isLoading && student && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Student Details
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  {getUploadUrl(student.profile) ? (
                    <img
                      src={getUploadUrl(student.profile)!}
                      alt={student.fullName}
                      className="h-28 w-28 rounded-full border border-border object-cover shadow-xs"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted text-3xl font-semibold text-foreground">
                      {student.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Full Name
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {student.fullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {student.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Gender
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {student.gender || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {student.number || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Class
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {student.class || "Not assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Section
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {student.section || "Not assigned"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Address
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {student.addresh || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-border/60 pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/StudentView?page=${page}`)}
                  >
                    Back
                  </Button>

                  {isAdmin && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate(`/EditStudent/${student.id}`)}
                      >
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={handleDelete}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}