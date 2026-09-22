import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { useForgotPasswordMutation, useResetPasswordMutation } from "../../api/AuthApi";

type ApiError = {
  data?: {
    message?: string;
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "data" in error) {
    const message = (error as ApiError).data?.message;
    if (message) return message;
  }
  return fallback;
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleSendCode = async () => {
    if (!email.trim()) {
      toast.error("Enter your email.");
      return;
    }

    try {
      const res = await forgotPassword({ email: email.trim() }).unwrap();
      toast.success(res?.message || "If that account exists, a code was sent.");
      setStep(2);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Something went wrong. Try again."));
    }
  };

  const handleReset = async () => {
    if (code.trim().length !== 6 || newPassword.length < 6) {
      toast.error("Enter the 6-digit code and a password of at least 6 characters.");
      return;
    }

    try {
      await resetPassword({ email: email.trim(), code: code.trim(), newPassword }).unwrap();
      toast.success("Password reset! You can now log in.");
      navigate("/Login");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't reset password."));
    }
  };

  return (
    <AuthLayout
      heroBadgeText="Account Recovery"
      heroTitle="Get back into your account, securely."
      heroDescription="We'll email you a one-time code to confirm it's really you before letting you set a new password."
      heroFeatures={[
        "6-digit codes expire automatically for your safety",
        "Only verified accounts can request a reset",
        "Your new password takes effect immediately",
      ]}
    >
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          <span>Password Reset</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Reset your password
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === 1
            ? "Enter your email and we'll send a reset code, if your account has been verified."
            : (
              <>
                We sent a code to{" "}
                <span className="font-medium text-foreground">{email}</span>. Enter it below with your new password.
              </>
            )}
        </p>
      </div>

      {/* Step 1 — request code */}
      {step === 1 && (
        <div className="space-y-4">
          <AuthInput
            id="email"
            label="Email Address"
            icon={Mail}
            type="email"
            inputProps={{
              placeholder: "name@institution.edu",
              autoComplete: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
            }}
          />

          <Button
            type="button"
            onClick={handleSendCode}
            disabled={isSending}
            className="group relative flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 font-medium text-white shadow-sm transition-all hover:bg-green-500 disabled:opacity-70 dark:bg-green-600 dark:hover:bg-green-500"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Sending code...</span>
              </>
            ) : (
              <>
                <span>Send reset code</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Step 2 — enter code + new password */}
      {step === 2 && (
        <div className="space-y-4">
          <AuthInput
            id="code"
            label="Reset Code"
            icon={KeyRound}
            inputProps={{
              inputMode: "numeric",
              maxLength: 6,
              placeholder: "123456",
              autoComplete: "one-time-code",
              value: code,
              onChange: (e) => setCode(e.target.value.replace(/\D/g, "")),
            }}
          />

          <AuthInput
            id="newPassword"
            label="New Password"
            icon={Lock}
            type={showPassword ? "text" : "password"}
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
              placeholder: "At least 6 characters",
              autoComplete: "new-password",
              value: newPassword,
              onChange: (e) => setNewPassword(e.target.value),
            }}
          />

          <Button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="group relative flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 font-medium text-white shadow-sm transition-all hover:bg-green-500 disabled:opacity-70 dark:bg-green-600 dark:hover:bg-green-500"
          >
            {isResetting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <span>Reset password</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-center text-xs font-medium text-muted-foreground underline-offset-2 hover:underline hover:text-foreground"
          >
            Use a different email
          </button>
        </div>
      )}
    </AuthLayout>
  );
}