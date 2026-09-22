import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useUpdateTeacherProfileMutation } from "../../api/TeacherApi";
import { useGetCurrentUserQuery } from "../../api/AuthApi";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ProfilePhotoUploadCard, ProfileEditTopBar, ReadOnlyInfoCard } from "@/components/profile";
import { getUploadUrl } from "@/lib/config";

interface ProfileForm {
  fullName: string;
  email: string;
  gender: string;
  number: string;
  address: string;
}

export default function UpdateTeacherProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, refetch } = useGetCurrentUserQuery();
  const [updateUserProfile, { isLoading: isUpdating }] = useUpdateTeacherProfileMutation();

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const methods = useForm<ProfileForm>({
    defaultValues: { fullName: "", email: "", gender: "", number: "", address: "" },
  });
  const { handleSubmit, reset, formState: { isDirty } } = methods;

  const currentProfileUrl =
    typeof user?.profile === "string" ? getUploadUrl(user.profile) : null;

  useEffect(() => {
    if (!user) return;
    reset({
      fullName: user.fullName || "",
      email: user.email || "",
      gender: user.gender || "",
      number: user.number || "",
      address: user.address || "",
    });
  }, [user, reset]);

  const handleDiscard = () => {
    reset();
    setProfileFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!id) return toast.error("User ID is missing");

    const formData = new FormData();
    if (profileFile) formData.append("Profile", profileFile);
    formData.append("FullName", data.fullName.trim());
    formData.append("Email", data.email.trim());
    formData.append("Gender", data.gender || "");
    formData.append("Number", data.number.trim());
    formData.append("Address", data.address.trim());

    try {
      await updateUserProfile({ id, formData }).unwrap();
      await refetch();
      toast.success("Profile updated successfully!");
      setTimeout(() => navigate("/ViewYourProfile"), 400);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      toast.error(err?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Profile">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !user) {
    return (
      <DashboardLayout activeMenu="Profile">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
          <Card className="w-full max-w-md p-6 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-3 text-lg">Unable to load profile</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Could not retrieve teacher data. Please try logging in again.
            </p>
            <Button className="mt-4 w-full" onClick={() => navigate("/Login")}>
              Go to Login
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const dirty = isDirty || !!profileFile;

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="min-h-[calc(100vh-4rem)] bg-muted/20 pb-12">
        <ProfileEditTopBar
          onBack={() => navigate(-1)}
          onDiscard={handleDiscard}
          onSave={handleSubmit(onSubmit)}
          isSaving={isUpdating}
          canDiscard={dirty}
        />

        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Edit Teacher Profile</h1>
            <p className="text-sm text-muted-foreground">
              Update your personal details, contact information, and public faculty picture.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <ProfilePhotoUploadCard
                photoUrl={previewUrl || currentProfileUrl || "/default-profile.jpg"}
                fullName={user.fullName}
                roleLabel="Teacher"
                roleIcon={ShieldCheck}
                roleBadgeClassName="bg-emerald-50 text-emerald-700 border-emerald-200"
                hasPendingChange={!!profileFile}
                guidelines={[
                  "Professional front-facing photo",
                  "Square format recommended",
                  "Max file size: 5MB",
                ]}
                onFileChange={(file) => {
                  setProfileFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                }}
                onReset={() => {
                  setProfileFile(null);
                  setPreviewUrl(null);
                }}
              />

              <ReadOnlyInfoCard
                title="Faculty Details"
                fields={[
                  { label: "Faculty ID", value: `#${user.id}` },
                  {
                    label: "Verification",
                    value: (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    ),
                  },
                ]}
              />
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal & Contact Information</CardTitle>
                  <CardDescription>
                    These details will be displayed on your teacher profile card and classes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                      <InputField
                        name="fullName"
                        label="Full Name"
                        icon={User}
                        placeholder="e.g. John Doe"
                        rules={{
                          required: "Full name is required",
                          minLength: { value: 2, message: "Name must be at least 2 characters" },
                        }}
                      />

                      <InputField
                        name="email"
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        placeholder="teacher@institution.edu"
                        rules={{
                          required: "Email address is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Please enter a valid email address",
                          },
                        }}
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

                      <InputField
                        name="number"
                        label="Phone Number"
                        type="tel"
                        icon={Phone}
                        placeholder="e.g. 98XXXXXXXX"
                        rules={{
                          pattern: {
                            value: /^[0-9+-\s]{7,15}$/,
                            message: "Please enter a valid phone number",
                          },
                        }}
                      />

                      <InputField
                        name="address"
                        label="Residential Address"
                        icon={MapPin}
                        placeholder="e.g. Kathmandu, Nepal"
                        rules={{
                          minLength: { value: 2, message: "Address must be at least 2 characters" },
                        }}
                      />

                      <div className="flex items-center justify-between border-t pt-5">
                        <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isUpdating}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isUpdating || !dirty}
                          className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Save Changes
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