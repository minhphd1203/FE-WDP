export type EventType = "DONATION" | "VOLUNTEER";
export type EventStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "CANCELED"
  | "COMPLETED";

export interface EventData {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface EventsResponse {
  data: EventData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface EventFilters {
  type?: EventType;
  status?: EventStatus;
  page?: number;
  limit?: number;
}
