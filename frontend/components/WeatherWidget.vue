<template>
  <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-full flex flex-col justify-between">
    <div class="flex justify-between items-start">
      <div>
        <p class="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1">Cáceres, ES</p>
        <p class="text-3xl font-serif font-bold text-white">{{ weather.temp }}°C</p>
      </div>
      <div class="text-4xl filter drop-shadow-lg">
        {{ weather.icon }}
      </div>
    </div>
    
    <div class="mt-4">
      <p class="text-[11px] font-bold text-basil-green-light uppercase tracking-widest">{{ weather.status }}</p>
      <div class="flex items-center gap-3 mt-2 text-[10px] text-white/60 font-medium">
        <span class="flex items-center gap-1">💨 {{ weather.wind }}km/h</span>
        <span class="flex items-center gap-1">💧 {{ weather.humidity }}%</span>
      </div>
    </div>

    <!-- Golden Hour Filter simulation -->
    <div class="absolute inset-0 bg-pumpkin-orange/5 pointer-events-none rounded-3xl"></div>
  </div>
</template>

<script setup lang="ts">
const weather = ref({
  temp: '22',
  status: 'Ideal para Cosecha',
  icon: '☀️',
  wind: '12',
  humidity: '45'
})
</script>
