import http from "@/api";
import { ResultData } from "../interface";
import { DashboardCards, MedicineStock, VisitTrend, PrescriptionType } from "../interface/chart";

/**
 * @name 数据统计模块
 */

// 获取卡片数据
export const getDashboardCards = () => {
    return http.get<DashboardCards>("/dashboard/cards");
};

// 获取药品库存分析
export const getMedicineStock = () => {
    return http.get<MedicineStock>("/dashboard/medicine-stock");
};

// 获取今日预约趋势
export const getVisitTrend = () => {
    return http.get<VisitTrend>("/dashboard/visit-trend");
};

// 获取医嘱类型分布
export const getPrescriptionTypes = () => {
    return http.get<PrescriptionType[]>("/dashboard/prescription-types");
};
