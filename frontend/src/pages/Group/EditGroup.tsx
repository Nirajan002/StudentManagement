import { useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Trash2,
  Save,
  Eye,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  Upload,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getUploadUrl } from "@/lib/config";
import { cn } from "@/lib/utils";

import {
  useGetGroupByIdQuery,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} from "../../api/GroupApi";
import { useGetCurrentUserQuery } from "../../api/AuthApi";

// Gradient themes matching GroupList & GroupHeader
const CARD_THEMES = [
  { banner: "from-emerald-600 via-teal-600 to-cyan-700" },
  { banner: "from-blue-600 via-indigo-600 to-violet-700" },
  { banner: "from-purple-600 via-fuchsia-600 to-pink-700" },
  { banner: "from-amber-500 via-orange-600 to-rose-700" },
  { banner: "from-teal-600 via-emerald-600 to-green-700" },
];

export default function EditGroup() {
  const { id } = useParams<{ id: string }>();
  const groupId = id ? Number(id) : 0;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: group,
    isLoading,
    isError,
  } = useGetGroupByIdQuery(groupId, {
    skip: !groupId,
  });
  const { data: currentUser } = useGetCurrentUserQuery();

  const [updateGroup, { isLoading: isSaving }] = useUpdateGroupMutation();
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();

  const [name, setName] = useState<string | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [newImage, setNewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const groupName = name ?? group?.name ?? "";
  const groupDescription = description ?? group?.description ?? "";

  const canManage =
    !!currentUser &&
    !!group &&
    (currentUser.role === "Admin" || currentUser.id === group.createdById);

  const theme = CARD_THEMES[groupId % CARD_THEMES.length];
  const existingImageUrl = getUploadUrl(group?.backgroundImage);

  const activeCoverUrl = previewUrl
    ? previewUrl
    : existingImageUrl && !removeImage
      ? existingImageUrl
      : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB.");
      return;
    }

    setNewImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const handleRemoveExisting = () => {
    setNewImage(null);
    setPreviewUrl(null);
    setRemoveImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!groupName.trim()) {
      setError("Group name is required.");
      return;
    }

    setError(null);

    const formData = new FormData();
    formData.append("Name", groupName.trim());
    if (groupDescription.trim()) {
      formData.append("Description", groupDescription.trim());
    } else {
      formData.append("Description", "");
    }
    if (newImage) formData.append("BackgroundImage", newImage);
    if (removeImage) formData.append("RemoveBackgroundImage", "true");

    try {
      await updateGroup({ groupId, formData }).unwrap();
      toast.success("Group settings updated.");
      navigate(`/groups/${groupId}`);
    } catch {
      toast.error("Couldn't update the group. Try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGroup(groupId).unwrap();
      toast.success("Group deleted.");
      navigate("/GroupsList");
    } catch {
      toast.error("Couldn't delete the group.");
    }
  };

  // =========================
  // LOADING STATE
  // =========================
  if (isLoading) {
    return (
      <DashboardLayout activeMenu="Groups">
        <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // ERROR STATE
  // =========================
  if (isError || !group) {
    return (
      <DashboardLayout activeMenu="Groups">
        <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
          <Card className="border-destructive/30 bg-destructive/5 p-6 shadow-xs">
            <CardContent className="space-y-4 pt-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Group Not Found
                </h3>
                <p className="text-xs text-muted-foreground">
                  The group you are trying to edit could not be found or has
                  been deleted.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/GroupsList")}
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Groups
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // UNAUTHORIZED STATE
  // =========================
  if (!canManage) {
    return (
      <DashboardLayout activeMenu="Groups">
        <div className="mx-auto w-full max-w-md px-4 py-16 text-center">
          <Card className="border-amber-500/30 bg-amber-500/5 p-6 shadow-xs">
            <CardContent className="space-y-4 pt-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Permission Denied
                </h3>
                <p className="text-xs text-muted-foreground">
                  Only the group creator or a system administrator can modify
                  these settings.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/groups/${groupId}`)}
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Return to Group
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // =========================
  // MAIN EDIT FORM
  // =========================
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
            <Button
              variant="ghost"
              size="sm"
              className="h-8 max-w-[180px] truncate px-2 text-xs font-medium text-muted-foreground hover:text-foreground sm:max-w-xs"
              onClick={() => navigate(`/groups/${groupId}`)}
            >
              {group.name}
            </Button>
            <span>/</span>
            <span className="font-semibold text-foreground">Settings</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => navigate(`/groups/${groupId}`)}
            >
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              View Group
            </Button>

            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 text-xs font-medium"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* PAGE TITLE & BADGES */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Group Settings
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Customize your group information, cover artwork, and lifecycle.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              ID #{group.id}
            </Badge>
            {group.createdByName && (
              <Badge variant="secondary" className="text-xs font-normal">
                Creator: {group.createdByName}
              </Badge>
            )}
          </div>
        </div>

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
              The group name and description are visible to all enrolled
              students and faculty members.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="edit-group-name"
                  className="text-xs font-medium"
                >
                  Group Name <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {groupName.length}/100
                </span>
              </div>
              <Input
                id="edit-group-name"
                maxLength={100}
                placeholder="e.g. Physics 101 - Spring Semester"
                value={groupName}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="edit-group-description"
                  className="text-xs font-medium"
                >
                  Description
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Optional
                </span>
              </div>
              <Textarea
                id="edit-group-description"
                placeholder="Add meeting schedule, syllabus details, instructor contact, or classroom rules..."
                value={groupDescription}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="text-sm leading-relaxed"
              />
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            CARD 2: APPEARANCE & COVER ARTWORK (LIVE PREVIEW)
        ======================================================== */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  Cover Artwork & Banner
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize the hero banner displayed at the top of the group.
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1 text-[11px]">
                <Sparkles className="h-3 w-3 text-primary" />
                Live Preview
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {/* LIVE BANNER PREVIEW CARD */}
            <div className="relative min-h-[160px] w-full overflow-hidden rounded-xl border border-border/80 shadow-sm sm:min-h-[180px]">
              {activeCoverUrl ? (
                <div className="absolute inset-0">
                  <img
                    src={activeCoverUrl}
                    alt="Cover Preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />
                </div>
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r",
                    theme.banner,
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

              {/* Preview Content Overlay */}
              <div className="relative z-10 flex h-full min-h-[160px] flex-col justify-between p-5 text-white sm:min-h-[180px]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-md">
                    Group #{group.id} Preview
                  </span>

                  {activeCoverUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-7 gap-1 px-2.5 text-xs backdrop-blur-md"
                      onClick={handleRemoveExisting}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Cover
                    </Button>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold tracking-tight drop-shadow-sm sm:text-2xl">
                    {groupName || "Untitled Group"}
                  </h3>
                  <p className="line-clamp-2 mt-1 max-w-xl text-xs text-white/80 sm:text-sm">
                    {groupDescription ||
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
                  PNG, JPG, or WEBP up to 5MB. Recommended resolution:
                  1200×320px.
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
                  {activeCoverUrl ? "Replace Image" : "Upload Banner"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================
            CARD 3: DANGER ZONE
        ======================================================== */}
        <Card className="border-destructive/30 bg-destructive/5 shadow-xs">
          <CardHeader className="border-b border-destructive/20 pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <CardTitle className="text-base font-semibold text-destructive">
                Danger Zone
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Irreversible actions that permanently affect this group and its
              data.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-start justify-between gap-4 pt-4 sm:flex-row sm:items-center">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">
                Delete this group
              </p>
              <p className="max-w-md text-xs text-muted-foreground">
                Permanently delete this group, removing all posts,
                announcements, and student submissions. This action cannot be
                reversed.
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="h-8 shrink-0 gap-1.5 text-xs"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Group
                  </Button>
                }
              />

              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Delete Group &ldquo;{group.name}&rdquo;?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-xs text-muted-foreground">
                    This will permanently delete this group, revoke access for
                    all enrolled students, and remove all coursework and
                    notices. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel className="text-xs">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-xs font-semibold text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, Delete Group
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* BOTTOM SAVE CONTROLS */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(`/groups/${groupId}`)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3.5 w-3.5" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
