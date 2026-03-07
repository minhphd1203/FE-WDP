import { User, RescueTeam } from "./types";

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
    const teamName =
      team.profile?.fullName ||
      team.fullName ||
      team.name ||
      `Đội cứu hộ ${index + 1}`;
    const teamCode =
      team.teamCode || `TEAM-${String(index + 1).padStart(3, "0")}`;
    const teamId =
      team.teamId || team.id || `T${String(index + 1).padStart(3, "0")}`;
    const membersCount = team.membersCount || team.teamSize || 8 + (index % 6);
    const vehiclesCount =
      team.vehiclesCount || Math.max(1, Math.ceil(membersCount / 4));
    const rating = Number(team.rating || 4 + (index % 8) / 10).toFixed(1);
    const successRate = team.successRate || 70 + (index % 25);
    const missionTotal = team.totalMissions || 20 + index * 5;
    const successfulMissions =
      team.successfulMissions || Math.floor((missionTotal * successRate) / 100);
    const failedMissions =
      team.failedMissions || missionTotal - successfulMissions;
    const status = team.isActive ? "available" : "offline";
    const lat = Number(team.location?.lat || 10.7769 + index * 0.002).toFixed(
      4,
    );
    const lng = Number(team.location?.lng || 106.7009 + index * 0.002).toFixed(
      4,
    );
    const baseLocation =
      team.location?.base_location ||
      team.profile?.address ||
      team.address ||
      "TP. HCM";
    const coverageArea =
      team.location?.coverage_area || `${baseLocation} và vùng lân cận`;
    const maxVictims =
      team.capacity?.max_victims || Math.max(20, membersCount * 4);
    const members =
      team.members ||
      Array.from({ length: Math.min(membersCount, 5) }, (_, memberIndex) => ({
        member_id: `${teamId}-M${memberIndex + 1}`,
        full_name: `Thành viên ${memberIndex + 1}`,
        role:
          memberIndex === 0
            ? "team_leader"
            : memberIndex % 3 === 0
              ? "doctor"
              : memberIndex % 2 === 0
                ? "driver"
                : "rescuer",
        phone: `09${(10000000 + index * 137 + memberIndex * 53).toString().slice(0, 8)}`,
        status: memberIndex === 4 ? "on_leave" : "active",
      }));
    const equipmentList = team.equipment_list || [
      {
        equipment_id: `${teamId}-EQ1`,
        equipment_name: "Bộ sơ cứu",
        quantity: 10 + (index % 4),
        status: "ready",
      },
      {
        equipment_id: `${teamId}-EQ2`,
        equipment_name: "Dây cứu hộ",
        quantity: 6 + (index % 3),
        status: "in_use",
      },
    ];
    const vehicles =
      team.vehicles ||
      Array.from({ length: vehiclesCount }, (_, vehicleIndex) => ({
        vehicle_id: `${teamId}-V${vehicleIndex + 1}`,
        vehicle_type: vehicleIndex % 2 === 0 ? "Xe cứu thương" : "Xe bán tải",
        plate_number: `51A-${(10300 + index * 17 + vehicleIndex * 9).toString()}`,
        capacity: vehicleIndex % 2 === 0 ? 4 : 6,
        status: vehicleIndex === 0 ? "ready" : "in_use",
      }));
    const lastMissionAt =
      team.last_mission_at || team.updatedAt || team.createdAt;

    return {
      ...team,
      teamId,
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
      address: team.profile?.address || team.address || "TP. HCM",
      phone: team.phone || team.phoneNumber || "-",
      specialties: team.specialties || ["first_aid", "trauma_care"],
      responseTime: team.averageResponseTime || `${12 + (index % 10)} phút`,
      lat,
      lng,
      baseLocation,
      coverageArea,
      maxVictims,
      members,
      equipmentList,
      vehicles,
      lastMissionAt,
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
