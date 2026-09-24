import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDispatch } from "react-redux";
import type { HubConnection } from "@microsoft/signalr";

import { createNotificationConnection } from "@/lib/signalr";
import { useGetCurrentUserQuery } from "../api/AuthApi";
import { GlobalNoticeApi } from "../api/GlobalNoticeApi";
import { GroupApi } from "../api/GroupApi";

export interface RealtimeNotification {
  id: string;
  type: "feedback" | "submission";
  title: string;
  description: string;
  groupId?: number;
  postId?: number;
  createdAt: string;
  read: boolean;
}

interface NotificationsContextValue {
  realtimeNotifications: RealtimeNotification[];
  unreadRealtimeCount: number;
  markRealtimeRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { data: user } = useGetCurrentUserQuery();
  const dispatch = useDispatch();
  const connectionRef = useRef<HubConnection | null>(null);
  const [realtimeNotifications, setRealtimeNotifications] = useState<
    RealtimeNotification[]
  >([]);

  useEffect(() => {
    if (!user?.id) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
      return;
    }

    const connection = createNotificationConnection();

    connection.on("globalNotice", () => {
      dispatch(GlobalNoticeApi.util.invalidateTags(["GlobalNotice"]));
    });

    connection.on("groupPost", (payload: { groupId: number }) => {
      dispatch(
        GroupApi.util.invalidateTags([
          { type: "Group", id: "NOTICES" },
          { type: "GroupPost", id: String(payload.groupId) },
          { type: "GroupPost", id: "MY_ASSIGNMENTS" },
        ])
      );
    });

    connection.on(
      "assignmentFeedback",
      (payload: { postId: number; groupId: number; title: string; feedback: string }) => {
        dispatch(
          GroupApi.util.invalidateTags([
            { type: "Submission", id: String(payload.postId) },
          ])
        );

        setRealtimeNotifications((prev) => [
          {
            id: `feedback-${payload.postId}-${Date.now()}`,
            type: "feedback",
            title: `Feedback on "${payload.title}"`,
            description:
              payload.feedback?.slice(0, 120) || "Your teacher left feedback.",
            groupId: payload.groupId,
            postId: payload.postId,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }
    );

    connection.on(
      "assignmentSubmission",
      (payload: {
        postId: number;
        groupId: number;
        title: string;
        studentName: string;
      }) => {
        dispatch(
          GroupApi.util.invalidateTags([
            { type: "Submission", id: String(payload.postId) },
          ])
        );

        setRealtimeNotifications((prev) => [
          {
            id: `submission-${payload.postId}-${payload.studentName}-${Date.now()}`,
            type: "submission",
            title: `New submission for "${payload.title}"`,
            description: `${payload.studentName} submitted their work.`,
            groupId: payload.groupId,
            postId: payload.postId,
            createdAt: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }
    );

    connection.start().catch(() => {
      // silent — falls back to normal query refetching on next navigation
    });

    connectionRef.current = connection;

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [user?.id, dispatch]);

  const markRealtimeRead = (id: string) => {
    setRealtimeNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadRealtimeCount = realtimeNotifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider
      value={{ realtimeNotifications, unreadRealtimeCount, markRealtimeRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// This hook is intentionally co-located with its provider and context.
// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}