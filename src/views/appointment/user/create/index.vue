<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { CreateAppointmentDto } from '@/api/interface/appointment';
import { createAppointment } from '@/api/modules/appointment';
import { getDoctorList } from '@/api/modules/admin';
import { AdminUser } from '@/api/interface/admin';
import { useRouter } from 'vue-router';

const router = useRouter();
const formRef = ref<FormInstance>();
const doctors = ref<AdminUser[]>([]);
const loading = ref(false);

const form = reactive<CreateAppointmentDto>({
    doctor_id: undefined,
    description: '',
    date_time: new Date(),
    duration: 30
});

const rules: FormRules = {
    doctor_id: [{ required: true, message: '请选择医生', trigger: 'change' }],
    description: [{ required: true, message: '请描述病情', trigger: 'blur' }],
    date_time: [{ required: true, message: '请选择预约时间', trigger: 'change' }]
};

// 获取医生列表
async function loadDoctors() {
    const res = await getDoctorList();
    if (Number(res.code) === 200) {
        doctors.value = res.data;
    }
}

// 提交预约
async function handleSubmit() {
    if (!formRef.value) return;

    await formRef.value.validate(async (valid) => {
        if (!valid) return;

        loading.value = true;
        try {
            const res = await createAppointment(form);
            if (Number(res.code) === 200) {
                ElMessage.success('预约成功');
                router.push('/appointment/user/history/index');
            }
        } finally {
            loading.value = false;
        }
    });
}

loadDoctors();
</script>

<template>
    <div class="app-container">
        <div class="form-wrapper">
            <h2>预约挂号</h2>
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="选择医生" prop="doctor_id">
                    <el-select v-model="form.doctor_id" placeholder="请选择医生">
                        <el-option v-for="doctor in doctors" :key="doctor.id" :label="doctor.real_name"
                            :value="doctor.id" />
                    </el-select>
                </el-form-item>

                <el-form-item label="预约时间" prop="date_time">
                    <el-date-picker v-model="form.date_time" type="datetime" placeholder="选择日期时间" />
                </el-form-item>

                <el-form-item label="预约时长" prop="duration">
                    <el-input-number v-model="form.duration" :min="30" :step="30" :max="120" />
                    <span class="duration-hint">分钟</span>
                </el-form-item>

                <el-form-item label="病情描述" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请详细描述您的症状..." />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSubmit" :loading="loading">提交预约</el-button>
                    <el-button @click="router.back()">返回</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<style lang="scss" src="./style.scss" scoped />