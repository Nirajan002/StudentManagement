export function getUnreadGlobalNotices<T extends { postedAt: string }>(
  notices: T[],
  lastViewedAt: string | null | undefined
): T[] {
  if (!lastViewedAt) return notices;

  const lastViewedTime = new Date(lastViewedAt).getTime();

  return notices.filter(
    (n) => new Date(n.postedAt).getTime() > lastViewedTime
  );
}