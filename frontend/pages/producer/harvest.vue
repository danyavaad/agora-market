<template>
  <div class="py-12 max-w-5xl mx-auto px-4">
    <!-- Header -->
    <header class="mb-12">
      <div class="flex items-center gap-2 text-basil-green-light text-xs font-bold uppercase tracking-widest mb-3">
        <NuxtLink to="/producer" class="hover:underline">Panel</NuxtLink>
        <span>/</span>
        <span class="text-white/40">Día de Cosecha</span>
      </div>
      <h1 class="text-4xl md:text-5xl font-serif font-bold text-white mb-2">Preparación del Puesto</h1>
      <p class="text-white/40 font-medium italic">Prepara las baldas para el agora y ajusta el peso real de la cosecha.</p>
    </header>

    <div v-if="loading" class="flex justify-center py-24">
      <div class="animate-pulse flex flex-col items-center gap-4">
         <div class="w-12 h-12 rounded-full border-2 border-basil-green border-t-transparent animate-spin"></div>
         <p class="text-basil-green-light text-[10px] font-bold uppercase tracking-widest">Consultando pedidos...</p>
      </div>
    </div>

    <div v-else-if="Object.keys(groupedByBin).length === 0" class="bg-forest-dark-card p-20 rounded-[3rem] border border-white/5 text-center shadow-2xl">
       <div class="text-7xl mb-8 filter grayscale opacity-20">🚜</div>
       <h3 class="text-2xl font-serif font-bold text-white mb-2">Todo en órden</h3>
       <p class="text-white/40 italic">No tienes productos asignados para cosechar esta semana.</p>
    </div>

    <div v-else class="space-y-16">
      <!-- Grouped by Bin -->
      <div v-for="(items, bin) in groupedByBin" :key="bin" class="space-y-6">
        <div class="flex items-center gap-6 px-2">
            <div class="flex items-center gap-3">
              <span class="w-12 h-12 bg-basil-green text-moss-green-dark rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">#{{ bin }}</span>
              <span class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Balda de Despacho</span>
            </div>
            <div class="h-px flex-grow bg-white/5"></div>
            <div class="text-right">
              <span class="text-[10px] font-bold text-basil-green-light uppercase tracking-widest block">{{ items[0].order.consumer.name }}</span>
              <span class="text-[10px] text-white/20 uppercase font-medium">Consumidor</span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
           <BentoCard v-for="item in items" :key="item.id" class="group transition-all hover:scale-[1.02]">
              <div class="flex justify-between items-start mb-6">
                <div class="flex items-center gap-4">
                   <div class="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-500">{{ getEmoji(item.product.name) }}</div>
                   <div>
                     <h4 class="font-bold text-lg text-white/90">{{ item.product.name }}</h4>
                     <p class="text-[10px] text-basil-green-light font-bold uppercase tracking-widest mt-1">
                       Petición: {{ item.estimatedUnits ? item.estimatedUnits + ' uds' : item.estimatedQuantityKg + ' kg' }}
                     </p>
                   </div>
                </div>
                <div v-if="item.actualWeightKg" class="bg-basil-green/20 text-basil-green-light px-3 py-1 rounded-full flex items-center gap-1.5 font-black text-[9px] uppercase tracking-tighter">
                   <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                   Pesado
                </div>
              </div>

              <!-- Weight Adjustment Input -->
              <div v-if="item.product.unitType === 'weight_variable' || item.product.unitType === 'weight_fixed'" class="mt-4 pt-6 border-t border-white/5">
                 <div class="flex items-center gap-4">
                    <div class="flex-grow relative">
                        <label class="block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2 pl-1">Peso Real de Cosecha</label>
                        <div class="relative">
                          <input type="number" 
                                 step="0.01"
                                 v-model="item.tempWeight"
                                 placeholder="Ej: 1.25"
                                 class="w-full bg-white/5 border border-white/10 p-4 rounded-xl focus:ring-4 focus:ring-basil-green/20 outline-none text-xl font-serif font-bold text-white transition-all" />
                          <span class="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-bold uppercase text-[10px]">KG</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-4">
                       <div class="flex items-center gap-2 px-2">
                          <input type="checkbox" v-model="item.qualityCheck" class="w-4 h-4 rounded border-white/10 bg-white/5 text-basil-green focus:ring-basil-green/20" />
                          <span class="text-[9px] font-bold text-white/40 uppercase tracking-widest">Garantía de Calidad</span>
                       </div>
                       <button @click="updateWeight(item)" 
                               :disabled="submittingId === item.id || !item.tempWeight || !item.qualityCheck"
                               class="px-8 py-4 bg-basil-green text-moss-green-dark rounded-xl font-black text-xs uppercase tracking-widest hover:bg-basil-green-light transition-all shadow-[0_10px_30px_rgba(124,173,88,0.2)] active:scale-95 disabled:opacity-20">
                         {{ submittingId === item.id ? '...' : 'Ajustar' }}
                       </button>
                    </div>
                 </div>
              </div>
              <div v-else class="mt-4 pt-6 border-t border-white/5 flex justify-between items-center group/btn">
                 <span class="text-[10px] font-bold text-white/20 uppercase tracking-widest italic pr-4">Peso no requerido para unidad fija</span>
                 <button class="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/30 uppercase tracking-widest hover:bg-basil-green hover:text-white hover:border-basil-green transition-all">Empaquetado</button>
              </div>
           </BentoCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || '/api'
const auth = useAuth()
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const loading = ref(true)
const submittingId = ref<string | null>(null)
const pickingList = ref<any[]>([])

// Date Logic for current week (simplified)
const currentWeekISO = computed(() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
})

// Grouping logic
const groupedByBin = computed(() => {
    const groups: Record<number, any[]> = {}
    pickingList.value.forEach(item => {
        const bin = item.order.binNumber
        if (!groups[bin]) groups[bin] = []
        groups[bin].push(item)
    })
    return groups
})

onMounted(async () => {
    await fetchPickingList()
})

const fetchPickingList = async () => {
    loading.value = true
    try {
        const { data } = await useFetch(`${apiBase}/tenants/${tenantId}/market/picking-list?week=${currentWeekISO.value}`, {
            headers: { 
                'Authorization': `Bearer ${auth.token}`,
                'x-tenant-id': tenantId
            }
        })
        if (data.value) {
            pickingList.value = (data.value as any[]).map(item => ({
                ...item,
                tempWeight: item.actualWeightKg || '',
                qualityCheck: !!item.actualWeightKg
            }))
        }
    } catch (e) {
        console.error('Fetch error:', e)
    } finally {
        loading.value = false
    }
}

const updateWeight = async (item: any) => {
    submittingId.value = item.id
    try {
        const { error } = await useFetch(`${apiBase}/tenants/${tenantId}/market/harvest-weight/${item.id}`, {
            method: 'PATCH',
            body: { realWeightKg: Number(item.tempWeight) },
            headers: { 
                'Authorization': `Bearer ${auth.token}`,
                'x-tenant-id': tenantId
            }
        })
        if (error.value) throw new Error(error.value.message)
        item.actualWeightKg = item.tempWeight
    } catch (e) {
        alert('Error al actualizar el peso')
    } finally {
        submittingId.value = null
    }
}

const getEmoji = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('broccoli') || n.includes('brócoli')) return '🥦'
  if (n.includes('carrot') || n.includes('zanahoria')) return '🥕'
  if (n.includes('tomato') || n.includes('tomate')) return '🍅'
  if (n.includes('pumpkin') || n.includes('calabaza')) return '🎃'
  if (n.includes('basil') || n.includes('albahaca')) return '🌿'
  return '🥗'
}
</script>
