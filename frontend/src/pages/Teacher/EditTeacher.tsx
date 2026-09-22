import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Phone, MapPin, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

import { useGetTeacherQuery, useUpdateTeacherMutation } from "../../api/TeacherApi";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ProfilePhotoUploadCard, ProfileEditTopBar } from "@/components/profile";
import { getUploadUrl } from "@/lib/config";

interface EditTeacherForm {
  fullName: string;
  email: string;
  gender: string;
  number: string;
  address: string;
  role: string;
}

export default function EditTeacher() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const {
    data: teacher,
    isLoading: isLoadingTeacher,
    isError,
  } = useGetTeacherQuery(id!, { skip: !id });

  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const methods = useForm<EditTeacherForm>({
    defaultValues: { fullName: "", email: "", gender: "", number: "", address: "", role: "" },
  });
  const { handleSubmit, reset, formState: { isDirty } } = methods;

  useEffect(() => {
    if (!teacher) return;
    reset({
      fullName: teacher.fullName || "",
      email: teacher.email || "",
      gender: teacher.gender || "",
      number: teacher.number || "",
      address: teacher.address || "",
      role: teacher.role || "",
    });
  }, [teacher, reset]);

  const handleDiscard = () => {
    reset();
    setProfileFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = async (data: EditTeacherForm) => {
    if (!id) return toast.error("Teacher ID is missing.");

    try {
      const formData = new FormData();
      formData.append("FullName", data.fullName);
      formData.append("Email", data.email);
      formData.append("Gender", data.gender);
      formData.append("Number", data.number);
      formData.append("Address", data.address);
      formData.append("Role", data.role);
      if (profileFile) formData.append("Profile", profileFile);

      await updateTeacher({ id, data: formData }).unwrap();
      toast.success("Teacher updated successfully!");
      navigate("/Teachers");
    } catch (error) {
      console.error("Failed to update teacher:", error);
      toast.error("Failed to update teacher.");
    }
  };

  if (isLoadingTeacher) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !teacher) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
          <p className="text-lg text-destructive">Failed to load teacher.</p>
          <Button onClick={() => navigate("/Teachers")}>Back to Teachers</Button>
        </div>
      </DashboardLayout>
    );
  }

  const dirty = isDirty || !!profileFile;

  return (
    <DashboardLayout>
      <div className="min-h-[calc(100vh-4rem)] bg-muted/20 pb-12">
        <ProfileEditTopBar
          onBack={() => navigate("/Teachers")}
          onDiscard={handleDiscard}
          onSave={handleSubmit(onSubmit)}
          isSaving={isUpdating}
          canDiscard={dirty}
          backLabel="Back to Teachers"
          saveLabel="Update Teacher"
        />

        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Edit Teacher</h1>
            <p className="text-sm text-muted-foreground">
              Update this teacher's photo, contact information, and role.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <ProfilePhotoUploadCard
                photoUrl={previewUrl || getUploadUrl(teacher.profile) || "/default-profile.jpg"}
                fullName={teacher.fullName}
                roleLabel={teacher.role || "Teacher"}
                roleIcon={ShieldCheck}
                roleBadgeClassName="bg-emerald-50 text-emerald-700 border-emerald-200"
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
                  <CardTitle className="text-lg">Teacher Information</CardTitle>
                  <CardDescription>These details are visible across the platform.</CardDescription>
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

                      <InputField name="number" label="Phone Number" icon={Phone} />

                      <InputField name="address" label="Address" icon={MapPin} />

                      <SelectField
                        name="role"
                        label="Role"
                        placeholder="Select role"
                        options={[
                          { value: "Teacher", label: "Teacher" },
                          { value: "Admin", label: "Admin" },
                        ]}
                      />

                      <div className="flex items-center justify-between border-t pt-5">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => navigate("/Teachers")}
                          disabled={isUpdating}
                        >
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
                              Update Teacher
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