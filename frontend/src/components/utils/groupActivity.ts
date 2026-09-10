export interface RecentNotice {
  id: number;
  groupId: number;
  groupName: string;
  title: string;
  postedAt: string;
  postedByName: string;
}

export function getUnreadNotices(
  notices: RecentNotice[],
  lastViewedMap: Record<string, string> | undefined
): RecentNotice[] {
  if (!lastViewedMap) return notices;

  return notices.filter((n) => {
    const lastViewed = lastViewedMap[String(n.groupId)];
    if (!lastViewed) return true;
    return new Date(n.postedAt).getTime() > new Date(lastViewed).getTime();
  });
}

export function hasUnreadActivity(
  lastPostAt: string | null | undefined,
  lastViewedAt: string | null | undefined
): boolean {
  if (!lastPostAt) return false;
  if (!lastViewedAt) return true;
  return new Date(lastPostAt).getTime() > new Date(lastViewedAt).getTime();
}