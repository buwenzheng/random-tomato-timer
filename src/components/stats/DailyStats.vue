<template>
  <div class="daily-stats">
    <el-date-picker
      v-model="selectedDate"
      type="date"
      placeholder="选择日期"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      @change="handleDateChange"
    />

    <div class="stats-cards">
      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>专注时间</span>
          </div>
        </template>
        <div class="stat-value">{{ formatDuration(stats.focusTime) }}</div>
      </el-card>

      <el-card class="stat-card">
        <template #header>
          <div class="card-header">
            <span>休息时间</span>
          </div>
        </template>
        <div class="stat-value">{{ formatDuration(stats.breakTime) }}</div>
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
            <span>时间分布</span>
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
  import { calculateDailyStats, formatDuration, formatPercentage } from '@/utils/stats'
  import * as echarts from 'echarts'

  const props = defineProps<{
    date: string
  }>()

  const storage = useStorage()
  const selectedDate = ref(props.date)
  const stats = ref(
    calculateDailyStats(storage.getItem('pomodoro-records') || [], selectedDate.value)
  )
  const chartRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null

  const handleDateChange = (date: string) => {
    selectedDate.value = date
    updateStats()
  }

  const updateStats = () => {
    stats.value = calculateDailyStats(storage.getItem('pomodoro-records') || [], selectedDate.value)
    updateChart()
  }

  const updateChart = () => {
    if (!chart || !chartRef.value) return

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}分钟 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { value: stats.value.focusTime, name: '专注时间' },
            { value: stats.value.breakTime, name: '休息时间' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
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
    () => props.date,
    newDate => {
      selectedDate.value = newDate
      updateStats()
    }
  )
</script>

<style lang="scss" scoped>
  .daily-stats {
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
