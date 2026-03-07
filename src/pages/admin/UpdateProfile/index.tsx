import { useEffect, useState } from "react";
import { UserCog, Save, Loader2 } from "lucide-react";
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      await authService.updateProfile({
        fullName: formData.fullName?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        avatarUrl: formData.avatarUrl?.trim() || undefined,
      });
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
              <Label htmlFor="avatarUrl">URL Avatar</Label>
              <input
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl || ""}
                onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-red-300 px-3 text-base focus:outline-red-500"
                placeholder="https://example.com/avatar.jpg"
              />
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
