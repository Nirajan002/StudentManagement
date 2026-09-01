import React from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

import { useDeleteStudentMutation } from "../api/api";

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

interface AdminViewTableProps {
  students: Student[];
  refetch: () => void | Promise<any>;
  page: number;
}

export default function AdminViewTable({
  students,
  refetch,
  page,
}: AdminViewTableProps) {
  const navigate = useNavigate();

  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

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
                  {/* View */}
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(`/Student/${student.id}?page=${page}`)
                    }
                  >
                    View More
                  </Button>

                  {/* Edit */}
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/EditStudent/${student.id}`)}
                  >
                    Edit
                  </Button>

                  {/* Delete */}
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
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No students found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
