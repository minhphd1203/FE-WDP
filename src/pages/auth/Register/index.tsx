import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ROUTES } from '../../../constants';

const registerSchema = z.object({
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ').optional(),
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-center">Đăng ký</h2>
        <p className="text-center text-muted-foreground mt-2">
          Tạo tài khoản mới
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Họ tên</Label>
          <Input
            id="name"
            placeholder="Nguyễn Văn A"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại (tùy chọn)</Label>
          <Input
            id="phone"
            placeholder="0123456789"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">Đã có tài khoản? </span>
        <Link to={ROUTES.LOGIN} className="text-primary hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
