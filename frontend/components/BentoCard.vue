<script setup lang="ts">
defineProps<{
  title?: string
  noPadding?: boolean
}>()
</script>

<template>
  <div class="relative bg-forest-dark-card border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-basil-green/20 hover:border-white/20 group">
    <!-- Paper Texture overlay -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

    <div v-if="title" class="flex items-center justify-between px-8 py-5 border-b border-white/5">
      <h3 class="font-serif font-bold text-white/90 text-base tracking-wide">{{ title }}</h3>
      <slot name="header-action"></slot>
    </div>
    
    <div :class="[noPadding ? '' : 'p-4']">
      <slot />
    </div>
  </div>
</template>
