import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự').max(200, 'Tên sản phẩm không được vượt quá 200 ký tự'),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0').or(z.string().transform(Number)),
  unit: z.string().min(1, 'Vui lòng nhập đơn vị'),
  condition: z.enum(['new', 'used', 'refurbished'], {
    required_error: 'Vui lòng chọn tình trạng sản phẩm',
  }),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  donorPhone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ').optional(),
});

export const verifyProductSchema = z.object({
  status: z.enum(['verified', 'rejected'], {
    required_error: 'Vui lòng chọn trạng thái',
  }),
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (data.status === 'rejected' && !data.rejectionReason) {
    return false;
  }
  return true;
}, {
  message: 'Vui lòng nhập lý do từ chối',
  path: ['rejectionReason'],
});

export const distributeProductSchema = z.object({
  teamId: z.string().min(1, 'Vui lòng chọn đội cứu trợ'),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0').optional().or(z.string().transform(Number)),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type VerifyProductFormData = z.infer<typeof verifyProductSchema>;
export type DistributeProductFormData = z.infer<typeof distributeProductSchema>;
