
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  GraduationCap,
} from "lucide-react";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getUploadUrl } from "@/lib/config";

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
  refetch: () => void | Promise<unknown>;
  page: number;
}

export default function StudentTable({
  students,
  refetch,
  page,
}: StudentTableProps) {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();

  const [deleteStudent, { isLoading: isDeleting }] =
    useDeleteStudentMutation();

  // Selected student for delete confirmation
  const [studentToDelete, setStudentToDelete] =
    useState<Student | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent(id).unwrap();
      await refetch();

      toast.success("Student deleted successfully!");
    } catch (error) {
      console.error("Delete student error:", error);
      toast.error("Failed to delete student");
    } finally {
      setStudentToDelete(null);
    }
  };

  const getGenderBadge = (gender: string) => {
    const g = gender?.toLowerCase() || "";

    if (g === "male") {
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
        >
          Male
        </Badge>
      );
    }

    if (g === "female") {
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
        >
          Female
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-muted-foreground">
        {gender || "N/A"}
      </Badge>
    );
  };

  return (
    <>
      {/* =========================
          MOBILE VIEW (Cards)
          ========================= */}

      <div className="space-y-3 md:hidden">
        {students?.length > 0 ? (
          students.map((student) => (
            <div
              key={student.id}
              className="rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-colors hover:border-foreground/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {getUploadUrl(student.profile) ? (
                    <img
                      src={getUploadUrl(student.profile)!}
                      alt={student.fullName}
                      className="h-12 w-12 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-foreground">
                      {student.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {student.fullName}
                    </p>

                    <p className="truncate text-xs text-muted-foreground">
                      {student.email}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      {getGenderBadge(student.gender)}

                      {student.education && (
                        <span className="text-xs text-muted-foreground">
                          {student.education}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                      />
                    }
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/Student/${student.id}?page=${page}`)
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>

                    {isAdmin && (
                      <>
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(`/EditStudent/${student.id}`)
                          }
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Student
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => setStudentToDelete(student)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground/60" />

            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No students found
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              No student records match your criteria.
            </p>
          </div>
        )}
      </div>

      {/* =========================
          DESKTOP TABLE VIEW
          ========================= */}

      <div className="hidden overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[320px]">Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="w-[80px] text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {students?.length > 0 ? (
              students.map((student) => (
                <TableRow
                  key={student.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  {/* Student Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getUploadUrl(student.profile) ? (
                        <img
                          src={getUploadUrl(student.profile)!}
                          alt={student.fullName}
                          className="h-10 w-10 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                          {student.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0">
                        <span
                          onClick={() =>
                            navigate(
                              `/Student/${student.id}?page=${page}`
                            )
                          }
                          className="cursor-pointer font-medium text-foreground hover:underline"
                        >
                          {student.fullName}
                        </span>

                        {student.number && (
                          <p className="text-xs text-muted-foreground">
                            {student.number}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-muted-foreground">
                    {student.email}
                  </TableCell>

                  {/* Gender */}
                  <TableCell>
                    {getGenderBadge(student.gender)}
                  </TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          />
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate(
                              `/Student/${student.id}?page=${page}`
                            )
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        {isAdmin && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/EditStudent/${student.id}`)
                              }
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Student
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() =>
                                setStudentToDelete(student)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-center">
                    <GraduationCap className="h-10 w-10 text-muted-foreground/60" />

                    <h3 className="mt-2 text-sm font-semibold text-foreground">
                      No students found
                    </h3>

                    <p className="text-xs text-muted-foreground">
                      There are no student records to display.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* =========================
          CONFIRM DELETE DIALOG
          ========================= */}

      <AlertDialog
        open={!!studentToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setStudentToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete Student?
            </AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                {studentToDelete?.fullName}
              </strong>
              ? This action cannot be undone and will permanently
              remove their records.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => {
                if (studentToDelete) {
                  handleDelete(studentToDelete.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}