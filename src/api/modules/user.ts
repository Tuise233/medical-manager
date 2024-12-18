import http from "@/api";
import { BasicInfo, HealthInfo, User } from "@/api/interface/user";
import { SearchUserParams } from "../interface/admin";
import { ResPage } from "../interface";
export const getPatientProfile = (id: number) => {
  return http.get<User>(`users/patient/${id}`);
};

export const getPatientList = (params: SearchUserParams) => {
  return http.get<ResPage<User>>(`users/patients`, params);
};

export const updatePatientBasicInfo = (id: number, data: BasicInfo) => {
  return http.put(`users/patient/${id}/basic`, data);
};

export const updatePatientHealthInfo = (id: number, data: HealthInfo) => {
  return http.put(`users/patient/${id}/health`, data);
};