export enum AnnounceType {
    Notice = 0,
    Policy = 1,
    Announcement = 2
}

export interface Announcement {
    id: number;
    title: string;
    description: string;
    type: AnnounceType;
    is_top: boolean;
    create_date: Date;
    expire_date: Date;
};

export interface CreateAnnounceDto {
    title: string;
    description: string;
    type: AnnounceType;
    is_top: boolean;
    expire_date: Date;
};

export interface SearchAnnounceParams {
    getType: 'valid' | 'all';
    pageSize: number;
    pageNum: number;
    searchValue?: string;
    type?: AnnounceType;
    startDate?: Date;
    endDate?: Date;
}