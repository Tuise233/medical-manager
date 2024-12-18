<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, FormInstance } from 'element-plus';
import { Appointment } from '@/api/interface/appointment';
import { getAppointmentList } from '@/api/modules/appointment';
import { getPatientList, getPatientProfile, updatePatientBasicInfo, updatePatientHealthInfo } from '@/api/modules/user';
import StatusTag from '@/views/appointment/components/StatusTag.vue';
import PageDivider from "@/components/PageDivider/index.vue";
import { formatDate } from '@/utils';
import { Gender, BloodType, AlcoholConsumption, BasicInfo, HealthInfo } from '@/api/interface/user';

// 患者列表相关
const patients = ref<any[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref('');

// 患者详情相关
const showPatientDetail = ref(false);
const currentPatient = ref<any>(null);
const appointments = ref<Appointment[]>([]);

// 预约详情相关
const showAppointmentDetail = ref(false);
const currentAppointment = ref<Appointment | null>(null);
const medications = ref<any[]>([]);

// 编辑基本信息相关
const showBasicInfoDialog = ref(false);
const basicFormRef = ref<FormInstance | null>(null);
const basicForm = ref<BasicInfo>({
    address: '',
    birth_date: undefined,
    gender: Gender.Male,
    emergency_contact: '',
    emergency_contact_phone: ''
});
const basicRules = {
    gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    birth_date: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
    emergency_contact: [{ required: true, message: '请输入紧急联系人', trigger: 'blur' }],
    emergency_contact_phone: [{ required: true, message: '请输入紧急联系电话', trigger: 'blur' }]
};

// 编辑健康信息相关
const showHealthInfoDialog = ref(false);
const healthFormRef = ref<FormInstance | null>(null);
const healthForm = ref<HealthInfo>({
    height: 0,
    weight: 0,
    blood_type: BloodType.A,
    blood_pressure: '',
    allergies: '',
    chronic_conditions: '',
    medical_history: '',
    current_medications: '',
    alcohol_consumption: AlcoholConsumption.None,
    heart_rate: 0,
    body_temperature: 36.5
});
const healthRules = {
    height: [{ required: true, message: '请输入身高', trigger: 'blur' }],
    weight: [{ required: true, message: '请输入体重', trigger: 'blur' }],
    blood_type: [{ required: true, message: '请选择血型', trigger: 'change' }]
};

// 加载患者列表
async function loadPatients() {
    try {
        const res = await getPatientList({
            pageNum: pageNum.value,
            pageSize: pageSize.value,
            searchValue: searchValue.value
        });
        if (Number(res.code) === 200) {
            // 确保每个患者都有完整的数据结构
            patients.value = res.data.list.map(patient => ({
                ...patient,
                basicInfo: patient.basicInfo || {},
                healthInfo: patient.healthInfo || {}
            }));
            total.value = res.data.total;
        }
    } catch (error) {
        console.error(error);
        ElMessage.error('获取患者列表失败');
    }
}

// 查看患者详情
async function viewPatientDetail(patient: any) {
    try {
        const profileRes = await getPatientProfile(patient.id);
        if (Number(profileRes.code) === 200) {
            // 确保数据结构正确
            currentPatient.value = {
                ...profileRes.data,
                basicInfo: profileRes.data.basicInfo || {},
                healthInfo: profileRes.data.healthInfo || {}
            };
        }

        const appointmentRes = await getAppointmentList({
            pageNum: 1,
            pageSize: 1000,
            patient_id: patient.id
        });
        if (appointmentRes.data) {
            appointments.value = appointmentRes.data.list;
        }

        showPatientDetail.value = true;
    } catch (error) {
        console.error(error);
        ElMessage.error('获取患者详情失败');
    }
}

// 查看预约详情
function viewAppointmentDetail(appointment: Appointment) {
    currentAppointment.value = appointment;
    showAppointmentDetail.value = true;
}

function handleSearch() {
    pageNum.value = 1;
    loadPatients();
}

function handlePageChange(page: number) {
    pageNum.value = page;
    loadPatients();
}

function handlePageSizeChange(size: number) {
    pageSize.value = size;
    loadPatients();
}

function resetSearch() {
    searchValue.value = '';
    handleSearch();
}

onMounted(() => {
    loadPatients();
});

const activeTab = ref('basic');

// 编辑基本信息
function editBasicInfo() {
    const basic_info = currentPatient.value.basic_info || currentPatient.value.basicInfo;
    basicForm.value = {
        address: basic_info.address || '',
        birth_date: basic_info.birth_date ? new Date(basic_info.birth_date) : undefined,
        gender: basic_info.gender ?? Gender.Male,
        emergency_contact: basic_info.emergency_contact || '',
        emergency_contact_phone: basic_info.emergency_contact_phone || ''
    };
    showBasicInfoDialog.value = true;
}

// 编辑健康信息
function editHealthInfo() {
    const health_info = currentPatient.value.health_info || currentPatient.value.healthInfo;
    healthForm.value = {
        height: health_info.height || 0,
        weight: health_info.weight || 0,
        blood_type: health_info.blood_type ?? BloodType.A,
        blood_pressure: health_info.blood_pressure || '',
        allergies: health_info.allergies || '',
        chronic_conditions: health_info.chronic_conditions || '',
        medical_history: health_info.medical_history || '',
        current_medications: health_info.current_medications || '',
        alcohol_consumption: health_info.alcohol_consumption ?? AlcoholConsumption.None,
        heart_rate: health_info.heart_rate || 0,
        body_temperature: health_info.body_temperature || 36.5
    };
    showHealthInfoDialog.value = true;
}

function getGenderText(gender: Gender) {
    return {
        [Gender.Male]: '男',
        [Gender.Female]: '女'
    }[gender] || '未知';
}

function getBloodTypeText(type: BloodType) {
    return {
        [BloodType.A]: 'A型',
        [BloodType.B]: 'B型',
        [BloodType.AB]: 'AB型',
        [BloodType.O]: 'O型'
    }[type] || '未知';
}

function getAlcoholConsumptionText(consumption: AlcoholConsumption) {
    return {
        [AlcoholConsumption.None]: '从不',
        [AlcoholConsumption.Occasional]: '偶尔',
        [AlcoholConsumption.Regular]: '经常'
    }[consumption] || '未知';
}

// 添加保存函数
async function handleSaveBasicInfo() {
    if (!basicFormRef.value) return;
    await basicFormRef.value.validate(async (valid) => {
        if (!valid) return;
        try {
            // 格式化日期为 YYYY-MM-DD 格式
            const formData = {
                ...basicForm.value,
                birth_date: basicForm.value.birth_date ? formatDate(basicForm.value.birth_date, 'YYYY-MM-DD') : undefined
            };

            const res = await updatePatientBasicInfo(currentPatient.value.id, formData);
            if (Number(res.code) === 200) {
                ElMessage.success('保存成功');
                showBasicInfoDialog.value = false;
                viewPatientDetail(currentPatient.value);
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('保存失败');
        }
    });
}

async function handleSaveHealthInfo() {
    if (!healthFormRef.value) return;
    await healthFormRef.value.validate(async (valid) => {
        if (!valid) return;
        try {
            const res = await updatePatientHealthInfo(currentPatient.value.id, healthForm.value);
            if (Number(res.code) === 200) {
                ElMessage.success('保存成功');
                showHealthInfoDialog.value = false;
                viewPatientDetail(currentPatient.value);
            }
        } catch (error) {
            console.error(error);
        }
    });
}

function calculateAge(birthDate: string | Date) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}
</script>

<template>
    <div class="app-page">
        <div class="app-header">
            <div class="app-search">
                <span>患者信息</span>
                <el-input v-model="searchValue" placeholder="请输入患者姓名/手机号">
                    <template #append>
                        <el-button @click="handleSearch">
                            <el-icon>
                                <Search />
                            </el-icon>
                        </el-button>
                    </template>
                </el-input>
                <el-button @click="resetSearch">重置</el-button>
            </div>
            <PageDivider @page-size-change="handlePageSizeChange" />
        </div>

        <div class="app-content">
            <el-table :data="patients" stripe>
                <el-table-column prop="real_name" label="姓名" width="120" />
                <el-table-column label="性别" width="80">
                    <template #default="scope">
                        {{ getGenderText(scope.row.basicInfo?.gender) }}
                    </template>
                </el-table-column>
                <el-table-column label="年龄" width="80">
                    <template #default="scope">
                        {{ scope.row.basicInfo?.birth_date ? calculateAge(scope.row.basicInfo.birth_date) : '-' }}
                    </template>
                </el-table-column>
                <el-table-column prop="phone" label="联系电话" width="150" />
                <el-table-column label="紧急联系人" width="200">
                    <template #default="scope">
                        {{ scope.row.basicInfo?.emergency_contact }} ({{ scope.row.basicInfo?.emergency_contact_phone
                        }})
                    </template>
                </el-table-column>
                <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="scope">
                        <el-button type="primary" link @click="viewPatientDetail(scope.row)">
                            查看详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
                @current-change="handlePageChange" />
        </div>

        <!-- 患者详情抽屉 -->
        <el-drawer v-model="showPatientDetail" title="患者详情" size="80%">
            <div class="patient-detail">
                <el-tabs v-model="activeTab">
                    <!-- 基本信息标签页 -->
                    <el-tab-pane label="基本信息" name="basic">
                        <el-card class="info-card">
                            <template #header>
                                <div class="card-header">
                                    <span>基本信息</span>
                                    <el-button type="primary" link @click="editBasicInfo">
                                        编辑
                                    </el-button>
                                </div>
                            </template>
                            <div class="info-content" v-if="currentPatient">
                                <div class="info-item">
                                    <span class="label">姓名：</span>
                                    <span class="value">{{ currentPatient.real_name }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">性别：</span>
                                    <span class="value">{{ getGenderText(currentPatient.basicInfo.gender) }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">出生日期：</span>
                                    <span class="value">{{ formatDate(currentPatient.basicInfo.birth_date) }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">电话：</span>
                                    <span class="value">{{ currentPatient.phone }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">邮箱：</span>
                                    <span class="value">{{ currentPatient.email }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">地址：</span>
                                    <span class="value">{{ currentPatient.basicInfo.address }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">紧急联系人：</span>
                                    <span class="value">{{ currentPatient.basicInfo.emergency_contact }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">紧急联系电话：</span>
                                    <span class="value">{{ currentPatient.basicInfo.emergency_contact_phone }}</span>
                                </div>
                            </div>
                        </el-card>
                    </el-tab-pane>

                    <!-- 健康信息标签页 -->
                    <el-tab-pane label="健康信息" name="health">
                        <el-card class="info-card">
                            <template #header>
                                <div class="card-header">
                                    <span>健康信息</span>
                                    <el-button type="primary" link @click="editHealthInfo">
                                        编辑
                                    </el-button>
                                </div>
                            </template>
                            <div class="info-content" v-if="currentPatient">
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="label">身高：</span>
                                        <span class="value">{{ currentPatient.healthInfo.height }}cm</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">体重：</span>
                                        <span class="value">{{ currentPatient.healthInfo.weight }}kg</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">血型：</span>
                                        <span class="value">{{ getBloodTypeText(currentPatient.healthInfo.blood_type)
                                            }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">血压：</span>
                                        <span class="value">{{ currentPatient.healthInfo.blood_pressure }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">心率：</span>
                                        <span class="value">{{ currentPatient.healthInfo.heart_rate }}次/分</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">体温：</span>
                                        <span class="value">{{ currentPatient.healthInfo.body_temperature }}°C</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">饮酒情况：</span>
                                        <span class="value">{{
                                            getAlcoholConsumptionText(currentPatient.healthInfo.alcohol_consumption)
                                            }}</span>
                                    </div>
                                </div>

                                <!-- 长文本信息单独放在下方 -->
                                <div class="long-text-section">
                                    <div class="info-item">
                                        <div class="label">过敏史：</div>
                                        <div class="value">{{ currentPatient.healthInfo.allergies || '无' }}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="label">慢性病：</div>
                                        <div class="value">{{ currentPatient.healthInfo.chronic_conditions || '无' }}
                                        </div>
                                    </div>
                                    <div class="info-item">
                                        <div class="label">病史：</div>
                                        <div class="value">{{ currentPatient.healthInfo.medical_history || '无' }}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="label">当前用药：</div>
                                        <div class="value">{{ currentPatient.healthInfo.current_medications || '无' }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-card>
                    </el-tab-pane>

                    <!-- 就诊记录标签页 -->
                    <el-tab-pane label="就诊记录" name="appointments">
                        <el-card class="appointment-card">
                            <el-table :data="appointments" stripe>
                                <el-table-column prop="date_time" label="就诊时间" width="180">
                                    <template #default="scope">
                                        {{ formatDate(scope.row.date_time) }}
                                    </template>
                                </el-table-column>
                                <el-table-column prop="duration" label="时长" width="100">
                                    <template #default="scope">
                                        {{ scope.row.duration }}分钟
                                    </template>
                                </el-table-column>
                                <el-table-column prop="doctor.real_name" label="主治医生" width="120" />
                                <el-table-column prop="description" label="病情描述" show-overflow-tooltip />
                                <el-table-column label="状态" width="100">
                                    <template #default="scope">
                                        <StatusTag :status="scope.row.status" />
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="120" fixed="right">
                                    <template #default="scope">
                                        <el-button type="primary" link @click="viewAppointmentDetail(scope.row)">
                                            查看详情
                                        </el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-card>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </el-drawer>

        <!-- 预约详情对话框 -->
        <el-dialog v-model="showAppointmentDetail" title="就诊详情" width="800px">
            <div class="detail-content" v-if="currentAppointment">
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

                <div class="section">
                    <h3>病情描述</h3>
                    <p class="description">{{ currentAppointment.description }}</p>
                </div>

                <div class="section">
                    <h3>医嘱信息</h3>
                    <div class="medical-advice">
                        {{ '暂无医嘱信息' }}
                    </div>
                </div>

                <div class="section">
                    <h3>用药记录</h3>
                    <el-table :data="medications" border stripe>
                        <el-table-column prop="name" label="药品名称" />
                        <el-table-column prop="dosage" label="用量" />
                        <el-table-column prop="frequency" label="服用频率" />
                        <el-table-column prop="duration" label="服用天数" />
                        <el-table-column prop="notes" label="备注" show-overflow-tooltip />
                    </el-table>
                </div>

                <div class="section">
                    <h3>备注信息</h3>
                    <div class="remarks">
                        {{ '暂无备注信息' }}
                    </div>
                </div>
            </div>
        </el-dialog>

        <!-- 编辑基本信息对话框 -->
        <el-dialog v-model="showBasicInfoDialog" title="编辑基本信息" width="600px">
            <el-form ref="basicFormRef" :model="basicForm" :rules="basicRules" label-width="100px">
                <el-form-item label="性别" prop="gender">
                    <el-radio-group v-model="basicForm.gender">
                        <el-radio :label="Gender.Male">男</el-radio>
                        <el-radio :label="Gender.Female">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="出生日期" prop="birth_date">
                    <el-date-picker v-model="basicForm.birth_date" type="date" placeholder="选择日期" />
                </el-form-item>
                <el-form-item label="地址" prop="address">
                    <el-input v-model="basicForm.address" type="textarea" :rows="2" />
                </el-form-item>
                <el-form-item label="紧急联系人" prop="emergency_contact">
                    <el-input v-model="basicForm.emergency_contact" />
                </el-form-item>
                <el-form-item label="紧急电话" prop="emergency_contact_phone">
                    <el-input v-model="basicForm.emergency_contact_phone" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showBasicInfoDialog = false">取消</el-button>
                <el-button type="primary" @click="handleSaveBasicInfo">保存</el-button>
            </template>
        </el-dialog>

        <!-- 编辑健康信息对话框 -->
        <el-dialog v-model="showHealthInfoDialog" title="编辑健康信息" width="600px">
            <el-form ref="healthFormRef" :model="healthForm" :rules="healthRules" label-width="100px">
                <el-form-item label="身高(cm)" prop="height">
                    <el-input-number v-model="healthForm.height" :min="0" :max="300" />
                </el-form-item>
                <el-form-item label="体重(kg)" prop="weight">
                    <el-input-number v-model="healthForm.weight" :min="0" :max="500" />
                </el-form-item>
                <el-form-item label="血型" prop="blood_type">
                    <el-select v-model="healthForm.blood_type">
                        <el-option label="A型" :value="BloodType.A" />
                        <el-option label="B型" :value="BloodType.B" />
                        <el-option label="AB型" :value="BloodType.AB" />
                        <el-option label="O型" :value="BloodType.O" />
                    </el-select>
                </el-form-item>
                <el-form-item label="血压" prop="blood_pressure">
                    <el-input v-model="healthForm.blood_pressure" />
                </el-form-item>
                <el-form-item label="心率" prop="heart_rate">
                    <el-input-number v-model="healthForm.heart_rate" :min="0" :max="300" />
                </el-form-item>
                <el-form-item label="体温(°C)" prop="body_temperature">
                    <el-input-number v-model="healthForm.body_temperature" :min="35" :max="42" :precision="1"
                        :step="0.1" />
                </el-form-item>
                <el-form-item label="过敏史" prop="allergies">
                    <el-input v-model="healthForm.allergies" type="textarea" :rows="2" />
                </el-form-item>
                <el-form-item label="慢性病" prop="chronic_conditions">
                    <el-input v-model="healthForm.chronic_conditions" type="textarea" :rows="2" />
                </el-form-item>
                <el-form-item label="病史" prop="medical_history">
                    <el-input v-model="healthForm.medical_history" type="textarea" :rows="3" />
                </el-form-item>
                <el-form-item label="当前用药" prop="current_medications">
                    <el-input v-model="healthForm.current_medications" type="textarea" :rows="2" />
                </el-form-item>
                <el-form-item label="饮酒情况" prop="alcohol_consumption">
                    <el-select v-model="healthForm.alcohol_consumption">
                        <el-option label="从不" :value="AlcoholConsumption.None" />
                        <el-option label="偶尔" :value="AlcoholConsumption.Occasional" />
                        <el-option label="经常" :value="AlcoholConsumption.Regular" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="showHealthInfoDialog = false">取消</el-button>
                <el-button type="primary" @click="handleSaveHealthInfo">保存</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss" src="./style.scss" scoped />
