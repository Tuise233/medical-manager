import { ResPage, ResultData } from "../interface";
import { Appointment, CreateAppointmentDto, UpdateAppointmentDto, SearchAppointmentParams } from '../interface/appointment';
import http from '@/api';

export const createAppointment = (params: CreateAppointmentDto) => {
    return http.post<Appointment>('/appointments', params);
};

export const updateAppointment = (id: number, params: UpdateAppointmentDto) => {
    return http.put<Appointment>(`/appointments/${id}`, params);
};

export const cancelAppointment = (id: number) => {
    return http.post<Appointment>(`/appointments/${id}/cancel`);
};

export const getAppointmentList = (params: SearchAppointmentParams) => {
    return http.get<ResPage<Appointment>>('/appointments', {
        params: {
            pageNum: params.pageNum,
            pageSize: params.pageSize,
            searchValue: params.searchValue || undefined,
            status: params.status,
            startDate: params.startDate?.toISOString(),
            endDate: params.endDate?.toISOString(),
            doctor_id: params.doctor_id,
            patient_id: params.patient_id
        }
    });
}; 