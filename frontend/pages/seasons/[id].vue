<template>
  <div class="py-4">
    <NuxtLink to="/seasons" class="text-basil-green font-bold text-xs uppercase tracking-widest flex items-center gap-1 mb-6 hover:translate-x-[-4px] transition-transform">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
      Volver a Temporadas
    </NuxtLink>
    
    <div v-if="season" class="mb-10">
        <h1 class="text-4xl font-serif font-bold text-earth-brown mb-2">{{ season.name }}</h1>
        <p class="text-basil-green font-medium italic">Gestión de Prioridades y Sistema de Draft.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- Left: Producer Simulation -->
        <BentoCard title="👨‍🌾 Simular Vista de Productor">
            <template #header-action>
              <div class="text-[10px] font-bold text-basil-green-dark bg-basil-green/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Sandbox</div>
            </template>

            <div class="mb-6">
                <label class="block text-[10px] font-bold text-earth-brown/50 uppercase tracking-widest mb-1 pl-1">Seleccionar Productor</label>
                <select v-model="selectedProducerId" class="w-full bg-paper-beige/50 border border-earth-brown/10 p-3 rounded-xl focus:ring-2 focus:ring-basil-green/20 outline-none text-earth-brown font-semibold transition-all">
                    <option disabled value="">-- Elegir Productor --</option>
                    <option v-for="pid in rotationOrder" :key="pid" :value="pid">
                        Productor {{ pid.substring(0, 8) }}...
                    </option>
                </select>
            </div>

            <div v-if="selectedProducerId" class="mt-6 pt-6 border-t border-earth-brown/5 space-y-4">
                <h3 class="text-xs font-bold text-earth-brown/40 uppercase tracking-widest mb-4 italic">Mis Prioridades de Cultivo:</h3>
                
                <div v-for="rank in [1, 2, 3]" :key="rank" class="flex items-center gap-4 bg-paper-beige/30 p-2 rounded-2xl border border-earth-brown/5">
                    <div class="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-basil-green text-white rounded-full font-serif font-bold shadow-sm">
                      {{ rank }}
                    </div>
                    <select 
                        :value="getPriorityProduct(selectedProducerId, rank)" 
                        @change="e => setPriority(selectedProducerId, rank, (e.target as HTMLSelectElement).value)"
                        class="flex-1 bg-white/50 border border-earth-brown/10 p-3 rounded-xl focus:ring-2 focus:ring-basil-green/20 outline-none text-earth-brown font-medium"
                    >
                        <option value="">-- Seleccionar Cultivo --</option>
                        <option v-for="prod in mockProducts" :key="prod.id" :value="prod.id">
                            {{ prod.name }}
                        </option>
                    </select>
                </div>
            </div>
            <div v-else class="text-center py-10 text-earth-brown/30 italic text-sm">
              Selecciona un productor para empezar a elegir cultivos.
            </div>
        </BentoCard>

        <!-- Right: Global Status Board -->
        <BentoCard title="📊 Tablero Global de Prioridades">
            <template #header-action>
               <button @click="fetchData" class="p-1 hover:rotate-180 transition-transform duration-500">
                  <svg class="w-4 h-4 text-earth-brown/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               </button>
            </template>

            <div v-if="priorities.length === 0" class="text-center py-12 opacity-30 italic text-earth-brown">No hay prioridades registradas todavía.</div>
            
            <div v-else class="overflow-hidden rounded-xl border border-earth-brown/5">
              <table class="w-full text-xs text-left">
                  <thead class="text-earth-brown/40 uppercase tracking-widest bg-paper-beige/50">
                      <tr>
                          <th class="px-4 py-3 font-bold">Productor</th>
                          <th class="px-4 py-3 font-bold text-center">Rango</th>
                          <th class="px-4 py-3 font-bold">Cultivo</th>
                          <th class="px-4 py-3 font-bold text-right">Estado</th>
                      </tr>
                  </thead>
                  <tbody class="divide-y divide-earth-brown/5">
                      <tr v-for="p in priorities" :key="p.id" class="hover:bg-basil-green/5 transition-colors">
                          <td class="px-4 py-3 font-bold text-earth-brown">{{ p.producerId.substring(0, 8) }}...</td>
                          <td class="px-4 py-3 text-center">
                            <span class="w-5 h-5 inline-flex items-center justify-center rounded-full bg-paper-beige font-bold text-earth-brown/60">{{ p.priorityOrder }}</span>
                          </td>
                          <td class="px-4 py-3 font-medium text-basil-green-dark">{{ getProductName(p.productId) }}</td>
                          <td class="px-4 py-3 text-right">
                               <!-- Conflict Detection Logic (Simple Visual) -->
                               <span v-if="isConflict(p)" class="inline-flex items-center gap-1 text-tomato-red font-bold">
                                 <span class="w-1.5 h-1.5 rounded-full bg-tomato-red animate-pulse"></span>
                                 Conflicto
                               </span>
                               <span v-else class="inline-flex items-center gap-1 text-basil-green font-bold">
                                 <span class="w-1.5 h-1.5 rounded-full bg-basil-green"></span>
                                 OK
                               </span>
                          </td>
                      </tr>
                  </tbody>
              </table>
            </div>

            <div class="mt-8 bg-paper-beige/50 p-4 rounded-2xl border border-earth-brown/10">
                <h4 class="text-[10px] font-bold text-earth-brown/60 uppercase tracking-widest mb-1 flex items-center gap-1">
                  💡 Regla del Draft
                </h4>
                <p class="text-[10px] text-earth-brown/50 leading-relaxed font-medium">
                  Si dos productores eligen el mismo cultivo en la **Ronda 1**, el conflicto se resuelve por el orden de rotación. El que esté más arriba en la lista tiene la prioridad (P1), y los demás pasarán a ser suplentes (P2, P3).
                </p>
            </div>
        </BentoCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const route = useRoute()
const seasonId = route.params.id as string
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'
const tenantId = 'nodo-caceres-id'

const season = ref(null)
const priorities = ref<any[]>([])
const selectedProducerId = ref('')

// Mock Products - Ideally from Backend /products
const mockProducts = [
    { id: 'prod_tomato', name: 'Tomate de Huerta' },
    { id: 'prod_broccoli', name: 'Brócoli Ecológico' },
    { id: 'prod_carrot', name: 'Zanahoria de Rama' },
    { id: 'prod_pumpkin', name: 'Calabaza' },
    { id: 'prod_basil', name: 'Albahaca' },
]

const getProductName = (id: string) => mockProducts.find(p => p.id === id)?.name || id

const rotationOrder = computed(() => {
    return season.value?.producerRotation || []
})

// Fetch Data
const fetchData = async () => {
    try {
        const headers = { 'x-tenant-id': tenantId }
        // Get Season
        season.value = await $fetch(`${apiBase}/tenants/${tenantId}/seasons/${seasonId}`, { headers })
        // Get Priorities
        priorities.value = await $fetch(`${apiBase}/tenants/${tenantId}/seasons/${seasonId}/priorities`, { headers })
    } catch(e) {
        console.error(e)
    }
}

// Helpers
const getPriorityProduct = (producerId: string, rank: number) => {
    const entry = priorities.value.find(p => p.producerId === producerId && p.priorityOrder === rank)
    return entry?.productId || ''
}

const isConflict = (priority) => {
    if (priority.priorityOrder !== 1) return false;
    
    // Conflict if another producer picked the same product at Rank 1
    const others = priorities.value.filter(p => 
        p.productId === priority.productId && 
        p.priorityOrder === 1 && 
        p.producerId !== priority.producerId
    )
    return others.length > 0
}

const setPriority = async (producerId: string, rank: number, productId: string) => {
    if (!productId) return
    try {
        await $fetch(`${apiBase}/tenants/${tenantId}/seasons/${seasonId}/priorities`, {
            method: 'POST',
            headers: { 'x-tenant-id': tenantId },
            body: {
                productId,
                priorityOrder: rank,
                producerId // Used for simulation
            }
        })
        await fetchData()
    } catch (e) {
        console.error(e)
        alert('Error al establecer prioridad')
    }
}

onMounted(() => {
    fetchData()
})
</script>
