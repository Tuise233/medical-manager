import http from '@/api';
import { ResPage, ResultData } from '../interface';
import { Announcement } from '../interface/announce';

export async function getValidAnnouncement(pageSize: number, pageNum: number, searchValue: string) {
    return http.get<ResPage<Announcement>>('announcement/valid', {
        pageSize, pageNum, searchValue
    });
}