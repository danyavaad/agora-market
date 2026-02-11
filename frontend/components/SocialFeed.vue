<template>
  <div class="space-y-8">
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-basil-green"></div>
    </div>
    
    <div v-else-if="posts.length === 0" class="text-center py-12 border border-dashed border-white/10 rounded-[2.5rem]">
      <p class="text-white/20 italic text-sm">Aún no hay historias en este Ágora.</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-8">
      <div v-for="post in posts" :key="post.id" class="bg-forest-dark-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl transition-all hover:border-white/20 group">
        <!-- Photo -->
        <div v-if="post.photoUrl" class="h-64 sm:h-80 relative overflow-hidden">
          <img :src="post.photoUrl.startsWith('http') ? post.photoUrl : apiBase + post.photoUrl" alt="Huerta Story" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105">
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
          
          <!-- Badge overlay -->
          <div class="absolute top-6 left-6 flex gap-2">
            <span v-if="post.eventType" 
                  :class="getEventClass(post.eventType)"
                  class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
              {{ translateEvent(post.eventType) }}
            </span>
            <span v-if="post.product" class="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
              {{ post.product.name }}
            </span>
          </div>
        </div>

        <div class="p-8">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full bg-basil-green/10 flex items-center justify-center text-xl shadow-inner uppercase font-black text-basil-green-dark">
                {{ post.producer?.name?.substring(0, 1) || 'A' }}
              </div>
              <div>
                <h4 class="text-lg font-serif font-bold text-white">{{ post.producer?.name || 'Productor Artesano' }}</h4>
                <p class="text-[10px] text-basil-green-light font-bold uppercase tracking-widest">{{ formatDate(post.createdAt) }}</p>
              </div>
            </div>
            <NuxtLink :to="'/chat?with=' + post.producerId" 
                      class="px-5 py-2 bg-white/5 border border-white/10 text-white hover:bg-basil-green hover:text-moss-green-dark transition-all rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              💬 Conversar
            </NuxtLink>
          </div>

          <p class="text-white/80 leading-relaxed font-medium">
             {{ post.message }}
          </p>
          
          <div class="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
             <div class="flex items-center gap-4 text-white/30">
                <button class="flex items-center gap-1.5 hover:text-basil-green-light transition-colors">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                   <span class="text-[10px] font-black uppercase tracking-widest">Me gusta</span>
                </button>
             </div>
             <NuxtLink v-if="post.productId" :to="`/shop?product=${post.productId}`" class="text-[9px] font-black text-basil-green-light uppercase tracking-[0.2em] hover:underline">
               Ver en el Puesto →
             </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const loading = ref(true)
const posts = ref<any[]>([])

onMounted(async () => {
  await fetchFeed()
})

const fetchFeed = async () => {
    loading.value = true
    try {
        const { data } = await useFetch(`${apiBase}/tenants/${tenantId}/feed`)
        posts.value = (data.value as any[]) || []
    } catch (e) {
        console.error('Fetch feed error:', e)
    } finally {
        loading.value = false
    }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const translateEvent = (event: string) => {
  const map: Record<string, string> = {
    planting: 'Siembra',
    harvest: 'Cosecha ✨',
    frost: 'Alarma: Helada ❄️',
    pest: 'Incidencia 🐛',
    other: 'Vida en la Huerta'
  }
  return map[event] || event
}

const getEventClass = (event: string) => {
  if (event === 'harvest') return 'bg-basil-green text-moss-green-dark'
  if (event === 'planting') return 'bg-basil-green-light/20 text-basil-green-light'
  if (event === 'frost' || event === 'pest') return 'bg-tomato-red text-white'
  return 'bg-white/5 text-white/40'
}
</script>
