/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";

export function getUnreadGlobalNotices<T extends {
  title: ReactNode;
  id: any; postedAt: string 
}>(
  notices: T[],
  lastViewedAt: string | null | undefined
): T[] {
  if (!lastViewedAt) return notices;

  const lastViewedTime = new Date(lastViewedAt).getTime();

  return notices.filter(
    (n) => new Date(n.postedAt).getTime() > lastViewedTime
  );
}