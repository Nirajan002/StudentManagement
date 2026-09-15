import React from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

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

type EditStudentFormData = {
  profile: FileList | null;
  fullName: string;
  email: string;
  gender: string;
  number: string;
  addresh: string;
  studentClass: string;
  section: string;
};

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

  const methods = useForm<EditStudentFormData>({
    defaultValues: {
      profile: null,
      fullName: "",
      email: "",
      gender: "",
      number: "",
      addresh: "",
      studentClass: "",
      section: "",
    },
  });

  const gender = useWatch({
    control: methods.control,
    name: "gender",
  });

  // =========================
  // LOAD STUDENT
  // =========================

  React.useEffect(() => {
    if (!student) return;

    methods.reset({
      profile: null,
      fullName: student.fullName || "",
      email: student.email || "",
      gender: student.gender || "",
      number: student.number || "",
      addresh: student.addresh || "",
      studentClass: student.class || "",
      section: student.section || "",
    });
  }, [student, methods]);

  // =========================
  // SUBMIT
  // =========================

  const onSubmit = async (data: EditStudentFormData) => {
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
    formData.append("Class", data.studentClass || "");
    formData.append("Section", data.section || "");

    // =========================
    // UPDATE
    // =========================

    try {
      await updateStudent({
        id,
        data: formData,
      }).unwrap();

      toast.success("Student updated successfully!");

      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (error: unknown) {
      console.error("UPDATE ERROR:", error);

      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Failed to update student";

      toast.error(message);
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
                  value={gender}
                  onValueChange={(value) => methods.setValue("gender", value ?? "")}
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
                  CLASS & SECTION
              ========================= */}

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  name="studentClass"
                  label="Class"
                  type="text"
                  placeholder="e.g. 10"
                />

                <InputField
                  name="section"
                  label="Section"
                  type="text"
                  placeholder="e.g. A"
                />
              </div>

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