import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  type: z.enum(['relief_team', 'product_donation'], {
    required_error: 'Vui lòng chọn loại sự kiện',
  }),
  startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
  endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
  location: z.string().optional(),
  teamId: z.string().optional(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
  path: ['endDate'],
});

export const registerEventSchema = z.object({
  eventId: z.string().min(1, 'ID sự kiện không hợp lệ'),
  notes: z.string().optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type RegisterEventFormData = z.infer<typeof registerEventSchema>;
