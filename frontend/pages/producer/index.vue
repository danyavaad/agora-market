<template>
  <div class="py-8">
    <!-- Dynamic Header area with Weather & Progress -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      <!-- Welcome & Chart -->
      <div class="lg:col-span-2 bg-forest-dark-card rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
         <!-- Macro BG effect -->
         <div class="absolute inset-0 z-0 opacity-30 pointer-events-none group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0">
            <img src="/images/orchard-macro.png" class="w-full h-full object-cover">
         </div>

         <div class="z-10 text-center md:text-left">
            <span class="text-[10px] font-bold text-basil-green-light uppercase tracking-[0.4em] block mb-3">Venta Directa • Estado</span>
            <h1 class="text-4xl md:text-6xl font-serif font-bold text-white leading-tight">Hola, {{ auth.user?.name || 'Productor' }}</h1>
            <p class="text-white/40 mt-6 max-w-sm italic text-sm">"Cooperación genuina, calidad artesanal. Directo de la huerta, sin intermediarios."</p>
                        <div class="mt-10 flex flex-wrap justify-center md:justify-start gap-4">
                <NuxtLink to="/producer/offers" class="px-8 py-4 bg-basil-green text-moss-green-dark rounded-2xl font-black hover:bg-basil-green-light transition-all shadow-2xl text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95">
                   🧺 Mi Puesto
                </NuxtLink>
                <NuxtLink to="/producer/harvest" class="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95">
                   🚜 Día de Cosecha
                </NuxtLink>
                <NuxtLink to="/producer/feed" class="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95">
                   📸 Compartir
                </NuxtLink>
             </div>
         </div>

         <div class="z-10 mt-10 md:mt-0 bg-forest-dark/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 shadow-inner">
            <HarvestChart :percentage="65" />
         </div>
      </div>

      <!-- Weather Widget -->
      <div class="relative group h-full">
         <WeatherWidget />
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <BentoCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">{{ stat.label }}</span>
            <span class="text-4xl font-serif font-bold text-white/90">{{ stat.value }}</span>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-basil-green/10 flex items-center justify-center text-2xl shadow-inner text-basil-green-light">
            {{ stat.icon }}
          </div>
        </div>
        <div class="mt-6 flex items-center gap-2 text-[11px] font-bold text-basil-green-light">
           <span class="bg-basil-green/20 px-2 py-0.5 rounded-lg">{{ stat.trend }}</span>
           <span class="text-white/20 font-medium lowercase">esta semana</span>
        </div>
      </BentoCard>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <BentoCard title="Próximas Entregas">
        <div class="space-y-4">
          <div v-if="upcomingOrders.length === 0" class="text-center py-16 text-white/20 italic text-sm">
            No hay pedidos para preparar todavía.
          </div>
          <div v-else v-for="order in upcomingOrders" :key="order.id" class="flex justify-between items-center p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer">
             <div>
                <p class="font-bold text-base text-white/90">{{ order.customer }}</p>
                <p class="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{{ order.items }} productos • Balda #{{ order.bin }}</p>
             </div>
             <NuxtLink :to="`/orders/${order.id}`" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-basil-green-light hover:bg-basil-green hover:text-white transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
             </NuxtLink>
          </div>
        </div>
      </BentoCard>

      <BentoCard title="Productos en el Puesto">
        <p class="text-xs text-white/30 mb-8 px-1">Tus productos disponibles en el Agora actual.</p>
        <div class="space-y-4">
          <div v-for="offer in activeOffers" :key="offer.id" class="flex justify-between items-center p-4 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
             <div class="flex items-center gap-4">
                <span class="text-2xl filter drop-shadow-md group-hover:scale-110 transition-transform">{{ offer.emoji }}</span>
                <div>
                   <p class="font-bold text-base text-white/90">{{ offer.name }}</p>
                   <p class="text-[10px] text-basil-green-light font-bold uppercase tracking-widest">{{ offer.stock }} {{ offer.unit }} disponibles</p>
                </div>
             </div>
             <div class="text-right">
                <p class="text-lg font-serif font-bold text-white/90">{{ offer.price }}€</p>
                <p class="text-[9px] text-white/20 font-bold uppercase tracking-tighter">Reservado: {{ offer.reserved }}</p>
             </div>
          </div>
        </div>
      </BentoCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const auth = useAuth()

const stats = [
  { label: 'Productos', value: '12', icon: '📦', trend: '+2' },
  { label: 'Pedidos', value: '45', icon: '🛒', trend: '+15' },
  { label: 'Ingresos Est.', value: '284€', icon: '💰', trend: '+12%' },
  { label: 'Popularidad', value: '4.9', icon: '⭐', trend: 'TOP' },
]

const upcomingOrders = ref<any[]>([])
const activeOffers = [
  { id: 1, name: 'Tomate Rosa', emoji: '🍅', stock: '25', unit: 'Kg', price: '3.50', reserved: '12kg' },
  { id: 2, name: 'Brócoli', emoji: '🥦', stock: '15', unit: 'Uds', price: '1.80', reserved: '5 uds' },
  { id: 3, name: 'Zanahoria', emoji: '🥕', stock: '40', unit: 'Kg', price: '1.20', reserved: '0kg' },
]
</script>
