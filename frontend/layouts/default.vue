<template>
  <div class="min-h-screen bg-forest-dark text-white font-sans selection:bg-basil-green/20">
    <AppHeader />
    
    <main class="container mx-auto px-4 py-10 max-w-lg md:max-w-2xl lg:max-w-4xl pb-32">
      <slot />
    </main>

    <!-- Floating Tab Bar (Mobile Nav) -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xs bg-moss-green-dark/80 backdrop-blur-2xl text-white rounded-[2rem] shadow-2xl z-50 px-6 py-4 flex items-center justify-between border border-white/10">
      
      <NuxtLink to="/" class="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition router-link-active:opacity-100 router-link-active:text-basil-green-light">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      </NuxtLink>

      <NuxtLink to="/shop" class="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition router-link-active:opacity-100 router-link-active:text-basil-green-light">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
      </NuxtLink>

      <NuxtLink to="/reparto" class="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition router-link-active:opacity-100 router-link-active:text-basil-green-light">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </NuxtLink>
      
       <NuxtLink to="/orders" class="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition router-link-active:opacity-100 router-link-active:text-basil-green-light">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      </NuxtLink>

    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  color: #7FB363; /* basil-green-light */
  opacity: 1;
}
</style>
