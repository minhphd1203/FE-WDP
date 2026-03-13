import {
  Eye,
  Ban,
  CheckCircle,
  MapPin,
  Star,
  Users,
  Truck,
} from "lucide-react";
import { RescueTeam } from "../types";
import { formatDateTime } from "../utils";
import { getRescueStatusLabel, getSpecialtyLabel } from "../constants";

interface RescueTeamCardProps {
  team: RescueTeam;
  onViewDetail: (team: RescueTeam) => void;
  onEdit: (team: RescueTeam) => void;
  onToggleStatus: (teamId: string, currentStatus: boolean) => void;
}

export default function RescueTeamCard({
  team,
  onViewDetail,
  onToggleStatus,
}: RescueTeamCardProps) {
  const displayTeamName = team.name || team.teamName;
  const displayTeamSize = team.teamSize ?? team.membersCount;
  const displayVehicles = team.totalVehicles ?? team.vehiclesCount;

  return (
    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-900">{displayTeamName}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            team.status === "available"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {getRescueStatusLabel(team.status)}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-600">
        Ngày tạo: {formatDateTime(team.createdAt)}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-red-500" />
            <p className="text-xs text-slate-500">Thành viên</p>
          </div>

          <p className="text-xl font-bold text-slate-900">{displayTeamSize}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-red-500" />
            <p className="text-xs text-slate-500">Phương tiện</p>
          </div>
          <p className="text-xl font-bold text-slate-900">{displayVehicles}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
        <MapPin className="h-4 w-4 text-red-500" />
        <span className="truncate" title={team.baseLocation || team.address}>
          {team.baseLocation || team.address}
        </span>
        <Star className="ml-auto h-4 w-4 text-amber-500" />
        <span className="font-semibold text-slate-800">{team.rating}</span>
      </div>

      <div className="mt-2 space-y-1 text-xs text-slate-600">
        <p>
          Khu vực:{" "}
          <span className="font-medium text-slate-800">
            {team.area || team.coverageArea || "-"}
          </span>
        </p>

        <p>
          Trưởng nhóm:{" "}
          <span className="font-medium text-slate-800">
            {team.account?.fullName || "-"}
          </span>
        </p>
      </div>

      {team.specialties.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {team.specialties.map((specialty: string) => (
            <span
              key={`${team.id}-${specialty}`}
              className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700"
            >
              {getSpecialtyLabel(specialty)}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex justify-end gap-3">
        <div
          onClick={() => onViewDetail(team)}
          className="rounded-lg hover:bg-slate-100 p-3 border border-slate-200 text-slate-600 cursor-pointer"
          title="Chi tiết"
        >
          <Eye size={16} />
        </div>

        <div
          onClick={() => onToggleStatus(team.teamId || team.id, team.isActive)}
          className="rounded-lg hover:bg-red-50 hover:border-red-100 p-3 border border-slate-200 text-slate-600 cursor-pointer"
        >
          {team.isActive ? (
            <Ban className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          )}
        </div>
      </div>
    </div>
  );
}
