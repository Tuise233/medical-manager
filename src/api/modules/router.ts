import http from '@/api';
import { CreateRouterDto, Router } from '../interface/router';

export async function getAllRouter() {
    return http.get<Router[]>('/router/all');
}

export async function saveRouter(router: Router[]) {
    return http.post<any>('/router/save', {
        data: router
    }, { loading: true });
}

export async function createRouter(router: CreateRouterDto) {
    return http.post('/router/create', router, { loading: true });
}