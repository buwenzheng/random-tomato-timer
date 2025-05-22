<template>
  <div class="weekly-stats">
    <el-date-picker
      v-model="selectedWeekStart"
      type="week"
      format="YYYY 第 ww 周"
      value-format="YYYY-MM-DD"
      placeholder="选择周"
      @change="handleWeekChange"
    />

    <div class="stats-cards">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>总专注时间</span>
          </div>
        </template>
        <div class="stat-value">{{ formatDuration(stats.totalFocusTime) }}</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>总休息时间</span>
          </div>
        </template>
        <div class="stat-value">{{ formatDuration(stats.totalBreakTime) }}</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>完成率</span>
          </div>
        </template>
        <div class="stat-value">
          {{ formatPercentage(stats.completedPomodoros, stats.totalPomodoros) }}
        </div>
      </el-card>
    </div>

    <div class="chart-container">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>每日专注时间</span>
          </div>
        </template>
        <div
          ref="chartRef"
          class="chart"
        ></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue'
  import { useStorage } from '@/utils/storage'
  import { calculateWeeklyStats, formatDuration, formatPercentage } from '@/utils/stats'
  import * as echarts from 'echarts'

  const props = defineProps<{
    weekStart: string
  }>()

  const storage = useStorage()
  const selectedWeekStart = ref(props.weekStart)
  const stats = ref(
    calculateWeeklyStats(storage.getItem('pomodoro-records') || [], selectedWeekStart.value)
  )
  const chartRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null

  const handleWeekChange = (date: string) => {
    selectedWeekStart.value = date
    updateStats()
  }

  const updateStats = () => {
    stats.value = calculateWeeklyStats(
      storage.getItem('pomodoro-records') || [],
      selectedWeekStart.value
    )
    updateChart()
  }

  const updateChart = () => {
    if (!chart || !chartRef.value) return

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: stats.value.dailyStats.map(day => day.date)
      },
      yAxis: {
        type: 'value',
        name: '分钟'
      },
      series: [
        {
          name: '专注时间',
          type: 'bar',
          data: stats.value.dailyStats.map(day => day.focusTime)
        }
      ]
    }

    chart.setOption(option)
  }

  onMounted(() => {
    if (chartRef.value) {
      chart = echarts.init(chartRef.value)
      updateChart()
    }
  })

  watch(
    () => props.weekStart,
    newWeekStart => {
      selectedWeekStart.value = newWeekStart
      updateStats()
    }
  )
</script>

<style lang="scss" scoped>
  .weekly-stats {
    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 20px 0;
    }

    .stat-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        color: var(--el-color-primary);
      }
    }

    .chart-container {
      margin-top: 20px;

      .chart {
        height: 400px;
      }
    }
  }
</style>
