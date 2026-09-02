import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  useGetStudentQuery,
  useGetCurrentUserQuery,
  useDeleteStudentMutation,
} from "../api/api";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Navbar from "@/components/NavBar";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || "1";

  // =========================
  // GET STUDENT
  // =========================

  const {
    data: student,
    isLoading,
    isError,
  } = useGetStudentQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  // =========================
  // GET CURRENT USER
  // =========================

  const { data: currentUser } = useGetCurrentUserQuery();

  // =========================
  // DELETE
  // =========================

  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  // =========================
  // CHECK ADMIN
  // =========================

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  // =========================
  // DELETE STUDENT
  // =========================

  const handleDelete = async () => {
    if (!id) {
      toast.error("Student ID is missing");
      return;
    }

    try {
      await deleteStudent(id).unwrap();

      toast.success("Student deleted successfully!");

      // Go back to the previous page
      setTimeout(() => {
        navigate(`/Result?page=${page}`);
      }, 500);
    } catch (error: any) {
      console.error("Delete student error:", error);

      toast.error(error?.data?.message || "Failed to delete student");
    }
  };

  // =========================
  // LOADING
  // =========================

  if (isLoading) {
    return (
      <div>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (isError || !student) {
    return (
      <div>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center">
          <h2>Failed to load student</h2>
        </div>
      </div>
    );
  }

  // =========================
  // EDUCATION
  // =========================

  let education: any[] = [];

  try {
    if (Array.isArray(student.education)) {
      education = student.education;
    } else if (typeof student.education === "string") {
      try {
        const parsed = JSON.parse(student.education);

        if (Array.isArray(parsed)) {
          education = parsed;
        } else {
          education = [
            {
              level: student.education,
            },
          ];
        }
      } catch {
        education = [
          {
            level: student.education,
          },
        ];
      }
    }
  } catch (error) {
    console.error("Education error:", error);
    education = [];
  }

  // =========================
  // UI
  // =========================

  return (
    <div>
      <Navbar />

      <div className="min-h-screen bg-muted/40 px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <Card>
            {/* =========================
                HEADER
            ========================= */}

            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Student Details
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* =========================
                  PROFILE
              ========================= */}

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

              {/* =========================
                  STUDENT INFORMATION
              ========================= */}

              <div className="grid gap-5 sm:grid-cols-2">
                {/* FULL NAME */}

                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>

                  <p className="text-lg font-medium">{student.fullName}</p>
                </div>

                {/* EMAIL */}

                <div>
                  <p className="text-sm text-muted-foreground">Email</p>

                  <p className="text-lg font-medium">{student.email}</p>
                </div>

                {/* GENDER */}

                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>

                  <p className="text-lg font-medium">
                    {student.gender || "Not provided"}
                  </p>
                </div>

                {/* PHONE */}

                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>

                  <p className="text-lg font-medium">
                    {student.number || "Not provided"}
                  </p>
                </div>

                {/* ADDRESS */}

                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>

                  <p className="text-lg font-medium">
                    {student.addresh || "Not provided"}
                  </p>
                </div>
              </div>

              {/* =========================
                  EDUCATION
              ========================= */}

              <div className="border-t pt-6">
                <h3 className="mb-4 text-lg font-semibold">Education</h3>

                {education.length > 0 ? (
                  <div className="space-y-4">
                    {education.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="space-y-4 pt-6">
                          {/* INSTITUTION */}

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Institution
                            </p>

                            <p className="font-medium">
                              {item.institution || "Not provided"}
                            </p>
                          </div>

                          {/* DEGREE */}

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Degree
                            </p>

                            <p className="font-medium">
                              {item.degree || "Not provided"}
                            </p>
                          </div>

                          {/* DATE */}

                          <div>
                            <p className="text-sm text-muted-foreground">
                              Date
                            </p>

                            <p className="font-medium">
                              {item.date || "Not provided"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No education information available.
                  </p>
                )}
              </div>

              {/* =========================
                  BUTTONS
              ========================= */}

              <div className="flex gap-3 pt-4">
                {/* BACK */}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>

                {/* ADMIN ONLY BUTTONS */}

                {isAdmin && (
                  <>
                    {/* EDIT */}

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(`/EditStudent/${student.id}`)}
                    >
                      Edit
                    </Button>

                    {/* DELETE */}

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
    </div>
  );
}
