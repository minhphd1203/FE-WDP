import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  UserCog,
  Save,
  Loader2,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { authService } from "../../../service/auth/api";
import { CurrentUserData, UpdateProfileRequest } from "../../../types/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";

export default function UpdateProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await authService.getCurrentUser();
        if (response.success) {
          const user = response.data;
          setCurrentUser(user);
          setFormData({
            fullName: user.fullName || user.profile?.fullName || "",
            phone: user.phone || user.profile?.phone || "",
            address: user.address || user.profile?.address || "",
            avatarUrl: user.profile?.avatarUrl || "",
          });
          setAvatarPreview(user.profile?.avatarUrl || "");
        }
      } catch (error) {
        toast.error("Không thể tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    void fetchCurrentUser();
  }, []);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    const blobUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(blobUrl);
    setFormData((prev) => ({ ...prev, avatarUrl: "" }));
  };

  const handleRemoveSelectedAvatar = () => {
    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(null);
    setAvatarPreview(currentUser?.profile?.avatarUrl || "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = new FormData();

      if (formData.fullName?.trim()) {
        payload.append("fullName", formData.fullName.trim());
      }
      if (formData.phone?.trim()) {
        payload.append("phone", formData.phone.trim());
      }
      if (formData.address?.trim()) {
        payload.append("address", formData.address.trim());
      }
      if (formData.avatarUrl?.trim()) {
        payload.append("avatarUrl", formData.avatarUrl.trim());
      }
      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      const response = await authService.updateProfile(payload);

      if (response.success) {
        setCurrentUser(response.data);
        setFormData({
          fullName:
            response.data.fullName || response.data.profile?.fullName || "",
          phone: response.data.phone || response.data.profile?.phone || "",
          address:
            response.data.address || response.data.profile?.address || "",
          avatarUrl: response.data.profile?.avatarUrl || "",
        });
        setAvatarFile(null);
        if (avatarPreview.startsWith("blob:")) {
          URL.revokeObjectURL(avatarPreview);
        }
        setAvatarPreview(response.data.profile?.avatarUrl || "");
      }

      toast.success("Cập nhật hồ sơ thành công");
    } catch (error) {
      toast.error("Cập nhật hồ sơ thất bại");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex items-center gap-2 text-red-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải thông tin hồ sơ...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-red-50/30 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Hồ sơ cá nhân Admin
        </h1>
        <p className="mt-1 text-base text-slate-600">
          Cập nhật thông tin cá nhân của bạn
        </p>
      </div>

      <Card className="rounded-2xl border-red-100 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <UserCog className="h-5 w-5 text-red-600" />
            Thông tin tài khoản
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ tên</Label>
                <input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName || ""}
                  onChange={handleInputChange}
                  className="h-11 w-full rounded-xl border border-red-300 px-3 text-base focus:outline-red-500"
                  placeholder="Nhập họ tên"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="h-11 w-full rounded-xl border border-red-300 px-3 text-base focus:outline-red-500"
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <textarea
                id="address"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                rows={3}
                className="w-full resize-none rounded-xl border border-red-300 px-3 py-2 text-base focus:outline-red-500"
                placeholder="Nhập địa chỉ"
              />
            </div>

            <div className="space-y-2">
              <Label>Ảnh đại diện</Label>
              <div className="rounded-2xl border border-red-100 bg-red-50/30 p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex items-center justify-center">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-red-200 bg-white shadow-sm">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-10 w-10 text-red-300" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Chọn ảnh từ máy tính
                      </p>
                      <p className="text-sm text-slate-500">
                        Ảnh sẽ được hiển thị xem trước trước khi lưu.
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarPick}
                    />

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Chọn ảnh
                      </Button>

                      {avatarFile ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-11 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                          onClick={handleRemoveSelectedAvatar}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Bỏ ảnh đã chọn
                        </Button>
                      ) : null}
                    </div>

                    {!avatarFile && formData.avatarUrl ? (
                      <p className="text-xs text-slate-500">
                        Đang dùng ảnh hiện tại của tài khoản.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/40 px-4 py-3 text-sm">
              <div>
                <p className="font-medium text-slate-800">
                  Tài khoản đăng nhập
                </p>
                <p className="text-slate-600">{currentUser?.email || "-"}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-800">Vai trò</p>
                <p className="text-slate-600">{currentUser?.role || "-"}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="h-11 rounded-xl border border-red-700 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 px-6 text-white hover:from-red-500 hover:to-rose-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
