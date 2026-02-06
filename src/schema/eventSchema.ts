import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  type: z.enum(['DONATION', 'VOLUNTEER'], {
    required_error: 'Vui lòng chọn loại sự kiện',
  }),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  location: z.string().optional(),
  teamId: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const now = new Date();
  return start >= now;
}, {
  message: 'Ngày bắt đầu không được là thời điểm trong quá khứ',
  path: ['startDate'],
}).refine((data) => {
  const end = new Date(data.endDate);
  const now = new Date();
  return end >= now;
}, {
  message: 'Ngày kết thúc không được là thời điểm trong quá khứ',
  path: ['endDate'],
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
  path: ['endDate'],
});

export const updateEventSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  location: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
  path: ['endDate'],
});

export const updateEventStatusSchema = z.object({
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED', 'CANCELLED'], {
    required_error: 'Vui lòng chọn trạng thái',
  }),
});

export const registerEventSchema = z.object({
  eventId: z.string().min(1, 'ID sự kiện không hợp lệ'),
  notes: z.string().optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
export type UpdateEventStatusFormData = z.infer<typeof updateEventStatusSchema>;
export type RegisterEventFormData = z.infer<typeof registerEventSchema>;
