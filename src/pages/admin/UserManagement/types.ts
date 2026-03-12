export interface RescueMember {
  member_id: string;
  full_name: string;
  role: string;
  phone: string;
  status: string;
}

export interface Equipment {
  equipment_id: string;
  equipment_name: string;
  quantity: number;
  status: string;
}

export interface Vehicle {
  vehicle_id: string;
  vehicle_type: string;
  plate_number: string;
  capacity: number;
  status: string;
}

export interface RescueTeam {
  id: string;
  teamId: string;
  accountId?: string | null;
  teamName: string;
  teamCode: string;
  membersCount: number;
  vehiclesCount: number;
  rating: string;
  successRate: number;
  missionTotal: number;
  successfulMissions: number;
  failedMissions: number;
  status: string;
  address: string;
  phone: string;
  specialties: string[];
  responseTime: string;
  lat: string;
  lng: string;
  baseLocation: string;
  coverageArea: string;
  maxVictims: number;
  members: RescueMember[];
  equipmentList: Equipment[];
  vehicles: Vehicle[];
  lastMissionAt: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  fullName?: string;
  name?: string;
  role: "USER" | "STAFF" | "RESCUE_TEAM" | "ADMIN";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
  profile?: {
    fullName?: string;
    avatarUrl?: string;
    address?: string;
  };
  address?: string;
}

export type RoleFilter = "USER" | "STAFF" | "RESCUE_TEAM";
