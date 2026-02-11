<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('cancel')"></div>
    <div class="relative w-full max-w-md bg-forest-dark-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
      
      <!-- Header -->
      <div class="p-6 bg-basil-green/10 border-b border-white/5 flex items-center justify-between">
        <h3 class="text-xl font-serif font-bold text-white">Confirmar Pedido</h3>
        <button @click="$emit('cancel')" class="text-white/40 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        
        <!-- Pickup Info -->
        <div class="space-y-2">
            <h4 class="text-xs font-bold text-basil-green-light uppercase tracking-widest">Punto de Recogida</h4>
            <div class="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-4">
                <div class="text-2xl">🏛️</div>
                <div>
                    <p class="font-bold text-white">Plaza Central</p>
                    <p class="text-sm text-white/50">Robledillo de la Vera</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Plaza+Central+Robledillo+de+la+Vera" target="_blank" class="inline-flex items-center gap-1 mt-2 text-xs text-basil-green hover:underline">
                        Ver en mapa 
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                </div>
            </div>
        </div>

        <!-- Date Info -->
        <div class="space-y-2">
            <h4 class="text-xs font-bold text-basil-green-light uppercase tracking-widest">Fecha y Hora</h4>
            <div class="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4">
                <div class="text-2xl">📅</div>
                <div>
                    <p class="font-bold text-white">Sábado, 10:00 - 14:00</p>
                    <p class="text-sm text-white/50">Recogida durante el mercado semanal (Ágora).</p>
                </div>
            </div>
        </div>

        <!-- Shared Delivery Option -->
        <div class="space-y-2">
            <h4 class="text-xs font-bold text-basil-green-light uppercase tracking-widest flex justify-between items-center">
                Delivery Compartido
                <span class="px-2 py-0.5 rounded-full bg-basil-green text-moss-green-dark text-[9px]">BETA</span>
            </h4>
            
            <div class="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p class="text-xs text-white/60 mb-4 leading-relaxed">
                   Si vives en un radio de 5km, puedes optar por un reparto conjunto con tus vecinos. Comparte tu ubicación para que te avisemos si hay un grupo disponible.
                </p>

                <button 
                  v-if="!locationShared" 
                  @click="shareLocation" 
                  :disabled="loadingLoc"
                  class="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/10"
                >
                    <span v-if="loadingLoc" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    <span v-else>📍 Compartir mi ubicación</span>
                </button>

                <div v-else class="flex items-center gap-2 text-basil-green text-sm font-bold bg-basil-green/10 p-3 rounded-xl">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    Ubicación registrada correctamente.
                </div>
            </div>
        </div>
        
        <!-- Total -->
        <div class="pt-4 border-t border-white/10 flex justify-between items-end">
            <span class="text-white/40 text-sm">Total a pagar</span>
            <span class="text-3xl font-serif font-bold text-white">{{ total.toFixed(2) }}€</span>
        </div>

        <button @click="$emit('confirm')" class="w-full py-4 bg-basil-green text-moss-green-dark rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg text-sm">
            Confirmar Pedido
        </button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  total: number
  items: any[]
}>()

watch(() => props.isOpen, (newVal) => {
  console.log('OrderConfirmationModal isOpen changed:', newVal);
});

onMounted(() => {
    console.log('OrderConfirmationModal mounted');
});

const emit = defineEmits(['confirm', 'cancel'])
const auth = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || '/api'

const loadingLoc = ref(false)
const locationShared = ref(false)

const shareLocation = () => {
    loadingLoc.value = true
    if (!navigator.geolocation) {
        alert('Tu navegador no soporta geolocalización.')
        loadingLoc.value = false
        return
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            await $fetch(`${apiBase}/users/profile`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${auth.token}` },
                body: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
            })
            locationShared.value = true
        } catch (e) {
            console.error('Location update error:', e)
            alert('Error al guardar la ubicación.')
        } finally {
            loadingLoc.value = false
        }
    }, (err) => {
        console.error('Geo error:', err)
        alert('No pudimos obtener tu ubicación. Revisa los permisos.')
        loadingLoc.value = false
    })
}
</script>
