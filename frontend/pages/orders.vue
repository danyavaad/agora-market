<!--
  * File: orders.vue
  * Purpose: Historial y gestión de pedidos para el consumidor.
  * Design: Vista de tarjetas Bento que muestra los pedidos activos, códigos QR de recogida y permite la edición/cancelación.
  * Dependencies: BentoCard, useAuth
  * Domain: Pedidos / Consumidor
-->
<template>
  <div class="py-12 max-w-4xl mx-auto px-4">
    <header class="mb-12">
      <h1 class="text-4xl font-serif font-bold text-white mb-2">Mis Pedidos</h1>
      <p class="text-basil-green-light font-bold uppercase tracking-widest text-[10px]">Historial • Reservas de Cosecha</p>
    </header>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-basil-green"></div>
    </div>

    <div v-else-if="visibleOrders.length === 0" class="bg-white/5 backdrop-blur-xl p-16 rounded-[2.5rem] border border-white/5 text-center">
      <div class="text-6xl mb-6 filter drop-shadow-2xl">🧺</div>
      <h3 class="text-xl font-serif font-bold text-white mb-3">Aún no tienes pedidos</h3>
      <p class="text-white/40 mb-8 italic">Pásate por el mercado para ver la cosecha de esta semana.</p>
      <NuxtLink to="/shop" class="inline-block px-10 py-4 bg-basil-green text-moss-green-dark font-black rounded-2xl hover:bg-basil-green-light transition shadow-xl uppercase tracking-widest text-xs">
        Ir al Mercado
      </NuxtLink>
    </div>

    <div v-else class="space-y-6">
      <BentoCard v-for="order in visibleOrders" :key="order.id" class="overflow-hidden">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Order Info -->
          <div class="flex-grow">
            <div class="flex justify-between items-start mb-4">
              <div>
                <div class="flex items-center gap-3 mb-1">
                   <span class="text-[10px] font-bold text-basil-green-light uppercase tracking-widest">Semana de Entrega</span>
                   <div class="flex items-center gap-1 text-[9px] font-black text-white/60 bg-white/10 px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-tighter">
                      <svg class="w-2.5 h-2.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      ID: {{ order.id.substring(0,8) }}
                   </div>
                </div>
                <h3 class="text-2xl font-serif font-bold text-white">{{ formatDate(order.week) }}</h3>
              </div>
              <div class="flex items-center gap-2">
                <div :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {{ order.status }}
                </div>
                <button v-if="order.status === 'pending'" 
                        @click="editOrder(order)"
                        class="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-basil-green/20 border border-white/10 hover:border-basil-green/30 rounded-full text-[10px] font-bold text-white/60 hover:text-basil-green transition-all uppercase tracking-widest">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Editar
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-8">
              <div class="bg-white/5 p-4 rounded-2xl border border-white/10">
                <span class="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">
                  {{ order.totalFinal ? 'Total Real' : 'Total Estimado' }}
                </span>
                <div class="flex items-end gap-2">
                  <span class="text-2xl font-serif font-bold text-white">{{ order.totalFinal || order.totalEstimated }}€</span>
                  <span v-if="order.totalFinal && order.totalFinal !== order.totalEstimated" 
                        class="text-[8px] bg-basil-green text-moss-green-dark px-1.5 py-0.5 rounded-md font-black uppercase mb-1">
                    Ajustado
                  </span>
                </div>
              </div>
              <div class="bg-basil-green/10 p-4 rounded-2xl border border-basil-green/20">
                <span class="text-[10px] font-bold text-basil-green-light uppercase tracking-widest block mb-1">Tu Balda (Bin)</span>
                <span class="text-xl font-serif font-bold text-basil-green-light">#{{ order.binNumber || '---' }}</span>
              </div>
            </div>

            <div class="space-y-3">
              <h4 class="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Resumen de Cosecha</h4>
              <ul class="text-sm text-white/80 space-y-2">
                <li v-for="item in order.items" :key="item.id" class="flex justify-between items-center bg-white/5 p-2 px-3 rounded-xl border border-white/5">
                  <div class="flex items-center gap-3">
                    <span class="font-bold text-white/90">{{ item.product.name }}</span>
                    <div class="flex items-center gap-2">
                      <button v-if="order.status === 'delivered' && !item.review" 
                              @click="openReview(item)"
                              class="text-[9px] font-black text-basil-green hover:underline uppercase tracking-widest">
                         ⭐ Valorar
                      </button>
                      <span v-else-if="item.review" class="text-[9px] text-white/20 font-bold uppercase tracking-widest">Ya valorado</span>
                      
                      <!-- Contact Producer -->
                      <NuxtLink :to="`/chat?with=${item.assignedToProducerId}`" 
                                class="p-1.5 bg-white/5 hover:bg-basil-green/20 rounded-lg text-white/40 hover:text-basil-green transition-all group"
                                :title="`Contactar al productor ${item.assignedProducer?.name || ''}`">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                      </NuxtLink>
                    </div>
                  </div>
                  <span class="font-black text-basil-green-light">{{ item.estimatedUnits ? item.estimatedUnits + ' uds' : item.estimatedQuantityKg + ' kg' }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Pickup QR -->
          <div v-if="order.status === 'pending' || order.status === 'confirmed'" 
               class="md:w-52 flex flex-col items-center justify-center bg-white/95 p-6 rounded-[2rem] shadow-2xl scale-95 hover:scale-100 transition-all">
            <template v-if="order.status === 'pending'">
               <button @click="cancelOrder(order.id)" 
                       class="mb-5 flex items-center gap-2 text-[10px] font-black text-tomato-red hover:text-white hover:bg-tomato-red bg-tomato-red/10 uppercase tracking-widest border border-tomato-red/30 px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-90">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Cancelar Pedido
               </button>
            </template>
            <template v-if="order.pickupQrToken">
              <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.pickupQrToken}`" 
                   alt="Pickup QR Code" 
                   class="w-36 h-36 mb-4 filter contrast-125">
              <p class="text-[9px] text-center text-moss-green-dark font-black uppercase tracking-[0.2em] leading-tight">
                Código de Recogida<br>Agora Caceres
              </p>
            </template>
            <div v-else class="text-center py-8">
              <p class="text-[10px] italic text-moss-green-dark/40 font-bold">Generando código...</p>
            </div>
          </div>
        </div>
      </BentoCard>
    </div>

    <!-- Edit Order Modal -->
    <div v-if="editingOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="editingOrder = null"></div>
       <div class="bg-forest-dark-card border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-8 relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-2xl font-serif font-bold text-white mb-2">Editar Pedido</h3>
              <p class="text-white/40 text-xs italic">Modifica las cantidades o añade nuevos productos.</p>
            </div>
            <button @click="editingOrder = null" class="text-white/40 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex gap-4 mb-8 border-b border-white/5">
             <button @click="editTab = 'items'" 
                     :class="editTab === 'items' ? 'text-basil-green border-b-2 border-basil-green' : 'text-white/20'"
                     class="pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all">
                Tus Productos ({{ editingOrder.items.length }})
             </button>
             <button @click="editTab = 'add'" 
                     :class="editTab === 'add' ? 'text-basil-green border-b-2 border-basil-green' : 'text-white/20'"
                     class="pb-4 px-2 text-[10px] font-black uppercase tracking-widest transition-all">
                Añadir Más 🌿
             </button>
          </div>
          
          <!-- Items List -->
          <div v-if="editTab === 'items'" class="space-y-4 mb-8">
             <div v-for="item in editingOrder.items" :key="item.id" class="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div class="w-12 h-12 rounded-xl bg-basil-green/10 flex items-center justify-center text-2xl">
                    {{ getEmoji(item.product.name) }}
                </div>
                <div class="flex-grow">
                    <p class="font-bold text-white text-sm">{{ item.product.name }}</p>
                    <p class="text-[10px] font-black text-white/40 uppercase tracking-widest">
                        {{ item.product.unitType === 'bunch' || item.product.unitType === 'unit' ? 'Unidades' : 'Kilogramos' }}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <button @click="updateItemQty(item, -1)" 
                            class="w-8 h-8 rounded-lg bg-white/5 hover:bg-tomato-red/80 flex items-center justify-center text-white/60 hover:text-white transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" /></svg>
                    </button>
                    <span class="font-serif font-bold text-white text-xl w-12 text-center">{{ getItemQty(item) }}</span>
                    <button @click="updateItemQty(item, 1)" 
                            class="w-8 h-8 rounded-lg bg-basil-green hover:bg-basil-green-light flex items-center justify-center text-moss-green-dark transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
                    </button>
                </div>
             </div>
          </div>

          <!-- Add More List -->
          <div v-if="editTab === 'add'" class="space-y-4 mb-8">
              <div class="relative mb-6">
                 <input v-model="marketSearch" 
                        type="text" 
                        placeholder="BUSCAR PRODUCTO..." 
                        class="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-10 text-xs font-bold tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-basil-green/30 transition-all uppercase" />
                 <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>

              <div class="grid grid-cols-1 gap-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div v-for="product in availableProducts" :key="product.id" class="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/10 hover:border-basil-green/30 transition-all group">
                     <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                            {{ getEmoji(product.name) }}
                        </div>
                        <div>
                            <p class="font-bold text-white text-xs">{{ product.name }}</p>
                            <p class="text-[9px] text-basil-green-light font-black uppercase tracking-widest">
                                {{ product.estimatedPricePerUnit || product.pricePerKg }}€
                            </p>
                        </div>
                     </div>
                     <button @click="addProductToOrder(product)" 
                             class="px-4 py-2 bg-basil-green/10 hover:bg-basil-green text-basil-green hover:text-moss-green-dark rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">
                        Añadir
                     </button>
                  </div>
                  <div v-if="availableProducts.length === 0" class="py-10 text-center opacity-40">
                      <p class="text-xs italic">No hay más productos disponibles para esta semana.</p>
                  </div>
              </div>
          </div>

          <div class="flex gap-4">
            <button @click="editingOrder = null" 
                    class="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm transition-all">
               Cancelar
            </button>
            <button @click="saveOrderChanges" 
                    :disabled="savingOrder"
                    class="flex-1 py-3 bg-basil-green hover:bg-basil-green-light text-moss-green-dark rounded-xl font-bold text-sm transition-all disabled:opacity-50">
               {{ savingOrder ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
       </div>
    </div>

    <!-- Review Modal -->
    <div v-if="reviewingItem" class="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="reviewingItem = null"></div>
       <div class="bg-forest-dark-card border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 relative z-10 shadow-2xl">
          <h3 class="text-2xl font-serif font-bold text-white mb-2">Valorar {{ reviewingItem.product.name }}</h3>
          <p class="text-white/40 text-xs italic mb-8">Tu opinión ayuda al productor y a la comunidad.</p>
          
          <div class="space-y-6">
             <div>
                <label class="block text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Valoración</label>
                <div class="flex gap-2">
                   <button v-for="star in 5" :key="star" 
                           @click="reviewForm.rating = star"
                           :class="reviewForm.rating >= star ? 'text-basil-green' : 'text-white/10'"
                           class="text-3xl transition-all hover:scale-110">
                      ★
                   </button>
                </div>
             </div>
             <div>
                <label class="block text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3">Tu Comentario</label>
                <textarea v-model="reviewForm.comment" 
                          rows="4"
                          placeholder="¿Qué te ha parecido la calidad?"
                          class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-white focus:ring-2 focus:ring-basil-green/20"></textarea>
             </div>
             <button @click="submitReview" 
                     class="w-full py-4 bg-basil-green text-moss-green-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-basil-green-light transition-all shadow-xl">
                Enviar Valoración
             </button>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const auth = useAuth()
const toast = useToast()

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || '/api'
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const loading = ref(true)
const orders = ref<any[]>([])
const visibleOrders = computed(() => orders.value.filter(o => o.status !== 'cancelled'))
const reviewingItem = ref<any>(null)
const reviewForm = ref({ rating: 5, comment: '' })
const editingOrder = ref<any>(null)
const savingOrder = ref(false)
const editedQuantities = ref<Record<string, number>>({})
const editTab = ref('items') // 'items' | 'add'
const marketSearch = ref('')
const marketProducts = ref<any[]>([])

// Emoji Helper
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

const formatDate = (dateString: string) => {
  const d = new Date(dateString)
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-pumpkin-orange/10 text-pumpkin-orange'
    case 'confirmed': return 'bg-basil-green/10 text-basil-green'
    case 'delivered': return 'bg-basil-green text-moss-green-dark shadow-lg shadow-basil-green/20'
    default: return 'bg-gray-100/10 text-white/20'
  }
}

const editOrder = async (order: any) => {
    editingOrder.value = JSON.parse(JSON.stringify(order)) // Deep clone
    editedQuantities.value = {}
    editTab.value = 'items'
    
    // Initialize quantities
    order.items.forEach((item: any) => {
        editedQuantities.value[item.id] = item.estimatedUnits || item.estimatedQuantityKg || 0
    })

    // Fetch market products for this week
    try {
        const url = `${apiBase}/tenants/${tenantId}/market/products?week=${order.week}`
        const data = await $fetch(url, {
            headers: { 'x-tenant-id': tenantId }
        })
        marketProducts.value = data as any[]
    } catch (e) {
        console.error('Fetch market error:', e)
    }
}

const availableProducts = computed(() => {
    if (!marketProducts.value) return []
    // Filter out products already in the order
    const existingProductIds = new Set(editingOrder.value?.items.map((i: any) => i.productId) || [])
    const q = marketSearch.value.toLowerCase()
    return marketProducts.value.filter(p => 
        !existingProductIds.has(p.id) && 
        (!q || p.name.toLowerCase().includes(q))
    )
})

const addProductToOrder = (product: any) => {
    if (!editingOrder.value) return
    
    // Create a temporary item structure
    const newItem = {
        id: `temp-${Date.now()}`,
        productId: product.id,
        product: {
            name: product.name,
            unitType: product.unitType
        },
        estimatedUnits: product.unitType === 'bunch' || product.unitType === 'unit' ? 1 : 0,
        estimatedQuantityKg: product.unitType !== 'bunch' && product.unitType !== 'unit' ? 1 : 0
    }
    
    editingOrder.value.items.push(newItem)
    editedQuantities.value[newItem.id] = 1
    editTab.value = 'items' // Go back to items to see it
    toast.success(`${product.name} añadido al pedido`)
}

const getItemQty = (item: any) => {
    return editedQuantities.value[item.id] || item.estimatedUnits || item.estimatedQuantityKg || 0
}

const updateItemQty = (item: any, delta: number) => {
    const current = editedQuantities.value[item.id] || item.estimatedUnits || item.estimatedQuantityKg || 0
    const newQty = Math.max(0, current + delta)
    editedQuantities.value[item.id] = newQty
}

const saveOrderChanges = async () => {
    if (!editingOrder.value) return
    savingOrder.value = true
    
    try {
        // Cancel old order
        await $fetch(`${apiBase}/tenants/${tenantId}/market/orders/${editingOrder.value.id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${auth.token}`,
                'x-tenant-id': tenantId
            }
        })
        
        // Create new order with updated quantities
        const items = editingOrder.value.items
            .filter((item: any) => editedQuantities.value[item.id] > 0)
            .map((item: any) => ({
                productId: item.productId,
                quantityKg: item.product.unitType !== 'bunch' && item.product.unitType !== 'unit' ? editedQuantities.value[item.id] : undefined,
                units: (item.product.unitType === 'bunch' || item.product.unitType === 'unit') ? editedQuantities.value[item.id] : undefined
            }))
        
        if (items.length > 0) {
            await $fetch(`${apiBase}/tenants/${tenantId}/market/orders`, {
                method: 'POST',
                body: {
                    week: editingOrder.value.week,
                    items
                },
                headers: { 
                    'Authorization': `Bearer ${auth.token}`,
                    'x-tenant-id': tenantId
                }
            })
            toast.success('Pedido actualizado con éxito 🌿')
        } else {
            toast.success('Pedido eliminado (sin productos) 🗑️')
        }
        
        editingOrder.value = null
        await fetchOrders()
    } catch (e: any) {
        toast.error('Error al actualizar el pedido: ' + (e.data?.message || e.message))
        console.error(e)
    } finally {
        savingOrder.value = false
    }
}

onMounted(async () => {
    await fetchOrders()
})

const fetchOrders = async () => {
    loading.value = true
    try {
        const { data, error } = await useFetch(`${apiBase}/tenants/${tenantId}/market/my-orders`, {
            headers: { 
              'Authorization': `Bearer ${auth.token}`,
              'x-tenant-id': tenantId
            }
        })
        if (error.value) throw new Error(error.value.message)
        orders.value = (data.value as any) || []
    } catch (e) {
        console.error('Fetch orders error:', e)
    } finally {
        loading.value = false
    }
}

const openReview = (item: any) => {
    reviewingItem.value = item
    reviewForm.value = { rating: 5, comment: '' }
}

const submitReview = async () => {
    if (!reviewingItem.value) return
    try {
        const { error } = await useFetch(`${apiBase}/tenants/${tenantId}/reviews`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${auth.token}`,
                'x-tenant-id': tenantId
            },
            body: {
                productId: reviewingItem.value.productId,
                producerId: reviewingItem.value.assignedToProducerId,
                orderItemId: reviewingItem.value.id,
                rating: reviewForm.value.rating,
                comment: reviewForm.value.comment
            }
        })
        if (error.value) throw new Error(error.value.message)
        
        toast.success('¡Gracias por tu valoración! 🌿')
        reviewingItem.value = null
        await fetchOrders() // Refresh to hide review button if added logic
    } catch (e) {
        toast.error('Error al enviar la valoración')
    }
}
const cancelOrder = (id: string) => {
    toast.confirm({
        title: '¿Cancelar Pedido?',
        message: 'Se devolverá el stock al productor y no podrás deshacer esta acción.',
        actionLabel: 'Sí, Cancelar',
        onAction: async () => {
            try {
                await $fetch(`${apiBase}/tenants/${tenantId}/market/orders/${id}`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `Bearer ${auth.token}`,
                        'x-tenant-id': tenantId
                    }
                })
                toast.success('Pedido cancelado con éxito 🗑️', '¡Todo listo!')
                await fetchOrders()
            } catch (e: any) {
                console.error('Cancel order error:', e)
                toast.error('Error al cancelar el pedido: ' + (e.data?.message || 'Error desconocido'), 'Vaya...')
            }
        }
    })
}
</script>
