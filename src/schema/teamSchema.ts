import { z } from "zod";

const teamEquipmentSchema = z.object({
  equipmentName: z.string().min(1, "Tên thiết bị là bắt buộc"),
  quantity: z.number().int().min(0, "Số lượng không hợp lệ"),
  status: z.string().min(1, "Trạng thái thiết bị là bắt buộc"),
});

const teamVehicleSchema = z.object({
  vehicleTypeCode: z.string().min(1, "Loại phương tiện là bắt buộc"),
  plateNumber: z.string().min(1, "Biển số là bắt buộc"),
  capacity: z.number().int().min(1, "Sức chứa phải lớn hơn 0"),
  status: z.string().min(1, "Trạng thái phương tiện là bắt buộc"),
});

export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Tên đội cứu hộ là bắt buộc")
    .max(255, "Tên đội cứu hộ không được quá 255 ký tự"),
  area: z
    .string()
    .min(1, "Khu vực là bắt buộc")
    .max(500, "Khu vực không được quá 500 ký tự"),
  teamSize: z
    .number()
    .min(1, "Quy mô đội phải ít nhất 1 người")
    .max(1000, "Quy mô đội không được quá 1000 người"),
  baseLocation: z
    .string()
    .max(500, "Vị trí căn cứ không được quá 500 ký tự")
    .optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rating: z.number().min(0).max(5).optional(),
  specialties: z.array(z.string()).optional(),
  equipmentList: z.array(teamEquipmentSchema).optional(),
  vehicles: z.array(teamVehicleSchema).optional(),
  accountEmail: z.string().email("Email không hợp lệ").optional(),
  accountPassword: z.string().min(8, "Mật khẩu ít nhất 8 ký tự").optional(),
  accountFullName: z
    .string()
    .min(1, "Tên tài khoản là bắt buộc")
    .max(100)
    .optional(),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .min(1, "Tên đội cứu hộ là bắt buộc")
    .max(255, "Tên đội cứu hộ không được quá 255 ký tự")
    .optional(),
  area: z
    .string()
    .min(1, "Khu vực là bắt buộc")
    .max(500, "Khu vực không được quá 500 ký tự")
    .optional(),
  teamSize: z
    .number()
    .min(1, "Quy mô đội phải ít nhất 1 người")
    .max(1000, "Quy mô đội không được quá 1000 người")
    .optional(),
  baseLocation: z
    .string()
    .max(500, "Vị trí căn cứ không được quá 500 ký tự")
    .optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rating: z.number().min(0).max(5).optional(),
  specialties: z.array(z.string()).optional(),
  equipmentList: z.array(teamEquipmentSchema).optional(),
  vehicles: z.array(teamVehicleSchema).optional(),
  accountEmail: z.string().email("Email không hợp lệ").optional(),
  accountPassword: z.string().min(8, "Mật khẩu ít nhất 8 ký tự").optional(),
  accountFullName: z
    .string()
    .min(1, "Tên tài khoản là bắt buộc")
    .max(100)
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
