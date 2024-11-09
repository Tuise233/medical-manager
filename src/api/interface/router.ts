export interface Router {
    id: number;
    index: number;
    parent_id: number;
    path: string;
    name: string;
    component: string;
    icon: string;
    title: string;
    is_link: string;
    is_hide: boolean;
    is_full: boolean;
    is_affix: boolean;
    is_keep_alive: boolean;
    role_access: number[];
}

export class UpdateRouterDto {
    data: Router[] = [];
};

export interface CreateRouterDto {
    index: number;
    path: string;
    name: string;
    component: string;
    icon: string;
    title: string;
    is_link: string;
    is_hide: boolean
    is_full: boolean
    is_affix: boolean
    is_keep_alive: boolean;
    role_access: number[];
}