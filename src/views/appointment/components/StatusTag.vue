<script setup lang="ts">
import { AppointmentStatus } from '@/api/interface/appointment';

defineProps<{
    status: AppointmentStatus;
}>();

const statusMap = {
    [AppointmentStatus.Pending]: {
        type: 'warning',
        label: '待处理'
    },
    [AppointmentStatus.Accepted]: {
        type: 'success',
        label: '已接受'
    },
    [AppointmentStatus.Rejected]: {
        type: 'danger',
        label: '已拒绝'
    },
    [AppointmentStatus.Cancelled]: {
        type: 'info',
        label: '已取消'
    },
    [AppointmentStatus.Completed]: {
        type: 'success',
        label: '已完成'
    }
} as const;
</script>

<template>
    <el-tag :type="statusMap[status].type">{{ statusMap[status].label }}</el-tag>
</template>