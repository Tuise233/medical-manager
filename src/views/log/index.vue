<script lang="ts" setup>
import { Log, SearchLogDto } from '@/api/interface/log';
import { getLogPage } from '@/api/modules/log';
import { onMounted, nextTick, Ref, ref } from 'vue';
import PageDivider from '../../components/PageDivider/index.vue';

const data: Ref<Log[]> = ref<Log[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref('');
const dateRange = ref<[Date, Date]>();

onMounted(async () => {
    await nextTick();
    queryLogs();
});

function handlePageChange(curPage: number) {
    pageNum.value = curPage;
    queryLogs();
}

async function queryLogs() {
    const params: SearchLogDto = {
        pageSize: pageSize.value,
        pageNum: pageNum.value,
        searchValue: searchValue.value,
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1]
    };

    const results = await getLogPage(params);
    data.value = results.data.list;
    pageNum.value = results.data.pageNum;
    pageSize.value = results.data.pageSize;
    total.value = results.data.total;
}

function handlePageSizeChange(size: number) {
    pageSize.value = size;
    queryLogs();
}

function resetSearch() {
    searchValue.value = '';
    dateRange.value = undefined;
    queryLogs();
}

</script>

<template>
    <div class="app-page">
        <div class="app-header">
            <div class="app-search">
                <div class="search-item">
                    <span>日志内容</span>
                    <el-input type="text" v-model="searchValue" placeholder="请输入日志内容" />
                </div>
                <div class="search-item">
                    <span>时间范围</span>
                    <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                        end-placeholder="结束日期" />
                </div>
                <div class="search-buttons">
                    <el-button type="primary" @click="queryLogs">搜索</el-button>
                    <el-button @click="resetSearch">重置</el-button>
                </div>
            </div>
            <PageDivider @page-size-change="handlePageSizeChange" />
        </div>

        <div class="app-content">
            <el-table :data="data" stripe>
                <el-table-column prop="id" label="ID" width="80"></el-table-column>
                <el-table-column prop="user_id" label="管理员ID" width="110"></el-table-column>
                <el-table-column prop="action" label="日志内容"></el-table-column>
                <el-table-column label="创建时间" width="180">
                    <template #default="scope">
                        <span>{{ new Date(scope.row.action_date).toLocaleString() }}</span>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
                @current-change="handlePageChange" />
        </div>
    </div>
</template>

<style src="./style.scss" scoped />