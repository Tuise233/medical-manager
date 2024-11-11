import { Log, SearchLogDto } from "../interface/log";
import { ResPage } from "../interface/index";
import http from "@/api";

export const getLogPage = (params: SearchLogDto) => {
    return http.get<ResPage<Log>>('/log/page', params);
};