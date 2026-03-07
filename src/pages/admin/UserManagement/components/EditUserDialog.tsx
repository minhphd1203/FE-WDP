import { type ChangeEvent, type RefObject } from "react";
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import {
  Edit,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  User,
  Shield,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { UpdateAccountFormData } from "../../../../schema/userSchema";
import { User as UserType } from "../types";

interface EditUserDialogProps {
  user: UserType | null;
  onClose: () => void;
  onSubmit: () => void;
  register: UseFormRegister<UpdateAccountFormData>;
  errors: FieldErrors<UpdateAccountFormData>;
  setValue: UseFormSetValue<UpdateAccountFormData>;
  watch: UseFormWatch<UpdateAccountFormData>;
  isLoading: boolean;
  avatarFilePreview: string;
  fileInputRef: RefObject<HTMLInputElement>;
  onImagePick: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function EditUserDialog({
  user,
  onClose,
  onSubmit,
  register,
  errors,
  setValue,
  watch,
  isLoading,
  avatarFilePreview,
  fileInputRef,
  onImagePick,
}: EditUserDialogProps) {
  const avatarPreview = watch("avatarUrl");

  return (
    <Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl border-2 bg-gradient-to-br from-white to-red-50/30">
        <DialogHeader className="border-b border-red-100 pb-4">
          <div className="flex items-center gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/50">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Chỉnh sửa tài khoản
              </DialogTitle>
              <p className="mt-1 text-sm text-slate-500">
                Cập nhật thông tin tài khoản
              </p>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3 pt-4">
          <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <User className="h-4 w-4 text-red-600" />
              Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-fullName"
                  className="text-sm font-medium text-slate-700"
                >
                  Họ tên
                </Label>
                <input
                  id="edit-fullName"
                  className="h-11 w-full rounded-xl border-[1px] border-red-400 px-3 text-base focus:ring-0 focus:outline-red-500"
                  placeholder="Nhập họ tên đầy đủ"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-role"
                  className="text-sm font-medium text-slate-700"
                >
                  Vai trò
                </Label>
                <Select
                  value={watch("role") || user?.role}
                  onValueChange={(value) => setValue("role", value as any)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-2 border-red-200 bg-white transition-all focus:ring-2 focus:ring-red-500/20">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="USER" className="rounded-lg">
                      👤 Người dùng
                    </SelectItem>
                    <SelectItem value="STAFF" className="rounded-lg">
                      👔 Nhân viên
                    </SelectItem>
                    <SelectItem value="RESCUE_TEAM" className="rounded-lg">
                      🚑 Đội cứu hộ
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Shield className="h-4 w-4 text-red-600" />
              Thông tin liên hệ
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-email"
                    className="text-sm font-medium text-slate-700"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
                    <input
                      id="edit-email"
                      type="email"
                      className="h-11 w-full rounded-xl border-[1px] border-red-400 pl-10 pr-3 text-base focus:ring-0 focus:outline-red-500"
                      placeholder="example@email.com"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-phone"
                    className="text-sm font-medium text-slate-700"
                  >
                    Số điện thoại
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
                    <input
                      id="edit-phone"
                      className="h-11 w-full rounded-xl border-[1px] border-red-400 pl-10 pr-3 text-base focus:ring-0 focus:outline-red-500"
                      placeholder="0901234567"
                      {...register("phone")}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-address"
                  className="text-sm font-medium text-slate-700"
                >
                  Địa chỉ
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-red-400" />
                  <Textarea
                    id="edit-address"
                    className="min-h-[80px] resize-none rounded-xl border-2 border-red-200 bg-white pl-10 transition-all focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20"
                    placeholder="Nhập địa chỉ chi tiết"
                    {...register("address")}
                    rows={2}
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ImageIcon className="h-4 w-4 text-red-600" />
              Avatar
            </h3>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 space-y-3">
                <Label
                  htmlFor="edit-avatarUrl"
                  className="text-sm font-medium text-slate-700"
                >
                  URL ảnh đại diện
                </Label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
                  <input
                    id="edit-avatarUrl"
                    className="h-11 w-full rounded-xl border-[1px] border-red-400 pl-10 pr-3 text-base focus:ring-0 focus:outline-red-500"
                    placeholder="https://example.com/avatar.jpg"
                    {...register("avatarUrl")}
                  />
                </div>
                {errors.avatarUrl && (
                  <p className="text-sm text-red-600">
                    {errors.avatarUrl.message}
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImagePick}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl border-2 border-red-200 bg-white text-red-600 transition-all hover:border-red-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Chọn ảnh từ máy tính
                </Button>
              </div>
              {avatarFilePreview || avatarPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Xem trước
                  </Label>
                  <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-red-200 shadow-lg">
                    <img
                      src={avatarFilePreview || avatarPreview}
                      alt="Avatar preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Xem trước
                  </Label>
                  <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-dashed border-red-200 bg-red-50/50">
                    <ImageIcon className="h-12 w-12 text-red-300" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="gap-3 border-t border-red-100 pt-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl border-2 border-red-200 bg-white text-red-600 transition-all hover:border-red-400 sm:flex-none sm:px-8"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-11 flex-1 rounded-xl border-2 border-red-600 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 px-8 text-white shadow-lg shadow-red-500/50 transition-all hover:from-red-500 hover:to-rose-600 disabled:opacity-50 sm:flex-none"
            >
              {isLoading ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Cập nhật
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
