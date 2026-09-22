import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Phone, MapPin, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";

import { useGetCurrentUserQuery } from "../../api/AuthApi";
import { useUpdateStudentProfileMutation } from "../../api/StudentApi";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { ProfilePhotoUploadCard, ProfileEditTopBar, ReadOnlyInfoCard } from "@/components/profile";
import { getUploadUrl } from "@/lib/config";

interface ProfileForm {
  gender: string;
  number: string;
  addresh: string;
}

export default function UpdateStudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, refetch } = useGetCurrentUserQuery();
  const [updateStudentProfile, { isLoading: isUpdating }] = useUpdateStudentProfileMutation();

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const methods = useForm<ProfileForm>({
    defaultValues: { gender: "", number: "", addresh: "" },
  });
  const { handleSubmit, reset, formState: { isDirty } } = methods;

  const currentProfileUrl =
    typeof user?.profile === "string" ? getUploadUrl(user.profile) : null;

  useEffect(() => {
    if (!user) return;
    reset({
      gender: user.gender || "",
      number: user.number || "",
      addresh: user.address || (user as unknown as { addresh?: string }).addresh || "",
    });
  }, [user, reset]);

  const handleDiscard = () => {
    reset();
    setProfileFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!id) return toast.error("Student ID is missing");

    const formData = new FormData();
    if (profileFile) formData.append("Profile", profileFile);
    formData.append("Gender", data.gender || "");
    formData.append("Number", data.number || "");
    formData.append("Addresh", data.addresh || "");

    try {
      await updateStudentProfile({ id, formData }).unwrap();
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
            <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-3 text-lg">Unable to load profile</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Could not retrieve student data. Please try logging in again.
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
            <h1 className="text-2xl font-bold tracking-tight">Edit Student Profile</h1>
            <p className="text-sm text-muted-foreground">
              Update your personal photo, phone number, and residential address.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <ProfilePhotoUploadCard
                photoUrl={previewUrl || currentProfileUrl || "/default-profile.jpg"}
                fullName={user.fullName}
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

              <ReadOnlyInfoCard
                title="School Records"
                description="These fields are verified by administration and cannot be changed here."
                fields={[
                  { label: "Full Name", value: user.fullName },
                  { label: "Official Email", value: user.email },
                ]}
              />
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                  <CardDescription>Provide your up-to-date contact information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                        name="addresh"
                        label="Address"
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