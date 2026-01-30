<template>
  <div class="relative w-32 h-32 flex items-center justify-center">
    <svg class="w-full h-full -rotate-90">
      <!-- Background Circle -->
      <circle
        cx="64"
        cy="64"
        r="58"
        stroke="currentColor"
        stroke-width="8"
        fill="transparent"
        class="text-white/5"
      />
      <!-- Progress Circle -->
      <circle
        cx="64"
        cy="64"
        r="58"
        stroke="currentColor"
        stroke-width="8"
        fill="transparent"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        class="text-basil-green transition-all duration-1000 ease-out"
      />
    </svg>
    <!-- Center Info -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <span class="text-2xl font-serif font-bold text-white">{{ percentage }}%</span>
      <span class="text-[8px] font-bold text-white/30 uppercase tracking-tighter">Preparado</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  percentage: number
}>()

const circumference = 2 * Math.PI * 58
const dashOffset = computed(() => circumference - (props.percentage / 100) * circumference)
</script>
