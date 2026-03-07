import { Edit, Ban, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Button } from "../../../../components/ui/button";
import { User } from "../types";
import { formatDateTime } from "../utils";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
}

export default function UserTable({
  users,
  onEdit,
  onToggleStatus,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border-none">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[280px] text-slate-600">Tên</TableHead>
            <TableHead className="text-center text-slate-600">
              Số điện thoại
            </TableHead>
            <TableHead className="text-center text-slate-600">
              Trạng thái
            </TableHead>
            <TableHead className="text-center text-slate-600">
              Ngày tạo
            </TableHead>
            <TableHead className="text-center text-slate-600">
              Địa chỉ
            </TableHead>
            <TableHead className="text-center text-slate-600">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user: User) => {
            const fullName =
              user.profile?.fullName || user.fullName || user.name || "";
            const phone = user.phone || user.phoneNumber || "-";
            const avatarUrl = user.profile?.avatarUrl || user.avatarUrl || "";

            return (
              <TableRow key={user.id} className="hover:bg-slate-50/80">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full border border-slate-200 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/40?text=?";
                        }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-500">
                        {(fullName || user.email || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {fullName || "Chưa cập nhật"}
                      </p>
                      <p
                        className="max-w-[150px] truncate text-xs text-slate-500"
                        title={user.email || ""}
                      >
                        {user.email || "-"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center text-slate-700">
                  <span
                    className="mx-auto block max-w-[140px] truncate"
                    title={phone}
                  >
                    {phone}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div
                    className={
                      user.isActive
                        ? "rounded-full bg-emerald-100 py-1 text-sm text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  >
                    {user.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                  </div>
                </TableCell>
                <TableCell className="text-center text-slate-700">
                  {formatDateTime(user.createdAt)}
                </TableCell>
                <TableCell className="text-center text-slate-700">
                  <span
                    className="mx-auto block max-w-[300px] truncate"
                    title={user.profile?.address || user.address || "-"}
                  >
                    {user.profile?.address || user.address || "-"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="rounded-lg hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleStatus(user.id, user.isActive)}
                      className="rounded-lg hover:bg-red-50"
                    >
                      {user.isActive ? (
                        <Ban className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
