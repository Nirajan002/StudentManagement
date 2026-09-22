import { useEffect, useState, useMemo } from "react";
import { Megaphone } from "lucide-react";

import DashboardLayout from "@/components/layouts/DashboardLayout";

import { useGetCurrentUserQuery } from "../api/AuthApi";
import {
  useGetGlobalNoticesQuery,
  useCreateGlobalNoticeMutation,
  useDeleteGlobalNoticeMutation,
  useMarkGlobalNoticesViewedMutation,
} from "../api/GlobalNoticeApi";

import CreateNoticeDialog from "@/components/global-notice/CreateNoticeDialog";
import NoticeFilterBar from "@/components/global-notice/NoticeFilterBar";
import NoticeCard from "@/components/global-notice/NoticeCard";
import { NoticeListSkeleton, EmptyNoticesState } from "@/components/global-notice/NoticeListStates";
import type { GlobalNotice } from "@/components/global-notice/types";

export default function GlobalNotices() {
  const { data: currentUser } = useGetCurrentUserQuery();
  const { data: notices, isLoading, refetch } = useGetGlobalNoticesQuery(undefined);

  const [createNotice, { isLoading: isPosting }] = useCreateGlobalNoticeMutation();
  const [deleteNotice] = useDeleteGlobalNoticeMutation();
  const [markViewed] = useMarkGlobalNoticesViewedMutation();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterWithFile, setFilterWithFile] = useState(false);

  const isAdmin = currentUser?.role === "Admin";

  useEffect(() => {
    markViewed(undefined);
  }, [markViewed]);

  const handleCreate = async (formData: FormData) => {
    try {
      await createNotice(formData).unwrap();
      await refetch();
      markViewed(undefined);
      return true;
    } catch {
      return false;
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteNotice(id).unwrap();
      await refetch();
    } finally {
      setDeletingId(null);
    }
  };

  const filteredNotices = useMemo(() => {
    if (!notices) return [];

    return notices.filter((n: GlobalNotice) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q) ||
        n.postedByName.toLowerCase().includes(q);
      const matchesFile = !filterWithFile || Boolean(n.fileName);
      return matchesSearch && matchesFile;
    });
  }, [notices, searchQuery, filterWithFile]);

  return (
    <DashboardLayout activeMenu="Announcements">
      <div className="mx-auto max-w-4xl p-4 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20">
                <Megaphone className="h-5 w-5" />
              </span>
              Campus Announcements
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Official school-wide notices for all students and faculty members.
            </p>
          </div>

          {isAdmin && (
            <CreateNoticeDialog isPosting={isPosting} onCreate={handleCreate} />
          )}
        </div>

        <NoticeFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterWithFile={filterWithFile}
          onToggleFilterWithFile={() => setFilterWithFile((v) => !v)}
          resultCount={filteredNotices.length}
        />

        {isLoading && <NoticeListSkeleton />}

        {!isLoading && filteredNotices.length === 0 && (
          <EmptyNoticesState
            isAdmin={isAdmin}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
          />
        )}

        <div className="space-y-4">
          {filteredNotices.map((notice: GlobalNotice) => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              isAdmin={isAdmin}
              isDeleting={deletingId === notice.id}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}