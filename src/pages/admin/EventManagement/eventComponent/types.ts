export type EventStatus = "DRAFT" | "OPEN" | "CLOSED" | "CANCELLED";

export interface DeleteDialogState {
  open: boolean;
  eventId: string | null;
  eventTitle: string;
}
