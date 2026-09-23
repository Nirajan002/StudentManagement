import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Save,
  AlertCircle,
  Upload,
  Sparkles,
  Users,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { cn } from "@/lib/utils";

import { StudentPicker, type PickedStudent } from "@/components/group/StudentPicker";
import { useCreateGroupMutation } from "../../api/GroupApi";

// Gradient themes — same as EditGroup, GroupHeader, GroupList
const CARD_THEMES = [
  { banner: "from-emerald-600 via-teal-600 to-cyan-700" },
  { banner: "from-blue-600 via-indigo-600 to-violet-700" },
  { banner: "from-purple-600 via-fuchsia-600 to-pink-700" },
  { banner: "from-amber-500 via-orange-600 to-rose-700" },
  { banner: "from-teal-600 via-emerald-600 to-green-700" },
];

// Deterministic theme based on current time so new groups have variety
const DEFAULT_THEME = CARD_THEMES[Math.floor(Date.now() / 1000) % CARD_THEMES.length];

export default function CreateGroup() {
  const navigate = useNavigate();
  const [createGroup, { isLoading }] = useCreateGroupMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [students, setStudents] = useState<PickedStudent[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB.");
      return;
    }

    setBackgroundImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("Name", name.trim());
    if (description.trim()) formData.append("Description", description.trim());
    students.forEach((s) => formData.append("StudentIds", s.id));
    if (backgroundImage) formData.append("BackgroundImage", backgroundImage);

    try {
      const group = await createGroup(formData).unwrap();
      toast.success("Group created successfully!");
      navigate(`/groups/${group.id}`);
    } catch {
      toast.error("Couldn't create the group. Try again.");
      setError("Couldn't create the group. Try again.");
    }
  };

  return (
    <DashboardLayout activeMenu="Groups">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">

        {/* TOP BREADCRUMB & HEADER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/GroupsList")}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Groups
            </Button>
            <span>/</span>
            <span className="font-semibold text-foreground">New Group</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => navigate("/GroupsList")}
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Create Group
            </Button>
          </div>
        </div>

        {/* PAGE TITLE */}
        <div className="border-b border-border/60 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Create a Group
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Give it a name and optionally add students — you can always add more later.
          </p>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================
            CARD 1: GENERAL INFORMATION
        ======================================================== */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle className="text-base font-semibold">
              General Information
            </CardTitle>
            <CardDescription className="text-xs">
              The group name and description will be visible to all enrolled
              students and faculty.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="group-name" className="text-xs font-medium">
                  Group Name <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {name.length}/100
                </span>
              </div>
              <Input
                id="group-name"
                maxLength={100}
                placeholder="e.g. Physics 101 – Spring Semester"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                autoFocus
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="group-description"
                  className="text-xs font-medium"
                >
                  Description
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Optional
                </span>
              </div>
              <Textarea
                id="group-description"
                placeholder="Add meeting schedule, syllabus details, instructor contact, or classroom rules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="text-sm leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            CARD 2: COVER ARTWORK (LIVE PREVIEW)
        ======================================================== */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Cover Artwork & Banner
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize the hero banner shown at the top of the group page.
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1 text-[11px]">
                <Sparkles className="h-3 w-3 text-primary" />
                Live Preview
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {/* LIVE BANNER PREVIEW */}
            <div className="relative min-h-[160px] w-full overflow-hidden rounded-xl border border-border/80 shadow-sm sm:min-h-[180px]">
              {previewUrl ? (
                <div className="absolute inset-0">
                  <img
                    src={previewUrl}
                    alt="Cover Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
                </div>
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r",
                    DEFAULT_THEME.banner
                  )}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/35" />
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                </div>
              )}

              {/* Overlay content */}
              <div className="relative z-10 flex h-full min-h-[160px] flex-col justify-between p-5 text-white sm:min-h-[180px]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-md">
                    New Group Preview
                  </span>

                  {previewUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-7 gap-1 px-2.5 text-xs"
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight drop-shadow-sm sm:text-2xl">
                    {name.trim() || "Untitled Group"}
                  </h3>
                  <p className="mt-1 line-clamp-2 max-w-xl text-xs text-white/80 sm:text-sm">
                    {description.trim() ||
                      "No description provided for this group yet."}
                  </p>
                </div>
              </div>
            </div>

            {/* UPLOAD CONTROLS */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-foreground">
                  Upload custom image
                </p>
                <p className="text-[11px] text-muted-foreground">
                  PNG, JPG, or WEBP up to 5MB. Recommended: 1200×320px.
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 w-full gap-1.5 text-xs sm:w-auto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  {previewUrl ? "Replace Image" : "Upload Banner"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            CARD 3: ENROLL STUDENTS
        ======================================================== */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Enroll Students
                </CardTitle>
                <CardDescription className="text-xs">
                  Search and select students to add now. You can always add more
                  after creation.
                </CardDescription>
              </div>

              {students.length > 0 && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  {students.length} selected
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            <StudentPicker selected={students} onChange={setStudents} />

            {students.length === 0 && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                <Plus className="mr-1 inline h-3 w-3" />
                Start typing to search for students by name or email.
              </p>
            )}
          </CardContent>
        </Card>

        {/* BOTTOM SAVE CONTROLS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate("/GroupsList")}
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-1.5"
          >
            {isLoading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            Create Group
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}