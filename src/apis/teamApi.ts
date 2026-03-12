import httpClient from "../lib/http";

const TEAM_ENDPOINTS = {
  BASE: "/admin/teams",
  BY_ID: (id: string) => `/admin/teams/${id}`,
};

export interface Team {
  id: string;
  name: string;
  area: string;
  teamSize: number;
  baseLocation?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  rating?: string | number | null;
  accountId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface TeamEquipmentInput {
  equipmentName: string;
  quantity: number;
  status: string;
}

export interface TeamVehicleInput {
  vehicleTypeCode: string;
  plateNumber: string;
  capacity: number;
  status: string;
}

export interface CreateTeamDto {
  name: string;
  area: string;
  teamSize: number;
  baseLocation?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  specialties?: string[];
  equipmentList?: TeamEquipmentInput[];
  vehicles?: TeamVehicleInput[];
  accountEmail?: string;
  accountPassword?: string;
  accountFullName?: string;
}

export interface UpdateTeamDto {
  name?: string;
  area?: string;
  teamSize?: number;
  baseLocation?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  specialties?: string[];
  equipmentList?: TeamEquipmentInput[];
  vehicles?: TeamVehicleInput[];
  accountEmail?: string;
  accountPassword?: string;
  accountFullName?: string;
  isActive?: boolean;
}

export interface ListTeamsParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  order?: "ASC" | "DESC";
  search?: string;
  isActive?: boolean;
}

export interface ListTeamsResponse {
  items: Team[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface ApiResponse<T> {
  data: T;
  success?: boolean;
  message?: string;
}

// List all teams
export const listTeams = async (
  params?: ListTeamsParams,
): Promise<ListTeamsResponse> => {
  const normalizedParams = {
    ...params,
    q: params?.q || params?.search,
  };
  const response = await httpClient.get<ApiResponse<any>>(TEAM_ENDPOINTS.BASE, {
    params: normalizedParams,
  });

  // Handle standard backend shape from httpClient (already unwrapped):
  // { statusCode, success, message, data: { data: Team[], meta: {...} } }
  if (Array.isArray(response?.data?.data)) {
    const items = response.data.data;
    const meta = response.data.meta || {};
    return {
      items,
      total: meta.total ?? items.length,
      page: meta.page ?? 1,
      limit: meta.limit ?? items.length,
      pages: meta.pages ?? 1,
    };
  }

  // Handle Axios-style wrapped shape if any caller bypasses httpClient:
  if (Array.isArray(response?.data?.data?.data)) {
    const items = response.data.data.data;
    const meta = response.data.data.meta || {};
    return {
      items,
      total: meta.total ?? items.length,
      page: meta.page ?? 1,
      limit: meta.limit ?? items.length,
      pages: meta.pages ?? 1,
    };
  }
  if (response.data.items) {
    return response.data;
  }
  if (response.data.data?.items) {
    return response.data.data;
  }
  if (Array.isArray(response.data)) {
    return {
      items: response.data,
      total: response.data.length,
      page: 1,
      limit: response.data.length,
      pages: 1,
    };
  }
  if (Array.isArray(response.data.data)) {
    return {
      items: response.data.data,
      total: response.data.data.length,
      page: 1,
      limit: response.data.data.length,
      pages: 1,
    };
  }

  return {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  };
};

// Get team by ID
export const getTeamById = async (id: string): Promise<Team> => {
  const response = await httpClient.get<ApiResponse<any>>(
    TEAM_ENDPOINTS.BY_ID(id),
  );
  return response.data.data || response.data;
};

// Create team
export const createTeam = async (data: CreateTeamDto): Promise<Team> => {
  const response = await httpClient.post<ApiResponse<any>>(
    TEAM_ENDPOINTS.BASE,
    data,
  );
  return response.data.data || response.data;
};

// Update team
export const updateTeam = async (
  id: string,
  data: UpdateTeamDto,
): Promise<Team> => {
  const response = await httpClient.patch<ApiResponse<any>>(
    TEAM_ENDPOINTS.BY_ID(id),
    data,
  );
  return response.data.data || response.data;
};

// Delete team
export const deleteTeam = async (id: string): Promise<void> => {
  await httpClient.delete(TEAM_ENDPOINTS.BY_ID(id));
};
