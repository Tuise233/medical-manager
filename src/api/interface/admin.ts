export interface AdminUser {
  id: number;
  username: string;
  real_name?: string;
  email?: string;
  phone?: string;
  role: number;
  status: number;
  create_date: Date;
  basicInfo?: {
    id: number;
    name?: string;
    avatar?: string;
  };
}

export interface SearchUserParams {
  pageNum: number;
  pageSize: number;
  searchValue?: string;
  role?: number;
  status?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateUserParams {
  username: string;
  password: string;
  real_name: string;
  email?: string;
  phone?: string;
  role: number;
}

export interface AuditUserParams {
  status: number;
  remark?: string;
}

export interface UpdateUserParams {
  username: string;
  real_name: string;
  email: string;
  phone: string;
  role: number;
}