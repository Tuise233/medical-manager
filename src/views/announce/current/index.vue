<script lang="ts" setup>
import { Announcement } from '@/api/interface/announce';
import { getValidAnnouncement } from '@/api/modules/announce';
import { onMounted, nextTick, Ref, ref } from 'vue';
import PageDivider from '../../../components/PageDivider/index.vue';

const data: Ref<Announcement[]> = ref<Announcement[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const showDialog = ref(false);
const detail: Ref<Announcement | undefined> = ref<Announcement | undefined>(undefined);
const searchValue = ref('');

onMounted(async () => {
    await nextTick();
    queryAnnouncement();
});

function handlePageChange(curPage: number) {
    pageNum.value = curPage;
    queryAnnouncement();
}

async function queryAnnouncement() {
    const results = await getValidAnnouncement(pageSize.value, pageNum.value, searchValue.value);
    data.value = results.data.list;
    pageNum.value = results.data.pageNum;
    pageSize.value = results.data.pageSize;
    total.value = results.data.total;
}

function handlePageSizeChange(size: number) {
    pageSize.value = size;
}

function showDetail(item: Announcement) {
    detail.value = item;
    showDialog.value = true;
}

</script>

<template>
    <div class="app-page">
        <div class="app-header">
            <div class="app-search">
                <span>公告标题</span>
                <el-input type="text" v-model="searchValue" placeholder="请输入公告标题"/>
                <el-button type="primary" @click="queryAnnouncement">搜索</el-button>
            </div>
            
            <PageDivider @page-size-change="handlePageSizeChange"/>
        </div>

        <div class="app-content">
            <el-table :data="data" stripe>
                <el-table-column prop="title" label="标题"></el-table-column>
                <el-table-column label="发布时间">
                    <template #default="scope">
                        <span>{{ new Date(scope.row.create_date).toLocaleString() }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="primary" @click="showDetail(scope.row)">查看详情</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" @change="handlePageChange" />
        </div>

        <el-dialog v-model="showDialog" width="500">
            <div class="app-detail">
                <span>{{ detail?.title }}</span>
                <span>发布时间: {{ new Date(detail?.create_date!).toLocaleString() }}</span>
                <p>{{ detail?.description }}</p>
                <el-button @click="() => { showDialog = false }">关闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<style src="./style.scss" scoped />