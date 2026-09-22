import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, AlertCircle, RefreshCw, Edit3, Trash2 } from "lucide-react";

import { useGetTeacherQuery, useDeleteTeacherMutation, useGetCurrentTeacherQuery } from "../../api/TeacherApi";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layouts/DashboardLayout";

import {
  ProfileHeroBanner,
  ProfileQuickOverview,
  ProfileContactInfo,
} from "@/components/profile";

export default function TeacherDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useGetTeacherQuery(id, { skip: !id, refetchOnMountOrArgChange: true });

  const { data: currentUser } = useGetCurrentTeacherQuery(id ?? "");
  const [deleteUser, { isLoading: isDeleting }] = useDeleteTeacherMutation();

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";
  const isVerified = Boolean(user?.emailVerified);

  const handleDelete = async () => {
    if (!id) return toast.error("User ID is missing");
    if (!isAdmin) return toast.error("Only administrators can delete teachers.");

    try {
      await deleteUser(id).unwrap();
      toast.success("User deleted successfully!");
      setTimeout(() => navigate("/Teachers"), 500);
    } catch (error: unknown) {
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

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Teachers">
        <div className="min-h-[calc(100vh-4rem)] bg-muted/20 pb-12">
          <div className="border-b bg-background px-4 py-3 sm:px-8">
            <div className="mx-auto max-w-5xl">
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
            <Skeleton className="mb-6 h-44 w-full rounded-2xl" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Skeleton className="h-48 lg:col-span-1" />
              <Skeleton className="h-48 lg:col-span-2" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !user) {
    return (
      <DashboardLayout activeMenu="Teachers">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Card className="w-full max-w-md p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              Teacher Record Not Found
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The teacher profile you requested could not be found or failed to load.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="outline" onClick={() => navigate("/Teachers")}>
                Return to List
              </Button>
              <Button onClick={() => refetch()}>
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Teachers">
      <div className="min-h-[calc(100vh-4rem)] bg-muted/20 pb-12">
        <div className="border-b bg-background px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/Teachers")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Teachers
            </Button>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/EditTeacher/${user.id}`)}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
          <ProfileHeroBanner
            profile={user.profile}
            fullName={user.fullName}
            email={user.email}
            role={user.role}
            emailVerified={isVerified}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ProfileQuickOverview
                id={user.id}
                role={user.role}
                gender={user.gender}
                emailVerified={isVerified}
              />
            </div>

            <div className="lg:col-span-2">
              <ProfileContactInfo
                fullName={user.fullName}
                email={user.email}
                number={user.number}
                address={user.address}
                emailVerified={isVerified}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}