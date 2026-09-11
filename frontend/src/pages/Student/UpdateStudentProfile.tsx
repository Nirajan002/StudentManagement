/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useGetCurrentUserQuery } from "../../api/AuthApi";
import { useUpdateStudentProfileMutation } from "../../api/StudentApi";

import InputField from "@/components/form/InputField";
import FileField from "@/components/form/FileField";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import DashboardLayout from "@/components/layouts/DashboardLayout";

interface ProfileForm {
  profile: FileList | null;
  gender: string;
  number: string;
  addresh: string;
}

export default function UpdateStudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, refetch } = useGetCurrentUserQuery();

  const [updateStudentProfile, { isLoading: isUpdating }] =
    useUpdateStudentProfileMutation();

  const methods = useForm<ProfileForm>({
    defaultValues: {
      profile: null,
      gender: "",
      number: "",
      addresh: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    methods.reset({
      profile: null,
      gender: user.gender || "",
      number: user.number || "",
      addresh: user.address || "",
    });
  }, [user, methods]);

  useEffect(() => {
    if (!id) {
      toast.error("User ID is missing");
      navigate("/ViewYourProfile");
    }
  }, [id, navigate]);

  const onSubmit = async (data: ProfileForm) => {
    if (!id) {
      toast.error("User ID is missing");
      return;
    }

    const formData = new FormData();

    if (data.profile?.[0]) {
      formData.append("Profile", data.profile[0]);
    }

    // FullName and Email are intentionally NOT sent — students can't edit them.
    formData.append("Gender", data.gender);
    formData.append("Number", data.number);
    formData.append("Addresh", data.addresh);

    try {
      await updateStudentProfile({ id, formData }).unwrap();

      await refetch();

      toast.success("Profile updated successfully!");

      setTimeout(() => {
        navigate("/ViewYourProfile");
      }, 500);
    } catch (error: any) {
      console.error("PROFILE UPDATE ERROR:", error);
      console.error("SERVER RESPONSE:", error?.data);

      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Profile">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !user) {
    return (
      <DashboardLayout activeMenu="Profile">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Unable to load profile</CardTitle>
            </CardHeader>

            <CardContent>
              <Button onClick={() => navigate("/Login")}>Go to Login</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="min-h-[calc(100vh-4rem)] bg-muted/40 p-6">
        <div className="mx-auto max-w-2xl">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-center text-2xl">
                Edit Profile
              </CardTitle>
            </CardHeader>

            <CardContent className="px-0">
              <FormProvider {...methods}>
                <form
                  onSubmit={methods.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FileField
                    name="profile"
                    label="Profile"
                    accept="image/*"
                    defaultPreview={
                      user.profile
                        ? `https://localhost:7014/uploads/${user.profile}`
                        : "/default-profile.jpg"
                    }
                  />

                  {/* FULL NAME - read only */}
                  <div className="space-y-2">
                    <Label htmlFor="fullNameDisplay">Full Name</Label>
                    <Input
                      id="fullNameDisplay"
                      type="text"
                      value={user.fullName || ""}
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact an administrator to change your name.
                    </p>
                  </div>

                  {/* EMAIL - read only */}
                  <div className="space-y-2">
                    <Label htmlFor="emailDisplay">Email</Label>
                    <Input
                      id="emailDisplay"
                      type="email"
                      value={user.email || ""}
                      disabled
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact an administrator to change your email.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>

                    <Select
                      value={methods.watch("gender")}
                      onValueChange={(value) =>
                        methods.setValue("gender", value ?? "")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <InputField name="number" label="Phone Number" type="tel" />

                  <InputField name="addresh" label="Address" type="text" />

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={isUpdating}
                    >
                      ← Back
                    </Button>

                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}