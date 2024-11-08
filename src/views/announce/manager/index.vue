<script lang="ts" setup>
import { Announcement, CreateAnnounceDto } from '@/api/interface/announce';
import { createAnnouncement, deleteAnnouncement, getValidAnnouncement, updateAnnouncement } from '@/api/modules/announce';
import { ref, Ref, onMounted, nextTick } from 'vue';
import PageDivider from '../../../components/PageDivider/index.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const data: Ref<Announcement[]> = ref<Announcement[]>([]);
const pageSize = ref(15);
const pageNum = ref(1);
const total = ref(0);
const searchValue = ref('');
const showCreateDialog = ref(false);
const showEditDialog = ref(false);
const editItem: Ref<Announcement | undefined> = ref<Announcement | undefined>();
const createItem: Ref<CreateAnnounceDto | undefined> = ref<CreateAnnounceDto | undefined>();

onMounted(async () => {
    await nextTick();
    queryAnnouncement();
});

function handlePageChange(curPage: number) {
    pageNum.value = curPage;
    queryAnnouncement();
}

async function queryAnnouncement() {
    const results = await getValidAnnouncement(pageSize.value, pageNum.value, searchValue.value, false);
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
};

function create() {
    createItem.value = {
        title: '',
        description: '',
        expire_date: new Date()
    };
    showCreateDialog.value = true;
}

function saveItem() {
    if(!editItem.value) return;
    ElMessageBox.confirm(
        '你确定要保存这条公告的数据吗?',
        '保存公告',
        {
            confirmButtonText: '保存',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        if(!editItem.value) return;
        const result = await updateAnnouncement(editItem.value);
        if(Number(result.code) === 200) {
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
    if(!editItem.value) return;
    ElMessageBox.confirm(
        '你确定要删除这条公告吗?',
        '删除公告',
        {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        if(!editItem.value) return;
        const result = await deleteAnnouncement(editItem.value.id);
        if(Number(result.code) === 200) {
            ElMessage.success('你成功删除这条公告');
            showEditDialog.value = false;
            editItem.value = undefined;
            await nextTick();
            queryAnnouncement();
        }
    });
}

function createAnnounce() {
    if(!createItem.value) return;
    if(!createItem.value.title || !createItem.value.description || !createItem.value.expire_date) {
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
        if(!createItem.value) return;
        const result = await createAnnouncement(createItem.value);
        if(Number(result.code) === 200) {
            ElMessage.success('你成功创建了一条新公告');
            showCreateDialog.value = false;
            createItem.value = undefined;
            await nextTick();
            queryAnnouncement();    
        }
    });
}

</script>

<template>
    <div class="app-page">
        <div class="app-header">
            <el-button type="primary" @click="create">创建新公告</el-button>
            <PageDivider @page-size-change="handlePageSizeChange" />
        </div>

        <div class="app-content">
            <el-table :data="data" stripe>
                <el-table-column prop="id" label="编号" width="100"></el-table-column>
                <el-table-column prop="title" label="标题"></el-table-column>
                <el-table-column prop="description" label="内容"></el-table-column>
                <el-table-column label="发布时间">
                    <template #default="scope">
                        <span>{{ new Date(scope.row.create_date).toLocaleString() }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="有效到期时间">
                    <template #default="scope">
                        <span>{{ new Date(scope.row.expire_date).toLocaleString() }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="primary" @click="edit(scope.row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize" @change="handlePageChange" />
        </div>

        <el-dialog v-model="showCreateDialog" width="500" title="创建新公告">
            <div class="app-edit" v-if="createItem">
                <div>
                    <span>标题</span>
                    <el-input type="text" placeholder="请输入标题" v-model="createItem.title"></el-input>
                </div>

                <div>
                    <span>公告内容</span>
                    <el-input type="textarea" :rows="5" placeholder="请输入公告内容" v-model="createItem.description"></el-input>
                </div>

                <div>
                    <span>有效到期时间</span>
                    <el-date-picker v-model="createItem.expire_date" type="datetime" placeholder="请选择有效到期时间"></el-date-picker>
                </div>

                <div class="app-button">
                    <el-button type="primary" @click="createAnnounce">创建</el-button>
                </div>
            </div>
        </el-dialog>

        <el-dialog v-model="showEditDialog" width="500" title="编辑公告">
            <div class="app-edit" v-if="editItem">
                <div>
                    <span>标题</span>
                    <el-input type="text" placeholder="请输入标题" v-model="editItem.title"></el-input>
                </div>

                <div>
                    <span>公告内容</span>
                    <el-input type="textarea" :rows="5" placeholder="请输入公告内容" v-model="editItem.description"></el-input>
                </div>

                <div>
                    <span>有效到期时间</span>
                    <el-date-picker v-model="editItem.expire_date" type="datetime" placeholder="请选择有效到期时间"></el-date-picker>
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