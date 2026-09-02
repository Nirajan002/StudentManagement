import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import InputField from "../components/form/InputField";
import FileField from "../components/form/FileField";

import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "../api/api";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditUserForm {
  fullName: string;
  email: string;
  gender: string;
  number: string;
  address: string;
  role: string;
  profile: FileList;
}

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: user,
    isLoading: isLoadingUser,
    isError,
  } = useGetUserQuery(id!, {
    skip: !id,
  });

  const [updateUser, { isLoading: isUpdating }] =
    useUpdateUserMutation();

  const methods = useForm<EditUserForm>({
    defaultValues: {
      fullName: "",
      email: "",
      gender: "",
      number: "",
      address: "",
      role: "",
    },
  });

  const {
    handleSubmit,
    reset,
  } = methods;

  React.useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || "",
        email: user.email || "",
        gender: user.gender || "",
        number: user.number || "",
        address: user.address || "",
        role: user.role || "Student",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: EditUserForm) => {
    if (!id) {
      toast.error("User ID is missing.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("FullName", data.fullName);
      formData.append("Email", data.email);
      formData.append("Gender", data.gender);
      formData.append("Number", data.number);
      formData.append("Address", data.address);
      formData.append("Role", data.role);

      if (data.profile && data.profile.length > 0) {
        formData.append("Profile", data.profile[0]);
      }

      await updateUser({
        id,
        data: formData,
      }).unwrap();

      toast.success("User updated successfully!");

      navigate("/Users");
    } catch (error: any) {
      console.error("Update user error:", error);

      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to update user.");
      }
    }
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          Loading user...
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="text-destructive">
            Failed to load user.
          </p>

          <Button
            className="mt-4"
            onClick={() => navigate("/Users")}
          >
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Edit User
            </CardTitle>
          </CardHeader>

          <CardContent>
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* PROFILE */}
                <FileField
                  name="profile"
                  label="Profile Picture"
                  accept="image/*"
                  defaultPreview={
                    user.profile
                      ? `https://localhost:7014/uploads/${user.profile}`
                      : "/default-profile.jpg"
                  }
                  rules={{
                    validate: {
                      fileType: (files) => {
                        if (!files || files.length === 0) {
                          return true;
                        }

                        const file = files[0];

                        return file.type.startsWith("image/")
                          ? true
                          : "Please select an image file";
                      },
                    },
                  }}
                />

                {/* FULL NAME */}
                <InputField
                  name="fullName"
                  label="Full Name"
                  placeholder="Enter full name"
                  rules={{
                    required: "Full name is required",
                  }}
                />

                {/* EMAIL */}
                <InputField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message:
                        "Enter a valid email address",
                    },
                  }}
                />

                {/* GENDER */}
                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender
                  </Label>

                  <Controller
                    name="gender"
                    control={methods.control}
                    rules={{
                      required: "Gender is required",
                    }}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="Male">
                            Male
                          </SelectItem>

                          <SelectItem value="Female">
                            Female
                          </SelectItem>

                          <SelectItem value="Other">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {methods.formState.errors.gender && (
                    <p className="text-sm text-destructive">
                      {
                        methods.formState.errors.gender
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* PHONE */}
                <InputField
                  name="number"
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter 10 digit phone number"
                  rules={{
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message:
                        "Phone number must be exactly 10 digits",
                    },
                  }}
                />

                {/* ADDRESS */}
                <InputField
                  name="address"
                  label="Address"
                  placeholder="Enter address"
                  rules={{
                    required: "Address is required",
                  }}
                />

                {/* ROLE */}
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role
                  </Label>

                  <Controller
                    name="role"
                    control={methods.control}
                    rules={{
                      required: "Role is required",
                    }}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="Admin">
                            Admin
                          </SelectItem>

                          <SelectItem value="Staff">
                            Staff
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {methods.formState.errors.role && (
                    <p className="text-sm text-destructive">
                      {
                        methods.formState.errors.role
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* BUTTONS */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating
                      ? "Updating..."
                      : "Update User"}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}