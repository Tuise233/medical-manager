import http from "@/api";
import { ResPage, ResultData } from "../interface";
import { Medication, SearchMedicationDto, CreateMedicationDto, UpdateMedicationDto } from "../interface/medication";

/**
 * @name 药品管理模块
 */

// 管理员获取药品列表
export const getMedicationList = (params: SearchMedicationDto) => {
    return http.get<ResPage<Medication>>("/medications", params);
};

// 创建药品
export const createMedication = (params: CreateMedicationDto) => {
    return http.post<ResultData<Medication>>("/medications", params, { loading: true });
};

// 更新药品
export const updateMedication = (id: number, params: UpdateMedicationDto) => {
    return http.put<ResultData<Medication>>(`/medications/${id}`, params, { loading: true });
};

// 删除药品
export const deleteMedication = (id: number) => {
    return http.delete<ResultData<void>>(`/medications/${id}`, {}, { loading: true });
}; 