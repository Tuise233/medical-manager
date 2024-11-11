<script lang="ts" setup>
import { CreateRouterDto, Router } from '@/api/interface/router';
import { createRouter, getAllRouter, saveRouter, deleteRouter } from '@/api/modules/router';
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
    if (Number(result.code) === 200) {
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
    if (!newData.value) return;
    ElMessageBox.confirm(
        '你确定创建这个新路由吗?',
        '创建路由',
        {
            confirmButtonText: '创建',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        if (!newData.value) return;
        const result = await createRouter(newData.value);
        if (Number(result.code) === 200) {
            showDialog.value = false;
            ElMessage.success('创建成功');
            getRouter();
        }
    });
}

async function handleDelete(row: Router) {
    ElMessageBox.confirm(
        '你确定要删除这个路由吗?',
        '删除路由',
        {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
        }
    ).then(async () => {
        const result = await deleteRouter(row.id);
        if (Number(result.code) === 200) {
            ElMessage.success('删除成功');
            getRouter();
            await nextTick();
            initDynamicRouter();
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
            <el-table stripe :data="data" style="width: 100%" :max-height="800" border fit>
                <!-- 基础信息列组 -->
                <el-table-column label="基础信息" min-width="220" align="center">
                    <el-table-column prop="id" label="编号" min-width="60" align="center"></el-table-column>
                    <el-table-column label="排序" min-width="80" align="center">
                        <template #default="scope">
                            <el-input-number v-model="scope.row.index" :min="1" controls-position="right"
                                style="width: 80px" />
                        </template>
                    </el-table-column>
                    <el-table-column label="父级路由" min-width="80" align="center">
                        <template #default="scope">
                            <el-input-number v-model="scope.row.parent_id" :min="0" controls-position="right"
                                style="width: 80px" />
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- 路由配置列组 -->
                <el-table-column label="路由配置" min-width="480" align="center">
                    <el-table-column label="路由路径" min-width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.path" placeholder="请输入路由路径" />
                        </template>
                    </el-table-column>
                    <el-table-column label="组件名称" min-width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.name" placeholder="请输入组件名称" />
                        </template>
                    </el-table-column>
                    <el-table-column label="组件路径" min-width="180">
                        <template #default="scope">
                            <el-input v-model="scope.row.component" placeholder="请输入组件路径" />
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- 显示配置列组 -->
                <el-table-column label="显示配置" min-width="400" align="center">
                    <el-table-column label="图标" min-width="100">
                        <template #default="scope">
                            <el-input v-model="scope.row.icon">
                                <template #prefix>
                                    <el-icon v-if="scope.row.icon">
                                        <component :is="scope.row.icon" />
                                    </el-icon>
                                </template>
                            </el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="标题" min-width="120">
                        <template #default="scope">
                            <el-input v-model="scope.row.title" placeholder="请输入标题" />
                        </template>
                    </el-table-column>
                    <el-table-column label="路由外链" min-width="180">
                        <template #default="scope">
                            <el-input v-model="scope.row.is_link" placeholder="请输入路由外链" />
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- 功能开关列组 -->
                <el-table-column label="功能开关" min-width="200" align="center">
                    <el-table-column label="菜单设置" min-width="200" align="center">
                        <template #default="scope">
                            <el-space>
                                <el-tooltip content="菜单隐藏">
                                    <el-switch v-model="scope.row.is_hide" />
                                </el-tooltip>
                                <el-tooltip content="菜单全屏">
                                    <el-switch v-model="scope.row.is_full" />
                                </el-tooltip>
                                <el-tooltip content="固定">
                                    <el-switch v-model="scope.row.is_affix" />
                                </el-tooltip>
                                <el-tooltip content="缓存">
                                    <el-switch v-model="scope.row.is_keep_alive" />
                                </el-tooltip>
                            </el-space>
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- 权限配置列组 -->
                <el-table-column label="权限配置" min-width="200" align="center">
                    <el-table-column label="可见角色" min-width="200">
                        <template #default="scope">
                            <el-select v-model="scope.row.role_access" multiple collapse-tags collapse-tags-tooltip>
                                <el-option v-for="item in roles" :key="item.value" :label="item.label"
                                    :value="item.value" />
                            </el-select>
                        </template>
                    </el-table-column>
                </el-table-column>

                <!-- 操作列 -->
                <el-table-column label="操作" width="80" fixed="right" align="center">
                    <template #default="scope">
                        <el-button type="danger" link @click="handleDelete(scope.row)">
                            删除
                        </el-button>
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
                    <el-input type="text" v-model="newData.name" placeholder="请输入组件名称" />
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