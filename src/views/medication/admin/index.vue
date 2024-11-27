<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { getMedicationList, createMedication, updateMedication, deleteMedication } from "@/api/modules/medication";
import { Medication, MedicationCategory, MedicationStatus, CreateMedicationDto } from "@/api/interface/medication";
import { formatDate } from "@/utils";

// 表格数据
const tableData = ref<Medication[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref("");
const searchCategory = ref<MedicationCategory>();
const searchStatus = ref<MedicationStatus>();

// 弹窗控制
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const formRef = ref<FormInstance>();
const editingId = ref<number>();

// 表单数据
const createForm = reactive<CreateMedicationDto>({
    name: "",
    description: "",
    price: 0,
    amount: 0,
    category: MedicationCategory.Unknown,
    status: MedicationStatus.Disable
});

// 表单校验规则
const rules = reactive<FormRules>({
    name: [{ required: true, message: "请输入药品名称", trigger: "blur" }],
    price: [{ required: true, message: "请输入药品价格", trigger: "blur" }],
    amount: [{ required: true, message: "请输入库存数量", trigger: "blur" }],
    category: [{ required: true, message: "请选择药品类别", trigger: "change" }]
});

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

// 创建药品
async function handleCreate() {
    if (!formRef.value) return;
    await formRef.value.validate(async valid => {
        if (!valid) return;
        try {
            await createMedication(createForm);
            ElMessage.success("创建成功");
            showCreateDialog.value = false;
            queryMedications();
        } catch (error) {
            console.error(error);
        }
    });
}

// 编辑药品
function openEditDialog(row: Medication) {
    editingId.value = row.id;
    Object.assign(createForm, row);
    showEditDialog.value = true;
}

async function handleEdit() {
    if (!editingId.value || !formRef.value) return;
    await formRef.value.validate(async valid => {
        if (!valid) return;
        try {
            await updateMedication(editingId.value as number, createForm);
            ElMessage.success("修改成功");
            showEditDialog.value = false;
            queryMedications();
        } catch (error) {
            console.error(error);
        }
    });
}

// 删除药品
async function handleDelete(id: number) {
    try {
        await ElMessageBox.confirm("确定要删除该药品吗？", "提示", {
            type: "warning"
        });
        await deleteMedication(id);
        ElMessage.success("删除成功");
        queryMedications();
    } catch (error) {
        console.error(error);
    }
}

function handlePageChange(curPage: number) {
    pageNum.value = curPage;
    queryMedications();
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
                    <el-button type="primary" @click="showCreateDialog = true">新增</el-button>
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
                    <span class="amount-cell">{{ scope.row.amount }}件</span>
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
            <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                    <el-button type="primary" link @click="openEditDialog(scope.row)">编辑</el-button>
                    <el-button type="danger" link @click="handleDelete(scope.row.id)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
            @current-change="handlePageChange" />

        <!-- 创建药品弹窗 -->
        <el-dialog v-model="showCreateDialog" title="新增药品" width="500px">
            <el-form ref="formRef" :model="createForm" :rules="rules" label-width="100px">
                <el-form-item label="药品名称" prop="name">
                    <el-input v-model="createForm.name" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="createForm.description" type="textarea" />
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input-number v-model="createForm.price" :min="0" />
                </el-form-item>
                <el-form-item label="库存" prop="amount">
                    <el-input-number v-model="createForm.amount" :min="0" />
                </el-form-item>
                <el-form-item label="类别" prop="category">
                    <el-select v-model="createForm.category">
                        <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="createForm.status">
                        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showCreateDialog = false">取消</el-button>
                <el-button type="primary" @click="handleCreate">确定</el-button>
            </template>
        </el-dialog>

        <!-- 编辑药品弹窗 -->
        <el-dialog v-model="showEditDialog" title="编辑药品" width="500px">
            <el-form ref="formRef" :model="createForm" :rules="rules" label-width="100px">
                <el-form-item label="药品名称" prop="name">
                    <el-input v-model="createForm.name" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="createForm.description" type="textarea" />
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input-number v-model="createForm.price" :min="0" />
                </el-form-item>
                <el-form-item label="库存" prop="amount">
                    <el-input-number v-model="createForm.amount" :min="0" />
                </el-form-item>
                <el-form-item label="类别" prop="category">
                    <el-select v-model="createForm.category">
                        <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-select v-model="createForm.status">
                        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showEditDialog = false">取消</el-button>
                <el-button type="primary" @click="handleEdit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style src="../style.scss" lang="scss" scoped />