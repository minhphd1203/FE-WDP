import { z } from 'zod';

export const approveDonationSchema = z.object({
  note: z.string().optional(),
});

export const rejectDonationSchema = z.object({
  reason: z.string().min(10, 'Lý do từ chối phải có ít nhất 10 ký tự'),
});

export const bulkApproveDonationsSchema = z.object({
  ids: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 donation'),
  note: z.string().optional(),
});

export const bulkRejectDonationsSchema = z.object({
  ids: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 donation'),
  reason: z.string().min(10, 'Lý do từ chối phải có ít nhất 10 ký tự'),
});

export type ApproveDonationFormData = z.infer<typeof approveDonationSchema>;
export type RejectDonationFormData = z.infer<typeof rejectDonationSchema>;
export type BulkApproveDonationsFormData = z.infer<typeof bulkApproveDonationsSchema>;
export type BulkRejectDonationsFormData = z.infer<typeof bulkRejectDonationsSchema>;
