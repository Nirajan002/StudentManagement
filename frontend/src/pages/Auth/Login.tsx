import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import type { UnknownAction } from "redux";
import type { ThunkDispatch } from "redux-thunk";
import toast from "react-hot-toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Users,
  BookOpen,
} from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { AuthApi, useLoginMutation } from "../../api/AuthApi";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch<ThunkDispatch<unknown, unknown, UnknownAction>>();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() =>
    Boolean(localStorage.getItem("studentgrid_remembered_email"))
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      email: localStorage.getItem("studentgrid_remembered_email") ?? "",
      password: "",
    },
  });

  const [loginUser, { isLoading }] = useLoginMutation();

  const onSubmit = async (data: LoginForm) => {
    try {
      if (rememberMe) {
        localStorage.setItem("studentgrid_remembered_email", data.email.trim());
      } else {
        localStorage.removeItem("studentgrid_remembered_email");
      }

      const response = await loginUser(data).unwrap();
      const user = response.user;

      try {
        await dispatch(
          AuthApi.endpoints.getCurrentUser.initiate(undefined, {
            forceRefetch: true,
          })
        ).unwrap();
      } catch (refetchError) {
        console.error("Failed to refresh current user:", refetchError);
      }

      if (!user.emailVerified) {
        toast("Please verify your email to continue.");
        navigate("/VerifyEmail");
        return;
      }

      toast.success(`Welcome back, ${user.fullName || "User"}!`);

      const role = user.role?.toLowerCase();
      if (role === "admin") {
        navigate("/AdminIndex");
      } else if (role === "teacher") {
        navigate("/TeacherIndex");
      } else if (role === "student") {
        navigate("/StudentIndex");
      } else {
        toast.error("Invalid user role detected.");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);

      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Invalid email or password. Please try again.";

      toast.error(message);
    }
  };

  return (
    <AuthLayout>
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          <span>Admin • Faculty • Student Portal</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your verified institutional credentials to continue.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AuthInput
          id="email"
          label="Email Address"
          icon={Mail}
          type="email"
          error={errors.email?.message}
          inputProps={{
            placeholder: "name@institution.edu",
            autoComplete: "email",
            ...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            }),
          }}
        />

        <AuthInput
          id="password"
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          error={errors.password?.message}
          labelRightElement={
            <Link
              to="/ForgotPassword"
              className="text-xs font-medium text-green-600 hover:text-green-500 hover:underline dark:text-green-400"
            >
              Forgot password?
            </Link>
          }
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          inputProps={{
            placeholder: "••••••••••••",
            autoComplete: "current-password",
            ...register("password", { required: "Password is required" }),
          }}
        />

        {/* Remember Me Checkbox */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-input text-green-600 accent-green-600 focus:ring-green-500"
          />
          <label
            htmlFor="remember"
            className="cursor-pointer select-none text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Remember my email on this device
          </label>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isLoading}
            className="group relative flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 font-medium text-white shadow-sm transition-all hover:bg-green-500 disabled:opacity-70 dark:bg-green-600 dark:hover:bg-green-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign in to Dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-8 rounded-lg border border-border/60 bg-muted/40 p-3.5 text-xs text-muted-foreground">
        <div className="flex items-start gap-2.5">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
          <p>
            First time logging in? Ensure your account has been registered by
            your administrator or institution coordinator.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}