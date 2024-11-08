export interface Announcement {
    id: number;
    title: string;
    description: string;
    create_date: Date;
    expire_date: Date;
};

export interface CreateAnnounceDto {
    title: string;
    description: string;
    expire_date: Date;
};