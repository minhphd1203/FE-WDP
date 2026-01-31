import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, UserPlus, Edit, Trash2, Ban, CheckCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { 
  useUsers, 
  useCreateUser, 
  useUpdateUser, 
  useDeleteUser,
  useUpdateUserStatus 
} from '../../../hooks/useUser';
import { createAccountSchema, updateAccountSchema, CreateAccountFormData, UpdateAccountFormData } from '../../../schema/userSchema';

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    userId: string | null;
    userName: string;
  }>({
    open: false,
    userId: null,
    userName: '',
  });

  const { data: usersResponse, isLoading } = useUsers({
    search: searchQuery,
    role: roleFilter === 'all' ? undefined : roleFilter,
  });
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();

  const users = usersResponse?.data?.items || usersResponse?.data?.data || usersResponse?.data || [];

  // Form for create user
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    setValue: setValueCreate,
    reset: resetCreate,
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  });

  // Form for edit user
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    setValue: setValueEdit,
    reset: resetEdit,
  } = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
  });

  const onSubmitCreate = async (data: CreateAccountFormData) => {
    try {
      await createUserMutation.mutateAsync(data);
      setIsCreateDialogOpen(false);
      resetCreate();
    } catch (error) {
      // Error handled in hook
    }
  };

  const onSubmitEdit = async (data: UpdateAccountFormData) => {
    if (!editingUser) return;
    try {
      await updateUserMutation.mutateAsync({ id: editingUser.id, data });
      setEditingUser(null);
      resetEdit();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.userId) return;
    try {
      await deleteUserMutation.mutateAsync(deleteDialog.userId);
      setDeleteDialog({ open: false, userId: null, userName: '' });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({ 
        id: userId, 
        data: { isActive: !currentStatus } 
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setValueEdit('email', user.email);
    setValueEdit('phone', user.phone);
    setValueEdit('fullName', user.fullName || user.name);
    setValueEdit('role', user.role);
    setValueEdit('address', user.address || '');
    setValueEdit('avatarUrl', user.avatarUrl || '');
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      ADMIN: 'bg-red-100 text-red-800',
      STAFF: 'bg-blue-100 text-blue-800',
      USER: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      STAFF: 'Staff',
      USER: 'User',
    };
    return <Badge className={variants[role] || variants.USER}>{labels[role] || role}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tài khoản</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý Admin, Staff và User trong hệ thống
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm tài khoản
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc theo vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="STAFF">Staff</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách tài khoản ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : users.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Địa chỉ</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName || user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{user.address || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                          >
                            {user.isActive ? (
                              <Ban className="h-4 w-4 text-orange-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                userId: user.id,
                                userName: user.fullName || user.name,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy tài khoản nào
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Thêm tài khoản mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ tên *</Label>
                <Input id="fullName" {...registerCreate('fullName')} />
                {errorsCreate.fullName && (
                  <p className="text-sm text-red-500">{errorsCreate.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Vai trò *</Label>
                <Select onValueChange={(value) => setValueCreate('role', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errorsCreate.role && (
                  <p className="text-sm text-red-500">{errorsCreate.role.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...registerCreate('email')} />
                {errorsCreate.email && (
                  <p className="text-sm text-red-500">{errorsCreate.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input id="phone" {...registerCreate('phone')} placeholder="0901234567" />
                {errorsCreate.phone && (
                  <p className="text-sm text-red-500">{errorsCreate.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <Input id="password" type="password" {...registerCreate('password')} placeholder="Ít nhất 8 ký tự, 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt" />
              {errorsCreate.password && (
                <p className="text-sm text-red-500">{errorsCreate.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Textarea id="address" {...registerCreate('address')} rows={2} />
              {errorsCreate.address && (
                <p className="text-sm text-red-500">{errorsCreate.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">URL Avatar</Label>
              <Input id="avatarUrl" {...registerCreate('avatarUrl')} placeholder="https://example.com/avatar.jpg" />
              {errorsCreate.avatarUrl && (
                <p className="text-sm text-red-500">{errorsCreate.avatarUrl.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetCreate();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tài khoản</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-fullName">Họ tên</Label>
                <Input id="edit-fullName" {...registerEdit('fullName')} />
                {errorsEdit.fullName && (
                  <p className="text-sm text-red-500">{errorsEdit.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Vai trò</Label>
                <Select 
                  value={editingUser?.role} 
                  onValueChange={(value) => setValueEdit('role', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errorsEdit.role && (
                  <p className="text-sm text-red-500">{errorsEdit.role.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" {...registerEdit('email')} />
                {errorsEdit.email && (
                  <p className="text-sm text-red-500">{errorsEdit.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Số điện thoại</Label>
                <Input id="edit-phone" {...registerEdit('phone')} />
                {errorsEdit.phone && (
                  <p className="text-sm text-red-500">{errorsEdit.phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Địa chỉ</Label>
              <Textarea id="edit-address" {...registerEdit('address')} rows={2} />
              {errorsEdit.address && (
                <p className="text-sm text-red-500">{errorsEdit.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-avatarUrl">URL Avatar</Label>
              <Input id="edit-avatarUrl" {...registerEdit('avatarUrl')} />
              {errorsEdit.avatarUrl && (
                <p className="text-sm text-red-500">{errorsEdit.avatarUrl.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingUser(null);
                  resetEdit();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => 
        setDeleteDialog({ ...deleteDialog, open })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa tài khoản</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản "{deleteDialog.userName}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, userId: null, userName: '' })}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
