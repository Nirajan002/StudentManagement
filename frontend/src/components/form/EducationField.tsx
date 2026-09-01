import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Education() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="space-y-4">
      {/* TITLE */}

      <Label className="text-base font-semibold">
        Education
      </Label>

      {/* EDUCATION LIST */}

      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader>
            <CardTitle className="text-base">
              Education {index + 1}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {/* INSTITUTION */}

            <div className="space-y-2">
              <Label htmlFor={`institution-${index}`}>
                Institution
              </Label>

              <Input
                id={`institution-${index}`}
                type="text"
                placeholder="Enter institution"
                {...register(
                  `education.${index}.institution`,
                  {
                    required: "Institution is required",
                  }
                )}
              />

              {errors.education?.[index]?.institution && (
                <p className="text-sm text-destructive">
                  {
                    errors.education[index].institution
                      ?.message as string
                  }
                </p>
              )}
            </div>

            {/* DEGREE */}

            <div className="space-y-2">
              <Label htmlFor={`degree-${index}`}>
                Degree
              </Label>

              <Input
                id={`degree-${index}`}
                type="text"
                placeholder="Enter degree"
                {...register(
                  `education.${index}.degree`,
                  {
                    required: "Degree is required",
                  }
                )}
              />

              {errors.education?.[index]?.degree && (
                <p className="text-sm text-destructive">
                  {
                    errors.education[index].degree
                      ?.message as string
                  }
                </p>
              )}
            </div>

            {/* DATE */}

            <div className="space-y-2">
              <Label htmlFor={`date-${index}`}>
                Date
              </Label>

              <Input
                id={`date-${index}`}
                type="date"
                {...register(
                  `education.${index}.date`,
                  {
                    required: "Date is required",
                  }
                )}
              />

              {errors.education?.[index]?.date && (
                <p className="text-sm text-destructive">
                  {
                    errors.education[index].date
                      ?.message as string
                  }
                </p>
              )}
            </div>

            {/* REMOVE */}

            <Button
              type="button"
              variant="destructive"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </CardContent>
        </Card>
      ))}

      {/* ADD EDUCATION */}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          append({
            institution: "",
            degree: "",
            date: "",
          })
        }
      >
        + Add Education
      </Button>
    </div>
  );
}
