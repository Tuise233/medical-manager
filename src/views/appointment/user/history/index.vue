<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Appointment, AppointmentStatus } from '@/api/interface/appointment';
import { getAppointmentList, cancelAppointment } from '@/api/modules/appointment';
import { useUserStore } from '@/stores/modules/user';
import StatusTag from '../../components/StatusTag.vue';
import { formatDate } from '@/utils';

const userStore = useUserStore();
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
                <el-table-column prop="description" label="病情描述" min-width="200" show-overflow-tooltip />
                <el-table-column label="预约时间" width="180">
                    <template #default="scope">
                        {{ formatDate(scope.row.date_time) }}
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
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="scope">
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
    </div>
</template>

<style lang="scss" src="./style.scss" scoped />