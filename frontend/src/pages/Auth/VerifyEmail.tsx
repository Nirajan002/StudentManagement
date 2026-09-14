import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "@/components/NavBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useGetCurrentUserQuery,
  useSendVerificationEmailMutation,
  useChangePendingEmailMutation,
  useConfirmEmailVerificationMutation,
} from "../../api/AuthApi";

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
  const [sentOnce, setSentOnce] = useState(false);

  useEffect(() => {
    if (sentOnce) return;
    sendVerification({})
      .unwrap()
      .then(() => toast.success("Verification code sent to your email."))
      .catch(() => toast.error("Couldn't send verification code."));
    setSentOnce(true);
  }, [sentOnce, sendVerification]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    try {
      const res: any = await sendVerification({}).unwrap();
      toast.success(res?.message || "Code sent.");
      setCooldown(60);
    } catch (err: any) {
      toast.error(err?.data?.message || "Couldn't send code.");
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) return toast.error("Enter a new email address.");
    try {
      const res: any = await changeEmail({
        newEmail: newEmail.trim(),
      }).unwrap();
      toast.success(res?.message || "Code sent to new email.");
      setShowChangeEmail(false);
      setCooldown(60);
    } catch (err: any) {
      toast.error(err?.data?.message || "Couldn't update email.");
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
    } catch (err: any) {
      toast.error(err?.data?.message || "Incorrect code.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
        <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold">Verify your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a 6-digit code to{" "}
              <strong>{user?.email || "your email on file"}</strong>.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? "Verifying..." : "Verify"}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={isSending || cooldown > 0}
                className="text-primary underline disabled:opacity-50 disabled:no-underline"
              >
                {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
              </button>
              <button
                type="button"
                onClick={() => setShowChangeEmail((v) => !v)}
                className="text-muted-foreground underline"
              >
                Not your email?
              </button>
            </div>

            {showChangeEmail && (
              <div className="space-y-2 rounded-md border p-3">
                <Label htmlFor="newEmail">New email address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <Button
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
        </div>
      </div>
    </div>
  );
}
