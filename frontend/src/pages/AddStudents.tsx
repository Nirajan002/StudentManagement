import React from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import InputField from "../components/form/InputField";
import FileField from "../components/form/FileField";
import Education from "../components/form/EducationField";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAddStudentMutation } from "../api/api";

interface EducationItem {
  institution: string;
  degree: string;
  date: string;
}

interface AddStudentForm {
  fullName: string;
  email: string;
  gender: string;
  number: string;
  address: string;
  profile: FileList;
  education: EducationItem[];
}

export default function AddStudents() {
  const navigate = useNavigate();

  const [addStudent, { isLoading }] = useAddStudentMutation();

  const methods = useForm<AddStudentForm>({
    defaultValues: {
      fullName: "",
      email: "",
      gender: "",
      number: "",
      address: "",
      education: [
        {
          institution: "",
          degree: "",
          date: "",
        },
      ],
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = async (data: AddStudentForm) => {
    try {
      const formData = new FormData();

      formData.append("FullName", data.fullName);
      formData.append("Email", data.email);
      formData.append("Gender", data.gender);
      formData.append("Number", data.number);

      // Backend property is misspelled as Addresh
      formData.append("Addresh", data.address);

      // Profile image
      if (data.profile && data.profile.length > 0) {
        formData.append("Profile", data.profile[0]);
      }

      // Education
      formData.append("Education", JSON.stringify(data.education));

      await addStudent(formData).unwrap();

      toast.success("Student added successfully!");

      reset();

      navigate("/students");
    } catch (error: any) {
      console.error("Add student error:", error);

      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Failed to add student.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add Student</CardTitle>
          </CardHeader>

          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile */}
                <FileField
                  name="profile"
                  label="Profile Picture"
                  accept="image/*"
                  rules={{
                    validate: {
                      fileType: (files) => {
                        if (!files || files.length === 0) {
                          return true;
                        }

                        const file = files[0];

                        return file.type.startsWith("image/")
                          ? true
                          : "Please select an image file";
                      },
                    },
                  }}
                />

                {/* Full Name */}
                <InputField
                  name="fullName"
                  label="Full Name"
                  placeholder="Enter full name"
                  rules={{
                    required: "Full name is required",
                  }}
                />

                {/* Email */}
                <InputField
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  }}
                />

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>

                  <Controller
                    name="gender"
                    control={methods.control}
                    rules={{
                      required: "Gender is required",
                    }}
                    render={({ field }) => (
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {methods.formState.errors.gender && (
                    <p className="text-sm text-destructive">
                      {methods.formState.errors.gender.message}
                    </p>
                  )}
                </div>
                {/* Phone */}
                <InputField
                  name="number"
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter 10 digit phone number"
                  rules={{
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Phone number must be exactly 10 digits",
                    },
                  }}
                />

                {/* Address */}
                <InputField
                  name="address"
                  label="Address"
                  placeholder="Enter address"
                  rules={{
                    required: "Address is required",
                  }}
                />

                {/* Education */}
                <Education />

                {/* Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Adding Student..." : "Add Student"}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
