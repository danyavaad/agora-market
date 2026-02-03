<template>
  <div
    class="relative flex flex-col w-full max-w-sm overflow-hidden bg-black/80 backdrop-blur-xl text-white rounded-2xl shadow-2xl pointer-events-auto group border border-white/10"
    :class="['animate-in']"
    role="alert"
  >
    <!-- Accent Bar -->
    <div 
      class="absolute top-0 left-0 bottom-0 w-1"
      :class="accentBgClass"
    ></div>

    <!-- Progress Bar (only if timeout > 0) -->
    <div 
      v-if="notification.timeout > 0"
      class="absolute bottom-0 left-0 h-0.5"
      :class="accentBgClass"
      :style="{ width: progress + '%' }"
    ></div>

    <div class="flex p-4 pl-6 gap-4">
      <div 
        class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-xl border border-white/10 shadow-sm"
        :class="accentTextClass"
      >
        {{ icon }}
      </div>
      
      <div class="flex-grow pt-1">
        <h4 v-if="notification.title" class="font-serif font-bold text-sm leading-tight mb-0.5 tracking-tight">
          {{ notification.title }}
        </h4>
        <p class="text-xs font-medium text-white/70 leading-relaxed">
          {{ notification.message }}
        </p>

        <!-- Action Buttons -->
        <div v-if="notification.onAction" class="mt-4 flex gap-2">
          <button 
            @click="handleAction"
            class="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition-all transform active:scale-95 shadow-lg"
          >
            {{ notification.actionLabel || 'Confirmar' }}
          </button>
          <button 
            @click="$emit('close', notification.id)"
            class="px-4 py-2 bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/10 hover:text-white transition-all transform active:scale-95 border border-white/5"
          >
            Cancelar
          </button>
        </div>
      </div>

      <button
        type="button"
        class="flex-shrink-0 -mr-1 -mt-1 p-1 inline-flex items-center justify-center h-8 w-8 text-white/30 hover:text-white rounded-lg transition-colors"
        aria-label="Close"
        @click="$emit('close', notification.id)"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Notification } from '~/stores/notifications'

const props = defineProps<{
  notification: Notification
}>()

const emit = defineEmits(['close'])

const progress = ref(100)
let progressInterval: any = null

onMounted(() => {
  if (props.notification.timeout > 0) {
    const total = props.notification.timeout
    const step = 50 // Update every 50ms
    const decrement = (step / total) * 100
    
    progressInterval = setInterval(() => {
      progress.value -= decrement
      if (progress.value <= 0) {
        clearInterval(progressInterval)
      }
    }, step)
  }
})

const handleAction = () => {
  if (props.notification.onAction) {
    props.notification.onAction()
  }
  emit('close', props.notification.id)
}

const accentBgClass = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return 'bg-basil-green'
    case 'error':
      return 'bg-tomato-red'
    case 'warning':
      return 'bg-pumpkin-orange'
    case 'info':
    default:
      return 'bg-basil-green-light'
  }
})

const accentTextClass = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return 'text-basil-green'
    case 'error':
      return 'text-tomato-red'
    case 'warning':
      return 'text-pumpkin-orange'
    case 'info':
    default:
      return 'text-basil-green-light'
  }
})

const icon = computed(() => {
  switch (props.notification.type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '!'
    case 'info':
    default:
      return 'i'
  }
})
</script>

<style scoped>
.animate-in {
  animation: slideSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideSlide {
  from {
    transform: translateX(100%) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}
</style>
