import { User, RescueTeam } from "./types";

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatAverageResponseTime = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "-";

  const seconds = toNumber(value, NaN);
  if (!Number.isFinite(seconds) || seconds < 0) {
    return String(value);
  }

  if (seconds < 60) return `${Math.round(seconds)} giây`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} phút`;
};

export const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const transformUsersToRescueTeams = (users: User[]): RescueTeam[] => {
  return users.map((team: any, index: number) => {
    const source =
      team?.data && typeof team.data === "object" ? team.data : team;
    const location = source.location || {};
    const capacity = source.capacity || {};
    const rawMembers = Array.isArray(source.members) ? source.members : [];
    const rawVehicles = Array.isArray(source.vehicles) ? source.vehicles : [];
    const rawEquipmentList = Array.isArray(source.equipment_list)
      ? source.equipment_list
      : Array.isArray(source.equipmentList)
        ? source.equipmentList
        : [];

    const teamName =
      source.team_name ||
      source.name ||
      source.profile?.fullName ||
      source.fullName ||
      `Đội cứu hộ ${index + 1}`;
    const teamCode = source.team_code || source.teamCode || "-";
    const teamRecordId =
      source.team_id ||
      source.teamId ||
      source.id ||
      `T${String(index + 1).padStart(3, "0")}`;
    const accountId = source.accountId || source.account?.id || null;
    const account =
      source.account && typeof source.account === "object"
        ? {
            id: source.account.id || accountId || "-",
            email: source.account.email || source.email,
            phone: source.account.phone || source.phone || source.phoneNumber,
            fullName: source.account.fullName || source.fullName || source.name,
            role: source.account.role || source.role,
            isActive:
              typeof source.account.isActive === "boolean"
                ? source.account.isActive
                : undefined,
          }
        : undefined;

    const membersCount = toNumber(
      source.totalMembers ?? source.membersCount ?? source.teamSize,
      rawMembers.length,
    );
    const totalVehicles = toNumber(
      source.totalVehicles ?? source.vehiclesCount ?? capacity.vehicles,
      rawVehicles.length,
    );
    const teamSize = toNumber(
      source.teamSize ?? source.totalMembers,
      membersCount,
    );
    const vehiclesCount = totalVehicles;
    const rating = toNumber(source.rating, 0).toFixed(2);
    const missionTotal = toNumber(
      source.total_missions ?? source.totalMissions ?? source.missionTotal,
      0,
    );
    const successfulMissions = toNumber(
      source.successful_missions ?? source.successfulMissions,
      0,
    );
    const failedMissions = toNumber(
      source.failed_missions ?? source.failedMissions,
      0,
    );
    const successRate =
      missionTotal > 0
        ? Math.round((successfulMissions / missionTotal) * 100)
        : toNumber(source.successRate, 0);
    const status = source.status || (source.isActive ? "available" : "offline");

    const lat = String(location.lat ?? source.latitude ?? source.lat ?? "-");
    const lng = String(location.lng ?? source.longitude ?? source.lng ?? "-");
    const baseLocation =
      location.base_location ||
      source.baseLocation ||
      source.profile?.address ||
      "-";
    const coverageArea =
      location.coverage_area || source.area || source.coverageArea || "-";
    const maxVictims = toNumber(capacity.max_victims ?? source.maxVictims, 0);

    const members = rawMembers.map((member: any, memberIndex: number) => ({
      member_id:
        member.member_id ||
        member.account_id ||
        member.membership_id ||
        `${teamRecordId}-M${memberIndex + 1}`,
      full_name: member.full_name || member.fullName || "-",
      role: member.role || "member",
      phone: member.phone || "-",
      status: member.status || "active",
    }));

    const equipmentList = rawEquipmentList.map(
      (item: any, equipmentIndex: number) => ({
        equipment_id:
          item.equipment_id || `${teamRecordId}-EQ${equipmentIndex + 1}`,
        equipment_name: item.equipment_name || item.name || "-",
        quantity: toNumber(item.quantity, 0),
        status: item.status || "ready",
      }),
    );

    const vehicles = rawVehicles.map((vehicle: any, vehicleIndex: number) => ({
      vehicle_id: vehicle.vehicle_id || `${teamRecordId}-V${vehicleIndex + 1}`,
      vehicle_type: vehicle.vehicle_type || vehicle.type || "-",
      plate_number: vehicle.plate_number || "-",
      capacity: toNumber(vehicle.capacity, 0),
      status: vehicle.status || "ready",
    }));

    const lastMissionAt =
      source.last_mission_at ||
      source.lastMissionAt ||
      source.updatedAt ||
      source.createdAt;
    const address =
      source.address ||
      baseLocation ||
      coverageArea ||
      source.profile?.address ||
      "-";
    const phone =
      source.account?.phone || source.phone || source.phoneNumber || "-";

    return {
      ...source,
      id: accountId || teamRecordId,
      teamId: teamRecordId,
      accountId,
      account,
      name: source.name || teamName,
      area: source.area || coverageArea,
      teamSize,
      totalVehicles,
      latitude: lat,
      longitude: lng,
      teamName,
      teamCode,
      membersCount,
      vehiclesCount,
      rating,
      successRate,
      missionTotal,
      successfulMissions,
      failedMissions,
      status,
      address,
      phone,
      specialties: Array.isArray(source.specialties) ? source.specialties : [],
      responseTime: formatAverageResponseTime(
        source.average_response_time ?? source.averageResponseTime,
      ),
      lat,
      lng,
      baseLocation,
      coverageArea,
      maxVictims,
      members,
      equipmentList,
      vehicles,
      lastMissionAt,
      isActive: Boolean(source.isActive),
      createdAt: source.createdAt || source.created_at,
      updatedAt: source.updatedAt || source.updated_at,
    };
  });
};

export const getVisiblePages = (page: number, totalPages: number) => {
  const pageStart = Math.max(1, page - 1);
  const pageEnd = Math.min(totalPages, page + 1);
  return Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, index) => pageStart + index,
  );
};
