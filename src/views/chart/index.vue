<template>
    <div class="chart-container">
        <div class="chart-header">
            <h2>数据统计概览</h2>
        </div>

        <div class="chart-grid">
            <!-- 今日预约趋势图 -->
            <div class="chart-item">
                <el-card>
                    <div class="chart-title">今日预约趋势</div>
                    <div ref="visitTrendChart" style="height: 300px"></div>
                </el-card>
            </div>

            <!-- 药品库存分析图 -->
            <div class="chart-item">
                <el-card>
                    <div class="chart-title">药品库存分析</div>
                    <div ref="medicineStockChart" style="height: 300px"></div>
                </el-card>
            </div>

            <!-- 药品状态分布图 -->
            <div class="chart-item">
                <el-card>
                    <div class="chart-title">药品状态分布</div>
                    <div ref="medicineStatusChart" style="height: 300px"></div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import { getDashboardCards, getMedicineStock, getVisitTrend } from '@/api/modules/chart'

const visitTrendChart = ref<HTMLElement | null>(null)
const medicineStockChart = ref<HTMLElement | null>(null)
const medicineStatusChart = ref<HTMLElement | null>(null)

let visitTrendInstance: EChartsType | null = null
let medicineStockInstance: EChartsType | null = null
let medicineStatusInstance: EChartsType | null = null

// 初始化药品库存分析图
const initMedicineStockChart = async () => {
    if (!medicineStockChart.value) return
    try {
        const { data } = await getMedicineStock()
        medicineStockInstance = echarts.init(medicineStockChart.value)
        medicineStockInstance.setOption({
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['药品数量', '库存数量']
            },
            xAxis: {
                type: 'category',
                data: data.categories
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '药品数量',
                    type: 'bar',
                    data: data.counts
                },
                {
                    name: '库存数量',
                    type: 'bar',
                    data: data.amounts
                }
            ]
        })
    } catch (error) {
        console.error('获取药品库存数据失败:', error)
    }
}

// 初始化预约趋势图
const initVisitTrendChart = async () => {
    if (!visitTrendChart.value) return
    try {
        const { data } = await getVisitTrend()
        visitTrendInstance = echarts.init(visitTrendChart.value)
        visitTrendInstance.setOption({
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['预约数', '就诊数']
            },
            xAxis: {
                type: 'category',
                data: data.hours
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '预约数',
                    type: 'line',
                    smooth: true,
                    data: data.appointments
                },
                {
                    name: '就诊数',
                    type: 'line',
                    smooth: true,
                    data: data.visits
                }
            ]
        })
    } catch (error) {
        console.error('获取预约趋势数据失败:', error)
    }
}

// 初始化药品状态分布图
const initMedicineStatusChart = async () => {
    if (!medicineStatusChart.value) return
    try {
        const { data } = await getDashboardCards()
        medicineStatusInstance = echarts.init(medicineStatusChart.value)
        medicineStatusInstance.setOption({
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                right: 10,
                top: 'center'
            },
            series: [
                {
                    name: '药品状态',
                    type: 'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '20',
                            fontWeight: 'bold'
                        }
                    },
                    data: [
                        { value: data.totalMedicines, name: '药品总数' },
                        { value: data.availableMedicines, name: '可用药品' },
                        { value: data.lowStockMedicines, name: '库存预警' }
                    ]
                }
            ]
        })
    } catch (error) {
        console.error('获取药品状态数据失败:', error)
    }
}

// 初始化所有图表
const initCharts = async () => {
    await Promise.all([
        initVisitTrendChart(),
        initMedicineStockChart(),
        initMedicineStatusChart()
    ])
}

onMounted(() => {
    initCharts()

    // 监听窗口大小变化，重绘图表
    window.addEventListener('resize', () => {
        visitTrendInstance?.resize()
        medicineStockInstance?.resize()
        medicineStatusInstance?.resize()
    })
})

// 组件卸载时清理
onUnmounted(() => {
    visitTrendInstance?.dispose()
    medicineStockInstance?.dispose()
    medicineStatusInstance?.dispose()
    window.removeEventListener('resize', () => {
        visitTrendInstance?.resize()
        medicineStockInstance?.resize()
        medicineStatusInstance?.resize()
    })
})
</script>
