import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "./config";

export function createNotificationConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl(`${API_BASE_URL}/hubs/notifications`, {
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .build();
}