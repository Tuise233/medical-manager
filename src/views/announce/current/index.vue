<script lang="ts" setup>
import { Announcement, AnnounceType } from '@/api/interface/announce';
import { getAnnouncementList } from '@/api/modules/announce';
import { onMounted, nextTick, Ref, ref } from 'vue';
import PageDivider from '../../../components/PageDivider/index.vue';

const data: Ref<Announcement[]> = ref<Announcement[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const showDialog = ref(false);
const detail: Ref<Announcement | undefined> = ref<Announcement | undefined>(undefined);
const searchValue = ref('');
const searchType = ref<AnnounceType>();

const typeOptions = [
    { label: '通知', value: AnnounceType.Notice },
    { label: '政策', value: AnnounceType.Policy },
    { label: '公告', value: AnnounceType.Announcement }
];

onMounted(async () => {
    await nextTick();
    queryAnnouncement();
});

function handlePageChange(curPage: number) {
    pageNum.value = curPage;
    queryAnnouncement();
}

async function queryAnnouncement() {
    const results = await getAnnouncementList({
        getType: 'valid',
        pageSize: pageSize.value,
        pageNum: pageNum.value,
        searchValue: searchValue.value,
        type: searchType.value
    });
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

function getTypeLabel(type: AnnounceType) {
    return typeOptions.find(option => option.value === type)?.label || '';
}

</script>

<template>
    <div class="app-page">
        <div class="app-header">
            <div class="app-search">
                <span>公告标题</span>
                <el-input type="text" v-model="searchValue" placeholder="请输入公告标题" />

                <span>公告类型</span>
                <el-select v-model="searchType" placeholder="请选择公告类型" clearable>
                    <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <el-button type="primary" @click="queryAnnouncement">搜索</el-button>
            </div>

            <PageDivider @page-size-change="handlePageSizeChange" />
        </div>

        <div class="app-content">
            <el-table :data="data" stripe>
                <el-table-column prop="title" label="标题" min-width="200">
                    <template #default="scope">
                        <div class="title-cell">
                            <el-tag v-if="scope.row.is_top" type="danger" effect="dark" size="small">置顶</el-tag>
                            <span>{{ scope.row.title }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="100">
                    <template #default="scope">
                        {{ getTypeLabel(scope.row.type) }}
                    </template>
                </el-table-column>
                <el-table-column label="发布时间" width="180">
                    <template #default="scope">
                        <span>{{ new Date(scope.row.create_date).toLocaleString() }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template #default="scope">
                        <el-button type="primary" @click="showDetail(scope.row)">查看详情</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="prev, pager, next" :total="total" :page-count="pageNum"
                :page-size="pageSize" @change="handlePageChange" />
        </div>

        <el-dialog v-model="showDialog" width="500">
            <div class="app-detail">
                <div class="detail-header">
                    <span class="title">{{ detail?.title }}</span>
                    <div class="info">
                        <el-tag size="small">{{ getTypeLabel(detail?.type!) }}</el-tag>
                        <span>发布时间: {{ new Date(detail?.create_date!).toLocaleString() }}</span>
                    </div>
                </div>
                <div class="detail-content">{{ detail?.description }}</div>
                <el-button @click="() => { showDialog = false }">关闭</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" src="./style.scss" scoped />