import React from "react";
import { useFormContext, type RegisterOptions } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  rules?: RegisterOptions;
}

export default function InputField({
  name,
  label,
  type = "text",
  placeholder,
  rules,
}: InputFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, rules)}
      />

      {error && (
        <p className="text-sm text-destructive">
          {typeof error.message === "string" ? error.message : "Invalid value"}
        </p>
      )}
    </div>
  );
}
