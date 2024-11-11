import { PageDto } from "./page";

export interface Log {
    id: number;
    content: string;
    create_date: Date;
    type: string;
}

export interface SearchLogDto extends PageDto {
    startDate?: Date;
    endDate?: Date;
    searchValue?: string;
}