import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

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

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const page = searchParams.get("page") || "1";

  const {
    data: student,
    isLoading,
    isError,
  } = useGetStudentQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const { data: currentUser } = useGetCurrentTeacherQuery();

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
        navigate(`/Result?page=${page}`);
      }, 500);
    } catch (error: any) {
      console.error("Delete student error:", error);

      toast.error(
        error?.data?.message || "Failed to delete student"
      );
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Students">
        <div className="flex min-h-screen items-center justify-center">
          <h2>Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !student) {
    return (
      <DashboardLayout activeMenu="Students">
        <div className="flex min-h-screen items-center justify-center">
          <h2>Failed to load student</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Students">
      <div className="min-h-screen bg-muted/40 px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Student Details
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-center">
                {student.profile ? (
                  <img
                    src={`https://localhost:7014/uploads/${student.profile}`}
                    alt={student.fullName}
                    className="h-32 w-32 rounded-full border object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted text-3xl font-medium">
                    {student.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Full Name
                  </p>
                  <p className="text-lg font-medium">
                    {student.fullName}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg font-medium">
                    {student.email}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Gender
                  </p>
                  <p className="text-lg font-medium">
                    {student.gender || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="text-lg font-medium">
                    {student.number || "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Class
                  </p>
                  <p className="text-lg font-medium">
                    {student.class || "Not assigned"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Section
                  </p>
                  <p className="text-lg font-medium">
                    {student.section || "Not assigned"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Address
                  </p>
                  <p className="text-lg font-medium">
                    {student.addresh || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>

                {isAdmin && (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        navigate(`/EditStudent/${student.id}`)
                      }
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
        </div>
      </div>
    </DashboardLayout>
  );
}