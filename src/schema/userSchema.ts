import { z } from 'zod';

export const createAccountSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số')
    .regex(/[@$!%*?&]/, 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt'),
  role: z.enum(['ADMIN', 'STAFF', 'USER'], {
    required_error: 'Vui lòng chọn vai trò',
  }),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên không được vượt quá 100 ký tự'),
  address: z.string().optional(),
  avatarUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

export const updateAccountSchema = z.object({
  email: z.string().email('Email không hợp lệ').optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ').optional(),
  role: z.enum(['ADMIN', 'STAFF', 'USER']).optional(),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(100, 'Họ tên không được vượt quá 100 ký tự').optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
