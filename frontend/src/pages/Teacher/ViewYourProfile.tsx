import { useNavigate } from "react-router-dom";

import { useGetCurrentUserQuery } from "../../api/AuthApi";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function Profile() {
  const navigate = useNavigate();

  const {
    data: user,
    isLoading,
    isError,
  } = useGetCurrentUserQuery();

  // =========================
  // LOADING
  // =========================

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Profile">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">
            Loading profile...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (isError || !user) {
    return (
      <DashboardLayout activeMenu="Profile">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                Unable to load profile
              </CardTitle>

              <CardDescription>
                We couldn't retrieve your profile information.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button onClick={() => navigate("/Login")}>
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // PROFILE
  // =========================

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="min-h-[calc(100vh-4rem)] bg-muted/30 px-4 py-10">
        <div className="mx-auto max-w-3xl">

          {/* PROFILE CARD */}
          <Card className="overflow-hidden">

            {/* PROFILE HEADER */}
            <CardHeader className="flex flex-col items-center gap-4 border-b bg-background py-8">

              {/* PROFILE IMAGE */}
              {user.profile ? (
                <img
                  src={`https://localhost:7014/uploads/${user.profile}`}
                  alt={user.fullName}
                  className="h-28 w-28 rounded-full border-4 border-background object-cover shadow-md"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted text-4xl font-semibold shadow-md">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* NAME + EMAIL */}
              <div className="text-center">
                <CardTitle className="text-2xl">
                  {user.fullName}
                </CardTitle>

                <CardDescription className="mt-1">
                  {user.email}
                </CardDescription>
              </div>

              {/* ROLE */}
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                {user.role}
              </span>
            </CardHeader>

            {/* USER INFORMATION */}
            <CardContent className="p-6">

              <h2 className="mb-6 text-lg font-semibold">
                Personal Information
              </h2>

              <div className="space-y-5">

                {/* FULL NAME */}
                <div className="border-b pb-4">
                  <p className="text-sm text-muted-foreground">
                    Full Name
                  </p>

                  <p className="mt-1 font-medium">
                    {user.fullName || "Not provided"}
                  </p>
                </div>

                {/* EMAIL */}
                <div className="border-b pb-4">
                  <p className="text-sm text-muted-foreground">
                    Email
                  </p>

                  <p className="mt-1 font-medium">
                    {user.email || "Not provided"}
                  </p>
                </div>

                {/* GENDER */}
                <div className="border-b pb-4">
                  <p className="text-sm text-muted-foreground">
                    Gender
                  </p>

                  <p className="mt-1 font-medium">
                    {user.gender || "Not provided"}
                  </p>
                </div>

                {/* PHONE NUMBER */}
                <div className="border-b pb-4">
                  <p className="text-sm text-muted-foreground">
                    Phone Number
                  </p>

                  <p className="mt-1 font-medium">
                    {user.number || "Not provided"}
                  </p>
                </div>

                {/* ADDRESS */}
                <div className="border-b pb-4">
                  <p className="text-sm text-muted-foreground">
                    Address
                  </p>

                  <p className="mt-1 font-medium">
                    {user.address || "Not provided"}
                  </p>
                </div>

              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-8 flex items-center justify-between">

                {/* BACK */}
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  ← Back
                </Button>

                {/* EDIT */}
                <Button
                  onClick={() =>
                    navigate(`/UpdateYourProfile/${user.id}`)
                  }
                >
                  Edit Profile
                </Button>

              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}