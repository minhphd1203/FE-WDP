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
import {
  FiActivity,
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiMail,
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiShield,
  FiStar,
  FiTool,
  FiTruck,
  FiUser,
  FiUsers,
} from "react-icons/fi";

interface RescueTeamDetailDialogProps {
  team: RescueTeam | null;
  onClose: () => void;
}

export default function RescueTeamDetailDialog({
  team,
  onClose,
}: RescueTeamDetailDialogProps) {
  const displayTeamName = team?.name || team?.teamName || "-";
  const displayTeamSize = team?.teamSize ?? team?.membersCount ?? 0;
  const displayVehicles = team?.totalVehicles ?? team?.vehiclesCount ?? 0;
  const displayArea = team?.area || team?.coverageArea || "-";
  const displayLat = team?.latitude || team?.lat || "-";
  const displayLng = team?.longitude || team?.lng || "-";
  const mapLat = Number(displayLat);
  const mapLng = Number(displayLng);
  const hasValidCoordinates =
    Number.isFinite(mapLat) &&
    Number.isFinite(mapLng) &&
    Math.abs(mapLat) <= 90 &&
    Math.abs(mapLng) <= 180;
  const mapBounds = hasValidCoordinates
    ? {
        minLng: mapLng - 0.01,
        minLat: mapLat - 0.01,
        maxLng: mapLng + 0.01,
        maxLat: mapLat + 0.01,
      }
    : null;
  const embeddedMapUrl = mapBounds
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapBounds.minLng}%2C${mapBounds.minLat}%2C${mapBounds.maxLng}%2C${mapBounds.maxLat}&layer=mapnik&marker=${mapLat}%2C${mapLng}`
    : "";
  const fullMapUrl = hasValidCoordinates
    ? `https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLng}#map=16/${mapLat}/${mapLng}`
    : "";

  return (
    <Dialog open={!!team} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 bg-slate-50 p-0 shadow-2xl">
        <DialogHeader className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
          <DialogTitle className="text-2xl font-extrabold tracking-tight text-slate-900">
            Chi tiết đội cứu hộ
          </DialogTitle>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan thông tin đội, vị trí và năng lực vận hành
          </p>
        </DialogHeader>

        {team ? (
          <div className="space-y-4 p-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-2xl font-black tracking-tight text-slate-900">
                    {displayTeamName}
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4 text-slate-500" />
                      Ngày tạo: {formatDateTime(team.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold md:min-w-[360px]">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                    <FiShield className="h-4 w-4 text-slate-500" />
                    Trạng thái: {team.isActive ? "Đang hoạt động" : "Tạm khóa"}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                    <FiStar className="h-4 w-4 text-slate-500" />
                    Đánh giá: {team.rating || "0.00"}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                    <FiUsers className="h-4 w-4 text-slate-500" />
                    Thành viên: {displayTeamSize}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                    <FiTruck className="h-4 w-4 text-slate-500" />
                    Phương tiện: {displayVehicles}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                  <FiMapPin className="h-4 w-4 text-slate-600" />
                  Vị trí
                </p>
                <p className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                  <FiNavigation className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                  Căn cứ: {team.baseLocation}
                </p>
                <p className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                  <FiMapPin className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                  Phạm vi: {displayArea}
                </p>
                <p className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                  <FiNavigation className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                  Tọa độ: {displayLat}, {displayLng}
                </p>
                <p className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                  <FiMapPin className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                  Địa chỉ: {team.address}
                </p>

                {hasValidCoordinates ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <iframe
                      title={`Bản đồ vị trí ${displayTeamName}`}
                      src={embeddedMapUrl}
                      className="h-64 w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-2 text-xs">
                      <span className="text-slate-500">
                        Hiển thị theo GPS của đội
                      </span>
                      <a
                        href={fullMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-red-700 hover:underline"
                      >
                        Mở bản đồ chi tiết
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Không thể hiển thị bản đồ vì tọa độ chưa hợp lệ.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                  <FiActivity className="h-4 w-4 text-slate-600" />
                  Năng lực
                </p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <FiAlertCircle className="h-4 w-4 text-slate-500" />
                    Số nạn nhân tối đa: {team.maxVictims}
                  </p>
                  <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <FiTruck className="h-4 w-4 text-slate-500" />
                    Phương tiện: {displayVehicles}
                  </p>
                  <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <FiUsers className="h-4 w-4 text-slate-500" />
                    Thành viên: {displayTeamSize}
                  </p>
                  <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <FiPhone className="h-4 w-4 text-slate-500" />
                    Điện thoại: {team.phone}
                  </p>
                  <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <FiStar className="h-4 w-4 text-slate-500" />
                    Đánh giá: {team.rating || "0.00"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                <FiUser className="h-4 w-4 text-slate-600" />
                Tài khoản quản lý đội
              </p>
              <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 md:grid-cols-2">
                <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <FiUser className="h-4 w-4 text-slate-500" />
                  Họ tên: {team.account?.fullName || "-"}
                </p>
                <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <FiMail className="h-4 w-4 text-slate-500" />
                  Email: {team.account?.email || "-"}
                </p>
                <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <FiPhone className="h-4 w-4 text-slate-500" />
                  Số điện thoại: {team.account?.phone || team.phone || "-"}
                </p>
                <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <FiShield className="h-4 w-4 text-slate-500" />
                  Vai trò: {team.account?.role || "RESCUE_TEAM"}
                </p>
                <p className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:col-span-2">
                  <FiActivity className="h-4 w-4 text-slate-500" />
                  Trạng thái: {team.isActive ? "Đang hoạt động" : "Tạm khóa"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                <FiStar className="h-4 w-4 text-slate-600" />
                Chuyên môn
              </p>
              <div className="flex flex-wrap gap-2">
                {team.specialties.map((specialty: string, idx: number) => (
                  <span
                    key={`${team.id}-${specialty}-detail`}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      idx % 2 === 0
                        ? "border border-red-200 bg-red-50 text-red-700"
                        : "border border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    {getSpecialtyLabel(specialty)}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                <FiUsers className="h-4 w-4 text-slate-600" />
                Thành viên
              </p>
              <div className="grid grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                <span className="flex items-center gap-1">
                  <FiUser className="h-3.5 w-3.5" /> Tên
                </span>
                <span className="flex items-center gap-1">
                  <FiShield className="h-3.5 w-3.5" /> Vai trò
                </span>
                <span className="flex items-center gap-1">
                  <FiPhone className="h-3.5 w-3.5" /> Số điện thoại
                </span>
                <span className="flex items-center gap-1">
                  <FiActivity className="h-3.5 w-3.5" /> Trạng thái
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {team.members.map((member: any) => (
                  <div
                    key={member.member_id}
                    className="grid grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
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
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                  <FiTool className="h-4 w-4 text-slate-600" />
                  Thiết bị
                </p>
                <div className="space-y-1">
                  {team.equipmentList.map((item: any) => (
                    <div
                      key={item.equipment_id}
                      className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                    >
                      <span className="truncate">{item.equipment_name}</span>

                      <span>SL: {item.quantity}</span>
                      <span>{getEquipmentStatusLabel(item.status)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                  <FiTruck className="h-4 w-4 text-slate-600" />
                  Phương tiện
                </p>
                <div className="space-y-1">
                  {team.vehicles.map((vehicle: any) => (
                    <div
                      key={vehicle.vehicle_id}
                      className="grid grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
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

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-3 flex items-center gap-2 text-base font-bold text-slate-900">
                <FiClock className="h-4 w-4 text-slate-600" />
                Chỉ số nhiệm vụ
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 md:grid-cols-5">
                <p className="rounded-lg bg-slate-50 px-3 py-2">
                  Tổng: {team.missionTotal}
                </p>
                <p className="rounded-lg bg-slate-50 px-3 py-2">
                  Thành công: {team.successfulMissions}
                </p>
                <p className="rounded-lg bg-slate-50 px-3 py-2">
                  Thất bại: {team.failedMissions}
                </p>
                <p className="rounded-lg bg-slate-50 px-3 py-2">
                  Phản hồi TB: {team.responseTime}
                </p>
                <p className="rounded-lg bg-slate-50 px-3 py-2">
                  Nhiệm vụ gần nhất: {formatDateTime(team.lastMissionAt)}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100"
            onClick={onClose}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
