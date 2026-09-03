import { FormProvider, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Navbar from "../components/NavBar";
import InputField from "../components/form/InputField";
import FileField from "../components/form/FileField";

import { Button } from "@/components/ui/button";
import { useRegisterMutation } from "../api/AuthApi";

interface RegisterForm {
  fullName: string;
  email: string;
  password: string;
  profile: FileList | null;
}

export default function Register() {
  const navigate = useNavigate();

  const methods = useForm<RegisterForm>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      profile: null,
    },
  });

  const [registerUser, { isLoading }] = useRegisterMutation();

  const onSubmit = async (data: RegisterForm) => {
    // Clear previous server error on email
    methods.clearErrors("email");

    try {
      const formData = new FormData();

      formData.append("FullName", data.fullName.trim());
      formData.append("Email", data.email.trim());
      formData.append("Password", data.password);

      if (data.profile && data.profile.length > 0) {
        formData.append("Profile", data.profile[0]);
      }

      await registerUser(formData).unwrap();

      toast.success("Registration successful!");

      navigate("/Login");
    } catch (error: any) {
      console.log("Registration error:", error);

      // ================================
      // EMAIL ALREADY EXISTS
      // ================================
      if (error?.status === 409) {
        methods.setError("email", {
          type: "server",
          message: "An account with this email already exists.",
        });

        return;
      }

      // ================================
      // OTHER SERVER ERRORS
      // ================================
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
              {/* Profile */}
              <FileField
                name="profile"
                label="Profile Picture"
                accept="image/*"
              />

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
