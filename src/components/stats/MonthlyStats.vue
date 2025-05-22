<template>
  <div class="monthly-stats">
    <el-date-picker
      v-model="selectedMonth"
      type="month"
      format="YYYY年MM月"
      value-format="YYYY-MM"
      placeholder="选择月份"
      @change="handleMonthChange"
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
            <span>每周专注时间</span>
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
  import { calculateMonthlyStats, formatDuration, formatPercentage } from '@/utils/stats'
  import * as echarts from 'echarts'

  const props = defineProps<{
    month: string
  }>()

  const storage = useStorage()
  const selectedMonth = ref(props.month)
  const stats = ref(
    calculateMonthlyStats(storage.getItem('pomodoro-records') || [], selectedMonth.value)
  )
  const chartRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null

  const handleMonthChange = (date: string) => {
    selectedMonth.value = date
    updateStats()
  }

  const updateStats = () => {
    stats.value = calculateMonthlyStats(
      storage.getItem('pomodoro-records') || [],
      selectedMonth.value
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
        data: stats.value.weeklyStats.map(week => `第${week.weekStart.split('-')[2]}周`)
      },
      yAxis: {
        type: 'value',
        name: '分钟'
      },
      series: [
        {
          name: '专注时间',
          type: 'bar',
          data: stats.value.weeklyStats.map(week => week.totalFocusTime)
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
    () => props.month,
    newMonth => {
      selectedMonth.value = newMonth
      updateStats()
    }
  )
</script>

<style lang="scss" scoped>
  .monthly-stats {
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
