import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

import { useState, useEffect } from "react";

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

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const groupId = id ? Number(id) : 0;

  const navigate = useNavigate();

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
    null,
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
        (m: { teacherId: number }) => m.teacherId === currentUser.id,
      ));

  // HANDLERS

  const handleAddMembers = async (studentIds: string[]) => {
    try {
      setError(null);
      await addMembers({ groupId, studentIds }).unwrap();
      await refetchGroup();
      return true;
    } catch {
      setError("Couldn't add students. Try again.");
      return false;
    }
  };

  const handleRemoveMember = async (studentId: string) => {
    setRemovingId(studentId);

    try {
      setError(null);
      await removeMember({ groupId, studentId }).unwrap();
      await refetchGroup();
    } catch {
      setError("Couldn't remove student. Try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddManagers = async (teacherIds: string[]) => {
    try {
      setError(null);
      await addManagers({ groupId, teacherIds }).unwrap();
      await refetchGroup();
      return true;
    } catch {
      setError("Couldn't add co-teachers. Try again.");
      return false;
    }
  };

  const handleRemoveManager = async (teacherId: string) => {
    setRemovingManagerId(teacherId);

    try {
      setError(null);
      await removeManager({ groupId, teacherId }).unwrap();
      await refetchGroup();
    } catch {
      setError("Couldn't remove co-teacher. Try again.");
    } finally {
      setRemovingManagerId(null);
    }
  };

  const handleCreatePost = async (formData: FormData) => {
    try {
      setError(null);
      await createPost({ groupId, formData }).unwrap();
      await refetchPosts();
      // Push our own "last viewed" timestamp forward so the post we just
      // created never shows up as unread activity for ourselves.
      markViewed(String(groupId));
      return true;
    } catch {
      setError("Couldn't publish post. Try again.");
      return false;
    }
  };

  const handleDeletePost = async (postId: number) => {
    setDeletingPostId(postId);

    try {
      setError(null);
      await deletePost({ groupId, postId }).unwrap();
      await refetchPosts();
    } catch {
      setError("Couldn't delete post. Try again.");
    } finally {
      setDeletingPostId(null);
    }
  };

    // RENDER

  return (
    <DashboardLayout activeMenu="Groups">
      <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-5xl flex-col p-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 shrink-0 text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to groups
        </Button>

        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading group...
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">Couldn't load this group.</p>
        )}

        {group && (
          <>
            <div className="shrink-0">
              <GroupHeader
                group={group}
                canManageStudents={canManageStudents}
                isAdding={isAdding}
                onAddMembers={handleAddMembers}
              />

              {error && (
                <p className="mb-4 text-sm text-destructive">{error}</p>
              )}
            </div>

            {/* =========================
                TWO-COLUMN LAYOUT
            ========================= */}

            <div className="grid grid-cols-1 gap-6 overflow-visible lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:overflow-hidden">
              {/* LEFT COLUMN — scrolling div #1 */}
              <div className="thin-scrollbar lg:col-span-2 lg:h-full lg:overflow-y-auto lg:pr-1">
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

              {/* RIGHT COLUMN — scrolling div #2 */}
              <div className="thin-scrollbar space-y-6 lg:col-span-1 lg:h-full lg:overflow-y-auto lg:pr-1">
                {group.createdByName && (
                  <div className="rounded-lg border p-4">
                    <p className="mb-2 text-sm font-medium">Owner</p>

                    <p
                      className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/Teacher/${group.createdById}`)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {group.createdByRole || "Admin"}:
                      <span className="font-medium text-foreground">
                        {group.createdByName}
                      </span>
                    </p>
                  </div>
                )}

                <CoTeachersSection
                  group={group}
                  canManageCoTeachers={canManageCoTeachers}
                  isAddingManager={isAddingManager}
                  removingManagerId={removingManagerId}
                  onAddManagers={handleAddManagers}
                  onRemoveManager={handleRemoveManager}
                />

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