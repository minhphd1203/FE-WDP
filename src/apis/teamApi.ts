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
  accountId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateTeamDto {
  name: string;
  area: string;
  teamSize: number;
}

export interface UpdateTeamDto {
  name?: string;
  area?: string;
  teamSize?: number;
  isActive?: boolean;
}

export interface ListTeamsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ListTeamsResponse {
  items: Team[];
  total: number;
  page: number;
  limit: number;
}

// List all teams
export const listTeams = async (
  params?: ListTeamsParams,
): Promise<ListTeamsResponse> => {
  const response = await httpClient.get(TEAM_ENDPOINTS.BASE, { params });

  // Handle different response structures
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
    };
  }
  if (Array.isArray(response.data.data)) {
    return {
      items: response.data.data,
      total: response.data.data.length,
      page: 1,
      limit: response.data.data.length,
    };
  }

  return {
    items: [],
    total: 0,
    page: 1,
    limit: 10,
  };
};

// Get team by ID
export const getTeamById = async (id: string): Promise<Team> => {
  const response = await httpClient.get(TEAM_ENDPOINTS.BY_ID(id));
  return response.data.data || response.data;
};

// Create team
export const createTeam = async (data: CreateTeamDto): Promise<Team> => {
  const response = await httpClient.post(TEAM_ENDPOINTS.BASE, data);
  return response.data.data || response.data;
};

// Update team
export const updateTeam = async (
  id: string,
  data: UpdateTeamDto,
): Promise<Team> => {
  const response = await httpClient.patch(TEAM_ENDPOINTS.BY_ID(id), data);
  return response.data.data || response.data;
};

// Delete team
export const deleteTeam = async (id: string): Promise<void> => {
  await httpClient.delete(TEAM_ENDPOINTS.BY_ID(id));
};
