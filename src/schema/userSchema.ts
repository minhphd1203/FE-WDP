import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên không được vượt quá 100 ký tự'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ').optional(),
  role: z.enum(['admin', 'staff', 'user']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(100, 'Tên không được vượt quá 100 ký tự').optional(),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ').optional(),
  role: z.enum(['admin', 'staff', 'user']).optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
