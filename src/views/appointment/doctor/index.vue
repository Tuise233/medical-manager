<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Appointment, AppointmentStatus, UpdateAppointmentDto } from '@/api/interface/appointment';
import { getAppointmentList, getAppointmentRecord, updateAppointment, updateAppointmentRecord, deletePrescription } from '@/api/modules/appointment';
import StatusTag from '../components/StatusTag.vue';
import { formatDate } from '@/utils';
import http from '@/api';
import { MedicalRecord } from '@/api/interface/medical-record';
import { Prescription } from '@/api/interface/prescription';
import { getMedicationList } from '@/api/modules/medication';
import type { Medication } from '@/api/interface/medication';
import { Edit, Check } from '@element-plus/icons-vue';

const data = ref<Appointment[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref('');
const searchStatus = ref<AppointmentStatus>();
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

// 添加病历和医嘱的状态
const medicalRecord = ref<MedicalRecord | null>(null);
const prescriptions = ref<Prescription[]>([]);

// 修改编辑状态的变量
const isEditingRecord = ref(false);  // 病历编辑状态
const isEditingPrescription = ref(false);  // 医嘱编辑状态
const editingRecord = ref<Partial<MedicalRecord>>({});
const editingPrescriptions = ref<Partial<Prescription>[]>([]);

// 添加药品相关状态
const medications = ref<Medication[]>([]);
const medicationKeyword = ref('');
const medicationLoading = ref(false);

// 获取病历和医嘱信息
async function getMedicalRecord(appointmentId: number) {
    try {
        const result = await getAppointmentRecord(appointmentId);
        if (Number(result.code) === 200) {
            medicalRecord.value = result.data.record;
            prescriptions.value = result.data.prescriptions;
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('获取病历信息失败');
    }
}

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

// 处理预约
function openProcessDialog(appointment: Appointment) {
    currentAppointment.value = appointment;
    rejectReason.value = '';
    // 初始化病历和医嘱
    editingRecord.value = {
        chief_complaint: '',
        present_illness: '',
        past_history: '',
        physical_exam: '',
        diagnosis: '',
        treatment_plan: '',
        note: ''
    };
    editingPrescriptions.value = [];
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
        await updateAppointment(currentAppointment.value.id, params);
        ElMessage.success('处理成功');
        showProcessDialog.value = false;
        queryAppointments();
    } catch (error) {
        console.error(error);
    }
}

async function handleComplete(id: number) {
    try {
        await ElMessageBox.confirm('确定要完成这个预约吗？', '提示', {
            type: 'warning'
        });
        await updateAppointment(id, { status: AppointmentStatus.Completed });
        ElMessage.success('操作成功');
        queryAppointments();
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

function canProcess(status: AppointmentStatus) {
    return status === AppointmentStatus.Pending;
}

function canComplete(status: AppointmentStatus) {
    return status === AppointmentStatus.Accepted;
}

// 修改查看预约详情函数
async function viewAppointmentDetail(appointment: Appointment) {
    currentAppointment.value = appointment;
    showAppointmentDetail.value = true;
    // 如果是已完成的预约，获取病历信息
    if (appointment.status === AppointmentStatus.Accepted) {
        await getMedicalRecord(appointment.id);
    }
}

// 在其他 ref 变量旁边添加
const showAppointmentDetail = ref(false);
const activeProcessTab = ref('basic');

// 开始编辑病历
function startEditRecord() {
    editingRecord.value = { ...medicalRecord.value };
    isEditingRecord.value = true;
}

// 开始编辑医嘱
function startEditPrescription() {
    editingPrescriptions.value = prescriptions.value.map(p => ({ ...p }));
    isEditingPrescription.value = true;
}

// 取消编辑病历
function cancelEditRecord() {
    isEditingRecord.value = false;
    editingRecord.value = {};
}

// 取消编辑医嘱
function cancelEditPrescription() {
    isEditingPrescription.value = false;
    editingPrescriptions.value = [];
}

// 保存病历
async function handleSaveRecord() {
    if (!currentAppointment.value) return;

    try {
        await updateAppointmentRecord(currentAppointment.value.id, {
            record: editingRecord.value,
            prescriptions: prescriptions.value // 保持原有医嘱不变
        });

        ElMessage.success('病历保存成功');
        isEditingRecord.value = false;
        // 重新获取最新数据
        await getMedicalRecord(currentAppointment.value.id);
    } catch (error) {
        console.error(error);
        ElMessage.error('保存失败');
    }
}

// 保存医嘱
async function handleSavePrescription() {
    if (!currentAppointment.value) return;

    try {
        await updateAppointmentRecord(currentAppointment.value.id, {
            record: medicalRecord.value || {}, // 保持原有病历不变
            prescriptions: editingPrescriptions.value
        });

        ElMessage.success('医嘱保存成功');
        isEditingPrescription.value = false;
        // 重新获取最新数据
        await getMedicalRecord(currentAppointment.value.id);
    } catch (error) {
        console.error(error);
        ElMessage.error('保存失败');
    }
}

// 添加医嘱
function addPrescription() {
    editingPrescriptions.value.push({
        type: 0,
        description: '',
        frequency: '',
        dosage: '',
        duration: 1,
        note: ''
    });
}

// 删除医嘱
async function removePrescription(index: number) {
    // 如果是新添加的医嘱（还未保存），直接从数组中移除
    if (!editingPrescriptions.value[index].id) {
        editingPrescriptions.value.splice(index, 1);
        return;
    }

    try {
        await ElMessageBox.confirm('确定要删除这条医嘱吗？', '提示', {
            type: 'warning'
        });

        const prescriptionId = editingPrescriptions.value[index].id!;
        await deletePrescription(currentAppointment.value!.id, prescriptionId);

        ElMessage.success('删除成功');
        editingPrescriptions.value.splice(index, 1);
    } catch (error) {
        if (error !== 'cancel') {
            console.error(error);
            ElMessage.error('删除失败');
        }
    }
}

// 在 script setup 中添加
const activeDetailTab = ref('basic');

// 修改处理预约函数
async function handleAcceptWithRecord() {
    if (!currentAppointment.value) return;

    try {
        // 先接受预约
        await updateAppointment(currentAppointment.value.id, {
            status: AppointmentStatus.Accepted
        });

        // 保存病历和医嘱
        await updateAppointmentRecord(currentAppointment.value.id, {
            record: editingRecord.value,
            prescriptions: editingPrescriptions.value
        });

        ElMessage.success('处理成功');
        showProcessDialog.value = false;
        queryAppointments();
    } catch (error) {
        console.error(error);
        ElMessage.error('处理失败');
    }
}

// 搜索药品
async function searchMedications(keyword: string) {
    medicationLoading.value = true;
    try {
        const res = await getMedicationList({
            pageNum: 1,
            pageSize: 20,
            searchValue: keyword
        });
        if (Number(res.code) === 200) {
            medications.value = res.data.list;
        }
    } finally {
        medicationLoading.value = false;
    }
}

// 选择药品后自动填充信息
function handleSelectMedication(medication: Medication, index: number) {
    editingPrescriptions.value[index] = {
        ...editingPrescriptions.value[index],
        description: medication.name,
        dosage: '',
        frequency: '',
        duration: 1,
        note: ''
    };
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
                <el-table-column prop="patient.real_name" label="患者姓名" width="120">
                    <template #default="scope">
                        {{ scope.row.patient.real_name }}
                    </template>
                </el-table-column>
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
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button v-if="canProcess(scope.row.status)" type="primary" link
                            @click="openProcessDialog(scope.row)">
                            处理预约
                        </el-button>
                        <el-button v-if="canComplete(scope.row.status)" type="success" link
                            @click="handleComplete(scope.row.id)">
                            完成预约
                        </el-button>
                        <el-button type="primary" link @click="viewAppointmentDetail(scope.row)">查看详情</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
                @current-change="handlePageChange" @size-change="handlePageSizeChange" />
        </div>

        <!-- 修改处理预约对话框 -->
        <el-dialog v-model="showProcessDialog" title="处理预约" width="800px">
            <div class="process-form" v-if="currentAppointment">
                <el-tabs v-model="activeProcessTab">
                    <el-tab-pane label="基本信息" name="basic">
                        <div class="info-item">
                            <span class="label">患者姓名:</span>
                            <span class="value">{{ currentAppointment.patient.real_name }}</span>
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
                    </el-tab-pane>

                    <el-tab-pane label="病历记录" name="record">
                        <div class="medical-record">
                            <div class="record-item">
                                <div class="label">主诉：</div>
                                <el-input v-model="editingRecord.chief_complaint" type="textarea" :rows="2"
                                    placeholder="请输入主诉" />
                            </div>
                            <div class="record-item">
                                <div class="label">现病史：</div>
                                <el-input v-model="editingRecord.present_illness" type="textarea" :rows="3"
                                    placeholder="请输入现病史" />
                            </div>
                            <div class="record-item">
                                <div class="label">既往史：</div>
                                <el-input v-model="editingRecord.past_history" type="textarea" :rows="3"
                                    placeholder="请输入既往史" />
                            </div>
                            <div class="record-item">
                                <div class="label">体格检查：</div>
                                <el-input v-model="editingRecord.physical_exam" type="textarea" :rows="3"
                                    placeholder="请输入体格检查结果" />
                            </div>
                            <div class="record-item">
                                <div class="label">诊断：</div>
                                <el-input v-model="editingRecord.diagnosis" type="textarea" :rows="2"
                                    placeholder="请输入诊断结果" />
                            </div>
                            <div class="record-item">
                                <div class="label">治疗计划：</div>
                                <el-input v-model="editingRecord.treatment_plan" type="textarea" :rows="3"
                                    placeholder="请输入治疗计划" />
                            </div>
                            <div class="record-item">
                                <div class="label">备注：</div>
                                <el-input v-model="editingRecord.note" type="textarea" :rows="2" placeholder="请输入备注" />
                            </div>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="医嘱信息" name="prescription">
                        <div class="prescription-section">
                            <el-button type="primary" @click="addPrescription">添加医嘱</el-button>
                            <el-table :data="editingPrescriptions" border stripe class="mt-4">
                                <el-table-column prop="description" label="药品名称" min-width="120">
                                    <template #default="scope">
                                        <el-select v-model="scope.row.description" filterable remote reserve-keyword
                                            placeholder="搜索药品名称" :remote-method="searchMedications"
                                            :loading="medicationLoading">
                                            <el-option v-for="item in medications" :key="item.id" :label="item.name"
                                                :value="item.name" @click="handleSelectMedication(item, scope.$index)">
                                                <div class="medication-option">
                                                    <span>{{ item.name }}</span>
                                                    <small>{{ item.description }}</small>
                                                </div>
                                            </el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="frequency" label="频次" width="120">
                                    <template #default="scope">
                                        <el-input v-model="scope.row.frequency" placeholder="如：一日三次" />
                                    </template>
                                </el-table-column>
                                <el-table-column prop="dosage" label="用量" width="120">
                                    <template #default="scope">
                                        <el-input v-model="scope.row.dosage" placeholder="如：5ml" />
                                    </template>
                                </el-table-column>
                                <el-table-column prop="duration" label="天数" width="100">
                                    <template #default="scope">
                                        <el-input-number v-model="scope.row.duration" :min="1" :max="30" />
                                    </template>
                                </el-table-column>
                                <el-table-column prop="note" label="备注" min-width="150">
                                    <template #default="scope">
                                        <el-input v-model="scope.row.note" placeholder="请输入备注" />
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="80" fixed="right">
                                    <template #default="scope">
                                        <el-button type="danger" link
                                            @click="removePrescription(scope.$index)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <template #footer>
                <el-button @click="showProcessDialog = false">取消</el-button>
                <el-button type="danger" @click="handleProcess(AppointmentStatus.Rejected)">拒绝</el-button>
                <el-button type="primary" @click="handleAcceptWithRecord">接受并保存</el-button>
            </template>
        </el-dialog>

        <!-- 修改预约详情抽屉 -->
        <el-drawer v-model="showAppointmentDetail" title="就诊详情" size="80%" direction="rtl">
            <div class="detail-content" v-if="currentAppointment">
                <el-tabs v-model="activeDetailTab" class="detail-tabs">
                    <el-tab-pane label="基本信息" name="basic">
                        <div class="section">
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
                                    <span class="label">患者姓名：</span>
                                    <span class="value">{{ currentAppointment.patient.real_name }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">就诊状态：</span>
                                    <span class="value">
                                        <StatusTag :status="currentAppointment.status" />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="section">
                            <h3>预约描述</h3>
                            <p class="description">{{ currentAppointment.description }}</p>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane v-if="currentAppointment.status === AppointmentStatus.Accepted" label="病历信息"
                        name="record">
                        <div class="section">
                            <div class="section-header">
                                <h3>病历记录</h3>
                                <div class="header-actions">
                                    <template v-if="!isEditingRecord">
                                        <el-button type="primary" :icon="Edit" @click="startEditRecord">
                                            编辑病历
                                        </el-button>
                                    </template>
                                    <template v-else>
                                        <el-button-group>
                                            <el-button @click="cancelEditRecord">取消</el-button>
                                            <el-button type="primary" :icon="Check"
                                                @click="handleSaveRecord">保存</el-button>
                                        </el-button-group>
                                    </template>
                                </div>
                            </div>

                            <div class="medical-record">
                                <template v-if="!isEditingRecord">
                                    <!-- 显示模式 -->
                                    <div class="record-item" v-if="medicalRecord">
                                        <div class="label">主诉：</div>
                                        <div class="value">{{ medicalRecord.chief_complaint }}</div>
                                    </div>
                                    <div class="record-item">
                                        <div class="label">现病史：</div>
                                        <div class="value">{{ medicalRecord?.present_illness }}</div>
                                    </div>
                                    <div class="record-item">
                                        <div class="label">既往史：</div>
                                        <div class="value">{{ medicalRecord?.past_history }}</div>
                                    </div>
                                    <div class="record-item">
                                        <div class="label">体格检查：</div>
                                        <div class="value">{{ medicalRecord?.physical_exam }}</div>
                                    </div>
                                    <div class="record-item">
                                        <div class="label">诊断：</div>
                                        <div class="value">{{ medicalRecord?.diagnosis }}</div>
                                    </div>
                                    <div class="record-item">
                                        <div class="label">治疗计划：</div>
                                        <div class="value">{{ medicalRecord?.treatment_plan }}</div>
                                    </div>
                                    <div class="record-item">
                                        <div class="label">备注：</div>
                                        <div class="value">{{ medicalRecord?.note || '无' }}</div>
                                    </div>
                                </template>
                                <template v-else>
                                    <!-- 编辑模式 -->
                                    <div class="record-item">
                                        <div class="label">主诉：</div>
                                        <el-input v-model="editingRecord.chief_complaint" type="textarea" :rows="2" />
                                    </div>
                                    <div class="record-item">
                                        <div class="label">现病史：</div>
                                        <el-input v-model="editingRecord.present_illness" type="textarea" :rows="3" />
                                    </div>
                                    <div class="record-item">
                                        <div class="label">既往史：</div>
                                        <el-input v-model="editingRecord.past_history" type="textarea" :rows="3" />
                                    </div>
                                    <div class="record-item">
                                        <div class="label">体格检查：</div>
                                        <el-input v-model="editingRecord.physical_exam" type="textarea" :rows="3" />
                                    </div>
                                    <div class="record-item">
                                        <div class="label">诊断：</div>
                                        <el-input v-model="editingRecord.diagnosis" type="textarea" :rows="2" />
                                    </div>
                                    <div class="record-item">
                                        <div class="label">治疗计划：</div>
                                        <el-input v-model="editingRecord.treatment_plan" type="textarea" :rows="3" />
                                    </div>
                                    <div class="record-item">
                                        <div class="label">备注：</div>
                                        <el-input v-model="editingRecord.note" type="textarea" :rows="2" />
                                    </div>
                                </template>
                            </div>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane v-if="currentAppointment.status === AppointmentStatus.Accepted" label="医嘱信息"
                        name="prescription">
                        <div class="section">
                            <div class="section-header">
                                <h3>医嘱列表</h3>
                                <div class="header-actions">
                                    <template v-if="!isEditingPrescription">
                                        <el-button type="primary" :icon="Edit" @click="startEditPrescription">
                                            编辑医嘱
                                        </el-button>
                                    </template>
                                    <template v-else>
                                        <el-button-group>
                                            <el-button @click="cancelEditPrescription">取消</el-button>
                                            <el-button type="primary" :icon="Check"
                                                @click="handleSavePrescription">保存</el-button>
                                        </el-button-group>
                                        <el-button type="primary" @click="addPrescription">添加医嘱</el-button>
                                    </template>
                                </div>
                            </div>

                            <template v-if="!isEditingPrescription">
                                <!-- 显示模式 -->
                                <el-table :data="prescriptions" border stripe>
                                    <el-table-column prop="description" label="药品名称" min-width="80" />
                                    <el-table-column prop="frequency" label="频次" width="220" />
                                    <el-table-column prop="dosage" label="用量" width="120" />
                                    <el-table-column prop="duration" label="天数" width="80">
                                        <template #default="scope">
                                            {{ scope.row.duration }}天
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="note" label="备注" min-width="150" show-overflow-tooltip />
                                </el-table>
                                <div v-if="!prescriptions.length" class="empty-block">
                                    暂无医嘱信息
                                </div>
                            </template>
                            <template v-else>
                                <!-- 编辑模式 -->
                                <el-table :data="editingPrescriptions" border stripe>
                                    <el-table-column prop="description" label="药品名称" min-width="80">
                                        <template #default="scope">
                                            <el-select v-model="scope.row.description" filterable remote reserve-keyword
                                                placeholder="搜索药品名称" :remote-method="searchMedications"
                                                :loading="medicationLoading">
                                                <el-option v-for="item in medications" :key="item.id" :label="item.name"
                                                    :value="item.name"
                                                    @click="handleSelectMedication(item, scope.$index)">
                                                    <div class="medication-option">
                                                        <span>{{ item.name }}</span>
                                                        <small>{{ item.description }}</small>
                                                    </div>
                                                </el-option>
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="frequency" label="频次" width="220">
                                        <template #default="scope">
                                            <el-input v-model="scope.row.frequency" placeholder="如：一日三次" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="dosage" label="用量" width="120">
                                        <template #default="scope">
                                            <el-input v-model="scope.row.dosage" placeholder="如：5ml" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="duration" label="天数" width="100">
                                        <template #default="scope">
                                            <el-input v-model="scope.row.duration" :min="1" :max="30" type="number" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="note" label="备注" min-width="150">
                                        <template #default="scope">
                                            <el-input v-model="scope.row.note" placeholder="请输入备注" />
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="80" fixed="right">
                                        <template #default="scope">
                                            <el-button type="danger" link @click="removePrescription(scope.$index)">
                                                删除
                                            </el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div v-if="!editingPrescriptions.length" class="empty-block">
                                    点击"添加医嘱"按钮开始添加医嘱
                                </div>
                            </template>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-drawer>
    </div>
</template>

<style lang="scss" src="./style.scss" scoped />