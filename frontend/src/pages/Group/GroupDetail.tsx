import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  GraduationCap,
  Bell,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DashboardLayout from "@/components/layouts/DashboardLayout";

import GroupHeader from "@/components/group/GroupHeader";
import CoTeachersSection from "@/components/group/CoTeachersSection";
import PostsSection from "@/components/group/PostsSectionProps";
import MembersSection from "@/components/group/MembersSection";

import {
  useGetGroupByIdQuery,
  useAddGroupMembersMutation,
  useRemoveGroupMemberMutation,
  useAddGroupManagersMutation,
  useRemoveGroupManagerMutation,
  useGetGroupPostsQuery,
  useCreateGroupPostMutation,
  useDeleteGroupPostMutation,
  useMarkGroupViewedMutation,
} from "../../api/GroupApi";
import { useGetCurrentUserQuery } from "../../api/AuthApi";
import { initials } from "@/components/utils/initials";
import type { GroupPost } from "@/components/utils/SubmitType";
import { cn } from "@/lib/utils";

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const groupId = id ? Number(id) : 0;
  const navigate = useNavigate();

  // Mobile navigation tab state
  const [activeMobileTab, setActiveMobileTab] = useState<"stream" | "people">(
    "stream"
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  // GROUP
  const {
    data: group,
    isLoading,
    isError,
    refetch: refetchGroup,
  } = useGetGroupByIdQuery(groupId, { skip: !groupId });

  // CURRENT USER
  const { data: currentUser } = useGetCurrentUserQuery();

  // LAST VIEWED
  const [markViewed] = useMarkGroupViewedMutation();

  useEffect(() => {
    if (groupId) {
      markViewed(String(groupId));
    }
  }, [groupId, markViewed]);

  // MEMBERS
  const [addMembers, { isLoading: isAdding }] = useAddGroupMembersMutation();
  const [removeMember] = useRemoveGroupMemberMutation();
  const [removingId, setRemovingId] = useState<string | null>(null);

  // CO-TEACHERS
  const [addManagers, { isLoading: isAddingManager }] =
    useAddGroupManagersMutation();
  const [removeManager] = useRemoveGroupManagerMutation();
  const [removingManagerId, setRemovingManagerId] = useState<string | null>(
    null
  );

  // ERROR
  const [error, setError] = useState<string | null>(null);

  // POSTS
  const {
    data: posts,
    isLoading: isLoadingPosts,
    refetch: refetchPosts,
  } = useGetGroupPostsQuery(String(groupId), { skip: !groupId });

  const [createPost, { isLoading: isPosting }] = useCreateGroupPostMutation();
  const [deletePost] = useDeleteGroupPostMutation();
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  // ROLE / PERMISSIONS
  const isStudent = currentUser?.role?.toLowerCase() === "student";

  // Only creator or Admin can manage co-teachers
  const canManageCoTeachers =
    !!currentUser &&
    !!group &&
    !isStudent &&
    (currentUser.role === "Admin" || currentUser.id === group.createdById);

  // Teachers/Admins can manage students
  const canManageStudents = !!currentUser && !!group && !isStudent;

  // Admin, creator, or co-teacher can publish posts
  const canPost =
    !!currentUser &&
    !!group &&
    !isStudent &&
    (currentUser.role === "Admin" ||
      currentUser.id === group.createdById ||
      (group.managers ?? []).some(
        (m: { teacherId: number }) => m.teacherId === currentUser.id
      ));

  // HANDLERS
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([refetchGroup(), refetchPosts()]);
      toast.success("Group refreshed");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddMembers = async (studentIds: string[]) => {
    try {
      setError(null);
      await addMembers({ groupId, studentIds }).unwrap();
      await refetchGroup();
      return true;
    } catch {
      setError("Couldn't add students. Try again.");
      toast.error("Failed to add students");
      return false;
    }
  };

  const handleRemoveMember = async (studentId: string) => {
    setRemovingId(studentId);
    try {
      setError(null);
      await removeMember({ groupId, studentId }).unwrap();
      await refetchGroup();
      toast.success("Student removed");
    } catch {
      setError("Couldn't remove student. Try again.");
      toast.error("Failed to remove student");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddManagers = async (teacherIds: string[]) => {
    try {
      setError(null);
      await addManagers({ groupId, teacherIds }).unwrap();
      await refetchGroup();
      toast.success("Co-teacher added");
      return true;
    } catch {
      setError("Couldn't add co-teachers. Try again.");
      toast.error("Failed to add co-teacher");
      return false;
    }
  };

  const handleRemoveManager = async (teacherId: string) => {
    setRemovingManagerId(teacherId);
    try {
      setError(null);
      await removeManager({ groupId, teacherId }).unwrap();
      await refetchGroup();
      toast.success("Co-teacher removed");
    } catch {
      setError("Couldn't remove co-teacher. Try again.");
      toast.error("Failed to remove co-teacher");
    } finally {
      setRemovingManagerId(null);
    }
  };

  const handleCreatePost = async (formData: FormData) => {
    try {
      setError(null);
      await createPost({ groupId, formData }).unwrap();
      await refetchPosts();
      markViewed(String(groupId));
      toast.success("Post published successfully");
      return true;
    } catch {
      setError("Couldn't publish post. Try again.");
      toast.error("Failed to publish post");
      return false;
    }
  };

  const handleDeletePost = async (postId: number) => {
    setDeletingPostId(postId);
    try {
      setError(null);
      await deletePost({ groupId, postId }).unwrap();
      await refetchPosts();
      toast.success("Post deleted");
    } catch {
      setError("Couldn't delete post. Try again.");
      toast.error("Failed to delete post");
    } finally {
      setDeletingPostId(null);
    }
  };

  // METRICS
  const noticesCount = (posts ?? []).filter(
    (p: GroupPost) => p.type === "Notice"
  ).length;
  const assignmentsCount = (posts ?? []).filter(
    (p: GroupPost) => p.type === "Assignment"
  ).length;
  const membersCount = group?.members?.length ?? 0;
  const facultyCount =
    (group?.managers?.length ?? 0) + (group?.createdByName ? 1 : 0);

  return (
    <DashboardLayout activeMenu="Groups">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* =========================
            TOP BREADCRUMB & ACTIONS
        ========================= */}
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
            <span className="max-w-[200px] truncate font-medium text-foreground sm:max-w-md">
              {group?.name || "Group Details"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* =========================
            LOADING STATE (SKELETON)
        ========================= */}
        {isLoading && <GroupDetailSkeleton />}

        {/* =========================
            ERROR STATE
        ========================= */}
        {isError && (
          <Card className="border-destructive/30 bg-destructive/5 py-12 text-center shadow-xs">
            <CardContent className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  Unable to load this group
                </h3>
                <p className="mx-auto max-w-md text-xs text-muted-foreground">
                  The group may have been removed, or your account may not have
                  the necessary permissions to access this page.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/GroupsList")}
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to Groups
                </Button>
                <Button size="sm" onClick={() => refetchGroup()}>
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* =========================
            ACTIVE GROUP VIEW
        ========================= */}
        {group && (
          <>
            {/* HERO BANNER */}
            <GroupHeader
              group={group}
              canManageStudents={canManageStudents}
              canManageCoTeachers={canManageCoTeachers}
              isAdding={isAdding}
              onAddMembers={handleAddMembers}
              onEditGroup={() => navigate(`/EditGroup/${groupId}`)}
            />

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* QUICK STATS METRICS STRIP */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs transition-colors hover:border-emerald-500/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {membersCount}
                  </p>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    Enrolled Students
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs transition-colors hover:border-blue-500/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {facultyCount}
                  </p>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    Course Faculty
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs transition-colors hover:border-amber-500/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {noticesCount}
                  </p>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    Notices Posted
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs transition-colors hover:border-purple-500/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {assignmentsCount}
                  </p>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    Assignments
                  </p>
                </div>
              </div>
            </div>

            {/* MOBILE NAVIGATION TABS (visible only on small screens) */}
            <div className="flex rounded-lg border border-border/80 bg-muted/40 p-1 lg:hidden">
              <button
                type="button"
                onClick={() => setActiveMobileTab("stream")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-all",
                  activeMobileTab === "stream"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Stream & Coursework
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  {noticesCount + assignmentsCount}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveMobileTab("people")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-medium transition-all",
                  activeMobileTab === "people"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                People & Faculty
                <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
                  {membersCount + facultyCount}
                </Badge>
              </button>
            </div>

            {/* =========================
                TWO-COLUMN LAYOUT
            ========================= */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
              {/* LEFT COLUMN: Feed & Posts */}
              <div
                className={cn(
                  "min-w-0 lg:col-span-2",
                  activeMobileTab === "people" && "hidden lg:block"
                )}
              >
                <PostsSection
                  groupId={String(groupId)}
                  groupName={group.name}
                  posts={posts}
                  isLoadingPosts={isLoadingPosts}
                  canPost={canPost}
                  isPosting={isPosting}
                  deletingPostId={deletingPostId}
                  currentUserId={currentUser?.id?.toString()}
                  currentUserRole={currentUser?.role}
                  onCreatePost={handleCreatePost}
                  onDeletePost={handleDeletePost}
                />
              </div>

              {/* RIGHT COLUMN: Sidebar (Lead Instructor, Co-Teachers, Members) */}
              <div
                className={cn(
                  "space-y-6 lg:sticky lg:top-6 lg:col-span-1",
                  activeMobileTab === "stream" && "hidden lg:block"
                )}
              >
                {/* LEAD INSTRUCTOR / OWNER CARD */}
                {group.createdByName && (
                  <Card className="overflow-hidden border border-border/80 shadow-xs transition-all hover:border-border">
                    <CardHeader className="border-b border-border/40 bg-muted/30 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          Lead Instructor
                        </div>
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[11px] font-normal"
                        >
                          {group.createdByRole || "Admin"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-3.5">
                      <div
                        onClick={() =>
                          navigate(`/Teacher/${group.createdById}`)
                        }
                        className="group flex cursor-pointer items-center justify-between rounded-lg p-1.5 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-9 w-9 shrink-0 border border-border/80">
                            <AvatarFallback className="bg-emerald-600/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {initials(group.createdByName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                              {group.createdByName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              Course Administrator
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CO-TEACHERS SECTION */}
                <CoTeachersSection
                  group={group}
                  canManageCoTeachers={canManageCoTeachers}
                  isAddingManager={isAddingManager}
                  removingManagerId={removingManagerId}
                  onAddManagers={handleAddManagers}
                  onRemoveManager={handleRemoveManager}
                />

                {/* MEMBERS SECTION */}
                <MembersSection
                  members={group.members}
                  canManageStudents={canManageStudents}
                  removingId={removingId}
                  onRemove={handleRemoveMember}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// Full page skeleton that mirrors the layout for zero visual jumping
function GroupDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Banner Skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl sm:h-56" />

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>

      {/* 2-Column Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
        <div className="space-y-4 lg:col-span-1">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
