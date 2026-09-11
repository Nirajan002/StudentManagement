import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Megaphone } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  useGetRecentNoticesQuery,
  useGetAllGroupsLastViewedQuery,
} from "../api/GroupApi";
import {
  useGetGlobalNoticesQuery,
  useGetLastViewedGlobalNoticesQuery,
  useMarkGlobalNoticesViewedMutation,
} from "../api/GlobalNoticeApi";
import { getUnreadNotices } from "./utils/groupActivity";
import { getUnreadGlobalNotices } from "./utils/globalNoticeActivity";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: groupNotices = [] } = useGetRecentNoticesQuery(undefined);
  const { data: groupLastViewedMap } = useGetAllGroupsLastViewedQuery();

  const { data: globalNotices = [] } = useGetGlobalNoticesQuery(undefined);
  const { data: globalLastViewed } = useGetLastViewedGlobalNoticesQuery();
  const [markGlobalViewed] = useMarkGlobalNoticesViewedMutation();

  const unreadGroup = getUnreadNotices(groupNotices, groupLastViewedMap);
  const unreadGlobal = getUnreadGlobalNotices(
    globalNotices,
    globalLastViewed?.lastViewedAt
  );

  const totalUnread = unreadGroup.length + unreadGlobal.length;

  const handleGroupNoticeClick = (groupId: number) => {
    setOpen(false);
    navigate(`/groups/${groupId}`);
  };

  const handleGlobalNoticeClick = () => {
    setOpen(false);
    markGlobalViewed();
    navigate("/GlobalNotices");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted">
        <Bell className="h-5 w-5" />

        {totalUnread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-3 py-2 text-sm font-medium">
          Notices{totalUnread > 0 ? ` (${totalUnread} new)` : ""}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {unreadGlobal.length === 0 && unreadGroup.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No new notices
            </p>
          ) : (
            <>
              {unreadGlobal.map((notice) => (
                <div
                  key={`global-${notice.id}`}
                  onClick={handleGlobalNoticeClick}
                  className="flex cursor-pointer items-start gap-2 border-b px-3 py-2 last:border-0 hover:bg-muted"
                >
                  <Megaphone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />

                  <div>
                    <p className="text-sm font-medium leading-tight">
                      {notice.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Announcement ·{" "}
                      {new Date(notice.postedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

              {unreadGroup.map((notice) => (
                <div
                  key={`group-${notice.id}`}
                  onClick={() => handleGroupNoticeClick(notice.groupId)}
                  className="cursor-pointer border-b px-3 py-2 last:border-0 hover:bg-muted"
                >
                  <p className="text-sm font-medium leading-tight">
                    {notice.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {notice.groupName} ·{" "}
                    {new Date(notice.postedAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}