<!--
  File: frontend/pages/captain/index.vue
  
  Purpose: 
  Vista principal para el rol de 'Capitán' (Gestor del Ágora).
  Esta pantalla permite dos funciones críticas de logística:
  1. Validar la entrega de pedidos al consumidor final (Outbound).
  2. Recepcionar mercancía de los productores (Inbound).
  
  Design:
  Utiliza un diseño de tarjetas (Bento UI) para separar las acciones.
  Incluye lógica de escaneo de QR (vía cámara simulada por upload) para facilitar
  el trabajo de campo sin hardware específico.
  
  Dependencies: jsQR, useAuth, BentoCard
  Domain: Logística / Inbound / Outbound
-->

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
          
          <div class="flex flex-col md:flex-row gap-4 mt-8">
              <div class="flex-1 flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-dashed border-white/10 justify-center group cursor-pointer hover:bg-white/10 transition-all opacity-50 pointer-events-none">
                 <span class="text-2xl group-hover:scale-110 transition-transform">📸</span>
                 <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest">Escanear (Cámara)</p>
              </div>

              <!-- Upload Button -->
              <div @click="triggerFileInput" class="flex-1 flex items-center gap-4 bg-basil-green/10 p-4 rounded-2xl border border-dashed border-basil-green/30 justify-center group cursor-pointer hover:bg-basil-green/20 transition-all">
                 <span class="text-2xl group-hover:scale-110 transition-transform">📤</span>
                 <p class="text-[10px] font-bold text-basil-green-light uppercase tracking-widest">Subir Imagen QR</p>
                 <input type="file" ref="fileInput" accept="image/*" @change="handleFileUpload" class="hidden" />
              </div>
          </div>
        </div>
      </BentoCard>

      <!-- Search Results / Feedback -->
      <Transition name="fade" mode="out-in">
        <!-- Bloque de Recepción de Mercancía (Producer) -->
        <div v-if="producerDeliveries !== null" class="mt-8" key="producer">
             <div class="flex items-center justify-between mb-6">
                 <h2 class="text-2xl font-serif font-bold text-white">Recepción de Mercancía</h2>
                 <button @click="producerDeliveries = null" class="text-xs text-white/40 hover:text-white underline">Cancelar</button>
             </div>
             
             <!-- Success State -->
             <div v-if="producerDeliveries.length === 0" class="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <span class="text-4xl block mb-2">✅</span>
                  <p class="text-basil-green text-lg font-bold">¡Todo recibido!</p>
                  <p class="text-xs text-white/40">No quedan entregas pendientes para este productor.</p>
             </div>

             <!-- List of Pending Deliveries -->
             <div v-else class="space-y-4">
                 <div v-for="delivery in producerDeliveries" :key="delivery.orderId" class="bg-forest-dark-card border border-white/10 p-4 rounded-2xl flex flex-col gap-4 shadow-lg">
                     <div class="flex justify-between items-start border-b border-white/5 pb-3">
                         <div>
                             <span class="bg-pumpkin-orange text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest mb-1 inline-block shadow-sm">Balda #{{ delivery.binNumber }}</span>
                             <h3 class="text-lg font-bold text-white leading-tight">{{ delivery.customerName }}</h3>
                         </div>
                         <button @click="confirmProducerDelivery(delivery.orderId)" class="bg-basil-green text-moss-green-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 flex items-center gap-1">
                             <span>Confirmar</span>
                             <span>📦</span>
                         </button>
                     </div>
                     
                     <ul class="space-y-2 bg-black/20 p-3 rounded-xl mt-1">
                         <li v-for="item in delivery.items" :key="item.id" class="flex justify-between text-xs text-white/80 border-b border-white/5 last:border-0 pb-1 last:pb-0">
                             <span class="font-medium">{{ item.productName }}</span>
                             <span class="font-black text-basil-green-light">{{ item.qty }} {{ item.unitType === 'bunch' ? 'buds' : 'kg' }}</span>
                         </li>
                     </ul>
                 </div>
             </div>
        </div>

        <!-- Bloque de Entrega Confirmada (Consumer) -->
        <div v-else-if="orderResult" class="mt-4" key="consumer">
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

              <!-- Order Details List -->
              <div class="px-6 pb-6 pt-0">
                  <div class="mt-4 pt-4 border-t border-basil-green/20">
                      <h4 class="text-[10px] font-bold text-basil-green/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <span>📦 Contenido de la Caja</span>
                         <span class="bg-basil-green/20 text-basil-green px-1.5 py-0.5 rounded text-[9px]">{{ orderResult.items?.length || 0 }} productos</span>
                      </h4>
                      <div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                          <div v-for="item in orderResult.items" :key="item.id" class="flex justify-between items-center p-3 rounded-xl bg-basil-green/5 border border-basil-green/10 hover:bg-basil-green/10 transition-colors">
                               <div class="flex items-center gap-3">
                                   <span class="text-lg">🥬</span>
                                   <span class="text-sm font-bold text-white/90">{{ item.product?.name || 'Producto Desconocido' }}</span>
                               </div>
                               <span class="font-mono text-xs font-bold text-basil-green bg-basil-green/10 px-2 py-1 rounded-lg">
                                  {{ (item.estimatedUnits || item.units) ? (item.estimatedUnits || item.units) + ' Uds' : (Number(item.estimatedQuantityKg || item.quantityKg).toFixed(2)) + ' Kg' }}
                               </span>
                          </div>
                      </div>
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
import jsQR from 'jsqr'

const auth = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || '/api'
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const qrToken = ref('')
const loading = ref(false)
const orderResult = ref<any>(null)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = target.files
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            if (!context) return

            canvas.width = img.width
            canvas.height = img.height
            context.drawImage(img, 0, 0, img.width, img.height)
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
            const code = jsQR(imageData.data, imageData.width, imageData.height)

            if (code) {
                console.log("QR Code Found:", code.data)
                qrToken.value = code.data
                validatePickup() // Auto-submit
            } else {
                error.value = "No se detectó ningún código QR en la imagen."
            }
        }
        img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

const producerDeliveries = ref<any[] | null>(null)
const viewingProducerId = ref('')

/**
 * Confirma la recepción de un pedido específico entregado por el productor.
 * @param orderId ID del pedido que se marca como "recibido en el hub".
 * 
 * Lógica:
 * 1. Llama al endpoint de confirmación.
 * 2. Si es exitoso, elimina el pedido de la lista local para feedback instantáneo.
 * 3. Si la lista queda vacía, muestra mensaje de éxito y resetea la vista.
 */
const confirmProducerDelivery = async (orderId: string) => {
   try {
       await $fetch(`${apiBase}/tenants/${tenantId}/market/confirm-producer-delivery`, {
           method: 'POST',
           body: { producerId: viewingProducerId.value, orderId },
           headers: { 'Authorization': `Bearer ${auth.token}` }
       })
       
       // Eliminación optimista de la lista para UX fluida
       if (producerDeliveries.value) {
           const idx = producerDeliveries.value.findIndex(d => d.orderId === orderId)
           if (idx !== -1) producerDeliveries.value.splice(idx, 1)
           
           if (producerDeliveries.value.length === 0) {
               // Feedback visual de finalización
               error.value = '¡Todas las entregas recibidas!'
               setTimeout(() => { 
                    producerDeliveries.value = null 
                    error.value = ''
               }, 2000)
           }
       }
   } catch (e) {
       console.error(e)
       alert('Error al confirmar entrega')
   }
}

/**
 * Función principal de validación.
 * Maneja dos flujos dependiendo del contenido del QR:
 * A) Prefijo "PRODUCER:": Inicia flujo de recepción de mercancía (Inbound).
 * B) Token UUID estándar: Inicia flujo de entrega a consumidor (Outbound).
 */
const validatePickup = async () => {
    loading.value = true
    error.value = ''
    orderResult.value = null
    producerDeliveries.value = null // Resetear vista previa
    
    // --- FLUJO A: INBOUND (Recepción de Productor) ---
    if (qrToken.value.startsWith('PRODUCER:')) {
        const producerId = qrToken.value.split(':')[1]
        try {
            // Obtenemos lista de lo que debe entregar este productor
            const data = await $fetch(`${apiBase}/tenants/${tenantId}/market/producer-delivery/${producerId}`, {
                headers: { 
                    'Authorization': `Bearer ${auth.token}`,
                    'x-tenant-id': tenantId
                }
            })
            producerDeliveries.value = (data as any[]) || []
            viewingProducerId.value = producerId
            
            if (producerDeliveries.value.length === 0) {
                error.value = 'Este productor no tiene entregas pendientes.'
            }
        } catch (e) {
            console.error('Fetch producer deliveries error:', e)
            error.value = 'Error al obtener datos del productor.'
        } finally {
            loading.value = false
            qrToken.value = ''
        }
        return
    }

    // --- FLUJO B: OUTBOUND (Entrega a Consumidor) ---
    try {
        const { data, error: apiError } = await useFetch(`${apiBase}/tenants/${tenantId}/market/confirm-pickup`, {
            method: 'POST',
            body: { qrToken: qrToken.value },
            headers: { 
                'Authorization': `Bearer ${auth.token}`,
                'x-tenant-id': tenantId
            }
        })
        
        if (apiError.value) {
             throw new Error(apiError.value.message || 'Error al validar')
        }
        
        // Mostrar tarjeta de éxito con detalles del pedido
        orderResult.value = data.value
        qrToken.value = '' 
    } catch (e: any) {
        error.value = 'Token no válido o pedido ya entregado.'
        console.error("Pickup validation error:", e)
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
