import { RoleFilter } from "./types";

// Role options
export const roleOptions: Array<{
  value: RoleFilter;
  label: string;
}> = [
  { value: "USER", label: "Người dùng" },
  { value: "STAFF", label: "Nhân viên" },
  { value: "RESCUE_TEAM", label: "Đội cứu hộ" },
];

// Button styles
export const primaryButtonClass =
  "rounded-xl border border-red-700 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white shadow-[0_10px_24px_-10px_rgba(220,38,38,0.75)] hover:from-red-500 hover:to-rose-600";

export const secondaryButtonClass =
  "rounded-xl border border-red-300 bg-white text-red-700 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-700 disabled:border-red-200 disabled:bg-red-50 disabled:text-red-300 disabled:opacity-100";

// Label translation helpers
export const getRescueStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    available: "Sẵn sàng",
    busy: "Bận",
    on_mission: "Đang làm nhiệm vụ",
    offline: "Ngoại tuyến",
    maintenance: "Bảo trì",
  };
  return labels[status] || status;
};

export const getMemberRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    team_leader: "Đội trưởng",
    member: "Thành viên",
    doctor: "Bác sĩ",
    nurse: "Y tá",
    rescuer: "Cứu hộ viên",
    driver: "Tài xế",
    logistics_officer: "Hậu cần",
  };
  return labels[role] || role;
};

export const getMemberStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    active: "Đang hoạt động",
    on_leave: "Nghỉ phép",
    injured: "Bị thương",
  };
  return labels[status] || status;
};

export const getEquipmentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ready: "Sẵn sàng",
    in_use: "Đang sử dụng",
    maintenance: "Bảo trì",
  };
  return labels[status] || status;
};

export const getVehicleStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    ready: "Sẵn sàng",
    in_use: "Đang sử dụng",
    maintenance: "Bảo trì",
  };
  return labels[status] || status;
};

export const getSpecialtyLabel = (specialty: string) => {
  const labels: Record<string, string> = {
    first_aid: "Sơ cứu",
    trauma_care: "Chăm sóc chấn thương",
    water_rescue: "Cứu hộ dưới nước",
  };
  return labels[specialty] || specialty;
};
