<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Appointment, AppointmentStatus } from '@/api/interface/appointment';
import { getAppointmentList, cancelAppointment, getAppointmentRecord } from '@/api/modules/appointment';
import StatusTag from '../../components/StatusTag.vue';
import { formatDate } from '@/utils';
import { MedicalRecord } from '@/api/interface/medical-record';
import { Prescription } from '@/api/interface/prescription';

const data = ref<Appointment[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref('');
const searchStatus = ref<AppointmentStatus>();
const dateRange = ref<[Date, Date]>();

// 状态选项
const statusOptions = [
    { label: '待处理', value: AppointmentStatus.Pending },
    { label: '已接受', value: AppointmentStatus.Accepted },
    { label: '已拒绝', value: AppointmentStatus.Rejected },
    { label: '已取消', value: AppointmentStatus.Cancelled },
    { label: '已完成', value: AppointmentStatus.Completed }
];

// 预约详情相关
const showAppointmentDetail = ref(false);
const currentAppointment = ref<Appointment | null>(null);
const medicalRecord = ref<MedicalRecord | null>(null);
const prescriptions = ref<Prescription[]>([]);

onMounted(async () => {
    await nextTick();
    queryAppointments();
});

// 查询预约列表
async function queryAppointments() {
    const results = await getAppointmentList({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        searchValue: searchValue.value,
        status: searchStatus.value,
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1]
    });
    data.value = results.data.list;
    total.value = results.data.total;
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
    dateRange.value = undefined;
    queryAppointments();
}

// 判断是否可以取消预约
function canCancel(status: AppointmentStatus) {
    return status === AppointmentStatus.Pending;
}

// 查看预约详情
async function viewAppointmentDetail(appointment: Appointment) {
    currentAppointment.value = appointment;
    showAppointmentDetail.value = true;

    // 只有已完成的预约才能查看病历和医嘱
    if (appointment.status === AppointmentStatus.Completed) {
        try {
            const result = await getAppointmentRecord(appointment.id);
            medicalRecord.value = result.data.record;
            prescriptions.value = result.data.prescriptions;
        } catch (error) {
            console.error(error);
            ElMessage.error('获取就诊记录失败');
        }
    }
}
</script>

<template>
    <div class="app-container">
        <div class="search-wrapper">
            <div class="search-form">
                <el-form :inline="true">
                    <el-form-item label="医生姓名">
                        <el-input v-model="searchValue" placeholder="请输入医生姓名" clearable />
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
                <el-table-column prop="doctor.real_name" label="医生姓名" width="120" />
                <el-table-column prop="description" label="病情描述" min-width="80" show-overflow-tooltip />
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
                <el-table-column prop="reject_reason" label="拒绝原因" min-width="100" show-overflow-tooltip>
                    <template #default="scope">
                        <span v-if="scope.row.status === AppointmentStatus.Rejected" class="reject-reason">
                            {{ scope.row.reject_reason }}
                        </span>
                        <span v-else>未被拒绝</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button link @click="viewAppointmentDetail(scope.row)">
                            查看详情
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

        <!-- 预约详情对话框 -->
        <el-dialog v-model="showAppointmentDetail" title="就诊详情" width="800px">
            <div class="detail-content" v-if="currentAppointment">
                <!-- 基本信息 -->
                <div class="section">
                    <h3>基本信息</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">就诊时间：</span>
                            <span class="value">{{ formatDate(currentAppointment.date_time) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">就诊时长：</span>
                            <span class="value">{{ currentAppointment.duration }}分钟</span>
                        </div>
                        <div class="info-item">
                            <span class="label">主治医生：</span>
                            <span class="value">{{ currentAppointment.doctor.real_name }}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">就诊状态：</span>
                            <span class="value">
                                <StatusTag :status="currentAppointment.status" />
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 病情描述 -->
                <div class="section">
                    <h3>病情描述</h3>
                    <p class="description">{{ currentAppointment.description }}</p>
                </div>

                <!-- 病历信息 - 仅显示已完成的预约 -->
                <template v-if="currentAppointment.status === AppointmentStatus.Completed">
                    <div class="section">
                        <h3>病历信息</h3>
                        <el-card class="medical-record" v-if="medicalRecord">
                            <el-descriptions :column="1" border>
                                <el-descriptions-item label="主诉">
                                    {{ medicalRecord.chief_complaint || '无' }}
                                </el-descriptions-item>
                                <el-descriptions-item label="现病史">
                                    {{ medicalRecord.present_illness || '无' }}
                                </el-descriptions-item>
                                <el-descriptions-item label="既往史">
                                    {{ medicalRecord.past_history || '无' }}
                                </el-descriptions-item>
                                <el-descriptions-item label="体格检查">
                                    {{ medicalRecord.physical_exam || '无' }}
                                </el-descriptions-item>
                                <el-descriptions-item label="诊断">
                                    {{ medicalRecord.diagnosis || '无' }}
                                </el-descriptions-item>
                                <el-descriptions-item label="治疗计划">
                                    {{ medicalRecord.treatment_plan || '无' }}
                                </el-descriptions-item>
                                <el-descriptions-item label="备注">
                                    {{ medicalRecord.note || '无' }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </el-card>
                        <el-empty v-else description="暂无病历信息" />
                    </div>

                    <!-- 医嘱信息 -->
                    <div class="section">
                        <h3>医嘱信息</h3>
                        <el-card v-if="prescriptions.length">
                            <el-table :data="prescriptions" border stripe>
                                <el-table-column prop="description" label="药品名称" min-width="120" />
                                <el-table-column prop="dosage" label="用量" width="100" />
                                <el-table-column prop="frequency" label="服用频率" width="120" />
                                <el-table-column prop="duration" label="服用天数" width="100">
                                    <template #default="scope">
                                        {{ scope.row.duration }}天
                                    </template>
                                </el-table-column>
                                <el-table-column prop="note" label="备注" min-width="150" show-overflow-tooltip />
                            </el-table>
                        </el-card>
                        <el-empty v-else description="暂无医嘱信息" />
                    </div>
                </template>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" src="./style.scss" scoped />

<style lang="scss" scoped>
.detail-content {
    max-height: calc(80vh - 120px);
    overflow-y: auto;
    padding-right: 10px;

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--el-border-color-lighter);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-track {
        background-color: transparent;
    }

    .section {
        margin-bottom: 24px;

        h3 {
            margin: 0 0 16px;
            font-size: 16px;
            font-weight: 500;
            color: var(--el-text-color-primary);
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;

            .info-item {
                display: flex;
                align-items: center;

                .label {
                    width: 100px;
                    color: var(--el-text-color-secondary);
                }

                .value {
                    flex: 1;
                }
            }
        }

        .description {
            padding: 12px;
            background-color: var(--el-fill-color-lighter);
            border-radius: 4px;
            line-height: 1.6;
        }

        .medical-record {
            :deep(.el-descriptions__label) {
                width: 100px;
                font-weight: 500;
                color: var(--el-text-color-regular);
            }

            :deep(.el-descriptions__content) {
                white-space: pre-wrap;
                line-height: 1.6;
            }
        }

        .el-card {
            margin-top: 12px;
            border-radius: 8px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        }
    }
}
</style>