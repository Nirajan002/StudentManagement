import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
}

export default function AddStudents() {
  const navigate = useNavigate();

  const [addStudent, { isLoading }] = useAddStudentMutation();

  const methods = useForm<AddStudentForm>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: AddStudentForm) => {
    try {
      await addStudent({
        FullName: data.fullName.trim(),
        Email: data.email.trim(),
        Password: data.password,
      }).unwrap();

      toast.success("Student added successfully!");

      reset();

      navigate(-1);
    } catch (error: any) {
      console.error("Add student error:", error);

      if (error?.status === 409) {
        toast.error(
          error?.data?.message ||
            "A student with this email already exists."
        );
        return;
      }

      toast.error(
        error?.data?.message || "Failed to add student."
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

                  {/* Password */}
                  <InputField
                    name="password"
                    label="Password"
                    type="password"
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