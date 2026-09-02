import React, { useEffect, useState } from "react";
import { useFormContext, type RegisterOptions } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface FileFieldProps {
  name: string;
  label: string;
  accept?: string;
  defaultPreview?: string;
  rules?: RegisterOptions;
}

export default function FileField({
  name,
  label,
  accept,
  defaultPreview,
  rules,
}: FileFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const [preview, setPreview] = useState<string | null>(
    defaultPreview || "/default-profile.jpg",
  );

  useEffect(() => {
    if (defaultPreview) {
      setPreview(defaultPreview);
    }
  }, [defaultPreview]);

  const { ref, onChange, ...rest } = register(name, rules);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    onChange(event);

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    } else {
      setPreview(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <Label className="block text-center">{label}</Label>

      {/* Profile Preview */}
      <div className="flex justify-center">
        {preview ? (
          <img
            src={preview}
            alt="Profile preview"
            className="h-24 w-24 rounded-full border object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border bg-muted text-sm text-muted-foreground">
            Profile
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        id={name}
        type="file"
        accept={accept}
        ref={ref}
        onChange={handleChange}
        {...rest}
        className="hidden"
      />

      {/* Choose / Change Button */}
      <div className="flex justify-center">
        <Button type="button" variant="outline">
          <label htmlFor={name} className="cursor-pointer">
            {preview ? "Change Profile" : "Choose Profile"}
          </label>
        </Button>
      </div>

      {/* Validation Error */}
      {errors[name] && (
        <p className="text-center text-sm text-destructive">
          {typeof errors[name]?.message === "string"
            ? errors[name]?.message
            : "Invalid file"}
        </p>
      )}
    </div>
  );
}
