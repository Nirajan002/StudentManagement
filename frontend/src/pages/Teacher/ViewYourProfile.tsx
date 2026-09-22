import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertCircle, Edit3 } from "lucide-react";

import { useGetCurrentUserQuery } from "../../api/AuthApi";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";

import {
  ProfileHeroBanner,
  ProfileQuickOverview,
  ProfileContactInfo,
  ProfileVerificationNotice,
} from "@/components/profile";

export default function ViewYourProfile() {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useGetCurrentUserQuery();

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Profile">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !user) {
    return (
      <DashboardLayout activeMenu="Profile">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Card className="w-full max-w-md text-center p-6">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4 text-xl">Unable to Load Profile</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't retrieve your profile data. Please log in again.
            </p>
            <Button className="mt-5 w-full" onClick={() => navigate("/Login")}>
              Go to Login
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const isStudent = user.role?.toLowerCase() === "student";
  const isVerified = Boolean(user.emailVerified);

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="min-h-[calc(100vh-4rem)] bg-muted/20 pb-12">
        <div className="border-b bg-background px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              onClick={() =>
                navigate(
                  isStudent
                    ? `/UpdateStudentProfile/${user.id}`
                    : `/UpdateTeacherProfile/${user.id}`
                )
              }
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
          <ProfileHeroBanner
            profile={typeof user.profile === "string" ? user.profile : null}
            fullName={user.fullName}
            email={user.email}
            role={user.role}
            emailVerified={isVerified}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <ProfileQuickOverview
                id={user.id}
                role={user.role}
                gender={user.gender}
                emailVerified={isVerified}
              />

              {!isVerified && (
                <ProfileVerificationNotice onVerifyClick={() => navigate("/VerifyEmail")} />
              )}
            </div>

            <div className="space-y-6 lg:col-span-2">
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