import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../service/auth/api";
import { CurrentUserData } from "../../../types/auth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ROUTES } from "../../../constants";
import { toast } from "sonner";

const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .regex(/^0\d{9,10}$/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  avatarUrl: z
    .string()
    .url("URL ảnh không hợp lệ")
    .optional()
    .or(z.literal("")),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export default function UpdateProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<CurrentUserData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (response.success) {
          setUserData(response.data);
          const phoneValue = response.data.phone || (response.data.profile?.phone as string | undefined);
          reset({
            fullName: response.data.fullName,
            phone: phoneValue,
            address: response.data.address || (response.data.profile?.address as string | undefined),
            avatarUrl: response.data.profile?.avatarUrl as string | undefined,
          });
        }
      } catch (error) {
        toast.error("Không thể tải thông tin tài khoản");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [reset]);

  const onSubmit = async (data: UpdateProfileFormData) => {
    setIsSaving(true);

    try {
      const updateData = {
        fullName: data.fullName || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        avatarUrl: data.avatarUrl || undefined,
      };

      const response = await authService.updateProfile(updateData);

      if (response.success) {
        toast.success("Cập nhật thông tin thành công!");
        setUserData(response.data);
        navigate(ROUTES.STAFF_DASHBOARD);
      } else {
        toast.error(response.message || "Cập nhật thông tin thất bại");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cập nhật thông tin thất bại";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(ROUTES.STAFF_DASHBOARD)}
            className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Cập nhật thông tin
          </h1>
          <p className="text-gray-500 mt-2">
            Cập nhật thông tin cá nhân của bạn
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0901234567"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                type="text"
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
                {...register("address")}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl">URL ảnh đại diện</Label>
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                {...register("avatarUrl")}
              />
              {errors.avatarUrl && (
                <p className="text-sm text-red-500">
                  {errors.avatarUrl.message}
                </p>
              )}
            </div>

            {/* Current Email (Read-only) */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="px-3 py-2 border rounded-md bg-gray-50 text-gray-600">
                {userData?.email}
              </div>
              <p className="text-xs text-gray-500">Email không thể thay đổi</p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.STAFF_DASHBOARD)}
                disabled={isSaving}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
