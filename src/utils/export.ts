import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatDate } from '@/utils';
import { Appointment, AppointmentStatus } from '@/api/interface/appointment';
import { MedicalRecord } from '@/api/interface/medical-record';
import { Prescription } from '@/api/interface/prescription';
import { Gender, BloodType, AlcoholConsumption } from '@/api/interface/user';

// 表格样式配置
const styles = {
    header: {
        fill: { fgColor: { rgb: "4B90B1" } },
        font: { color: { rgb: "FFFFFF" }, bold: true, sz: 12 },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
        }
    },
    subHeader: {
        fill: { fgColor: { rgb: "E6F3F7" } },
        font: { bold: true, sz: 11 },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
        }
    },
    sectionTitle: {
        fill: { fgColor: { rgb: "F5F7FA" } },
        font: { bold: true, sz: 11, color: { rgb: "1F2937" } },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
        }
    },
    cell: {
        font: { sz: 10 },
        alignment: { vertical: "center", wrapText: true },
        border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
        }
    },
    labelCell: {
        fill: { fgColor: { rgb: "F9FAFB" } },
        font: { sz: 10, color: { rgb: "374151" } },
        alignment: { horizontal: "right", vertical: "center" },
        border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
        }
    }
};

// 设置工作表样式
function setWorksheetStyle(ws: XLSX.WorkSheet, range: XLSX.Range, style: any) {
    for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: col });
            if (!ws[cell]) ws[cell] = {};
            ws[cell].s = style;
        }
    }
}

// 转换性别
function getGenderText(gender: Gender) {
    return {
        [Gender.Male]: '男',
        [Gender.Female]: '女'
    }[gender] || '未知';
}

// 转换血型
function getBloodTypeText(type: BloodType) {
    return {
        [BloodType.A]: 'A型',
        [BloodType.B]: 'B型',
        [BloodType.AB]: 'AB型',
        [BloodType.O]: 'O型'
    }[type] || '未知';
}

// 转换饮酒情况
function getAlcoholConsumptionText(consumption: AlcoholConsumption) {
    return {
        [AlcoholConsumption.None]: '从不',
        [AlcoholConsumption.Occasional]: '偶尔',
        [AlcoholConsumption.Regular]: '经常'
    }[consumption] || '未知';
}

// 导出患者信息
export function exportPatientInfo(patient: any) {
    return [
        [{ v: '基本信息', s: styles.header }],
        [{ v: '姓名', s: styles.labelCell }, { v: patient.real_name, s: styles.cell }],
        [{ v: '性别', s: styles.labelCell }, { v: getGenderText(patient.basicInfo.gender), s: styles.cell }],
        [{ v: '出生日期', s: styles.labelCell }, { v: formatDate(patient.basicInfo.birth_date, 'YYYY-MM-DD'), s: styles.cell }],
        [{ v: '联系电话', s: styles.labelCell }, { v: patient.phone, s: styles.cell }],
        [{ v: '邮箱', s: styles.labelCell }, { v: patient.email, s: styles.cell }],
        [{ v: '地址', s: styles.labelCell }, { v: patient.basicInfo.address, s: styles.cell }],
        [{ v: '紧急联系人', s: styles.labelCell }, { v: patient.basicInfo.emergency_contact, s: styles.cell }],
        [{ v: '紧急联系电话', s: styles.labelCell }, { v: patient.basicInfo.emergency_contact_phone, s: styles.cell }],
        [{ v: '', s: styles.cell }],
        [{ v: '健康信息', s: styles.header }],
        [{ v: '身高', s: styles.labelCell }, { v: `${patient.healthInfo.height}cm`, s: styles.cell }],
        [{ v: '体重', s: styles.labelCell }, { v: `${patient.healthInfo.weight}kg`, s: styles.cell }],
        [{ v: '血型', s: styles.labelCell }, { v: getBloodTypeText(patient.healthInfo.blood_type), s: styles.cell }],
        [{ v: '血压', s: styles.labelCell }, { v: patient.healthInfo.blood_pressure, s: styles.cell }],
        [{ v: '心率', s: styles.labelCell }, { v: `${patient.healthInfo.heart_rate}次/分`, s: styles.cell }],
        [{ v: '体温', s: styles.labelCell }, { v: `${patient.healthInfo.body_temperature}°C`, s: styles.cell }],
        [{ v: '饮酒情况', s: styles.labelCell }, { v: getAlcoholConsumptionText(patient.healthInfo.alcohol_consumption), s: styles.cell }],
        [{ v: '过敏史', s: styles.labelCell }, { v: patient.healthInfo.allergies || '无', s: styles.cell }],
        [{ v: '慢性病', s: styles.labelCell }, { v: patient.healthInfo.chronic_conditions || '无', s: styles.cell }],
        [{ v: '病史', s: styles.labelCell }, { v: patient.healthInfo.medical_history || '无', s: styles.cell }],
        [{ v: '当前用药', s: styles.labelCell }, { v: patient.healthInfo.current_medications || '无', s: styles.cell }]
    ];
}

// 导出预约记录和对应的病历医嘱
export function exportAppointmentsWithDetails(appointments: Appointment[], records: { [key: number]: { record: MedicalRecord, prescriptions: Prescription[] } }) {
    const data = [];
    let rowIndex = 2; // 从第3行开始（前两行是标题）

    // 添加表头
    data.push([{ v: '就诊记录及详情', s: styles.header }]);
    data.push([
        { v: '就诊时间', s: styles.subHeader },
        { v: '就诊时长', s: styles.subHeader },
        { v: '主治医生', s: styles.subHeader },
        { v: '病情描述', s: styles.subHeader },
        { v: '状态', s: styles.subHeader }
    ]);

    // 用于存储合并单元格信息
    const merges = [{
        s: { r: 0, c: 0 },
        e: { r: 0, c: 4 }
    }];

    appointments.forEach(appointment => {
        // 添加预约基本信息
        data.push([
            { v: formatDate(appointment.date_time), s: styles.cell },
            { v: `${appointment.duration}分钟`, s: styles.cell },
            { v: appointment.doctor.real_name, s: styles.cell },
            { v: appointment.description, s: styles.cell },
            { v: ['待处理', '已接受', '已拒绝', '已取消', '已完成'][appointment.status], s: styles.cell }
        ]);
        rowIndex++;

        // 如果是已完成的预约，添加病历和医嘱信息
        if (appointment.status === AppointmentStatus.Completed && records[appointment.id]) {
            const { record, prescriptions } = records[appointment.id];

            // 添加病历信息标题
            data.push([
                { v: '', s: styles.cell },
                { v: '病历信息', s: styles.sectionTitle },
                { v: '', s: styles.cell },
                { v: '', s: styles.cell },
                { v: '', s: styles.cell }
            ]);
            merges.push({
                s: { r: rowIndex, c: 1 },
                e: { r: rowIndex, c: 4 }
            });
            rowIndex++;

            // 添加病历详情
            const recordItems = [
                ['主诉', record.chief_complaint],
                ['诊断', record.diagnosis],
                ['治疗计划', record.treatment_plan]
            ];

            recordItems.forEach(([label, value]) => {
                data.push([
                    { v: '', s: styles.cell },
                    { v: label, s: styles.labelCell },
                    { v: value || '无', s: styles.cell },
                    { v: '', s: styles.cell },
                    { v: '', s: styles.cell }
                ]);
                merges.push({
                    s: { r: rowIndex, c: 2 },
                    e: { r: rowIndex, c: 4 }
                });
                rowIndex++;
            });

            // 如果有医嘱，添加医嘱信息
            if (prescriptions.length) {
                data.push([
                    { v: '', s: styles.cell },
                    { v: '医嘱信息', s: styles.sectionTitle },
                    { v: '', s: styles.cell },
                    { v: '', s: styles.cell },
                    { v: '', s: styles.cell }
                ]);
                merges.push({
                    s: { r: rowIndex, c: 1 },
                    e: { r: rowIndex, c: 4 }
                });
                rowIndex++;

                prescriptions.forEach(prescription => {
                    data.push([
                        { v: '', s: styles.cell },
                        { v: prescription.description, s: styles.cell },
                        { v: prescription.dosage, s: styles.cell },
                        { v: prescription.frequency, s: styles.cell },
                        { v: `${prescription.duration}天`, s: styles.cell }
                    ]);
                    rowIndex++;
                });
            }

            // 添加分隔行
            data.push([
                { v: '', s: styles.cell },
                { v: '', s: styles.cell },
                { v: '', s: styles.cell },
                { v: '', s: styles.cell },
                { v: '', s: styles.cell }
            ]);
            rowIndex++;
        }
    });

    return {
        data,
        merges,
        colWidths: [
            { wch: 20 }, // 就诊时间
            { wch: 15 }, // 就诊时长
            { wch: 15 }, // 主治医生
            { wch: 40 }, // 病情描述
            { wch: 15 }  // 状态
        ]
    };
}

// 添加导出格式枚举
export enum ExportFormat {
    Excel = 'excel',
    JSON = 'json'
}

// 修改导出函数，支持不同格式
export function exportFullMedicalRecord(
    patient: any,
    appointments: Appointment[],
    records: { [key: number]: { record: MedicalRecord, prescriptions: Prescription[] } },
    format: ExportFormat = ExportFormat.Excel
) {
    if (format === ExportFormat.Excel) {
        exportAsExcel(patient, appointments, records);
    } else {
        exportAsJSON(patient, appointments, records);
    }
}

// Excel导出实现
function exportAsExcel(
    patient: any,
    appointments: Appointment[],
    records: { [key: number]: { record: MedicalRecord, prescriptions: Prescription[] } }
) {
    const wb = XLSX.utils.book_new();

    // 添加基本信息工作表
    const basicInfo = exportPatientInfo(patient);
    const basicWs = XLSX.utils.aoa_to_sheet(basicInfo);
    basicWs['!cols'] = [{ wch: 15 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, basicWs, '基本信息');

    // 添加就诊记录工作表
    const { data, merges, colWidths } = exportAppointmentsWithDetails(appointments, records);
    const detailsWs = XLSX.utils.aoa_to_sheet(data);
    detailsWs['!merges'] = merges;
    detailsWs['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, detailsWs, '就诊记录及详情');

    // 生成并下载文件
    const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array',
        cellStyles: true
    });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `${patient.real_name}的病历记录.xlsx`);
}

// JSON导出实现
function exportAsJSON(
    patient: any,
    appointments: Appointment[],
    records: { [key: number]: { record: MedicalRecord, prescriptions: Prescription[] } }
) {
    const data = {
        exportDate: formatDate(new Date()),
        patientInfo: {
            basic: {
                name: patient.real_name,
                gender: getGenderText(patient.basicInfo.gender),
                birthDate: formatDate(patient.basicInfo.birth_date, 'YYYY-MM-DD'),
                phone: patient.phone,
                email: patient.email,
                address: patient.basicInfo.address,
                emergencyContact: patient.basicInfo.emergency_contact,
                emergencyPhone: patient.basicInfo.emergency_contact_phone
            },
            health: {
                height: `${patient.healthInfo.height}cm`,
                weight: `${patient.healthInfo.weight}kg`,
                bloodType: getBloodTypeText(patient.healthInfo.blood_type),
                bloodPressure: patient.healthInfo.blood_pressure,
                heartRate: `${patient.healthInfo.heart_rate}次/分`,
                temperature: `${patient.healthInfo.body_temperature}°C`,
                alcoholConsumption: getAlcoholConsumptionText(patient.healthInfo.alcohol_consumption),
                allergies: patient.healthInfo.allergies || '无',
                chronicConditions: patient.healthInfo.chronic_conditions || '无',
                medicalHistory: patient.healthInfo.medical_history || '无',
                currentMedications: patient.healthInfo.current_medications || '无'
            }
        },
        appointments: appointments.map(appointment => ({
            dateTime: formatDate(appointment.date_time),
            duration: `${appointment.duration}分钟`,
            doctor: appointment.doctor.real_name,
            description: appointment.description,
            status: ['待处理', '已接受', '已拒绝', '已取消', '已完成'][appointment.status],
            record: appointment.status === AppointmentStatus.Completed && records[appointment.id] ? {
                chiefComplaint: records[appointment.id].record.chief_complaint || '无',
                diagnosis: records[appointment.id].record.diagnosis || '无',
                treatmentPlan: records[appointment.id].record.treatment_plan || '无',
                prescriptions: records[appointment.id].prescriptions.map(prescription => ({
                    medication: prescription.description,
                    dosage: prescription.dosage,
                    frequency: prescription.frequency,
                    duration: `${prescription.duration}天`,
                    note: prescription.note || '无'
                }))
            } : null
        }))
    };

    // 创建并下载JSON文件
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `${patient.real_name}的病历记录.json`);
}

// 生成图表数据
export function generateChartData(appointments: Appointment[]) {
    // 按月统计就诊次数
    const monthlyVisits = appointments.reduce((acc: { [key: string]: number }, appointment) => {
        const month = formatDate(appointment.date_time, 'YYYY-MM');
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, {});

    // 统计不同状态的预约数量
    const statusCount = appointments.reduce((acc: { [key: string]: number }, appointment) => {
        const status = ['待处理', '已接受', '已拒绝', '已取消', '已完成'][appointment.status];
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return {
        monthlyVisits,
        statusCount
    };
} 