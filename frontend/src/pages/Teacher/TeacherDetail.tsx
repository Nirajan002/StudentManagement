import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";

import {
  useGetTeacherQuery,
  useDeleteTeacherMutation,
} from "../../api/TeacherApi";

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

export default function TeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // GET TEACHER
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useGetTeacherQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  // GET CURRENT USER
  const { data: currentUser } = useGetCurrentTeacherQuery(id ?? "");

  // DELETE
  const [deleteUser, { isLoading: isDeleting }] = useDeleteTeacherMutation();

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  // DELETE TEACHER
  const handleDelete = async () => {
    if (!id) {
      toast.error("User ID is missing");
      return;
    }

    if (!isAdmin) {
      toast.error("Only administrators can delete teachers.");
      return;
    }

    try {
      await deleteUser(id).unwrap();

      toast.success("User deleted successfully!");

      setTimeout(() => {
        navigate("/Teachers");
      }, 500);
    } catch (error: unknown) {
      console.error("Delete user error:", error);

      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Failed to delete user";

      toast.error(message);
    }
  };

  return (
    <DashboardLayout activeMenu="Groups">
      <div className="min-h-[calc(100vh-4rem)] bg-muted/20 px-4 py-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* Back Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-4 text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/Teachers")}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Teachers
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
          {!isLoading && (isError || !user) && (
            <Card className="border-destructive/20 bg-destructive/5 p-8 text-center">
              <div className="flex flex-col items-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <h2 className="mt-3 text-lg font-semibold text-foreground">
                  Teacher Record Not Found
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The teacher profile you requested could not be found or failed to load.
                </p>
                <div className="mt-5 flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/Teachers")}
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
          {!isLoading && user && (
            <Card className="border-border/80 shadow-xs">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Teacher Profile
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  {getUploadUrl(user.profile) ? (
                    <img
                      src={getUploadUrl(user.profile)!}
                      alt={user.fullName}
                      className="h-28 w-28 rounded-full border border-border object-cover shadow-xs"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted text-3xl font-semibold text-foreground">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Full Name
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {user.fullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Email
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Gender
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {user.gender || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Phone Number
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {user.number || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Role
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {user.role || "Teacher"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Address
                    </p>
                    <p className="mt-1 text-base font-medium text-foreground">
                      {user.address || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-border/60 pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/Teachers")}
                  >
                    Back
                  </Button>

                  {isAdmin && (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => navigate(`/EditTeacher/${user.id}`)}
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