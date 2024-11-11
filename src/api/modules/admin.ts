import http from "@/api";
import { AdminUser, SearchUserParams, CreateUserParams, AuditUserParams, UpdateUserParams } from "../interface/admin";
import { ResPage, ResultData } from "../interface";

/**
 * @name 管理员模块
 */

// 获取用户列表
export const getUserList = (params: SearchUserParams) => {
    return http.get<ResPage<AdminUser>>("/admin/users", params);
};

// 创建用户
export const createUser = (params: CreateUserParams) => {
    return http.post<ResultData<AdminUser>>("/admin/users/create", params, { loading: true });
};

// 审核用户
export const auditUser = (userId: number, params: AuditUserParams) => {
    return http.post<ResultData<AdminUser>>(`/admin/users/audit/${userId}`, params, { loading: true });
};

// 添加更新用户的方法
export const updateUser = (userId: number, params: UpdateUserParams) => {
    return http.put<void>(`/admin/users/${userId}`, params);
};