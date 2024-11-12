import http from '@/api';
import { ResPage, ResultData } from '../interface';
import { Announcement, CreateAnnounceDto, SearchAnnounceParams } from '../interface/announce';

export async function getAnnouncementList(params: SearchAnnounceParams) {
    return http.get<ResPage<Announcement>>('announcement/list', params);
}

export async function createAnnouncement(data: CreateAnnounceDto) {
    return http.post<ResultData<Announcement>>(`announcement/new`, data, { loading: true });
}

export async function updateAnnouncement(id: number, data: Partial<CreateAnnounceDto>) {
    return http.post<ResultData<Announcement>>(`announcement/update/${id}`, data, { loading: true });
}

export async function deleteAnnouncement(id: number) {
    return http.post<ResultData<Announcement>>(`announcement/delete/${id}`, { loading: true });
}