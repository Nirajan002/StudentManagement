import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
} from "../api/api";

import Navbar from "../components/NavBar";
import InputField from "../components/form/InputField";
import FileField from "../components/form/FileField";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileForm {
  profile: FileList | null;
  fullName: string;
  email: string;
  gender: string;
  number: string;
  address: string;
}

export default function UpdateUserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // =========================================================
  // GET CURRENT USER
  // =========================================================

  const { data: user, isLoading, isError } = useGetCurrentUserQuery();

  // =========================================================
  // UPDATE USER
  // =========================================================

  const [updateUserProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();

  // =========================================================
  // FORM
  // =========================================================

  const methods = useForm<ProfileForm>({
    defaultValues: {
      profile: null,
      fullName: "",
      email: "",
      gender: "",
      number: "",
      address: "",
    },
  });

  // =========================================================
  // LOAD USER DATA INTO FORM
  // =========================================================

  React.useEffect(() => {
    if (!user) return;

    methods.reset({
      profile: null,
      fullName: user.fullName || "",
      email: user.email || "",
      gender: user.gender || "",
      number: user.number || "",
      address: user.address || "",
    });
  }, [user, methods]);

  // =========================================================
  // CHECK ID
  // =========================================================

  React.useEffect(() => {
    if (!id) {
      toast.error("User ID is missing");
      navigate("/ViewYourProfile");
    }
  }, [id, navigate]);

  // =========================================================
  // SUBMIT
  // =========================================================

  const onSubmit = async (data: ProfileForm) => {
    if (!id) {
      toast.error("User ID is missing");
      return;
    }

    const formData = new FormData();

    // =======================================================
    // PROFILE IMAGE
    // =======================================================

    if (data.profile?.[0]) {
      formData.append("Profile", data.profile[0]);
    }

    // =======================================================
    // OTHER FIELDS
    // =======================================================

    formData.append("FullName", data.fullName);
    formData.append("Email", data.email);
    formData.append("Gender", data.gender);
    formData.append("Number", data.number);
    formData.append("Address", data.address);

    // =======================================================
    // DEBUG
    // =======================================================

    console.log("Updating user:", id);

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // =======================================================
    // UPDATE
    // =======================================================

    try {
      await updateUserProfile({
        id,
        formData,
      }).unwrap();

      toast.success("Profile updated successfully!");

      // Wait a little so the toast can be seen
      setTimeout(() => {
        navigate("/ViewYourProfile");
      }, 500);
    } catch (error: any) {
      console.error("PROFILE UPDATE ERROR:", error);
      console.error("SERVER RESPONSE:", error?.data);

      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return (
      <div>
        <Navbar />

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (isError || !user) {
    return (
      <div>
        <Navbar />

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
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div>
      <Navbar />

      <div className="min-h-[calc(100vh-4rem)] bg-muted/40 p-6">
        <div className="mx-auto max-w-2xl">
          <Card className="p-6">
            {/* =================================================
                HEADER
            ================================================= */}

            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-center text-2xl">
                Edit Profile
              </CardTitle>
            </CardHeader>

            {/* =================================================
                FORM
            ================================================= */}

            <CardContent className="px-0">
              <FormProvider {...methods}>
                <form
                  onSubmit={methods.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* =================================================
                      PROFILE
                  ================================================= */}

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

                  {/* =================================================
                      FULL NAME
                  ================================================= */}

                  <InputField name="fullName" label="Full Name" type="text" />

                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <InputField name="email" label="Email" type="email" />

                  {/* =================================================
                      GENDER
                  ================================================= */}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>

                    <Select
                      value={methods.watch("gender")}
                      onValueChange={(value) =>
                        methods.setValue("gender", value)
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

                  {/* =================================================
                      PHONE NUMBER
                  ================================================= */}

                  <InputField name="number" label="Phone Number" type="tel" />

                  {/* =================================================
                      ADDRESS
                  ================================================= */}

                  <InputField name="address" label="Address" type="text" />

                  {/* =================================================
                      BUTTONS
                  ================================================= */}

                  <div className="flex justify-between pt-4">
                    {/* BACK */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      disabled={isUpdating}
                    >
                      ← Back
                    </Button>

                    {/* UPDATE */}
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
    </div>
  );
}
