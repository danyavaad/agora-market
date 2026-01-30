<template>
  <div class="py-8 max-w-4xl mx-auto px-4">
    <!-- Header -->
    <header class="mb-10 flex justify-between items-end">
      <div>
        <div class="flex items-center gap-2 text-basil-green-light text-xs font-bold uppercase tracking-widest mb-2">
          <span>Logística</span>
          <span>/</span>
          <span class="text-white/40">Hoja de Ruta</span>
        </div>
        <h1 class="text-4xl font-serif font-bold text-white">Reparto Semanal</h1>
        <p class="text-white/40 italic">Rutas optimizadas con pooling geográfico.</p>
      </div>
      <div class="text-right">
          <span class="block text-[10px] text-white/40 uppercase tracking-widest font-bold">Semana</span>
          <span class="font-serif font-bold text-xl text-basil-green-light">{{ targetDate }}</span>
      </div>
    </header>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-basil-green"></div>
    </div>

    <div v-else-if="routes.length === 0" class="text-center py-20 bg-white/5 rounded-[2.5rem] border border-white/5">
       <p class="text-white/20 italic">No hay pedidos confirmados para reparto esta semana.</p>
    </div>

    <div v-else class="space-y-6">
       <div v-for="(route, idx) in routes" :key="idx" 
            class="bg-forest-dark-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
          <div class="p-6 sm:p-8">
             <div class="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div class="flex items-center gap-3">
                   <div class="w-12 h-12 rounded-2xl bg-basil-green/10 flex items-center justify-center border border-basil-green/20">
                      <span class="text-xl">{{ route.isPool ? '👥' : '🏠' }}</span>
                   </div>
                   <div>
                      <p class="text-[10px] font-bold text-basil-green-light uppercase tracking-widest">
                        {{ route.isPool ? 'Pool Compartido' : 'Entrega Individual' }}
                      </p>
                      <h3 class="text-xl font-serif font-bold text-white">{{ route.mainAddress }}</h3>
                   </div>
                </div>
                <div class="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-right">
                   <p class="text-[9px] font-bold text-white/20 uppercase tracking-widest">Peso Total Est.</p>
                   <p class="text-lg font-serif font-bold text-basil-green-light">{{ route.totalWeight }}kg</p>
                </div>
             </div>

             <!-- Orders in this route -->
             <div class="space-y-4">
                <div v-for="order in route.orders" :key="order.id" 
                     class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                   <div class="flex items-center gap-4">
                      <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                         {{ order.consumerId.substring(0, 2) }}
                      </div>
                      <div>
                         <p class="font-bold text-white/90 text-sm leading-none mb-1">{{ order.consumer.name }}</p>
                         <p class="text-[10px] text-white/20 font-bold uppercase tracking-widest">ID: #{{ order.id.substring(0, 8) }}</p>
                      </div>
                   </div>
                   
                   <div class="flex items-center gap-4">
                      <span v-if="order.status === 'delivered'" class="text-[10px] font-bold text-basil-green-light bg-basil-green/10 px-3 py-1 rounded-lg uppercase tracking-widest">Entregado</span>
                      <button v-else 
                              @click="confirmDelivery(order.id, idx)"
                              class="px-5 py-2 bg-basil-green text-moss-green-dark rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-basil-green-light transition-all active:scale-95 shadow-lg">
                        Confirmar Entrega
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'
const auth = useAuth()
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const loading = ref(true)
const routes = ref<any[]>([])

// Date Logic (same as shop)
const targetDate = computed(() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
})

onMounted(async () => {
  await fetchRoutes()
})

const fetchRoutes = async () => {
    loading.value = true
    try {
        const { data } = await useFetch(`${apiBase}/tenants/${tenantId}/delivery/routes?week=${targetDate.value}`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
        routes.value = (data.value as any[]) || []
    } catch (e) {
        console.error('Fetch routes error:', e)
    } finally {
        loading.value = false
    }
}

const confirmDelivery = async (orderId: string, routeIdx: number) => {
    try {
        const { error } = await useFetch(`${apiBase}/tenants/${tenantId}/delivery/${orderId}/confirm`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
        if (error.value) throw new Error(error.value.message)
        
        // Optimistic update
        const order = routes.value[routeIdx].orders.find((o: any) => o.id === orderId)
        if (order) order.status = 'delivered'
        
    } catch (e) {
        alert('Error al confirmar entrega')
        console.error(e)
    }
}
</script>
