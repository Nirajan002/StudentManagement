import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";

import { useDeleteTeacherMutation } from "../../api/TeacherApi";
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

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profile?: string | null;
}

interface UserTableProps {
  users: User[];
  refetch: () => void | Promise<unknown>;
}

export default function TeacherTable({ users, refetch }: UserTableProps) {
  const navigate = useNavigate();
  const { isAdmin } = useCurrentUser();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteTeacherMutation();

  // Selected user for delete confirmation
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id).unwrap();
      await refetch();
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error("Failed to delete user");
    } finally {
      setUserToDelete(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = role?.toLowerCase() || "";
    if (r === "admin") {
      return (
        <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400">
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
        Teacher
      </Badge>
    );
  };

  return (
    <>
      {/* =========================
          MOBILE VIEW (Card List)
      ========================== */}
      <div className="flex flex-col gap-3 md:hidden">
        {users?.length > 0 ? (
          users.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-colors hover:border-foreground/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {getUploadUrl(user.profile) ? (
                    <img
                      src={getUploadUrl(user.profile)!}
                      alt={user.fullName}
                      className="h-12 w-12 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-base font-semibold text-foreground">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {user.fullName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </div>

                {/* Dropdown Menu for Mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => navigate(`/Teacher/${user.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>

                    {isAdmin && (
                      <>
                        <DropdownMenuItem
                          onClick={() => navigate(`/EditTeacher/${user.id}`)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Teacher
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => setUserToDelete(user)}
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
            <Users className="h-10 w-10 text-muted-foreground/60" />
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              No teachers found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              There are no teacher records matching your search.
            </p>
          </div>
        )}
      </div>

      {/* =========================
          DESKTOP TABLE VIEW
      ========================== */}
      <div className="hidden rounded-xl border border-border/80 bg-card shadow-xs md:block overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[320px]">Teacher</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users?.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  {/* Teacher Info */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {getUploadUrl(user.profile) ? (
                        <img
                          src={getUploadUrl(user.profile)!}
                          alt={user.fullName}
                          className="h-10 w-10 rounded-full border border-border object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                          {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <span
                        onClick={() => navigate(`/Teacher/${user.id}`)}
                        className="cursor-pointer font-medium text-foreground hover:underline"
                      >
                        {user.fullName}
                      </span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-muted-foreground">
                    {user.email}
                  </TableCell>

                  {/* Role */}
                  <TableCell>{getRoleBadge(user.role)}</TableCell>

                  {/* Actions Dropdown */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/Teacher/${user.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        {isAdmin && (
                          <>
                            <DropdownMenuItem
                              onClick={() => navigate(`/EditTeacher/${user.id}`)}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Teacher
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onClick={() => setUserToDelete(user)}
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
                    <Users className="h-10 w-10 text-muted-foreground/60" />
                    <h3 className="mt-2 text-sm font-semibold text-foreground">
                      No teachers found
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      There are no teacher records to display.
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
      ========================== */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{userToDelete?.fullName}</strong>?
              This action cannot be undone and will permanently remove their records.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => userToDelete && handleDelete(userToDelete.id)}
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