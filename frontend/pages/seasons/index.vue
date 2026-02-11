<template>
  <div class="py-4">
    <header class="mb-10">
       <h1 class="text-4xl font-serif font-bold text-earth-brown mb-2">Gestión de Temporadas</h1>
       <p class="text-basil-green font-medium italic">Planificación estratégica de cultivos y rotaciones.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      <!-- Create Season Form -->
      <div class="lg:col-span-1">
        <BentoCard title="🌱 Iniciar Nueva Temporada">
          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-earth-brown/50 uppercase tracking-widest mb-1 pl-1">Nombre</label>
              <input v-model="newSeason.name" 
                     type="text" 
                     class="w-full bg-paper-beige/50 border border-earth-brown/10 p-3 rounded-xl focus:ring-2 focus:ring-basil-green/20 focus:border-basil-green outline-none transition-all placeholder:text-earth-brown/30" 
                     placeholder="Verano 2026" />
            </div>
            <div>
              <label class="block text-[10px] font-bold text-earth-brown/50 uppercase tracking-widest mb-1 pl-1">Fecha de Inicio</label>
              <input v-model="newSeason.startDate" 
                     type="date" 
                     class="w-full bg-paper-beige/50 border border-earth-brown/10 p-3 rounded-xl focus:ring-2 focus:ring-basil-green/20 focus:border-basil-green outline-none transition-all" />
            </div>
            <button @click="createSeason" 
                    class="w-full py-4 bg-basil-green text-white rounded-2xl font-bold hover:bg-basil-green-dark transition-all shadow-md hover:shadow-lg active:scale-95 text-xs uppercase tracking-widest mt-2">
              Crear y Rotar
            </button>
          </div>
          <p class="mt-4 text-[9px] text-earth-brown/40 leading-relaxed">
            * Al crear una temporada, el orden de draft rotará automáticamente según el historial del nodo.
          </p>
        </BentoCard>
      </div>

      <!-- Seasons List -->
      <div class="lg:col-span-2 space-y-6">
        <h2 class="text-xs font-bold text-earth-brown/40 uppercase tracking-[0.2em] mb-4">Cronograma de Temporadas</h2>
        
        <div v-if="loading" class="text-center py-10 opacity-30 italic">Cargando historial...</div>
        
        <div v-else-if="seasons.length === 0" class="text-center py-20 bg-white/30 rounded-3xl border border-dashed border-earth-brown/20 italic text-earth-brown/40">
          No hay temporadas registradas. Empieza creando una nueva.
        </div>

        <BentoCard v-for="season in seasons" :key="season.id" class="group">
          <div class="flex flex-col md:flex-row justify-between gap-6">
            <div class="flex-grow">
              <div class="flex items-center gap-3 mb-1">
                <h3 class="text-2xl font-serif font-bold text-earth-brown">{{ season.name }}</h3>
                <span :class="[
                  'text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase',
                  season.isActive ? 'bg-basil-green/20 text-basil-green-dark' : 'bg-earth-brown/10 text-earth-brown/40'
                ]">
                  {{ season.isActive ? 'Activa' : 'Borrador' }}
                </span>
              </div>
              <p class="text-xs text-earth-brown/60 mb-6 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Inicia el {{ new Date(season.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) }}
              </p>
              
              <div>
                <h4 class="text-[10px] font-bold text-earth-brown/40 uppercase tracking-widest mb-3">Orden del Draft (Rotación):</h4>
                <div class="flex flex-wrap gap-2">
                  <div v-for="(producerId, index) in season.producerRotation" :key="producerId" 
                       class="bg-paper-beige/80 border border-earth-brown/5 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <span class="text-[10px] font-bold text-basil-green">{{ (index as number) + 1 }}º</span>
                    <span class="text-xs font-semibold text-earth-brown">ID: {{ producerId.substring(0, 8) }}...</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col justify-end gap-2 shrink-0">
               <NuxtLink :to="`/seasons/${season.id}`" 
                         class="px-6 py-3 bg-earth-brown text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-earth-brown/80 transition shadow-sm text-center">
                 Gestionar Prioridades
               </NuxtLink>
            </div>
          </div>
        </BentoCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || '/api'
const tenantId = 'nodo-caceres-id'

// State
const seasons = ref<any[]>([])
const loading = ref(true)
const newSeason = ref({
  name: '',
  startDate: new Date().toISOString().split('T')[0]
})

// Fetch Seasons
const fetchSeasons = async () => {
  loading.value = true
  try {
    const { data, error } = await useFetch(`${apiBase}/tenants/${tenantId}/seasons`, {
        headers: { 'x-tenant-id': tenantId }
    })
    if (error.value) throw new Error(error.value.message)
    seasons.value = data.value as any[]
  } catch (e) {
    console.error('Failed to fetch seasons', e)
  } finally {
    loading.value = false
  }
}

// Create Season
const createSeason = async () => {
  if (!newSeason.value.name) return alert('Por favor, indica un nombre')
  
  try {
    await $fetch(`${apiBase}/tenants/${tenantId}/seasons`, {
      method: 'POST',
      headers: { 'x-tenant-id': tenantId },
      body: {
        name: newSeason.value.name,
        startDate: newSeason.value.startDate,
        isActive: true
      }
    })
    // Refresh list
    await fetchSeasons()
    newSeason.value.name = ''
  } catch (e) {
    alert('Error al crear la temporada')
    console.error(e)
  }
}

// Initial Load
onMounted(() => {
  fetchSeasons()
})
</script>
