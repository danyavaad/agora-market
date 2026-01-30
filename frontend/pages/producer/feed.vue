<template>
  <div class="py-12 max-w-2xl mx-auto px-4">
    <!-- Header -->
    <header class="mb-10 text-center">
      <div class="flex items-center justify-center gap-2 text-basil-green-light text-xs font-bold uppercase tracking-widest mb-3">
        <NuxtLink to="/producer" class="hover:underline">Panel</NuxtLink>
        <span>/</span>
        <span class="text-white/40">Mi Puesto</span>
      </div>
      <h1 class="text-4xl font-serif font-bold text-white mb-2">Historias de la Huerta</h1>
      <p class="text-white/40 italic">Comparte con la comunidad el progreso de tus cultivos.</p>
    </header>

    <BentoCard>
      <form @submit.prevent="submitPost" class="space-y-8 p-4">
        <!-- Event Type -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
           <button v-for="type in eventTypes" 
                   :key="type.id"
                   type="button"
                   @click="form.eventType = type.id"
                   :class="form.eventType === type.id ? 'bg-basil-green text-moss-green-dark border-basil-green' : 'bg-white/5 text-white/40 border-white/5'"
                   class="px-4 py-3 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105">
             {{ type.emoji }} {{ type.label }}
           </button>
        </div>

        <!-- Message -->
        <div class="space-y-2">
           <label class="block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] pl-1">¿Qué está pasando?</label>
           <textarea v-model="form.message" 
                     placeholder="Ej: Hoy hemos empezado a sembrar los tomates rosas..."
                     rows="4"
                     required
                     class="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:ring-4 focus:ring-basil-green/20 outline-none text-white transition-all placeholder:text-white/10"></textarea>
        </div>

        <!-- Photo URL (Simple Mock for now) -->
        <div class="space-y-2">
           <label class="block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] pl-1">URL de la Foto</label>
           <input v-model="form.photoUrl" 
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  class="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:ring-4 focus:ring-basil-green/20 outline-none text-white transition-all placeholder:text-white/10" />
           <p class="text-[9px] text-white/20 italic mt-2">Próximamente: Carga directa desde la cámara.</p>
        </div>

        <button type="submit" 
                :disabled="loading"
                class="w-full py-5 bg-basil-green text-moss-green-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-basil-green-light transition-all shadow-xl active:scale-95 disabled:opacity-50">
           {{ loading ? 'Publicando...' : 'Postear en el Ágora' }}
        </button>
      </form>
    </BentoCard>

    <!-- Recent Posts for the Producer -->
    <div class="mt-16 space-y-6">
       <h3 class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] text-center">Tus últimas historias</h3>
       <p class="text-center text-white/10 italic text-xs">Gestiona tus publicaciones aquí pronto.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'
const auth = useAuth()
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const loading = ref(false)
const form = ref({
  message: '',
  photoUrl: '',
  eventType: 'planting'
})

const eventTypes = [
  { id: 'planting', label: 'Siembra', emoji: '🌱' },
  { id: 'harvest', label: 'Cosecha', emoji: '✨' },
  { id: 'frost', label: 'Helada', emoji: '❄️' },
  { id: 'pest', label: 'Incidencia', emoji: '🐛' },
  { id: 'other', label: 'Otros', emoji: '🚜' },
]

const submitPost = async () => {
    loading.value = true
    try {
        const { error } = await useFetch(`${apiBase}/tenants/${tenantId}/feed`, {
            method: 'POST',
            body: form.value,
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
        if (error.value) throw new Error(error.value.message)
        
        // Success: Redirect to shop feed
        navigateTo('/shop?view=feed')
    } catch (e) {
        alert('Error al publicar la historia')
        console.error(e)
    } finally {
        loading.value = false
    }
}
</script>
