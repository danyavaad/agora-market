<!--
  * File: producer/index.vue
  * Purpose: Dashboard principal para productores (vendedores).
  * Design: Cuadro de mando visual con KPIs financieros/logísticos y acceso rápido a acciones de cosecha y puesto.
  * Dependencies: BentoCard, WeatherWidget, HarvestChart
  * Domain: Producción / Ventas
-->
<template>
  <div class="py-8">
    <!-- Dynamic Header area with Weather & Progress -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      <!-- Welcome & Chart -->
      <div class="lg:col-span-2 bg-forest-dark-card rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
         <!-- Macro BG effect -->
         <div class="absolute inset-0 z-0 opacity-30 pointer-events-none group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0">
            <img src="/images/orchard-macro.png" loading="lazy" class="w-full h-full object-cover">
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
                <NuxtLink to="/producer/reparto" class="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black hover:bg-white/10 transition-all text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95">
                   🚚 Hoja de Reparto
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
            <span class="text-2xl font-serif font-bold text-white/90">{{ stat.value }}</span>
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
                <p class="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">{{ order.itemCount }} productos • Balda #{{ order.bin }}</p>
             </div>
             <NuxtLink to="/producer/reparto" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-basil-green-light hover:bg-basil-green hover:text-white transition-all">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
             </NuxtLink>
          </div>
          <div v-if="upcomingOrders.length > 0" class="pt-2 text-center">
             <NuxtLink to="/producer/reparto" class="text-[10px] uppercase font-black tracking-widest text-white/40 hover:text-white transition-colors">Ver todas las entregas</NuxtLink>
          </div>
        </div>
      </BentoCard>

      <BentoCard title="Productos en el Puesto">
        <p class="text-xs text-white/30 mb-8 px-1">Tus productos disponibles en el Agora actual.</p>
        <div class="space-y-4">
          <div v-for="offer in activeOffers" :key="offer.id" 
               @click="goToOffer(offer.id)"
               class="flex justify-between items-center p-4 rounded-3xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
             <div class="flex items-center gap-4">
                <span class="text-2xl filter drop-shadow-md group-hover:scale-110 transition-transform">{{ offer.emoji }}</span>
                <div>
                   <p class="font-bold text-base text-white/90">{{ offer.name }}</p>
                   <p class="text-[10px] text-basil-green-light font-bold uppercase tracking-widest">{{ offer.stock }} {{ offer.unit }} disponibles</p>
                </div>
             </div>
             <div class="text-right">
                <p class="text-lg font-serif font-bold text-white/90">{{ offer.product.pricePerKg || offer.product.pricePerBunch }}€</p>
                 <p class="text-[9px] text-white/20 font-bold uppercase tracking-tighter">
                     Reservado: {{ (offer.product.unitType === 'bunch' || offer.product.unitType === 'unit') ? (offer.reservedUnits || 0) : (offer.reservedQuantityKg || 0).toFixed(1) }} {{ (offer.product.unitType === 'bunch' || offer.product.unitType === 'unit') ? 'uds' : 'kg' }}
                 </p>
             </div>
          </div>
        </div>
      </BentoCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || '/api'
const auth = useAuth()
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

// State
const myOffers = ref<any[]>([])
const upcomingOrders = ref<any[]>([])
const loading = ref(true)

// Computed Stats
const stats = computed(() => {
   const totalOfferedKg = myOffers.value.reduce((sum, o) => sum + (Number(o.availableQuantityKg) || 0) + (Number(o.reservedQuantityKg) || 0), 0)
   const totalReservedKg = myOffers.value.reduce((sum, o) => sum + (Number(o.reservedQuantityKg) || 0), 0)
   
   const totalOfferedUnits = myOffers.value.reduce((sum, o) => sum + (o.availableUnits || 0) + (o.reservedUnits || 0), 0)
   const totalReservedUnits = myOffers.value.reduce((sum, o) => sum + (o.reservedUnits || 0), 0)

   const estimatedIncome = myOffers.value.reduce((sum, o) => {
       // Simple estimation: Reserved * Price. 
       // Note: Final price might vary for weight_variable but this is "Estimated"
       const price = Number(o.product.pricePerKg || o.product.pricePerBunch || 0)
       const reservedAmount = (o.product.unitType === 'bunch' || o.product.unitType === 'unit') ? (o.reservedUnits || 0) : (o.reservedQuantityKg || 0)
       return sum + (price * reservedAmount)
   }, 0)

   return [
      { 
          label: 'Oferta Semanal', 
          value: `${totalOfferedKg.toFixed(1)}kg • ${totalOfferedUnits}uds`, 
          icon: '📦', 
          trend: 'ACTIVO' 
      },
      { 
          label: 'Reservado', 
          value: `${totalReservedKg.toFixed(1)}kg • ${totalReservedUnits}uds`, 
          icon: '🤝', 
          trend: 'PEDIDOS' 
      },
      { 
          label: 'Ingresos Est.', 
          value: `${estimatedIncome.toFixed(2)}€`, 
          icon: '💰', 
          trend: 'SEMANAL' 
      },
      { 
          label: 'Productos', 
          value: myOffers.value.length.toString(), 
          icon: '🥬', 
          trend: 'VARIEDAD' 
      },
   ]
})

// Offers for the "Productos en el Puesto" card (take top 5)
const activeOffers = computed(() => {
    return myOffers.value.slice(0, 5).map(o => ({
        id: o.id,
        name: o.product.name,
        emoji: getEmoji(o.product.name),
        stock: (o.product.unitType === 'bunch' || o.product.unitType === 'unit') ? o.availableUnits : Number(o.availableQuantityKg).toFixed(1),
        unit: (o.product.unitType === 'bunch' || o.product.unitType === 'unit') ? 'Uds' : 'Kg',
        product: o.product, // Pass full product for price logic in template
        reservedUnits: o.reservedUnits,
        reservedQuantityKg: o.reservedQuantityKg
    }))
})

// Navigation to edit offer
const goToOffer = (offerId: string) => {
    navigateTo(`/producer/offers?edit=${offerId}`)
}

// Helper
const getEmoji = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('miel')) return '🍯'
  if (n.includes('tomate')) return '🍅'
  if (n.includes('rábano') || n.includes('rabano')) return '🏮'
  if (n.includes('zanahoria')) return '🥕'
  if (n.includes('broccoli') || n.includes('brócoli')) return '🥦'
  if (n.includes('berenjena')) return '🍆'
  if (n.includes('calabacín') || n.includes('calabacin')) return '🥒'
  if (n.includes('pimiento')) return '🫑'
  if (n.includes('ajo')) return '🧄'
  if (n.includes('cebolla')) return '🧅'
  if (n.includes('puerro')) return '🎋'
  if (n.includes('acelga') || n.includes('espinaca') || n.includes('kale') || n.includes('rúcula') || n.includes('lechuga')) return '🥬'
  if (n.includes('patata')) return '🥔'
  if (n.includes('seta') || n.includes('hongo')) return '🍄'
  if (n.includes('huevo')) return '🥚'
  if (n.includes('queso')) return '🧀'
  if (n.includes('pan')) return '🥖'
  return '🥗'
}

const targetWeekISO = computed(() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
})

onMounted(async () => {
    try {
        const [offersData, pickingData] = await Promise.all([
            $fetch(`${apiBase}/tenants/${tenantId}/offers/my-offers`, {
                headers: { 'x-tenant-id': tenantId, 'Authorization': `Bearer ${auth.token}` }
            }),
            $fetch(`${apiBase}/tenants/${tenantId}/market/picking-list?week=${targetWeekISO.value}`, {
                headers: { 'x-tenant-id': tenantId, 'Authorization': `Bearer ${auth.token}` }
            })
        ])
        
        // Filter offers by current week
        myOffers.value = ((offersData as any[]) || []).filter(o => o.week.startsWith(targetWeekISO.value))

        // Process picking list for "Próximas Entregas"
        const rawItems = (pickingData as any[]) || []
        const groups: Record<string, any> = {}
        
        rawItems.forEach(item => {
            const orderId = item.orderId
            const bin = item.order?.binNumber
            if (!groups[orderId]) {
                groups[orderId] = {
                    id: orderId, // Use real order ID
                    bin,
                    customer: item.order?.consumer?.name || 'Consumidor',
                    itemCount: 0
                }
            }
            groups[orderId].itemCount++
        })
        
        // Take top 5 closest bin numbers
        upcomingOrders.value = Object.values(groups)
            .sort((a: any, b: any) => a.bin - b.bin)
            .slice(0, 5)

    } catch (e) {
        console.error('Fetch dashboard data error:', e)
    } finally {
        loading.value = false
    }
})
</script>
