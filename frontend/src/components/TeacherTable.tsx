import { useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

import {
  useDeleteTeacherMutation,
} from "../api/TeacherApi";

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

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profile?: string | null;
}

interface UserTableProps {
  users: User[];
  refetch: () => void | Promise<any>;
}

export default function TeacherTable({
  users,
  refetch,
}: UserTableProps) {
  const navigate = useNavigate();

  const [deleteUser, { isLoading: isDeleting }] =
    useDeleteTeacherMutation();

  // =========================
  // CHECK USER ROLE
  // =========================

  const role = localStorage.getItem("role");

  const isAdmin = role?.toLowerCase() === "admin";

  // =========================
  // DELETE USER
  // =========================

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();

      await refetch();

      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Delete user error:", error);

      toast.error("Failed to delete user");
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users?.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id}>

              {/* USER */}
              <TableCell>
                <div className="flex items-center gap-3">
                  {user.profile ? (
                    <img
                      src={`https://localhost:7014/uploads/${user.profile}`}
                      alt={user.fullName}
                      className="h-10 w-10 rounded-full border object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {user.fullName
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <span className="font-medium">
                    {user.fullName}
                  </span>
                </div>
              </TableCell>

              {/* EMAIL */}
              <TableCell>
                {user.email}
              </TableCell>

              {/* ROLE */}
              <TableCell>
                {user.role}
              </TableCell>

              {/* ACTIONS */}
              <TableCell>
                <div className="flex gap-2">

                  {/* VIEW MORE */}
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate(`/Teacher/${user.id}`)
                    }
                  >
                    View More
                  </Button>

                  {/* EDIT - ADMIN ONLY */}
                  {isAdmin && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate(`/EditTeacher/${user.id}`)
                      }
                    >
                      Edit
                    </Button>
                  )}

                  {/* DELETE - ADMIN ONLY */}
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        className="inline-flex h-9 items-center justify-center rounded-md bg-destructive/80 px-4 py-2 text-sm font-medium text-destructive-foreground shadow-xs transition-colors hover:bg-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      >
                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete User?
                          </AlertDialogTitle>

                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>
                              {user.fullName}
                            </strong>
                            ? This action cannot be undone
                            and will permanently remove the
                            user's data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            Cancel
                          </AlertDialogCancel>

                          <AlertDialogAction
                            onClick={() =>
                              handleDelete(user.id)
                            }
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
            <TableCell
              colSpan={4}
              className="h-24 text-center"
            >
              No users found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}