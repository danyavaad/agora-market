<script setup lang="ts">
const { locale } = useI18n()
const auth = useAuth()
const cartStore = useCartStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'

const offerCount = ref(0)
const targetWeekISO = computed(() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
})

onMounted(async () => {
    if (auth.user?.role === 'producer') {
        try {
            const data = await $fetch(`${apiBase}/tenants/${auth.user.tenantId}/offers/count?week=${targetWeekISO.value}`, {
                headers: { 
                  'Authorization': `Bearer ${auth.token}`,
                  'x-tenant-id': auth.user.tenantId
                }
            })
            offerCount.value = Number(data)
        } catch (e) {
            console.error('Fetch offer count error:', e)
        }
    }
})
</script>

<template>
  <header class="flex items-center justify-between px-6 py-4 bg-forest-dark/80 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5 shadow-2xl">
    <div class="flex items-center gap-3 group cursor-pointer">
      <!-- Logo placeholder -->
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-basil-green to-moss-green flex items-center justify-center text-white font-serif font-bold text-lg shadow-xl group-hover:scale-110 transition-transform">
        H
      </div>
      <div>
        <h1 class="font-serif font-bold text-white text-xl leading-tight">Huertify</h1>
        <p class="text-[9px] text-basil-green-light font-bold tracking-[0.2em] uppercase">Artesanal • Cooperativo • Directo</p>
      </div>
    </div>

    <ClientOnly>
      <div class="flex items-center gap-6">
        <!-- Consumer Links -->
        <template v-if="!auth.user || auth.user?.role === 'consumer'">
          <NuxtLink to="/shop" class="text-xs font-bold text-white/60 hover:text-basil-green-light uppercase tracking-widest transition">Tienda</NuxtLink>
          <template v-if="auth.isAuthenticated">
          <NuxtLink to="/orders" class="text-xs font-bold text-white/60 hover:text-basil-green-light uppercase tracking-widest transition">Mis Pedidos</NuxtLink>
          <NuxtLink to="/chat" class="text-xs font-bold text-white/60 hover:text-basil-green-light uppercase tracking-widest transition">Mensajes</NuxtLink>
        </template>
        </template>

        <!-- Producer Links -->
        <template v-else-if="auth.user?.role === 'producer'">
          <NuxtLink to="/producer" class="text-xs font-bold text-white/60 hover:text-basil-green-light uppercase tracking-widest transition">Panel</NuxtLink>
          <NuxtLink to="/harvest" class="text-xs font-bold text-white/60 hover:text-basil-green-light uppercase tracking-widest transition">🚜 Día de Cosecha</NuxtLink>
          <NuxtLink to="/chat" class="text-xs font-bold text-white/60 hover:text-basil-green-light uppercase tracking-widest transition">Mensajes</NuxtLink>
          <NuxtLink to="/producer/offers" class="text-xs font-bold text-white/60 hover:text-basil-green-light uppercase tracking-widest transition flex items-center gap-1.5">
             Mi Puesto
             <span v-if="offerCount > 0" class="bg-basil-green text-moss-green-dark text-[10px] px-1.5 py-0.5 rounded-full font-black min-w-[18px] text-center">
                {{ offerCount }}
             </span>
          </NuxtLink>
        </template>

        <!-- Logistics Links -->
        <template v-else-if="auth.user?.role === 'captain' || auth.user?.role === 'repartidor'">
          <NuxtLink to="/reparto" class="text-xs font-bold text-white/60 hover:text-basil-green-light uppercase tracking-widest transition">Reparto</NuxtLink>
          <NuxtLink v-if="auth.user?.role === 'captain'" to="/captain" class="text-xs font-bold text-white/60 hover:text-basil-green-light uppercase tracking-widest transition">Gestión Ágora</NuxtLink>
        </template>

        <!-- Global Cart -->
        <div v-if="!auth.user || auth.user?.role === 'consumer'" class="relative group/cart mr-2">
          <button class="w-10 h-10 rounded-xl bg-basil-green/10 flex items-center justify-center text-basil-green hover:bg-basil-green hover:text-white transition-all border border-basil-green/20 relative">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span v-if="cartStore.totalItems > 0" class="absolute -top-1 -right-1 bg-tomato-red text-white text-[8px] px-1.5 py-0.5 rounded-full font-black shadow-lg animate-bounce">
              {{ cartStore.totalItems }}
            </span>
          </button>

          <!-- Premium Cart Dropdown -->
          <div class="absolute right-0 top-12 w-80 bg-forest-dark-card border border-white/10 rounded-[2rem] shadow-2xl opacity-0 invisible group-hover/cart:opacity-100 group-hover/cart:visible transition-all duration-300 transform translate-y-2 group-hover/cart:translate-y-0 z-[100] p-6 backdrop-blur-xl">
             <div class="flex justify-between items-center mb-6">
                <h3 class="text-sm font-serif font-bold text-white">Tu Cesta</h3>
                <span class="text-[9px] font-black text-basil-green-light uppercase tracking-widest">{{ cartStore.totalItems }} Items</span>
             </div>

             <div v-if="cartStore.items.length === 0" class="py-10 text-center">
                <p class="text-white/20 italic text-xs">Cesta vacía.</p>
             </div>

             <div v-else>
                <ul class="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                   <li v-for="item in cartStore.items" :key="item.productId" class="flex justify-between items-center group/item">
                      <div class="flex-grow">
                         <p class="text-[11px] font-bold text-white/90 leading-tight">{{ item.name }}</p>
                         <p class="text-[9px] text-white/40 font-medium">{{ item.qty }} x {{ item.price }}€</p>
                      </div>
                      <div class="flex items-center gap-2">
                         <button @click="cartStore.updateQty({id: item.productId, unitType: item.unitType, marketState: {totalAvailableKg: 99, totalAvailableUnits: 99}}, -1)" 
                                 class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-tomato-red hover:text-white transition-all">-</button>
                         <button @click="cartStore.updateQty({id: item.productId, unitType: item.unitType, marketState: {totalAvailableKg: 99, totalAvailableUnits: 99}}, 1)" 
                                 class="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-basil-green hover:text-white transition-all">+</button>
                      </div>
                   </li>
                </ul>

                <div class="border-t border-white/5 pt-4 mb-6 flex justify-between items-center">
                   <span class="text-[9px] font-black text-white/20 uppercase tracking-widest">Total Estimado</span>
                   <span class="text-xl font-serif font-bold text-basil-green-light">{{ cartStore.totalPrice.toFixed(2) }}€</span>
                </div>

                <NuxtLink to="/shop" class="block w-full py-3 bg-basil-green text-moss-green-dark text-center rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-basil-green-light transition-all shadow-lg">
                   Ver Tienda
                </NuxtLink>
             </div>
          </div>
        </div>

        <!-- Notifications -->
        <button v-if="auth.isAuthenticated" class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/5">
          <span class="sr-only">Notifications</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>
        
        <!-- Auth Actions -->
        <NuxtLink v-if="!auth.isAuthenticated" to="/login" class="px-4 py-2 bg-basil-green text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-basil-green-dark transition shadow-sm">
          Entrar
        </NuxtLink>

        <div v-else class="flex items-center gap-3 pl-4 border-l border-white/5">
          <div class="text-right hidden sm:block">
             <p class="text-[9px] font-bold text-basil-green-light uppercase tracking-widest">{{ auth.user?.role }}</p>
             <p class="text-[11px] font-bold text-white leading-none">{{ auth.user?.name }}</p>
          </div>
          <div class="w-10 h-10 rounded-xl border border-white/10 bg-white/5 overflow-hidden relative cursor-pointer group" @click="auth.logout()">
             <img :src="`https://i.pravatar.cc/150?u=${auth.user?.id}`" alt="User" class="w-full h-full object-cover">
             <div class="absolute inset-0 bg-tomato-red/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  </header>
</template>
