import type { InputHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface AuthInputProps {
  id: string;
  label: string;
  icon: LucideIcon;
  type?: string;
  error?: string;
  rightElement?: ReactNode;
  labelRightElement?: ReactNode;
  helperText?: string;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
}

/**
 * The labeled, icon-prefixed input used across the auth screens
 * (email, password, verification code...). Keeps the focus ring, error
 * styling, and layout identical wherever it's used.
 */
export default function AuthInput({
  id,
  label,
  icon: Icon,
  type = "text",
  error,
  rightElement,
  labelRightElement,
  helperText,
  inputProps,
}: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium leading-none">
          {label}
        </label>
        {labelRightElement}
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>

        <input
          id={id}
          type={type}
          className={`flex h-10 w-full rounded-lg border bg-background pl-10 text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/20 focus-visible:border-green-500 disabled:cursor-not-allowed disabled:opacity-50 ${
            rightElement ? "pr-11" : "pr-4"
          } ${
            error
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
              : "border-input"
          }`}
          {...inputProps}
        />

        {rightElement}
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {!error && helperText && (
        <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}