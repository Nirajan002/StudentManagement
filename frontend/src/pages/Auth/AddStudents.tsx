import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GraduationCap, BookOpen, Hash } from "lucide-react";

import InputField from "@/components/form/InputField";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAddStudentMutation } from "../../api/AuthApi";
import DashboardLayout from "@/components/layouts/DashboardLayout";

interface AddStudentForm {
  fullName: string;
  email: string;
  password: string;
  studentClass: string;
  section: string;
  rollNumber: string;
}

export default function AddStudents() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [addStudent, { isLoading }] = useAddStudentMutation();

  const methods = useForm<AddStudentForm>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      studentClass: "",
      section: "",
      rollNumber: "",
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: AddStudentForm) => {
    try {
      await addStudent({
        FullName: data.fullName.trim(),
        Email: data.email.trim(),
        Password: data.password,
        Class: data.studentClass.trim(),
        Section: data.section.trim().toUpperCase(),
        RollNumber: Number(data.rollNumber),
      }).unwrap();

      toast.success("Student added successfully!");

      reset();

      navigate(-1);
    } catch (error: unknown) {
      console.error("Add student error:", error);

      const apiError = error as {
        status?: number;
        data?: { message?: string };
      };

      // 409 covers both "email already exists" and "roll number already taken";
      // 400 covers missing or invalid class / section / roll number.
      // The server sends a readable message for each.
      if (apiError.status === 409) {
        toast.error(
          apiError.data?.message ||
            "A student with this email already exists."
        );
        return;
      }

      toast.error(
        apiError.data?.message || "Failed to add student."
      );
    }
  };

  return (
    <DashboardLayout activeMenu="Students">
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Add Student
              </CardTitle>
            </CardHeader>

            <CardContent>
              <FormProvider {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Full Name */}
                  <InputField
                    name="fullName"
                    label="Full Name"
                    placeholder="Enter full name"
                    rules={{
                      required: "Full name is required",
                      minLength: {
                        value: 5,
                        message:
                          "Full name must be at least 5 characters",
                      },
                    }}
                  />

                  {/* Email */}
                  <InputField
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="Enter email"
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    }}
                  />

                  {/* Class / Section / Roll number */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InputField
                      name="studentClass"
                      label="Class"
                      icon={GraduationCap}
                      placeholder="e.g. 10"
                      rules={{
                        required: "Class is required",
                        maxLength: {
                          value: 20,
                          message: "Class is too long",
                        },
                      }}
                    />

                    <InputField
                      name="section"
                      label="Section"
                      icon={BookOpen}
                      placeholder="e.g. C"
                      rules={{
                        required: "Section is required",
                        maxLength: {
                          value: 10,
                          message: "Section is too long",
                        },
                      }}
                    />

                    <InputField
                      name="rollNumber"
                      label="Roll number"
                      type="number"
                      icon={Hash}
                      placeholder="e.g. 23"
                      rules={{
                        required: "Roll number is required",
                        pattern: {
                          value: /^\d+$/,
                          message: "Use whole numbers only",
                        },
                        min: {
                          value: 1,
                          message: "Roll number must be at least 1",
                        },
                        max: {
                          value: 9999,
                          message: "Roll number must be 9999 or less",
                        },
                      }}
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <InputField
                      name="password"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      rules={{
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message:
                            "Password must be at least 6 characters",
                        },
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>

                  {/* Buttons */}
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
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Adding Student..."
                        : "Add Student"}
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