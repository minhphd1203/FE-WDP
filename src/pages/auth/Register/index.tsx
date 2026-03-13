import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ROUTES } from "../../../constants";

const registerSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^[0-9]{10,11}$/.test(value), {
      message: "Số điện thoại không hợp lệ",
    }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const { register: registerUser, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data);
  };

  return (
    <div>
      <div className="mb-7 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Đăng ký</h2>
        <p className="mt-2 text-sm text-slate-500">Tạo tài khoản mới</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700">
            Họ tên
          </Label>
          <Input
            id="name"
            placeholder="Nguyễn Văn A"
            className="h-11 border-red-200 placeholder:text-slate-400 focus-visible:border-red-400 focus-visible:ring-red-500"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            className="h-11 border-red-200 placeholder:text-slate-400 focus-visible:border-red-400 focus-visible:ring-red-500"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700">
            Mật khẩu
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="h-11 border-red-200 placeholder:text-slate-400 focus-visible:border-red-400 focus-visible:ring-red-500"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-700">
            Số điện thoại (tùy chọn)
          </Label>
          <Input
            id="phone"
            placeholder="0123456789"
            className="h-11 border-red-200 placeholder:text-slate-400 focus-visible:border-red-400 focus-visible:ring-red-500"
            {...register("phone")}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-sm transition-opacity hover:opacity-95"
          disabled={isLoading}
        >
          {isLoading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-slate-500">Đã có tài khoản? </span>
        <Link
          to={ROUTES.LOGIN}
          className="font-medium text-red-700 hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
