import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation, useResetPasswordMutation } from "../../api/AuthApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [forgotPassword, { isLoading: isSending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleSendCode = async () => {
    if (!email.trim()) return toast.error("Enter your email.");
    try {
      const res: any = await forgotPassword({ email: email.trim() }).unwrap();
      toast.success(res?.message || "If that account exists, a code was sent.");
      setStep(2);
    } catch {
      toast.error("Something went wrong. Try again.");
    }
  };

  const handleReset = async () => {
    if (code.trim().length !== 6 || newPassword.length < 6) {
      return toast.error("Enter the 6-digit code and a password of at least 6 characters.");
    }
    try {
      await resetPassword({ email: email.trim(), code: code.trim(), newPassword }).unwrap();
      toast.success("Password reset! You can now log in.");
      navigate("/Login");
    } catch (err: any) {
      toast.error(err?.data?.message || "Couldn't reset password.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {step === 1
                ? "Enter your email and we'll send a reset code, if your email has been verified."
                : "Enter the code we sent and choose a new password."}
            </p>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <Button className="w-full" onClick={handleSendCode} disabled={isSending}>
                {isSending ? "Sending..." : "Send reset code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Reset code</Label>
                <Input id="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="123456" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
              </div>
              <Button className="w-full" onClick={handleReset} disabled={isResetting}>
                {isResetting ? "Resetting..." : "Reset password"}
              </Button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-muted-foreground underline">
                Use a different email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}