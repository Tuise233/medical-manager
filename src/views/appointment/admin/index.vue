<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Appointment, AppointmentStatus, UpdateAppointmentDto } from '@/api/interface/appointment';
import { getAppointmentList, updateAppointment, cancelAppointment } from '@/api/modules/appointment';
import { getDoctorList } from '@/api/modules/admin';
import { AdminUser } from '@/api/interface/admin';
import StatusTag from '../components/StatusTag.vue';
import { formatDate } from '@/utils';

const data = ref<Appointment[]>([]);
const doctors = ref<AdminUser[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref('');
const searchStatus = ref<AppointmentStatus>();
const searchDoctorId = ref<number>();
const dateRange = ref<[Date, Date]>();

// 处理预约相关
const showProcessDialog = ref(false);
const currentAppointment = ref<Appointment>();
const rejectReason = ref('');

// 状态选项
const statusOptions = [
    { label: '待处理', value: AppointmentStatus.Pending },
    { label: '已接受', value: AppointmentStatus.Accepted },
    { label: '已拒绝', value: AppointmentStatus.Rejected },
    { label: '已取消', value: AppointmentStatus.Cancelled },
    { label: '已完成', value: AppointmentStatus.Completed }
];

onMounted(async () => {
    await nextTick();
    loadDoctors();
    queryAppointments();
});

// 加载医生列表
async function loadDoctors() {
    const res = await getDoctorList();
    if (Number(res.code) === 200) {
        doctors.value = res.data;
    }
}

// 查询预约列表
async function queryAppointments() {
    const results = await getAppointmentList({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        searchValue: searchValue.value,
        status: searchStatus.value,
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1],
        doctor_id: searchDoctorId.value
    });
    if (results.data) {
        data.value = results.data.list;
        total.value = results.data.total;
    }
}

// 处理预约
function openProcessDialog(appointment: Appointment) {
    currentAppointment.value = appointment;
    rejectReason.value = '';
    showProcessDialog.value = true;
}

async function handleProcess(status: AppointmentStatus) {
    if (!currentAppointment.value) return;

    const params: UpdateAppointmentDto = {
        status,
        reject_reason: status === AppointmentStatus.Rejected ? rejectReason.value : undefined
    };

    if (status === AppointmentStatus.Rejected && !rejectReason.value) {
        ElMessage.warning('请填写拒绝原因');
        return;
    }

    try {
        const res = await updateAppointment(currentAppointment.value.id, params);
        if (Number(res.code) === 200) {
            ElMessage.success('处理成功');
            showProcessDialog.value = false;
            queryAppointments();
        }
    } catch (error) {
        console.error(error);
    }
}

// 取消预约
async function handleCancel(id: number) {
    try {
        await ElMessageBox.confirm('确定要取消这个预约吗？', '提示', {
            type: 'warning'
        });
        const res = await cancelAppointment(id);
        if (Number(res.code) === 200) {
            ElMessage.success('取消成功');
            queryAppointments();
        }
    } catch (error) {
        console.error(error);
    }
}

// 完成预约
async function handleComplete(id: number) {
    try {
        await ElMessageBox.confirm('确定要完成这个预约吗？', '提示', {
            type: 'warning'
        });
        const res = await updateAppointment(id, { status: AppointmentStatus.Completed });
        if (Number(res.code) === 200) {
            ElMessage.success('操作成功');
            queryAppointments();
        }
    } catch (error) {
        console.error(error);
    }
}

function handlePageChange(curPage: number) {
    pageNum.value = curPage;
    queryAppointments();
}

function handlePageSizeChange(size: number) {
    pageSize.value = size;
    queryAppointments();
}

function resetSearch() {
    searchValue.value = '';
    searchStatus.value = undefined;
    searchDoctorId.value = undefined;
    dateRange.value = undefined;
    queryAppointments();
}

// 判断是否可以处理预约
function canProcess(status: AppointmentStatus) {
    return status === AppointmentStatus.Pending;
}

// 判断是否可以完成预约
function canComplete(status: AppointmentStatus) {
    return status === AppointmentStatus.Accepted;
}

// 判断是否可以取消预约
function canCancel(status: AppointmentStatus) {
    return status === AppointmentStatus.Pending || status === AppointmentStatus.Accepted;
}
</script>

<template>
    <div class="app-container">
        <div class="search-wrapper">
            <div class="search-form">
                <el-form :inline="true">
                    <el-form-item label="患者姓名">
                        <el-input v-model="searchValue" placeholder="请输入患者姓名" clearable />
                    </el-form-item>
                    <el-form-item label="主治医生">
                        <el-select v-model="searchDoctorId" placeholder="请选择医生" clearable>
                            <el-option v-for="doctor in doctors" :key="doctor.id" :label="doctor.real_name"
                                :value="doctor.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="预约状态">
                        <el-select v-model="searchStatus" placeholder="请选择状态" clearable>
                            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="预约时间">
                        <el-date-picker v-model="dateRange" type="daterange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="queryAppointments">搜索</el-button>
                        <el-button @click="resetSearch">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>

        <div class="table-wrapper">
            <el-table :data="data" border stripe>
                <el-table-column prop="patient.real_name" label="患者姓名" width="120" />
                <el-table-column prop="doctor.real_name" label="主治医生" width="120" />
                <el-table-column prop="description" label="病情描述" min-width="200" show-overflow-tooltip />
                <el-table-column label="预约时间" width="180">
                    <template #default="scope">
                        {{ formatDate(scope.row.date_time) }}
                    </template>
                </el-table-column>
                <el-table-column label="创建时间" width="180">
                    <template #default="scope">
                        {{ formatDate(scope.row.create_date) }}
                    </template>
                </el-table-column>
                <el-table-column prop="duration" label="时长" width="100">
                    <template #default="scope">
                        {{ scope.row.duration }}分钟
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template #default="scope">
                        <StatusTag :status="scope.row.status" />
                    </template>
                </el-table-column>
                <el-table-column prop="reject_reason" label="拒绝原因" min-width="150" show-overflow-tooltip>
                    <template #default="scope">
                        <span v-if="scope.row.status === AppointmentStatus.Rejected" class="reject-reason">
                            {{ scope.row.reject_reason }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="250" fixed="right">
                    <template #default="scope">
                        <el-button v-if="canProcess(scope.row.status)" type="primary" link
                            @click="openProcessDialog(scope.row)">
                            处理预约
                        </el-button>
                        <el-button v-if="canComplete(scope.row.status)" type="success" link
                            @click="handleComplete(scope.row.id)">
                            完成预约
                        </el-button>
                        <el-button v-if="canCancel(scope.row.status)" type="danger" link
                            @click="handleCancel(scope.row.id)">
                            取消预约
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
                @current-change="handlePageChange" @size-change="handlePageSizeChange" />
        </div>

        <!-- 处理预约对话框 -->
        <el-dialog v-model="showProcessDialog" title="处理预约" width="500px">
            <div class="process-form" v-if="currentAppointment">
                <div class="info-item">
                    <span class="label">患者姓名:</span>
                    <span class="value">{{ currentAppointment.patient.real_name }}</span>
                </div>
                <div class="info-item">
                    <span class="label">主治医生:</span>
                    <span class="value">{{ currentAppointment.doctor.real_name }}</span>
                </div>
                <div class="info-item">
                    <span class="label">预约时间:</span>
                    <span class="value">{{ formatDate(currentAppointment.date_time) }}</span>
                </div>
                <div class="info-item">
                    <span class="label">病情描述:</span>
                    <span class="value">{{ currentAppointment.description }}</span>
                </div>
                <div class="reject-form" v-if="currentAppointment.status === AppointmentStatus.Pending">
                    <el-input v-model="rejectReason" type="textarea" :rows="3" placeholder="请输入拒绝原因（拒绝时必填）" />
                </div>
            </div>
            <template #footer>
                <el-button @click="showProcessDialog = false">取消</el-button>
                <el-button type="danger" @click="handleProcess(AppointmentStatus.Rejected)">拒绝</el-button>
                <el-button type="primary" @click="handleProcess(AppointmentStatus.Accepted)">接受</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" src="./style.scss" scoped />