import { API_ENDPOINTS } from "../constants";
import httpClient from "../lib/http";
import {
  ApiResponse,
  StaffNotificationCategory,
  StaffNotificationUnreadSummary,
} from "../types";

type MarkNotificationsReadResponse = {
  updatedCount: number;
  readAt: string;
  unreadSummary: StaffNotificationUnreadSummary;
  category: StaffNotificationCategory;
};

export const staffNotificationApi = {
  getUnreadSummary: async (): Promise<
    ApiResponse<StaffNotificationUnreadSummary>
  > => {
    return httpClient.get<ApiResponse<StaffNotificationUnreadSummary>>(
      API_ENDPOINTS.STAFF_NOTIFICATIONS_UNREAD_SUMMARY,
    );
  },

  markAsRead: async (
    category: StaffNotificationCategory,
  ): Promise<ApiResponse<MarkNotificationsReadResponse>> => {
    return httpClient.post<ApiResponse<MarkNotificationsReadResponse>>(
      API_ENDPOINTS.STAFF_NOTIFICATIONS_MARK_READ,
      { category },
    );
  },
};