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
            <h1 className="text-2xl font-bold">Create an Account</h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Register to continue
            </p>
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

              {/* Register Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Register"}
              </Button>
            </form>
          </FormProvider>

          {/* Login */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>

            <Link
              to="/Login"
              className="font-medium underline underline-offset-4"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
