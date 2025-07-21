<template>
  <div class="stats-view">
    <el-tabs v-model="activeTab">
      <el-tab-pane
        label="日统计"
        name="daily"
      >
        <DailyStats :date="selectedDate" />
      </el-tab-pane>
      <el-tab-pane
        label="周统计"
        name="weekly"
      >
        <WeeklyStats :week-start="selectedWeekStart" />
      </el-tab-pane>
      <el-tab-pane
        label="月统计"
        name="monthly"
      >
        <MonthlyStats :month="selectedMonth" />
      </el-tab-pane>
    </el-tabs>

    <div class="actions">
      <el-button
        type="primary"
        @click="exportData"
        >导出数据</el-button
      >
      <el-upload
        class="upload-demo"
        action=""
        :auto-upload="false"
        :show-file-list="false"
        accept=".json"
        @change="handleFileChange"
      >
        <el-button type="primary">导入数据</el-button>
      </el-upload>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { UploadFile } from 'element-plus'
  import DailyStats from '@/components/stats/DailyStats.vue'
  import WeeklyStats from '@/components/stats/WeeklyStats.vue'
  import MonthlyStats from '@/components/stats/MonthlyStats.vue'
  import { exportData, importData } from '@/utils/storage'

  const activeTab = ref('daily')
  const selectedDate = ref(new Date().toISOString().split('T')[0])
  const selectedWeekStart = ref(getWeekStart(new Date()))
  const selectedMonth = ref(new Date().toISOString().slice(0, 7))

  function getWeekStart(date: Date): string {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1)
    const weekStart = new Date(date.setDate(diff))
    return weekStart.toISOString().split('T')[0]
  }

  const handleFileChange = async (file: UploadFile) => {
    try {
      await importData(file.raw as File)
      ElMessage.success('数据导入成功')
    } catch (error) {
      ElMessage.error('数据导入失败')
    }
  }
</script>

<style lang="scss" scoped>
  .stats-view {
    padding: 20px;

    .actions {
      margin-top: 20px;
      display: flex;
      gap: 10px;
    }
  }
</style>
