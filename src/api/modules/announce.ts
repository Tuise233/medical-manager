import http from '@/api';
import { ResPage, ResultData } from '../interface';
import { Announcement } from '../interface/announce';

export async function getValidAnnouncement(pageSize: number, pageNum: number, searchValue: string, valid: boolean = true) {
    return http.get<ResPage<Announcement>>('announcement/valid', {
        pageSize, pageNum, searchValue, valid
    });
}

export async function updateAnnouncement(target: Announcement) {
    return http.post<ResultData<Announcement>>(`announcement/update/${target.id}`, target, { loading: true });
}

export async function deleteAnnouncement(id: number) {
    return http.post<ResultData<Announcement>>(`announcement/delete/${id}`, { loading: true });
}