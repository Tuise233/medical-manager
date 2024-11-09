<script lang="ts" setup>
import { CreateRouterDto, Router } from '@/api/interface/router';
import { createRouter, getAllRouter, saveRouter } from '@/api/modules/router';
import { initDynamicRouter } from '@/routers/modules/dynamicRouter';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, Ref, onMounted, nextTick } from 'vue';

const data: Ref<Router[]> = ref<Router[]>([]);
const roles: Ref<{ label: string; value: number; }[]> = ref<{ label: string; value: number; }[]>([
    { label: '全体可见', value: -1 },
    { label: '农村居民', value: 0 },
    { label: '医生', value: 1 },
    { label: '管理员', value: 2 }
]);
const showDialog = ref(false);
const newData: Ref<CreateRouterDto | undefined> = ref<CreateRouterDto | undefined>();

async function getRouter() {
    const results = await getAllRouter();
    data.value = results.data;
}

onMounted(async () => {
    await nextTick();
    getRouter();
});

async function save() {
    const result = await saveRouter(data.value);
    if(Number(result.code) === 200) {
        ElMessage.success('保存成功');
        getRouter();
        await nextTick();
        initDynamicRouter();
    }
}

async function showCreate() {
    newData.value = {
        index: 1,
        path: '',
        name: '',
        component: '',
        icon: '',
        title: '',
        is_link: '',
        is_hide: false,
        is_full: false,
        is_affix: false,
        is_keep_alive: false,
        role_access: []
    };
    await nextTick();
    showDialog.value = true;
}

function create() {
    if(!newData.value) return;
    ElMessageBox.confirm(
        '你确定创建这个新路由吗?',
        '创建路由',
        {
            confirmButtonText: '创建',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        if(!newData.value) return;
        const result = await createRouter(newData.value);
        if(Number(result.code) === 200) {
            showDialog.value = false;
            ElMessage.success('创建成功');
            getAllRouter();
        }
    });
}
</script>

<template>
    <div class="app-router">
        <div class="app-header">
            <el-button type="primary" @click="showCreate">创建新路由</el-button>
            <el-button type="primary" @click="save">保存数据</el-button>
        </div>

        <div class="app-content">
            <el-table stripe :data="data">
                <el-table-column prop="id" label="编号" width="60"></el-table-column>
                <el-table-column label="排序">
                    <template #default="scope">
                        <el-input type="number" v-model="scope.row.index" placeholder="请输入排序" />
                    </template>
                </el-table-column>
                <el-table-column label="父级路由">
                    <template #default="scope">
                        <el-input type="number" v-model="scope.row.parent_id" placeholder="请选择父级路由" />
                    </template>
                </el-table-column>
                <el-table-column label="路由路径">
                    <template #default="scope">
                        <el-input type="text" v-model="scope.row.path" placeholder="请输入路由路径" />
                    </template>
                </el-table-column>
                <el-table-column label="组件名称">
                    <template #default="scope">
                        <el-input type="text" v-model="scope.row.name" placeholder="请输入组件名称" />
                    </template>
                </el-table-column>
                <el-table-column label="组件路径">
                    <template #default="scope">
                        <el-input type="text" v-model="scope.row.component" placeholder="请输入组件路径" />
                    </template>
                </el-table-column>
                <el-table-column label="图标">
                    <template #default="scope">
                        <el-input type="text" v-model="scope.row.icon" placeholder="请输入图标名称" />
                    </template>
                </el-table-column>
                <el-table-column label="标题">
                    <template #default="scope">
                        <el-input type="text" v-model="scope.row.title" placeholder="请输入标题" />
                    </template>
                </el-table-column>
                <el-table-column label="路由外链">
                    <template #default="scope">
                        <el-input type="text" v-model="scope.row.is_link" placeholder="请输入路由外链" />
                    </template>
                </el-table-column>
                <el-table-column label="菜单隐藏">
                    <template #default="scope">
                        <el-switch v-model="scope.row.is_hide" />
                    </template>
                </el-table-column>
                <el-table-column label="菜单全屏">
                    <template #default="scope">
                        <el-switch v-model="scope.row.is_full" />
                    </template>
                </el-table-column>
                <el-table-column label="固定在标签页">
                    <template #default="scope">
                        <el-switch v-model="scope.row.is_affix" />
                    </template>
                </el-table-column>
                <el-table-column label="缓存">
                    <template #default="scope">
                        <el-switch v-model="scope.row.is_keep_alive" />
                    </template>
                </el-table-column>
                <el-table-column label="可见角色">
                    <template #default="scope">
                        <el-select v-model="scope.row.role_access" multiple>
                            <el-option v-for="item in roles" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <el-dialog v-model="showDialog" width="500" title="创建新路由">
            <div class="app-create" v-if="newData">
                <div>
                    <span>父级路由</span>
                    <el-input type="text" v-model="newData.path" placeholder="请输入父级路由" />
                </div>
                <div>
                    <span>组件名称</span>
                    <el-input type="text" v-model="newData.name" placeholder="请输入组件名称"/>
                </div>
                <div>
                    <span>组件路径</span>
                    <el-input type="text" v-model="newData.component" placeholder="请输入组件路径" />
                </div>
                <div>
                    <span>图标</span>
                    <el-input type="text" v-model="newData.icon" placeholder="请输入图标" />
                </div>
                <div>
                    <span>标题</span>
                    <el-input type="text" v-model="newData.title" placeholder="请输入标题" />
                </div>
                <el-button type="primary" @click="create">创建</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<style src="./style.scss" scoped />