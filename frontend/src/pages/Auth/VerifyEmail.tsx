import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound, Mail, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import { Button } from "@/components/ui/button";
import {
  useGetCurrentUserQuery,
  useSendVerificationEmailMutation,
  useChangePendingEmailMutation,
  useConfirmEmailVerificationMutation,
} from "../../api/AuthApi";

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

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();

  const [sendVerification, { isLoading: isSending }] =
    useSendVerificationEmailMutation();
  const [changeEmail, { isLoading: isChanging }] =
    useChangePendingEmailMutation();
  const [confirmCode, { isLoading: isConfirming }] =
    useConfirmEmailVerificationMutation();

  const [code, setCode] = useState("");
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const sentOnce = useRef(false);

  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    sendVerification({})
      .unwrap()
      .then(() => toast.success("Verification code sent to your email."))
      .catch(() => toast.error("Couldn't send verification code."));
  }, [sendVerification]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    try {
      const res = await sendVerification({}).unwrap();
      toast.success(res?.message || "Code sent.");
      setCooldown(60);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't send code."));
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return toast.error("Enter a new email address.");
    try {
      const res = await changeEmail({ newEmail: newEmail.trim() }).unwrap();
      toast.success(res?.message || "Code sent to new email.");
      setShowChangeEmail(false);
      setCooldown(60);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't update email."));
    }
  };

  const handleConfirm = async () => {
    if (code.trim().length !== 6) return toast.error("Enter the 6-digit code.");
    try {
      await confirmCode({ code: code.trim() }).unwrap();
      toast.success("Email verified!");
      const role = localStorage.getItem("role")?.toLowerCase();
      if (role === "admin") navigate("/AdminIndex");
      else if (role === "teacher") navigate("/TeacherIndex");
      else navigate("/StudentIndex");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Incorrect code."));
    }
  };

  return (
    <AuthLayout
      heroBadgeText="Secure Verification"
      heroTitle="One more step to secure your account."
      heroDescription="We use email verification to keep every StudentGrid account — admin, teacher, and student — protected from unauthorized access."
      heroFeatures={[
        "6-digit codes expire automatically for your safety",
        "Change your email right from this screen if needed",
        "Verified accounts unlock your full dashboard",
      ]}
    >
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          <span>Email Verification</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">
            {user?.email || "your email on file"}
          </span>
          .
        </p>
      </div>

      {/* Code form */}
      <div className="space-y-4">
        <AuthInput
          id="code"
          label="Verification Code"
          icon={KeyRound}
          error={undefined}
          inputProps={{
            inputMode: "numeric",
            maxLength: 6,
            placeholder: "123456",
            autoComplete: "one-time-code",
            value: code,
            onChange: (e) => setCode(e.target.value.replace(/\D/g, "")),
          }}
        />

        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirming}
          className="group relative flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 font-medium text-white shadow-sm transition-all hover:bg-green-500 disabled:opacity-70 dark:bg-green-600 dark:hover:bg-green-500"
        >
          {isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify email</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </Button>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleResend}
            disabled={isSending || cooldown > 0}
            className="font-medium text-green-600 underline-offset-2 hover:underline disabled:opacity-50 disabled:no-underline dark:text-green-400"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>

          <button
            type="button"
            onClick={() => setShowChangeEmail((v) => !v)}
            className="font-medium text-muted-foreground underline-offset-2 hover:underline hover:text-foreground"
          >
            Not your email?
          </button>
        </div>

        {showChangeEmail && (
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/40 p-3.5">
            <AuthInput
              id="newEmail"
              label="New email address"
              icon={Mail}
              type="email"
              inputProps={{
                placeholder: "you@example.com",
                value: newEmail,
                onChange: (e) => setNewEmail(e.target.value),
              }}
            />

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleChangeEmail}
              disabled={isChanging}
            >
              {isChanging ? "Updating..." : "Send code to this email"}
            </Button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}