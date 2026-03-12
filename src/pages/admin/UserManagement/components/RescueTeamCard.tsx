import {
  Edit,
  Eye,
  Ban,
  CheckCircle,
  MapPin,
  Star,
  Users,
  Truck,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
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
  onEdit,
  onToggleStatus,
}: RescueTeamCardProps) {
  return (
    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-900">{team.teamName}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-500">
            {team.teamCode} • {team.teamId}
          </p>
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
          <p className="text-xs text-slate-500">Thành viên</p>
          <p className="text-xl font-bold text-slate-900">
            {team.membersCount}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Phương tiện</p>
          <p className="text-xl font-bold text-slate-900">
            {team.vehiclesCount}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
        <MapPin className="h-4 w-4 text-red-500" />
        <span className="truncate" title={team.address}>
          {team.address}
        </span>
        <Star className="ml-auto h-4 w-4 text-amber-500" />
        <span className="font-semibold text-slate-800">{team.rating}</span>
      </div>

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

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
          <span>Tỷ lệ nhiệm vụ thành công</span>
          <span>{team.successRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600"
            style={{ width: `${team.successRate}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-red-500" />
          {team.membersCount} thành viên
        </div>
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-red-500" />
          {team.responseTime}
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(team)}
          className="rounded-lg hover:bg-slate-100"
          title="Chi tiết"
        >
          <Eye size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(team)}
          className="rounded-lg hover:bg-blue-50 hover:text-blue-700"
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onToggleStatus(team.teamId || team.id, team.isActive)}
          className="rounded-lg hover:bg-red-50"
        >
          {team.isActive ? (
            <Ban className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          )}
        </Button>
      </div>
    </div>
  );
}
