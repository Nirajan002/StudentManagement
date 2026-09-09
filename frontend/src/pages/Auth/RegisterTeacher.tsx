import { FormProvider, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Navbar from "@/components/NavBar";
import InputField from "@/components/form/InputField";

import { Button } from "@/components/ui/button";
import { useRegisterTeacherMutation } from "../../api/AuthApi";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
}

export default function RegisterTeacher() {
  const navigate = useNavigate();

  const methods = useForm<RegisterForm>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const [registerUser, { isLoading }] = useRegisterTeacherMutation();

  const onSubmit = async (data: RegisterForm) => {
    methods.clearErrors("email");

    try {
      await registerUser({
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        password: data.password,
      }).unwrap();

      toast.success("Registration successful!");

      navigate("/Teachers");
    } catch (error: any) {
      console.log("Registration error:", error);

      if (error?.status === 409) {
        methods.setError("email", {
          type: "server",
          message: "An account with this email already exists.",
        });
        return;
      }

      toast.error(
        error?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div>
      <Navbar />

      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
        <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Register a Teacher</h1>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Full Name */}
              <InputField
                name="fullName"
                label="Full Name"
                placeholder="Enter your full name"
                rules={{
                  required: "Full name is required",

                  minLength: {
                    value: 5,
                    message: "Full name must be at least 5 characters",
                  },
                }}
              />

              {/* Email */}
              <InputField
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                rules={{
                  required: "Password is required",

                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
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
                        ? "Adding Teacher..."
                        : "Add Teacher"}
                    </Button>
                  </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
