import http from '@/api';
import { ResPage, ResultData } from '../interface';
import { Announcement, CreateAnnounceDto } from '../interface/announce';

export async function getValidAnnouncement(pageSize: number, pageNum: number, searchValue: string, valid: boolean = true) {
    return http.get<ResPage<Announcement>>('announcement/valid', {
        pageSize, pageNum, searchValue, type: (valid ? 'valid' : 'all')
    });
}

export async function updateAnnouncement(target: Announcement) {
    return http.post<ResultData<Announcement>>(`announcement/update/${target.id}`, target, { loading: true });
}

export async function deleteAnnouncement(id: number) {
    return http.post<ResultData<Announcement>>(`announcement/delete/${id}`, { loading: true });
}

export async function createAnnouncement(data: CreateAnnounceDto) {
    return http.post<ResultData<Announcement>>(`announcement/new`, data, { loading: true });
}