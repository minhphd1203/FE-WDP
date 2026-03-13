import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { ROUTES } from "../../../constants";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div>
      <div className="mb-7 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Đăng nhập</h2>
        <p className="mt-2 text-sm text-slate-500">
          Đăng nhập vào hệ thống quản lý
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <Button
          type="submit"
          className="h-11 w-full bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-white shadow-sm transition-opacity hover:opacity-95"
          disabled={isLoading}
        >
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-slate-500">Chưa có tài khoản? </span>
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-red-700 hover:underline"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
