import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { useGetRecentNoticesQuery } from "../api/GroupApi";
import { getUnreadNotices } from "./utils/groupActivity";

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: notices = [] } = useGetRecentNoticesQuery();

  const unread = getUnreadNotices(notices);

  const handleNoticeClick = (groupId: number) => {
    setOpen(false);
    navigate(`/groups/${groupId}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted">
        <Bell className="h-5 w-5" />

        {unread.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-3 py-2 text-sm font-medium">
          Notices{unread.length > 0 ? ` (${unread.length} new)` : ""}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {unread.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No new notices
            </p>
          ) : (
            unread.map((notice) => (
              <div
                key={notice.id}
                onClick={() => handleNoticeClick(notice.groupId)}
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
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}