import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, UserPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useUpdateUserStatus,
} from "../../../hooks/useUser";
import {
  createAccountSchema,
  updateAccountSchema,
  CreateAccountFormData,
  UpdateAccountFormData,
} from "../../../schema/userSchema";
import {
  roleOptions,
  primaryButtonClass,
  secondaryButtonClass,
} from "./constants";
import { transformUsersToRescueTeams, getVisiblePages } from "./utils";
import { RoleFilter, User, RescueTeam } from "./types";
import RescueTeamCard from "./components/RescueTeamCard";
import RescueTeamDetailDialog from "./components/RescueTeamDetailDialog";
import UserTable from "./components/UserTable";
import CreateUserDialog from "./components/CreateUserDialog";
import EditUserDialog from "./components/EditUserDialog";

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("USER");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createAvatarFilePreview, setCreateAvatarFilePreview] = useState("");
  const [editAvatarFilePreview, setEditAvatarFilePreview] = useState("");
  const createFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [detailRescueTeam, setDetailRescueTeam] = useState<RescueTeam | null>(
    null,
  );

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    refetch: refetchUsers,
  } = useUsers({
    role: roleFilter,
    q: debouncedSearch || undefined,
    page,
    limit,
    sortBy: "createdAt",
    order: "DESC",
  });
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const updateStatusMutation = useUpdateUserStatus();

  const paginatedUsers = usersResponse?.data;
  const users = ((paginatedUsers?.data || []) as unknown as User[]).filter(
    (user: any) => user.role !== "ADMIN",
  );
  const meta = paginatedUsers?.meta;
  const totalPages = Math.max(meta?.pages || 1, 1);
  const totalItems = meta?.total || users.length;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, debouncedSearch]);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    setValue: setValueCreate,
    reset: resetCreate,
    watch: watchCreate,
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit },
    setValue: setValueEdit,
    reset: resetEdit,
    watch: watchEdit,
  } = useForm<UpdateAccountFormData>({
    resolver: zodResolver(updateAccountSchema),
  });

  const onSubmitCreate = async (data: CreateAccountFormData) => {
    try {
      await createUserMutation.mutateAsync(data);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await refetchUsers();
      setIsCreateDialogOpen(false);
      resetCreate();
      setCreateAvatarFilePreview("");
    } catch (error) {
      // Error handled in hook
    }
  };

  const onSubmitEdit = async (data: UpdateAccountFormData) => {
    if (!editingUser) return;
    try {
      await updateUserMutation.mutateAsync({ id: editingUser.id, data });
      await new Promise((resolve) => setTimeout(resolve, 300));
      await refetchUsers();
      setEditingUser(null);
      resetEdit();
      setEditAvatarFilePreview("");
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: userId,
        data: { isActive: !currentStatus },
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
      await refetchUsers();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user as any);
    const fullName = user.profile?.fullName || user.fullName || "";
    const phone = user.phone || "";
    const avatarUrl = user.profile?.avatarUrl || user.avatarUrl || "";
    const address = user.profile?.address || user.address || "";

    resetEdit({
      email: user.email || "",
      phone: phone,
      fullName: fullName,
      role: user.role as any,
      address: address,
      avatarUrl: avatarUrl,
    });
    setEditAvatarFilePreview("");
  };

  const handleCreateImagePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setCreateAvatarFilePreview(blobUrl);
    setValueCreate("avatarUrl", blobUrl, { shouldValidate: true });
  };

  const handleEditImagePick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    setEditAvatarFilePreview(blobUrl);
    setValueEdit("avatarUrl", blobUrl, { shouldValidate: true });
  };

  useEffect(() => {
    return () => {
      if (createAvatarFilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(createAvatarFilePreview);
      }
      if (editAvatarFilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(editAvatarFilePreview);
      }
    };
  }, [createAvatarFilePreview, editAvatarFilePreview]);

  const isRescueTeamView = roleFilter === "RESCUE_TEAM";
  const rescueTeams = transformUsersToRescueTeams(users);
  const visiblePages = getVisiblePages(page, totalPages);

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    resetCreate();
    setCreateAvatarFilePreview("");
  };

  const handleCloseEditDialog = () => {
    setEditingUser(null);
    resetEdit();
    setEditAvatarFilePreview("");
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Quản lý Tài khoản
          </h1>
          <p className="mt-1 text-lg text-slate-600">
            Quản lý người dùng, nhân viên và đội cứu hộ trong hệ thống
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className={`${primaryButtonClass} text-md h-11 px-6`}
        >
          <UserPlus size={18} className="mr-1" />
          Thêm tài khoản
        </Button>
      </div>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex shrink-0 gap-3">
              {roleOptions.map((option) => {
                const isActive = roleFilter === option.value;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    onClick={() => setRoleFilter(option.value)}
                    className={`min-w-[150px] rounded-xl border px-5 py-2 text-sm font-bold tracking-wide transition-all duration-200 ${
                      isActive
                        ? "border-red-600 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white shadow-[0_12px_26px_-14px_rgba(220,38,38,0.9)]"
                        : "border-red-300 bg-gradient-to-r from-red-50 to-rose-100 text-red-700 hover:border-red-400 hover:from-red-100 hover:to-rose-200"
                    }`}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-400" />
              <input
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-[400px] rounded-xl border-[1px] border-red-400 pl-10 pr-3 text-base focus:outline-red-500 focus:ring-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-none bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-4 tracking-tight text-slate-900">
            {isRescueTeamView
              ? `Danh sách đội cứu hộ (${totalItems})`
              : `Danh sách tài khoản (${totalItems})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Đang tải...</div>
          ) : users.length > 0 ? (
            isRescueTeamView ? (
              <div className="grid gap-4 md:grid-cols-2">
                {rescueTeams.map((team) => (
                  <RescueTeamCard
                    key={team.id}
                    team={team}
                    onViewDetail={setDetailRescueTeam}
                    onEdit={(team) => handleEditUser(team as any)}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            ) : (
              <UserTable
                users={users}
                onEdit={handleEditUser}
                onToggleStatus={handleToggleStatus}
              />
            )
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Không tìm thấy tài khoản nào
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Trang {page}/{totalPages}
              {isFetching && <span className="ml-2">Đang cập nhật...</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isFetching}
                className={secondaryButtonClass}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Trước
              </Button>

              {visiblePages.map((pageItem) => (
                <Button
                  key={pageItem}
                  type="button"
                  size="sm"
                  variant={pageItem === page ? "default" : "outline"}
                  onClick={() => setPage(pageItem)}
                  disabled={isFetching}
                  className={`min-w-9 rounded-xl ${pageItem === page ? primaryButtonClass : secondaryButtonClass}`}
                >
                  {pageItem}
                </Button>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page >= totalPages || isFetching}
                className={secondaryButtonClass}
              >
                Sau
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <RescueTeamDetailDialog
        team={detailRescueTeam}
        onClose={() => setDetailRescueTeam(null)}
      />

      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onSubmit={handleSubmitCreate(onSubmitCreate) as any}
        register={registerCreate}
        errors={errorsCreate}
        setValue={setValueCreate}
        watch={watchCreate}
        isLoading={createUserMutation.isPending}
        avatarFilePreview={createAvatarFilePreview}
        setAvatarFilePreview={setCreateAvatarFilePreview}
        fileInputRef={createFileInputRef}
        onImagePick={handleCreateImagePick}
      />

      <EditUserDialog
        user={editingUser}
        onClose={handleCloseEditDialog}
        onSubmit={handleSubmitEdit(onSubmitEdit) as any}
        register={registerEdit}
        errors={errorsEdit}
        setValue={setValueEdit}
        watch={watchEdit}
        isLoading={updateUserMutation.isPending}
        avatarFilePreview={editAvatarFilePreview}
        fileInputRef={editFileInputRef}
        onImagePick={handleEditImagePick}
      />
    </div>
  );
}
