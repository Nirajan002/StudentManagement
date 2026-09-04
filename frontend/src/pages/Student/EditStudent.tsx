import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import EducationField from "@/components/form/EducationField";
import InputField from "@/components/form/InputField";
import FileField from "@/components/form/FileField";

import {
  useGetStudentQuery,
  useUpdateStudentMutation,
} from "../../api/StudentApi";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  // =========================
  // GET STUDENT
  // =========================

  const {
    data: student,
    isLoading,
    isError,
  } = useGetStudentQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
  });

  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  // =========================
  // FORM
  // =========================

  const methods = useForm({
    defaultValues: {
      profile: null,
      fullName: "",
      email: "",
      gender: "",
      number: "",
      addresh: "",
      education: [],
    },
  });

  // =========================
  // LOAD STUDENT
  // =========================

  React.useEffect(() => {
    if (!student) return;

    let education: any[] = [];

    try {
      if (Array.isArray(student.education)) {
        // Education is already an array
        education = student.education;
      } else if (typeof student.education === "string") {
        try {
          // Try to parse JSON
          const parsed = JSON.parse(student.education);

          if (Array.isArray(parsed)) {
            education = parsed;
          } else {
            education = [
              {
                level: student.education,
              },
            ];
          }
        } catch {
          // Education is a normal string such as "Master"
          education = [
            {
              level: student.education,
            },
          ];
        }
      }
    } catch (error) {
      console.error("Education error:", error);
      education = [];
    }

    methods.reset({
      profile: null,
      fullName: student.fullName || "",
      email: student.email || "",
      gender: student.gender || "",
      number: student.number || "",
      addresh: student.addresh || "",
      education: education,
    });
  }, [student, methods]);

  // =========================
  // SUBMIT
  // =========================

  const onSubmit = async (data: any) => {
    if (!id) {
      toast.error("Student ID is missing");
      return;
    }

    const formData = new FormData();

    // =========================
    // PROFILE
    // =========================

    if (data.profile?.[0]) {
      formData.append("Profile", data.profile[0]);
    }

    // =========================
    // OTHER FIELDS
    // =========================

    formData.append("FullName", data.fullName);
    formData.append("Email", data.email);
    formData.append("Gender", data.gender);
    formData.append("Number", data.number);
    formData.append("Addresh", data.addresh);

    // =========================
    // EDUCATION
    // =========================

    formData.append("Education", JSON.stringify(data.education || []));

    // =========================
    // DEBUG
    // =========================

    console.log("Updating student:", id);

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // =========================
    // UPDATE
    // =========================

    try {
      await updateStudent({
        id,
        data: formData,
      }).unwrap();

      toast.success("Student updated successfully!");

      // Go back to the previous page
      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (error: any) {
      console.error("UPDATE ERROR:", error);

      toast.error(error?.data?.message || "Failed to update student");
    }
  };

  // =========================
  // LOADING
  // =========================

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Students">
        <div className="flex min-h-screen items-center justify-center">
          <h2>Loading...</h2>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (isError || !student) {
    return (
      <DashboardLayout activeMenu="Students">
        <div className="flex min-h-screen items-center justify-center">
          <h2>Failed to load student</h2>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <DashboardLayout activeMenu="Students">
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
        <Card className="w-full max-w-2xl p-6">
          <h2 className="mb-6 text-center text-2xl font-bold">Edit Student</h2>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* =========================
                  PROFILE
              ========================= */}

              <FileField
                name="profile"
                label="Profile"
                accept="image/*"
                defaultPreview={
                  student.profile
                    ? `https://localhost:7014/uploads/${student.profile}`
                    : "/default-profile.jpg"
                }
              />

              {/* =========================
                  FULL NAME
              ========================= */}

              <InputField name="fullName" label="Full Name" type="text" />

              {/* =========================
                  EMAIL
              ========================= */}

              <InputField name="email" label="Email" type="email" />

              {/* =========================
                  GENDER
              ========================= */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>

                <Select
                  value={methods.watch("gender")}
                  onValueChange={(value) => methods.setValue("gender", value)}
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

              {/* =========================
                  PHONE
              ========================= */}

              <InputField name="number" label="Phone Number" type="tel" />

              {/* =========================
                  ADDRESS
              ========================= */}

              <InputField name="addresh" label="Address" type="text" />

              {/* =========================
                  EDUCATION
              ========================= */}

              <EducationField />

              {/* =========================
                  BUTTONS
              ========================= */}

              <div className="flex justify-end gap-3">
                {/* CANCEL */}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>

                {/* UPDATE */}

                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Student"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </DashboardLayout>
  );
}
