<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { getUserList, createUser, auditUser, updateUser } from "@/api/modules/admin";
import { AdminUser, CreateUserParams, AuditUserParams, UpdateUserParams } from "@/api/interface/admin";
import PageDivider from "@/components/PageDivider/index.vue";
import { formatDate } from "@/utils";


const data = ref<AdminUser[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref("");
const searchRole = ref<number>();
const searchStatus = ref<number>();

// 创建用户相关
const showCreateDialog = ref(false);
const formRef = ref<FormInstance>();
const createForm = reactive<CreateUserParams>({
    username: "",
    password: "",
    email: "",
    phone: "",
    role: 0
});

// 审核相关
const showAuditDialog = ref(false);
const currentUserId = ref<number>();
const auditForm = reactive<AuditUserParams>({
    status: 0,
    remark: ""
});

// 编辑相关
const showEditDialog = ref(false);
const editingUserId = ref<number>();
const editForm = reactive<UpdateUserParams>({
    username: "",
    email: "",
    phone: "",
    role: 0
});

// 表单校验规则
const rules = reactive<FormRules>({
    username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
    password: [{ required: true, message: "请输入密码", trigger: "blur" }],
    role: [{ required: true, message: "请选择角色", trigger: "change" }]
});

// 角色和状态选项
const roleOptions = [
    { label: "普通用户", value: 0 },
    { label: "医生", value: 1 },
    { label: "管理员", value: 2 }
];

const statusOptions = [
    { label: "待审核", value: 0 },
    { label: "正常", value: 1 },
    { label: "禁用", value: 2 }
];

// 初始化
onMounted(async () => {
    await nextTick();
    queryUsers();
});

// 查询用户列表
async function queryUsers() {
    const results = await getUserList({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        searchValue: searchValue.value,
        role: searchRole.value,
        status: searchStatus.value
    });
    data.value = results.data.list;
    pageNum.value = results.data.pageNum;
    pageSize.value = results.data.pageSize;
    total.value = results.data.total;
}

// 分页相关
function handlePageChange(curPage: number) {
    pageNum.value = curPage;
    queryUsers();
}

function handlePageSizeChange(size: number) {
    pageSize.value = size;
    queryUsers();
}

// 创建用户相关
function openCreateDialog() {
    showCreateDialog.value = true;
}

async function handleCreate() {
    if (!formRef.value) return;
    await formRef.value.validate(async valid => {
        if (!valid) return;
        try {
            await createUser(createForm);
            ElMessage.success("创建成功");
            showCreateDialog.value = false;
            queryUsers();
        } catch (error) {
            console.error(error);
        }
    });
}

// 审核相关
function openAuditDialog(row: AdminUser) {
    currentUserId.value = row.id;
    auditForm.status = row.status;
    showAuditDialog.value = true;
}

async function handleAudit() {
    if (!currentUserId.value) return;
    try {
        await auditUser(currentUserId.value, auditForm);
        ElMessage.success("审核成功");
        showAuditDialog.value = false;
        queryUsers();
    } catch (error) {
        console.error(error);
    }
}

// 编辑相关
function openEditDialog(row: AdminUser) {
    editingUserId.value = row.id;
    editForm.username = row.username || '';
    editForm.email = row.email || '';
    editForm.phone = row.phone || '';
    editForm.role = row.role;
    showEditDialog.value = true;
}

async function handleEdit() {
    if (!editingUserId.value) return;
    try {
        await updateUser(editingUserId.value, editForm);
        ElMessage.success("修改成功");
        showEditDialog.value = false;
        queryUsers();
    } catch (error) {
        console.error(error);
    }
}

// 工具函数
function getRoleTagType(role: number): "success" | "warning" | "info" | "danger" {
    const map: Record<number, "success" | "warning" | "info" | "danger"> = {
        0: "info",
        1: "success",
        2: "danger"
    };
    return map[role] || "info";
}

function getStatusTagType(status: number): "success" | "warning" | "info" | "danger" {
    const map: Record<number, "success" | "warning" | "info" | "danger"> = {
        0: "warning",
        1: "success",
        2: "danger"
    };
    return map[status] || "info";
}

function getRoleText(role: number) {
    const map: Record<number, string> = {
        0: "普通用户",
        1: "医生",
        2: "管理员"
    };
    return map[role] || "";
}

function getStatusText(status: number) {
    const map: Record<number, string> = {
        0: "待审核",
        1: "正常",
        2: "禁用"
    };
    return map[status] || "";
}
</script>

<template>
    <div class="app-page">
        <div class="app-header">
            <div class="app-search">
                <span>用户名</span>
                <el-input v-model="searchValue" placeholder="请输入用户名/手机号" />
                <el-select v-model="searchRole" placeholder="角色" clearable>
                    <el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-select v-model="searchStatus" placeholder="状态" clearable>
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
                <el-button type="primary" @click="queryUsers">搜索</el-button>
                <el-button type="primary" @click="openCreateDialog">新增用户</el-button>
            </div>
            <PageDivider @page-size-change="handlePageSizeChange" />
        </div>

        <div class="app-content">
            <el-table :data="data" stripe>
                <el-table-column prop="username" label="用户名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="phone" label="手机号"></el-table-column>
                <el-table-column label="角色">
                    <template #default="scope">
                        <el-tag :type="getRoleTagType(scope.row.role)">
                            {{ getRoleText(scope.row.role) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="状态">
                    <template #default="scope">
                        <el-tag :type="getStatusTagType(scope.row.status)">
                            {{ getStatusText(scope.row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间">
                    <template #default="scope">
                        <span>{{ formatDate(scope.row.create_date) }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="primary" link @click="openEditDialog(scope.row)">编辑</el-button>
                        <el-button type="primary" link @click="openAuditDialog(scope.row)">审核</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
                @current-change="handlePageChange" />
        </div>

        <!-- 创建用户对话框 -->
        <el-dialog v-model="showCreateDialog" title="新增用户" width="500px">
            <div class="app-form">
                <el-form ref="formRef" :model="createForm" :rules="rules" label-width="80px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="createForm.username" placeholder="请输入用户名" />
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="createForm.password" type="password" placeholder="请输入密码" show-password />
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="createForm.email" placeholder="请输入邮箱" />
                    </el-form-item>
                    <el-form-item label="手机号" prop="phone">
                        <el-input v-model="createForm.phone" placeholder="请输入手机号" />
                    </el-form-item>
                    <el-form-item label="角色" prop="role">
                        <el-select v-model="createForm.role" placeholder="请选择角色">
                            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="showCreateDialog = false">取消</el-button>
                <el-button type="primary" @click="handleCreate">确定</el-button>
            </template>
        </el-dialog>

        <!-- 审核对话框 -->
        <el-dialog v-model="showAuditDialog" title="用户审核" width="500px">
            <div class="app-form">
                <el-form :model="auditForm" label-width="80px">
                    <el-form-item label="状态">
                        <el-select v-model="auditForm.status" placeholder="请选择状态">
                            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input v-model="auditForm.remark" type="textarea" placeholder="请输入审核备注" :rows="3" />
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="showAuditDialog = false">取消</el-button>
                <el-button type="primary" @click="handleAudit">确定</el-button>
            </template>
        </el-dialog>

        <!-- 编辑用户对话框 -->
        <el-dialog v-model="showEditDialog" title="编辑用户" width="500px">
            <div class="app-form">
                <el-form :model="editForm" label-width="80px">
                    <el-form-item label="用户名">
                        <el-input v-model="editForm.username" placeholder="请输入用户名" disabled />
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-input v-model="editForm.email" placeholder="请输入邮箱" />
                    </el-form-item>
                    <el-form-item label="手机号">
                        <el-input v-model="editForm.phone" placeholder="请输入手机号" />
                    </el-form-item>
                    <el-form-item label="角色">
                        <el-select v-model="editForm.role" placeholder="请选择角色">
                            <el-option v-for="item in roleOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="showEditDialog = false">取消</el-button>
                <el-button type="primary" @click="handleEdit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style src="./style.scss" scoped />