import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { RescueTeam } from "../types";
import { formatDateTime } from "../utils";
import {
  getMemberRoleLabel,
  getMemberStatusLabel,
  getEquipmentStatusLabel,
  getVehicleStatusLabel,
  getSpecialtyLabel,
} from "../constants";

interface RescueTeamDetailDialogProps {
  team: RescueTeam | null;
  onClose: () => void;
}

export default function RescueTeamDetailDialog({
  team,
  onClose,
}: RescueTeamDetailDialogProps) {
  return (
    <Dialog open={!!team} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl border-2 bg-gradient-to-br from-white to-red-50/30">
        <DialogHeader className="border-b border-red-100 pb-4">
          <DialogTitle className="text-2xl font-bold text-slate-900">
            Chi tiết đội cứu hộ
          </DialogTitle>
        </DialogHeader>

        {team ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-2xl border border-red-100 bg-white p-4">
              <p className="text-xl font-bold text-slate-900">
                {team.teamName}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {team.teamCode} • {team.teamId}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Ngày tạo: {formatDateTime(team.createdAt)}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 font-semibold text-slate-800">Vị trí</p>
                <p className="text-sm text-slate-600">
                  Căn cứ: {team.baseLocation}
                </p>
                <p className="text-sm text-slate-600">
                  Phạm vi: {team.coverageArea}
                </p>
                <p className="text-sm text-slate-600">
                  Tọa độ: {team.lat}, {team.lng}
                </p>
                <p className="text-sm text-slate-600">
                  Địa chỉ: {team.address}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 font-semibold text-slate-800">Năng lực</p>
                <p className="text-sm text-slate-600">
                  Số nạn nhân tối đa: {team.maxVictims}
                </p>
                <p className="text-sm text-slate-600">
                  Phương tiện: {team.vehiclesCount}
                </p>
                <p className="text-sm text-slate-600">
                  Thành viên: {team.membersCount}
                </p>
                <p className="text-sm text-slate-600">
                  Điện thoại: {team.phone}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-2 font-semibold text-slate-800">Chuyên môn</p>
              <div className="flex flex-wrap gap-2">
                {team.specialties.map((specialty: string) => (
                  <span
                    key={`${team.id}-${specialty}-detail`}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
                  >
                    {getSpecialtyLabel(specialty)}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-2 font-semibold text-slate-800">Thành viên</p>
              <div className="space-y-1">
                {team.members.map((member: any) => (
                  <div
                    key={member.member_id}
                    className="grid grid-cols-4 gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-700"
                  >
                    <span className="truncate">{member.full_name}</span>
                    <span className="truncate">
                      {getMemberRoleLabel(member.role)}
                    </span>
                    <span className="truncate">{member.phone}</span>
                    <span className="truncate">
                      {getMemberStatusLabel(member.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 font-semibold text-slate-800">Thiết bị</p>
                <div className="space-y-1">
                  {team.equipmentList.map((item: any) => (
                    <div
                      key={item.equipment_id}
                      className="grid grid-cols-4 gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-700"
                    >
                      <span className="truncate">{item.equipment_name}</span>
                      <span>Mã: {item.equipment_id}</span>
                      <span>SL: {item.quantity}</span>
                      <span>{getEquipmentStatusLabel(item.status)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 font-semibold text-slate-800">Phương tiện</p>
                <div className="space-y-1">
                  {team.vehicles.map((vehicle: any) => (
                    <div
                      key={vehicle.vehicle_id}
                      className="grid grid-cols-4 gap-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-700"
                    >
                      <span className="truncate">{vehicle.vehicle_type}</span>
                      <span>{vehicle.plate_number}</span>
                      <span>Sức chứa: {vehicle.capacity}</span>
                      <span>{getVehicleStatusLabel(vehicle.status)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-2 font-semibold text-slate-800">
                Chỉ số nhiệm vụ
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 md:grid-cols-3">
                <p>Tổng: {team.missionTotal}</p>
                <p>Thành công: {team.successfulMissions}</p>
                <p>Thất bại: {team.failedMissions}</p>
                <p>Tỷ lệ thành công: {team.successRate}%</p>
                <p>Phản hồi TB: {team.responseTime}</p>
                <p>Nhiệm vụ gần nhất: {formatDateTime(team.lastMissionAt)}</p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="border-t border-red-100 pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
            onClick={onClose}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
