<template>
  <div>
    <div class="card mb10">
      <h4 class="title">简介</h4>
      <span class="text">
        <el-link type="primary" href="" target="_blank">农村医疗信息管理系统</el-link>
        是一款基于 NestJS、Vue3.3、TypeScript、Vite5、Pinia、Element-Plus 构建的信息管理系统，该系统旨在解决当前偏远地区农村居民就以过程中信息共享
        不便的问题，尤其是在村医之间难以快速了解患者的过往病史、过敏史等相关关键健康信息的情况下，提升医疗效率并降低误诊风险。农村医疗信息管理系统的开发具有
        实际意义，现有的农村医疗信息共享不便，影响村医的诊断效率，该系统正是为了解决这一痛点，使村医能够更高效地获取患者信息，同时系统功能设计紧密围绕村医日常
        诊疗工作展开，包括病历管理、医嘱开具、药品查询等功能，符合实际的医疗场景需求，同时管理员和居民的功能也满足了系统的全面性。充分体现了该系统在目前现状下
        该领域补充的空缺与应用价值。
      </span>
    </div>
    <div class="card mb10">
      <h4 class="title">项目信息</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="版本号" label-align="left">
          <el-tag>{{ version }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发布时间" label-align="left">
          <el-tag>{{ lastBuildTime }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="后端仓库" label-align="left">
          <el-link type="primary" href="https://github.com/Tuise233/medical-manager-backend" target="_blank"> 后端代码仓库
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="前端仓库" label-align="left">
          <el-link type="primary" href="https://github.com/Tuise233/medical-manager" target="_blank"> 前端代码仓库 </el-link>
        </el-descriptions-item>
        <!-- <el-descriptions-item label="文档地址" label-align="left">
          <el-link type="primary" href="https://docs.spicyboy.cn" target="_blank"> 文档地址 </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="预览地址" label-align="left">
          <el-link type="primary" href="https://admin.spicyboy.cn" target="_blank"> 预览地址 </el-link>
        </el-descriptions-item> -->
      </el-descriptions>
    </div>
    <div class="card mb10">
      <h4 class="title">生产环境依赖</h4>
      <el-descriptions :column="3" border>
        <el-descriptions-item v-for="(value, key) in dependencies" :key="key" width="400px" :label="key">
          <el-tag type="info">
            {{ value }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="card">
      <h4 class="title">开发环境依赖</h4>
      <el-descriptions :column="3" border>
        <el-descriptions-item v-for="(value, key) in devDependencies" :key="key" width="400px" :label="key">
          <el-tag type="info">
            {{ value }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts" name="about">
const { pkg, lastBuildTime } = __APP_INFO__;
const { dependencies, devDependencies, version } = pkg;
</script>

<style lang="scss" scoped>
.card {
  .title {
    margin: 0 0 15px;
    font-size: 17px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }

  .text {
    font-size: 15px;
    line-height: 25px;
    color: var(--el-text-color-regular);

    .el-link {
      font-size: 15px;
    }
  }
}
</style>
