import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Hash,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { useGetStudentQuery, useUpdateStudentMutation } from "../../api/StudentApi";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ProfilePhotoUploadCard, ProfileEditTopBar } from "@/components/profile";
import { getUploadUrl } from "@/lib/config";

type EditStudentFormData = {
  fullName: string;
  email: string;
  gender: string;
  number: string;
  addresh: string;
  studentClass: string;
  section: string;
  rollNumber: string;
};

export default function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    data: student,
    isLoading,
    isError,
  } = useGetStudentQuery(id, { skip: !id, refetchOnMountOrArgChange: true });

  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const methods = useForm<EditStudentFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      gender: "",
      number: "",
      addresh: "",
      studentClass: "",
      section: "",
      rollNumber: "",
    },
  });
  const { handleSubmit, reset, formState: { isDirty } } = methods;

  useEffect(() => {
    if (!student) return;
    reset({
      fullName: student.fullName || "",
      email: student.email || "",
      gender: student.gender || "",
      number: student.number || "",
      addresh: student.addresh || "",
      studentClass: student.class || "",
      section: student.section || "",
      rollNumber:
        student.rollNumber !== null && student.rollNumber !== undefined
          ? String(student.rollNumber)
          : "",
    });
  }, [student, reset]);

  const handleDiscard = () => {
    reset();
    setProfileFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = async (data: EditStudentFormData) => {
    if (!id) return toast.error("Student ID is missing");

    const formData = new FormData();
    if (profileFile) formData.append("Profile", profileFile);
    formData.append("FullName", data.fullName);
    formData.append("Email", data.email);
    formData.append("Gender", data.gender);
    formData.append("Number", data.number);
    formData.append("Addresh", data.addresh);
    formData.append("Class", data.studentClass.trim());
    formData.append("Section", data.section.trim().toUpperCase());
    if (data.rollNumber.trim()) {
      formData.append("RollNumber", data.rollNumber.trim());
    }

    try {
      await updateStudent({ id, data: formData }).unwrap();
      toast.success("Student updated successfully!");
      setTimeout(() => navigate(-1), 500);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Failed to update student";

      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Students">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !student) {
    return (
      <DashboardLayout activeMenu="Students">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <h2>Failed to load student</h2>
        </div>
      </DashboardLayout>
    );
  }

  const dirty = isDirty || !!profileFile;

  return (
    <DashboardLayout activeMenu="Students">
      <div className="min-h-[calc(100vh-4rem)] bg-muted/20 pb-12">
        <ProfileEditTopBar
          onBack={() => navigate(-1)}
          onDiscard={handleDiscard}
          onSave={handleSubmit(onSubmit)}
          isSaving={isUpdating}
          canDiscard={dirty}
          saveLabel="Update Student"
        />

        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Edit Student</h1>
            <p className="text-sm text-muted-foreground">
              Update this student's photo, contact information, and class details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ProfilePhotoUploadCard
                photoUrl={previewUrl || getUploadUrl(student.profile) || "/default-profile.jpg"}
                fullName={student.fullName}
                roleLabel="Student"
                roleBadgeClassName="bg-sky-50 text-sky-700 border-sky-200"
                hasPendingChange={!!profileFile}
                onFileChange={(file) => {
                  setProfileFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }}
                onReset={() => {
                  setProfileFile(null);
                  setPreviewUrl(null);
                }}
              />
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Student Information</CardTitle>
                  <CardDescription>These details are visible on the student's record.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <InputField
                        name="fullName"
                        label="Full Name"
                        icon={User}
                        rules={{ required: "Full name is required" }}
                      />

                      <InputField
                        name="email"
                        label="Email"
                        type="email"
                        icon={Mail}
                        rules={{ required: "Email is required" }}
                      />

                      <SelectField
                        name="gender"
                        label="Gender"
                        placeholder="Select gender"
                        options={[
                          { value: "Male", label: "Male" },
                          { value: "Female", label: "Female" },
                          { value: "Other", label: "Other" },
                        ]}
                      />

                      <InputField name="number" label="Phone Number" type="tel" icon={Phone} />

                      <InputField name="addresh" label="Address" icon={MapPin} />

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <InputField
                          name="studentClass"
                          label="Class"
                          icon={GraduationCap}
                          placeholder="e.g. 10"
                          rules={{
                            maxLength: { value: 20, message: "Class is too long" },
                          }}
                        />
                        <InputField
                          name="section"
                          label="Section"
                          icon={BookOpen}
                          placeholder="e.g. C"
                          rules={{
                            maxLength: { value: 10, message: "Section is too long" },
                          }}
                        />
                        <InputField
                          name="rollNumber"
                          label="Roll number"
                          type="number"
                          icon={Hash}
                          placeholder="e.g. 23"
                          rules={{
                            pattern: { value: /^\d*$/, message: "Use whole numbers only" },
                            min: { value: 1, message: "Roll number must be at least 1" },
                            max: { value: 9999, message: "Roll number must be 9999 or less" },
                          }}
                        />
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Class, section and roll number go together: fill in all three or leave all three blank.
                        A roll number can only be used once within the same class and section.
                      </p>

                      <div className="flex items-center justify-between border-t pt-5">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isUpdating}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isUpdating}
                          className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Update Student
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </FormProvider>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}