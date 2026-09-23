import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  ShieldCheck,
  Bell,
  Search,
  BookOpen,
  Sparkles,
  Layers,
  Pencil,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { getUploadUrl } from "@/lib/config";

import { useGetGroupsQuery, useGetAllGroupsLastViewedQuery } from "../../api/GroupApi";
import { useGetCurrentUserQuery } from "../../api/AuthApi";
import { hasUnreadActivity } from "@/components/utils/groupActivity";

interface GroupItem {
  id: number;
  name: string;
  description?: string | null;
  backgroundImage?: string | null;
  memberCount?: number;
  createdByName?: string | null;
  createdById?: number | string | null;
  lastPostAt?: string | null;
}

// Preset banner gradients for visual variety across groups
const CARD_THEMES = [
  { banner: "from-emerald-600 via-teal-600 to-cyan-700", accent: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { banner: "from-blue-600 via-indigo-600 to-violet-700", accent: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { banner: "from-purple-600 via-fuchsia-600 to-pink-700", accent: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/40" },
  { banner: "from-amber-500 via-orange-600 to-rose-700", accent: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
  { banner: "from-teal-600 via-emerald-600 to-green-700", accent: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/40" },
];

export default function GroupsList() {
  const navigate = useNavigate();

  const { data: groups, isLoading, isError } = useGetGroupsQuery(undefined);
  const { data: lastViewedMap } = useGetAllGroupsLastViewedQuery();
  const { data: currentUser } = useGetCurrentUserQuery();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const isStudent = currentUser?.role?.toLowerCase() === "student";

  const canEditGroup = (group: GroupItem) =>
    !isStudent && (currentUser?.role === "Admin" || currentUser?.id === group.createdById);

  // Check how many groups have unread activity
  const unreadCount = useMemo(() => {
    if (!groups || !lastViewedMap) return 0;
    return groups.filter((g: GroupItem) =>
      hasUnreadActivity(g.lastPostAt, lastViewedMap[String(g.id)])
    ).length;
  }, [groups, lastViewedMap]);

  // Filtered groups
  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    return groups.filter((group: GroupItem) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        group.name.toLowerCase().includes(q) ||
        group.description?.toLowerCase().includes(q) ||
        group.createdByName?.toLowerCase().includes(q);

      const isUnread = hasUnreadActivity(group.lastPostAt, lastViewedMap?.[String(group.id)]);
      const matchesUnread = !filterUnreadOnly || isUnread;

      return matchesSearch && matchesUnread;
    });
  }, [groups, searchQuery, filterUnreadOnly, lastViewedMap]);

  return (
    <DashboardLayout activeMenu="Groups">
      <div className="mx-auto max-w-5xl p-4 sm:p-8">
        {/* Top Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20">
                <BookOpen className="h-5 w-5" />
              </span>
              Class Groups
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Collaborate, share study materials, and access course assignments.
            </p>
          </div>

          {!isStudent && (
            <Button
              onClick={() => navigate("/CreateGroup")}
              className="self-start sm:self-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          )}
        </div>

        {/* Quick Stats Banner */}
        {!isLoading && groups && groups.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card className="p-4 bg-card/60">
              <span className="text-xs font-medium text-muted-foreground">Enrolled Groups</span>
              <p className="mt-1 text-2xl font-bold text-foreground">{groups.length}</p>
            </Card>
            <Card className="p-4 bg-card/60 col-span-2 sm:col-span-1">
              <span className="text-xs font-medium text-muted-foreground">Unread Updates</span>
              <p className={`mt-1 text-2xl font-bold ${unreadCount > 0 ? "text-amber-600" : "text-foreground"}`}>
                {unreadCount}
              </p>
            </Card>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search classes by name, subject, or instructor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={filterUnreadOnly ? "secondary" : "outline"}
              size="sm"
              onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
              className="gap-1.5 text-xs"
            >
              <Bell className="h-3.5 w-3.5 text-amber-500" />
              Unread Activity
              {unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Badge variant="outline" className="text-xs text-muted-foreground px-2.5 py-1">
              {filteredGroups.length} {filteredGroups.length === 1 ? "Class" : "Classes"}
            </Badge>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden space-y-3">
                <Skeleton className="h-24 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
            <p className="text-sm font-medium text-destructive">
              Couldn't load groups. Please check your connection or refresh.
            </p>
          </div>
        )}

        {/* Empty State: Zero Groups Found */}
        {!isLoading && !isError && groups?.length === 0 && (
          <div className="rounded-2xl border border-dashed py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
            <h3 className="font-semibold text-foreground">No groups yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {isStudent
                ? "You haven't been enrolled in any class groups yet. Check with your teachers."
                : "Create your first group to start posting coursework and notices."}
            </p>
            {!isStudent && (
              <Button
                onClick={() => navigate("/CreateGroup")}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Create First Group
              </Button>
            )}
          </div>
        )}

        {/* Empty State: Filter Returned 0 Results */}
        {!isLoading && groups && groups.length > 0 && filteredGroups.length === 0 && (
          <div className="rounded-2xl border border-dashed py-12 text-center">
            <Layers className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">No matching groups</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Try adjusting your search terms or clearing the unread filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterUnreadOnly(false);
              }}
              className="mt-3 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Group Cards Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group: GroupItem) => {
            const unread = hasUnreadActivity(
              group.lastPostAt,
              lastViewedMap?.[String(group.id)]
            );
            const theme = CARD_THEMES[group.id % CARD_THEMES.length];

            return (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="group block transition-transform duration-200 hover:-translate-y-1"
              >
                <Card className="h-full overflow-hidden border transition-all hover:border-emerald-500/40 hover:shadow-md flex flex-col justify-between">
                  <div>
                    {/* Top Decorative Banner */}
                    <div
                      className={`relative h-24 w-full p-4 flex items-start justify-between ${
                        group.backgroundImage ? "" : `bg-gradient-to-r ${theme.banner}`
                      }`}
                      style={
                        group.backgroundImage
                          ? {
                              backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${getUploadUrl(
                                group.backgroundImage
                              )})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white font-bold text-lg shadow-xs">
                        {group.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {unread && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-md animate-pulse">
                            <Sparkles className="h-3 w-3" />
                            New Posts
                          </span>
                        )}

                        {canEditGroup(group) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/EditGroup/${group.id}`);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                            title="Edit group"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-base tracking-tight text-foreground line-clamp-1 group-hover:text-emerald-600 transition-colors">
                        {group.name}
                      </h3>

                      <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                        {group.description || "No description provided for this class group."}
                      </p>
                    </CardContent>
                  </div>

                  {/* Card Footer: Members & Instructor */}
                  <div className="border-t bg-muted/20 px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium text-foreground">
                        {group.memberCount ?? 0}
                      </span>
                      <span>{group.memberCount === 1 ? "student" : "students"}</span>
                    </div>

                    {group.createdByName && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (group.createdById) {
                            navigate(`/Teacher/${group.createdById}`);
                          }
                        }}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors max-w-[140px] truncate"
                        title={`Managed by ${group.createdByName}`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate font-medium">{group.createdByName}</span>
                      </button>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}