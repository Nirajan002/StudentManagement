import type { ElementType } from "react";
import { useFormContext, type RegisterOptions } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  icon?: ElementType;
  rules?: RegisterOptions;
}

export default function InputField({
  name,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  rules,
}: InputFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {label}
      </Label>

      <Input id={name} type={type} placeholder={placeholder} {...register(name, rules)} />

      {error && (
        <p className="text-xs text-destructive">
          {typeof error.message === "string" ? error.message : "Invalid value"}
        </p>
      )}
    </div>
  );
}