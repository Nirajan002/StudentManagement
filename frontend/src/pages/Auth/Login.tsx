import { FormProvider, useForm } from "react-hook-form";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import Navbar from "@/components/NavBar";

import InputField from "@/components/form/InputField";

import { Button } from "@/components/ui/button";

import { useLoginMutation } from "../../api/AuthApi";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();

  const methods = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [loginUser, { isLoading }] = useLoginMutation();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginUser(data).unwrap();

      console.log("Login response:", response);

      // =========================
      // GET USER
      // =========================

      const user = response.user;

      console.log("Full Name:", user.fullName);
      console.log("Role:", user.role);

      // =========================
      // SAVE LOGIN INFORMATION
      // =========================

      localStorage.setItem("fullName", user.fullName);
      localStorage.setItem("role", user.role);

      toast.success("Login successful!");

      // =========================
      // REDIRECT BASED ON ROLE
      // =========================

      const role = user.role?.toLowerCase();

      if (role === "admin") {
        console.log("Redirecting to AdminView");
        navigate("/AdminIndex");
      } 
      
      else if (role === "teacher") {
        console.log("Redirecting to TeacherView");
        navigate("/TeacherIndex");
      } 
      
      else if (role === "student") {
        console.log("Redirecting to StudentView");
        navigate("/StudentIndex");
      } 
      
      else {
        console.log("Unknown role:", user.role);

        toast.error("Invalid user role.");
      }

    } catch (error: any) {
      console.error("Login error:", error);

      toast.error(
        error?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <div>
      <Navbar />

      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">

          {/* =========================
              HEADER
          ========================= */}

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Login to your account
            </p>
          </div>

          {/* =========================
              LOGIN FORM
          ========================= */}

          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="space-y-5"
            >

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

              <InputField
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                rules={{
                  required: "Password is required",
                }}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

            </form>
          </FormProvider>

        </div>
      </div>
    </div>
  );
}