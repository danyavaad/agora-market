<template>
  <div class="py-12 max-w-4xl mx-auto px-4">
    <!-- Header -->
    <header class="mb-12">
      <div class="flex items-center gap-2 text-pumpkin-orange text-xs font-bold uppercase tracking-widest mb-3">
        <span>Agora Cáceres</span>
        <span>/</span>
        <span class="text-white/40">Rol: Capitán</span>
      </div>
      <h1 class="text-4xl md:text-5xl font-serif font-bold text-white mb-2">Despacho en el Ágora</h1>
      <p class="text-white/40 font-medium italic">Confirma la entrega directa del puesto a la balda del consumidor.</p>
    </header>

    <div class="grid grid-cols-1 gap-8">
      <!-- Search/Validation Card -->
      <BentoCard>
        <div class="p-4">
          <label class="block text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4 pl-1">Token del Puesto (UUID)</label>
          <div class="flex flex-col md:flex-row gap-4">
            <input type="text" 
                   v-model="qrToken"
                   placeholder="Código del consumidor..."
                   class="flex-grow bg-white/5 border border-white/10 p-5 rounded-2xl focus:ring-4 focus:ring-pumpkin-orange/20 outline-none text-xl font-mono font-bold text-white transition-all" />
            <button @click="validatePickup" 
                    :disabled="loading || !qrToken"
                    class="px-10 py-5 bg-pumpkin-orange text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-pumpkin-orange-hover transition-all shadow-xl active:scale-95 disabled:opacity-20 shrink-0">
               {{ loading ? 'Validando...' : 'Entregar Productos' }}
            </button>
          </div>
          
          <div class="mt-8 flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-dashed border-white/10 justify-center group cursor-pointer hover:bg-white/10 transition-all">
             <span class="text-2xl group-hover:scale-110 transition-transform">📸</span>
             <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest">Activar Cámara para Escanear</p>
          </div>
        </div>
      </BentoCard>

      <!-- Search Results / Feedback -->
      <Transition name="fade">
        <div v-if="orderResult" class="mt-4">
           <BentoCard class="border-basil-green/30 bg-basil-green/5">
              <div class="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div class="flex items-center gap-6">
                    <div class="w-20 h-20 bg-basil-green text-moss-green-dark rounded-full flex items-center justify-center text-3xl font-black shadow-lg">✓</div>
                    <div>
                       <h3 class="text-2xl font-serif font-bold text-white">¡Entrega Confirmada!</h3>
                       <p class="text-basil-green-light font-bold uppercase tracking-widest text-[10px] mt-1">Pedido #{{ orderResult.id.substring(0,8) }} • Balda #{{ orderResult.binNumber }}</p>
                    </div>
                 </div>
                 <div class="text-center md:text-right">
                    <p class="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Nombre del Consumidor</p>
                    <p class="text-xl font-bold text-white">{{ orderResult.consumer?.name || 'Usuario' }}</p>
                 </div>
              </div>
           </BentoCard>
        </div>
      </Transition>

      <div v-if="error" class="bg-tomato-red/10 border border-tomato-red/20 p-6 rounded-3xl text-center">
         <p class="text-tomato-red font-bold uppercase tracking-widest text-xs">{{ error }}</p>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const auth = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const qrToken = ref('')
const loading = ref(false)
const orderResult = ref<any>(null)
const error = ref('')

const validatePickup = async () => {
    loading.value = true
    error.value = ''
    orderResult.value = null
    
    try {
        const { data, error: apiError } = await useFetch(`${apiBase}/tenants/${tenantId}/market/confirm-pickup`, {
            method: 'POST',
            body: { qrToken: qrToken.value },
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
        
        if (apiError.value) throw new Error(apiError.value.message)
        
        orderResult.value = data.value
        qrToken.value = ''
    } catch (e: any) {
        error.value = 'Token no válido o pedido ya entregado.'
        console.error(e)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
