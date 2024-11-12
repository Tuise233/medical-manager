<script lang="ts" setup>
import { Announcement, CreateAnnounceDto, AnnounceType, SearchAnnounceParams } from '@/api/interface/announce';
import { createAnnouncement, deleteAnnouncement, getAnnouncementList, updateAnnouncement } from '@/api/modules/announce';
import { ref, Ref, onMounted, nextTick } from 'vue';
import PageDivider from '../../../components/PageDivider/index.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const data: Ref<Announcement[]> = ref<Announcement[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref('');
const searchType = ref<AnnounceType>();
const dateRange = ref<[Date, Date]>();
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const editItem: Ref<Announcement | undefined> = ref<Announcement | undefined>();
const createItem: Ref<CreateAnnounceDto | undefined> = ref<CreateAnnounceDto | undefined>();

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
    const params: SearchAnnounceParams = {
        getType: 'all',
        pageSize: pageSize.value,
        pageNum: pageNum.value,
        searchValue: searchValue.value,
        type: searchType.value,
        startDate: dateRange.value?.[0],
        endDate: dateRange.value?.[1]
    };

    const results = await getAnnouncementList(params);
    data.value = results.data.list;
    pageNum.value = results.data.pageNum;
    pageSize.value = results.data.pageSize;
    total.value = results.data.total;
}

function handlePageSizeChange(size: number) {
    pageSize.value = size;
}

function edit(item: Announcement) {
    editItem.value = item;
    showEditDialog.value = true;
}

function create() {
    createItem.value = {
        title: '',
        description: '',
        type: AnnounceType.Notice,
        is_top: false,
        expire_date: new Date()
    };
    showCreateDialog.value = true;
}

function saveItem() {
    if (!editItem.value) return;
    ElMessageBox.confirm(
        '你确定要保存这条公告的数据吗?',
        '保存公告',
        {
            confirmButtonText: '保存',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        if (!editItem.value) return;
        const result = await updateAnnouncement(editItem.value.id, editItem.value);
        if (Number(result.code) === 200) {
            ElMessage({
                message: '保存成功',
                type: 'success'
            });
            showEditDialog.value = false;
            editItem.value = undefined;
            await nextTick();
            queryAnnouncement();
        }
    });
}

function deleteItem() {
    if (!editItem.value) return;
    ElMessageBox.confirm(
        '你确定要删除这条公告吗?',
        '删除公告',
        {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        if (!editItem.value) return;
        const result = await deleteAnnouncement(editItem.value.id);
        if (Number(result.code) === 200) {
            ElMessage.success('你成功删除这条公告');
            showEditDialog.value = false;
            editItem.value = undefined;
            await nextTick();
            queryAnnouncement();
        }
    });
}

function createAnnounce() {
    if (!createItem.value) return;
    if (!createItem.value.title || !createItem.value.description || !createItem.value.expire_date) {
        ElMessage.error('请完整填写创建新公告所需的字段');
        return;
    }
    ElMessageBox.confirm(
        '你确定要创建这条新公告?',
        '创建新公告',
        {
            confirmButtonText: '创建',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        if (!createItem.value) return;
        const result = await createAnnouncement(createItem.value);
        if (Number(result.code) === 200) {
            ElMessage.success('你成功创建了一条新公告');
            showCreateDialog.value = false;
            createItem.value = undefined;
            await nextTick();
            queryAnnouncement();
        }
    });
}

function getTypeLabel(type: AnnounceType) {
    return typeOptions.find(option => option.value === type)?.label || '';
}
</script>

<template>
    <div class="app-page">
        <div class="app-header">
            <div class="app-search">
                <span>标题搜索</span>
                <el-input v-model="searchValue" placeholder="请输入标题关键词" />

                <span>公告类型</span>
                <el-select v-model="searchType" placeholder="请选择公告类型" clearable>
                    <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>

                <span>日期范围</span>
                <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                    end-placeholder="结束日期" />

                <el-button type="primary" @click="queryAnnouncement">搜索</el-button>
            </div>

            <el-button type="primary" @click="create">创建新公告</el-button>
        </div>

        <div class="app-content">
            <el-table :data="data" stripe>
                <el-table-column prop="id" label="编号" width="80" />
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="type" label="类型">
                    <template #default="scope">
                        {{ getTypeLabel(scope.row.type) }}
                    </template>
                </el-table-column>
                <el-table-column prop="is_top" label="置顶">
                    <template #default="scope">
                        <el-tag :type="scope.row.is_top ? 'success' : 'info'">
                            {{ scope.row.is_top ? '是' : '否' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="创建时间">
                    <template #default="scope">
                        {{ new Date(scope.row.create_date).toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column label="过期时间">
                    <template #default="scope">
                        {{ new Date(scope.row.expire_date).toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120">
                    <template #default="scope">
                        <el-button type="primary" @click="edit(scope.row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
                @current-change="handlePageChange" />
        </div>

        <el-dialog v-model="showCreateDialog" title="创建新公告" width="600">
            <div class="app-edit" v-if="createItem">
                <div>
                    <span>标题</span>
                    <el-input v-model="createItem.title" placeholder="请输入标题" />
                </div>

                <div>
                    <span>类型</span>
                    <el-select v-model="createItem.type" placeholder="请选择公告类型">
                        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </div>

                <div>
                    <span>内容</span>
                    <el-input v-model="createItem.description" type="textarea" :rows="5" placeholder="请输入公告内容" />
                </div>

                <div>
                    <span>过期时间</span>
                    <el-date-picker v-model="createItem.expire_date" type="datetime" placeholder="请选择过期时间" />
                </div>

                <div>
                    <span>置顶</span>
                    <el-switch v-model="createItem.is_top" />
                </div>

                <div class="app-button">
                    <el-button type="primary" @click="createAnnounce">创建</el-button>
                </div>
            </div>
        </el-dialog>

        <el-dialog v-model="showEditDialog" title="编辑公告" width="600">
            <div class="app-edit" v-if="editItem">
                <div>
                    <span>标题</span>
                    <el-input v-model="editItem.title" placeholder="请输入标题" />
                </div>

                <div>
                    <span>类型</span>
                    <el-select v-model="editItem.type" placeholder="请选择公告类型">
                        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label"
                            :value="item.value" />
                    </el-select>
                </div>

                <div>
                    <span>内容</span>
                    <el-input v-model="editItem.description" type="textarea" :rows="5" placeholder="请输入公告内容" />
                </div>

                <div>
                    <span>过期时间</span>
                    <el-date-picker v-model="editItem.expire_date" type="datetime" placeholder="请选择过期时间" />
                </div>

                <div>
                    <span>置顶</span>
                    <el-switch v-model="editItem.is_top" />
                </div>

                <div class="app-button">
                    <el-button type="danger" @click="deleteItem">删除</el-button>
                    <el-button type="primary" @click="saveItem">保存</el-button>
                </div>
            </div>
        </el-dialog>
    </div>
</template>
<style src="./style.scss" scoped />