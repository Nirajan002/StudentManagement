import { useParams, useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";

import {
  useGetUserQuery,
  useGetCurrentUserQuery,
  useDeleteUserMutation,
} from "../api/api";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Navbar from "@/components/NavBar";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // GET USER
  // =========================

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserQuery(id, {
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

  const [deleteUser, { isLoading: isDeleting }] =
    useDeleteUserMutation();

  // =========================
  // CHECK ADMIN
  // =========================

  const isAdmin =
    currentUser?.role?.toLowerCase() === "admin";

  // =========================
  // DELETE USER
  // =========================

  const handleDelete = async () => {
    if (!id) {
      toast.error("User ID is missing");
      return;
    }

    try {
      await deleteUser(id).unwrap();

      toast.success("User deleted successfully!");

      setTimeout(() => {
        navigate("/Users");
      }, 500);
    } catch (error: any) {
      console.error("Delete user error:", error);

      toast.error(
        error?.data?.message || "Failed to delete user"
      );
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

  if (isError || !user) {
    return (
      <div>
        <Navbar />

        <div className="flex min-h-screen items-center justify-center">
          <h2>Failed to load user</h2>
        </div>
      </div>
    );
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
                User Details
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* =========================
                  PROFILE
              ========================= */}

              <div className="flex justify-center">
                {user.profile ? (
                  <img
                    src={`https://localhost:7014/uploads/${user.profile}`}
                    alt={user.fullName}
                    className="h-32 w-32 rounded-full border object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted text-3xl font-medium">
                    {user.fullName
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              {/* =========================
                  USER INFORMATION
              ========================= */}

              <div className="grid gap-5 sm:grid-cols-2">

                {/* FULL NAME */}

                <div>
                  <p className="text-sm text-muted-foreground">
                    Full Name
                  </p>

                  <p className="text-lg font-medium">
                    {user.fullName}
                  </p>
                </div>

                {/* EMAIL */}

                <div>
                  <p className="text-sm text-muted-foreground">
                    Email
                  </p>

                  <p className="text-lg font-medium">
                    {user.email}
                  </p>
                </div>

                {/* GENDER */}

                <div>
                  <p className="text-sm text-muted-foreground">
                    Gender
                  </p>

                  <p className="text-lg font-medium">
                    {user.gender || "Not provided"}
                  </p>
                </div>

                {/* PHONE */}

                <div>
                  <p className="text-sm text-muted-foreground">
                    Phone Number
                  </p>

                  <p className="text-lg font-medium">
                    {user.number || "Not provided"}
                  </p>
                </div>

                {/* ADDRESS */}

                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Address
                  </p>

                  <p className="text-lg font-medium">
                    {user.address || "Not provided"}
                  </p>
                </div>

                {/* ROLE */}

                <div>
                  <p className="text-sm text-muted-foreground">
                    Role
                  </p>

                  <p className="text-lg font-medium">
                    {user.role || "Not provided"}
                  </p>
                </div>

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
                      onClick={() =>
                        navigate(`/EditUser/${user.id}`)
                      }
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
                      {isDeleting
                        ? "Deleting..."
                        : "Delete"}
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