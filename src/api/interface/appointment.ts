export enum AppointmentStatus {
    Pending = 0,
    Accepted = 1,
    Rejected = 2,
    Cancelled = 3,
    Completed = 4
}

export interface Appointment {
    id: number;
    patient: {
        id: number;
        username: string;
        real_name: string;
    };
    doctor: {
        id: number;
        username: string;
        real_name: string;
    };
    description: string;
    date_time: Date;
    duration: number;
    status: AppointmentStatus;
    reject_reason?: string;
    create_date: Date;
    update_date: Date;
}

export interface CreateAppointmentDto {
    doctor_id?: number;
    description: string;
    date_time: Date;
    duration: number;
}

export interface UpdateAppointmentDto {
    status: AppointmentStatus;
    reject_reason?: string;
}

export interface SearchAppointmentParams {
    pageSize: number;
    pageNum: number;
    searchValue?: string;
    status?: AppointmentStatus;
    startDate?: Date;
    endDate?: Date;
    doctor_id?: number;
    patient_id?: number;
} 