<script lang="ts" setup>
import { ref, defineEmits } from 'vue';

const selectedSide = ref(15);
const pageSizes = [5, 10, 15, 20];
const emit = defineEmits<{
    (e: 'pageSizeChange', size: number): void
}>();

function handlePageSizeChange(newSize: number) {
    emit('pageSizeChange', newSize);
}
</script>

<template>
    <div class="app-pagedivider">
        <el-select v-model="selectedSide" placeholder="请选择每页条数" @change="handlePageSizeChange">
            <el-option v-for="item in pageSizes" :key="item" :label="`${item}条`" :value="item" />
        </el-select>
    </div>
</template>

<style scoped>
.app-pagedivider {
    width: 120px;
}
</style>