/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

import { useDeleteStudentMutation } from "../../api/StudentApi";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  fullName: string;
  email: string;
  gender: string;
  number: string;
  addresh: string;
  profile?: string | null;
  education: string;
}

interface StudentTableProps {
  students: Student[];
  refetch: () => void | Promise<any>;
  page: number;
}

export default function StudentTable({
  students,
  refetch,
  page,
}: StudentTableProps) {
  const navigate = useNavigate();

  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  // =========================
  // CHECK USER ROLE
  // =========================

  const role = localStorage.getItem("role");

  const isAdmin = role?.toLowerCase() === "admin";

  // =========================
  // DELETE STUDENT
  // =========================

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id).unwrap();

      await refetch();

      toast.success("Student deleted successfully!");
    } catch (error) {
      console.error("Delete student error:", error);

      toast.error("Failed to delete student");
    }
  };

  return (
    <>
      <div className="space-y-3 md:hidden">
        {students?.length > 0 ? (
          students.map((student) => (
            <div key={student.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-3">
                {student.profile ? (
                  <img
                    src={`https://localhost:7014/uploads/${student.profile}`}
                    alt={student.fullName}
                    className="h-12 w-12 rounded-full border object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {student.fullName?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{student.fullName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {student.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {student.gender}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {/* View More - Everyone can see */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate(`/Student/${student.id}?page=${page}`)
                  }
                >
                  View More
                </Button>

                {/* Edit - ADMIN ONLY */}
                {isAdmin && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/EditStudent/${student.id}`)}
                  >
                    Edit
                  </Button>
                )}

                {/* Delete - ADMIN ONLY */}
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-destructive/80 px-4 py-2 text-sm font-medium text-destructive-foreground shadow-xs transition-colors hover:bg-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Student?</AlertDialogTitle>

                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          <strong>{student.fullName}</strong>? This action
                          cannot be undone and will permanently remove the
                          student's data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => handleDelete(student.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No students found.
          </p>
        )}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students?.length > 0 ? (
              students.map((student) => (
                <TableRow key={student.id}>
                  {/* Student */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {student.profile ? (
                        <img
                          src={`https://localhost:7014/uploads/${student.profile}`}
                          alt={student.fullName}
                          className="h-10 w-10 rounded-full border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {student.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <span className="font-medium">{student.fullName}</span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>{student.email}</TableCell>

                  {/* Gender */}
                  <TableCell>{student.gender}</TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex gap-2">
                      {/* View More - Everyone can see */}
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/Student/${student.id}?page=${page}`)
                        }
                      >
                        View More
                      </Button>

                      {/* Edit - ADMIN ONLY */}
                      {isAdmin && (
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`/EditStudent/${student.id}`)}
                        >
                          Edit
                        </Button>
                      )}

                      {/* Delete - ADMIN ONLY */}
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger className="inline-flex h-9 items-center justify-center rounded-md bg-destructive/80 px-4 py-2 text-sm font-medium text-destructive-foreground shadow-xs transition-colors hover:bg-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student?</AlertDialogTitle>

                              <AlertDialogDescription>
                                Are you sure you want to delete{" "}
                                <strong>{student.fullName}</strong>? This action
                                cannot be undone and will permanently remove the
                                student's data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() => handleDelete(student.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}