import { z } from 'zod';

export const createReliefRequestSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
  description: z.string().min(20, 'Mô tả phải có ít nhất 20 ký tự'),
  requesterPhone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  location: z.object({
    address: z.string().min(10, 'Địa chỉ phải có ít nhất 10 ký tự'),
    district: z.string().optional(),
    city: z.string().optional(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }).optional(),
  }),
  urgency: z.enum(['low', 'medium', 'high', 'critical'], {
    required_error: 'Vui lòng chọn mức độ khẩn cấp',
  }),
  images: z.array(z.string()).optional(),
});

export const assignTeamSchema = z.object({
  teamId: z.string().min(1, 'Vui lòng chọn đội cứu trợ'),
  notes: z.string().optional(),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(['approved', 'in_progress', 'completed', 'rejected'], {
    required_error: 'Vui lòng chọn trạng thái',
  }),
  notes: z.string().optional(),
});

export type CreateReliefRequestFormData = z.infer<typeof createReliefRequestSchema>;
export type AssignTeamFormData = z.infer<typeof assignTeamSchema>;
export type UpdateRequestStatusFormData = z.infer<typeof updateRequestStatusSchema>;
