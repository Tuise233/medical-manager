<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { getMedicationList } from "@/api/modules/medication";
import { Medication, MedicationCategory, MedicationStatus } from "@/api/interface/medication";
import { formatDate } from "@/utils";

// 表格数据
const tableData = ref<Medication[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref("");
const searchCategory = ref<MedicationCategory>();
const searchStatus = ref<MedicationStatus>();

// 药品类别选项
const categoryOptions = [
    { label: "未知", value: MedicationCategory.Unknown },
    { label: "处方药", value: MedicationCategory.Prescription },
    { label: "非处方药", value: MedicationCategory.OTC },
    { label: "中药", value: MedicationCategory.Traditional },
    { label: "保健品", value: MedicationCategory.HealthCare }
];

// 状态选项
const statusOptions = [
    { label: "下架", value: MedicationStatus.Disable },
    { label: "上架", value: MedicationStatus.Enable }
];

// 初始化
onMounted(async () => {
    await nextTick();
    queryMedications();
});

// 查询药品列表
async function queryMedications() {
    const results = await getMedicationList({
        pageNum: pageNum.value,
        pageSize: pageSize.value,
        searchValue: searchValue.value,
        category: searchCategory.value,
        status: searchStatus.value
    });
    tableData.value = results.data.list;
    total.value = results.data.total;
}

// 工具函数
function getCategoryText(category: MedicationCategory) {
    return categoryOptions.find(item => item.value === category)?.label || "未知";
}

function getStatusText(status: MedicationStatus) {
    return statusOptions.find(item => item.value === status)?.label || "未知";
}

function getStatusType(status: MedicationStatus): "success" | "danger" {
    return status === MedicationStatus.Enable ? "success" : "danger";
}
</script>

<template>
    <div class="app-container">
        <div class="table-search">
            <el-form :inline="true">
                <el-form-item label="药品名称">
                    <el-input v-model="searchValue" placeholder="请输入药品名称" clearable />
                </el-form-item>
                <el-form-item label="药品类别">
                    <el-select v-model="searchCategory" placeholder="请选择药品类别" clearable>
                        <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchStatus" placeholder="请选择状态" clearable>
                        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="queryMedications">查询</el-button>
                </el-form-item>
            </el-form>
        </div>

        <el-table :data="tableData" border stripe>
            <el-table-column prop="name" label="药品名称" min-width="120" />
            <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
            <el-table-column prop="price" label="价格" width="120">
                <template #default="scope">
                    <span class="price-cell">¥{{ scope.row.price }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="amount" label="库存" width="120">
                <template #default="scope">
                    <span class="amount-cell">{{ scope.row.amount }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="category" label="类别" width="120">
                <template #default="scope">
                    {{ getCategoryText(scope.row.category) }}
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
                <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)">
                        {{ getStatusText(scope.row.status) }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="update_date" label="更新时间" width="180">
                <template #default="scope">
                    {{ formatDate(scope.row.update_date) }}
                </template>
            </el-table-column>
        </el-table>

        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
            @current-change="pageNum = $event" />
    </div>
</template>

<style src="../style.scss" lang="scss" scoped />
