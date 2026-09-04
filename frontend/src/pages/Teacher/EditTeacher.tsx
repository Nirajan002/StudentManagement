import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import InputField from "@/components/form/InputField";
import FileField from "@/components/form/FileField";
import {
  useGetTeacherQuery,
  useUpdateTeacherMutation,
} from "../../api/TeacherApi";

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

import DashboardLayout from "@/components/layouts/DashboardLayout";

interface EditTeacherForm {
  fullName: string;
  email: string;
  gender: string;
  number: string;
  address: string;
  role: string;
  profile: FileList;
}

export default function EditTeacher() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: teacher,
    isLoading: isLoadingTeacher,
    isError,
  } = useGetTeacherQuery(id!, {
    skip: !id,
  });

  const [updateTeacher, { isLoading: isUpdating }] =
    useUpdateTeacherMutation();

  const methods = useForm<EditTeacherForm>({
    defaultValues: {
      fullName: "",
      email: "",
      gender: "",
      number: "",
      address: "",
      role: "",
    },
  });

  const { handleSubmit, reset } = methods;

  React.useEffect(() => {
    if (teacher) {
      reset({
        fullName: teacher.fullName || "",
        email: teacher.email || "",
        gender: teacher.gender || "",
        number: teacher.number || "",
        address: teacher.address || "",
        role: teacher.role || "",
      });
    }
  }, [teacher, reset]);

  if (isLoadingTeacher) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg">Loading teacher...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !teacher) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-lg text-red-500">
            Failed to load teacher.
          </p>

          <Button onClick={() => navigate("/Teachers")}>
            Back to Teachers
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const onSubmit = async (data: EditTeacherForm) => {
    if (!id) {
      toast.error("Teacher ID is missing.");
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

      await updateTeacher({
        id,
        data: formData,
      }).unwrap();

      toast.success("Teacher updated successfully!");

      navigate("/Teachers");
    } catch (error) {
      console.error("Failed to update teacher:", error);
      toast.error("Failed to update teacher.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">
              Edit Teacher
            </CardTitle>
          </CardHeader>

          <CardContent>
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Profile Image */}
                <FileField
                  name="profile"
                  label="Profile Image"
                  accept="image/*"
                  defaultPreview={
                    teacher.profile
                      ? `https://localhost:7014/uploads/${teacher.profile}`
                      : "/default-profile.jpg"
                  }
                />

                {/* Full Name */}
                <InputField
                  name="fullName"
                  label="Full Name"
                  rules={{
                    required: "Full name is required",
                  }}
                />

                {/* Email */}
                <InputField
                  name="email"
                  label="Email"
                  type="email"
                  rules={{
                    required: "Email is required",
                  }}
                />

                {/* Gender */}
                <Controller
                  name="gender"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="gender">
                        Gender
                      </Label>

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
                    </div>
                  )}
                />

                {/* Phone Number */}
                <InputField
                  name="number"
                  label="Phone Number"
                />

                {/* Address */}
                <InputField
                  name="address"
                  label="Address"
                />

                {/* Role */}
                <Controller
                  name="role"
                  control={methods.control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label htmlFor="role">
                        Role
                      </Label>

                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="Teacher">
                            Teacher
                          </SelectItem>

                          <SelectItem value="Admin">
                            Admin
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                />

                {/* Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/Teachers")}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating
                      ? "Updating..."
                      : "Update Teacher"}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}