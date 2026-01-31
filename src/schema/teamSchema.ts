import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Tên đội cứu hộ là bắt buộc').max(255, 'Tên đội cứu hộ không được quá 255 ký tự'),
  area: z.string().min(1, 'Khu vực là bắt buộc').max(500, 'Khu vực không được quá 500 ký tự'),
  teamSize: z.number().min(1, 'Quy mô đội phải ít nhất 1 người').max(1000, 'Quy mô đội không được quá 1000 người'),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1, 'Tên đội cứu hộ là bắt buộc').max(255, 'Tên đội cứu hộ không được quá 255 ký tự').optional(),
  area: z.string().min(1, 'Khu vực là bắt buộc').max(500, 'Khu vực không được quá 500 ký tự').optional(),
  teamSize: z.number().min(1, 'Quy mô đội phải ít nhất 1 người').max(1000, 'Quy mô đội không được quá 1000 người').optional(),
  isActive: z.boolean().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
