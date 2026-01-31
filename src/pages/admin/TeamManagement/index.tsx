import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from '../../../hooks/useTeam';
import { createTeamSchema, updateTeamSchema, CreateTeamInput, UpdateTeamInput } from '../../../schema/teamSchema';
import { Team } from '../../../apis/teamApi';

export default function TeamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Fetch teams
  const { data: teamsData, isLoading } = useTeams({
    search: searchTerm || undefined,
    isActive: isActiveFilter,
  });

  // Mutations
  const createTeamMutation = useCreateTeam();
  const updateTeamMutation = useUpdateTeam();
  const deleteTeamMutation = useDeleteTeam();

  // Create form
  const createForm = useForm<CreateTeamInput>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      area: '',
      teamSize: 1,
    },
  });

  // Edit form
  const editForm = useForm<UpdateTeamInput>({
    resolver: zodResolver(updateTeamSchema),
  });

  // Handle create
  const handleCreate = async (data: CreateTeamInput) => {
    await createTeamMutation.mutateAsync(data);
    setIsCreateDialogOpen(false);
    createForm.reset();
  };

  // Handle edit
  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    editForm.reset({
      name: team.name,
      area: team.area,
      teamSize: team.teamSize,
      isActive: team.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (data: UpdateTeamInput) => {
    if (!selectedTeam) return;
    await updateTeamMutation.mutateAsync({ id: selectedTeam.id, data });
    setIsEditDialogOpen(false);
    setSelectedTeam(null);
    editForm.reset();
  };

  // Handle delete
  const handleDelete = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedTeam) return;
    await deleteTeamMutation.mutateAsync(selectedTeam.id);
    setIsDeleteDialogOpen(false);
    setSelectedTeam(null);
  };

  // Handle status toggle
  const handleToggleStatus = async (team: Team) => {
    await updateTeamMutation.mutateAsync({
      id: team.id,
      data: { isActive: !team.isActive },
    });
  };

  const teams = teamsData?.items || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Đội Cứu Hộ</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo Đội Cứu Hộ
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc khu vực..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <select
            value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              setIsActiveFilter(value === 'all' ? undefined : value === 'active');
            }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      {/* Teams Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên đội</TableHead>
              <TableHead>Khu vực</TableHead>
              <TableHead>Quy mô</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : teams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Không tìm thấy đội cứu hộ nào
                </TableCell>
              </TableRow>
            ) : (
              teams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.area}</TableCell>
                  <TableCell>{team.teamSize} người</TableCell>
                  <TableCell>
                    <Badge
                      variant={team.isActive ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleToggleStatus(team)}
                    >
                      {team.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(team.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(team)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(team)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Đội Cứu Hộ Mới</DialogTitle>
            <DialogDescription>
              Điền thông tin để tạo đội cứu hộ mới
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreate)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Tên đội cứu hộ *</Label>
                <Input
                  id="create-name"
                  {...createForm.register('name')}
                  placeholder="Ví dụ: Đội cứu hộ Quận 1"
                />
                {createForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-area">Khu vực phụ trách *</Label>
                <Input
                  id="create-area"
                  {...createForm.register('area')}
                  placeholder="Ví dụ: Quận 1, TP.HCM"
                />
                {createForm.formState.errors.area && (
                  <p className="text-sm text-red-500">
                    {createForm.formState.errors.area.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-teamSize">Quy mô đội *</Label>
                <Input
                  id="create-teamSize"
                  type="number"
                  min="1"
                  {...createForm.register('teamSize', { valueAsNumber: true })}
                  placeholder="Ví dụ: 10"
                />
                {createForm.formState.errors.teamSize && (
                  <p className="text-sm text-red-500">
                    {createForm.formState.errors.teamSize.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  createForm.reset();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending ? 'Đang tạo...' : 'Tạo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Đội Cứu Hộ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin đội cứu hộ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleUpdate)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tên đội cứu hộ</Label>
                <Input
                  id="edit-name"
                  {...editForm.register('name')}
                  placeholder="Ví dụ: Đội cứu hộ Quận 1"
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-area">Khu vực phụ trách</Label>
                <Input
                  id="edit-area"
                  {...editForm.register('area')}
                  placeholder="Ví dụ: Quận 1, Quận 2, TP.HCM"
                />
                {editForm.formState.errors.area && (
                  <p className="text-sm text-red-500">
                    {editForm.formState.errors.area.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-teamSize">Quy mô đội</Label>
                <Input
                  id="edit-teamSize"
                  type="number"
                  min="1"
                  {...editForm.register('teamSize', { valueAsNumber: true })}
                  placeholder="Ví dụ: 12"
                />
                {editForm.formState.errors.teamSize && (
                  <p className="text-sm text-red-500">
                    {editForm.formState.errors.teamSize.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-isActive" className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    {...editForm.register('isActive')}
                    className="h-4 w-4"
                  />
                  Đang hoạt động
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTeam(null);
                  editForm.reset();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateTeamMutation.isPending}>
                {updateTeamMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa đội cứu hộ "{selectedTeam?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedTeam(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteTeamMutation.isPending}
            >
              {deleteTeamMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
