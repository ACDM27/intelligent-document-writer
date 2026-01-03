<template>
  <div class="placeholder-page">
    <el-empty description="功能开发中，敬请期待">
      <el-button type="primary" @click="goBack">返回工作台</el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}
</style>
