import type { ElementType } from "react";
import { Controller, useFormContext, type RegisterOptions } from "react-hook-form";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectFieldOption[];
  placeholder?: string;
  icon?: ElementType;
  rules?: RegisterOptions;
}

export default function SelectField({
  name,
  label,
  options,
  placeholder = "Select...",
  icon: Icon,
  rules,
}: SelectFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor={name} className="flex items-center gap-1.5">
            {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
            {label}
          </Label>

          <Select value={field.value || ""} onValueChange={field.onChange}>
            <SelectTrigger id={name} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <p className="text-xs text-destructive">
              {typeof error.message === "string" ? error.message : "Invalid value"}
            </p>
          )}
        </div>
      )}
    />
  );
}