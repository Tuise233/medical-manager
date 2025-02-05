// 定义卡片数据接口
export interface CardData {
    value: number;
    percentage: number;
    trend: 'up' | 'down';
}

// 卡片数据接口
export interface DashboardCards {
    todayAppointments: number;
    appointmentGrowth: string;
    totalMedicines: number;
    availableMedicines: number;
    lowStockMedicines: number;
}

// 定义药品库存分析接口
export interface MedicineStock {
    categories: string[];
    amounts: number[];
    counts: number[];
}

// 定义预约趋势接口
export interface VisitTrend {
    hours: string[];
    appointments: number[];
    visits: number[];
}

// 科室就诊分布接口
export interface DepartmentVisits {
    data: Array<{
        name: string;
        value: number;
    }>;
}

// 定义医嘱类型分布接口
export interface PrescriptionType {
    name: string;
    value: number;
} 