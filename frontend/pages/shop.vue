<template>
  <ClientOnly>
    <div class="py-4">
      <div class="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-8">
        
        <!-- Main Content Area -->
        <div class="flex-grow">
          <header class="mb-8 overflow-hidden">
            <div class="flex justify-between items-end mb-8">
              <div>
                <h1 class="text-4xl font-serif font-bold text-white mb-1">El Puesto de la Huerta</h1>
                <p class="text-basil-green-light font-bold uppercase tracking-widest text-[10px]">Sin intermediarios • Calidad Artesanal</p>
              </div>
              <div class="text-right">
                  <span class="block text-[10px] text-white/40 uppercase tracking-widest font-bold">Fecha de Entrega</span>
                  <span class="font-serif font-bold text-xl text-basil-green-light">{{ targetDate }}</span>
              </div>
            </div>

            <!-- View Toggle -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-1">
               <div class="flex gap-4">
                  <button @click="view = 'products'" 
                          :class="view === 'products' ? 'text-white border-b-2 border-basil-green' : 'text-white/20'"
                          class="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                     🌿 Productos
                  </button>
                  <button @click="view = 'feed'" 
                          :class="view === 'feed' ? 'text-white border-b-2 border-basil-green' : 'text-white/20'"
                          class="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                     📸 Historias de la Huerta
                  </button>
               </div>

               <!-- Improved Search Bar -->
                <div v-if="view === 'products'" class="relative w-full sm:w-64 mb-2 sm:mb-0">
                  <input 
                    v-model="searchQuery" 
                    type="text" 
                    placeholder="BUSCAR PRODUCTO..." 
                    class="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-4 pl-10 text-[10px] font-bold tracking-widest text-white placeholder:text-white/60 focus:outline-none focus:border-basil-green/50 transition-all uppercase"
                  />
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
               </div>
            </div>
          </header>

          <!-- Content Switch -->
          <div v-if="view === 'products'">
            <div v-if="loading" class="text-center py-20">
              <div class="animate-pulse flex flex-col items-center gap-4">
                 <div class="w-12 h-12 rounded-full bg-basil-green/20"></div>
                 <p class="text-white/40 text-[10px] font-bold uppercase tracking-widest">Preparando el puesto...</p>
              </div>
            </div>

            <div v-else-if="!filteredProducts || filteredProducts.length === 0" class="bg-white/5 backdrop-blur-xl p-16 rounded-[2.5rem] border border-white/5 text-center">
                <div class="text-6xl mb-6 filter drop-shadow-2xl">🧺</div>
                <h3 class="text-2xl font-serif font-bold text-white mb-3">{{ searchQuery ? 'No hay coincidencias' : 'Puesto Cerrado' }}</h3>
                <p class="text-white/40 italic">{{ searchQuery ? 'Prueba con otro término de búsqueda.' : 'Aún estamos recolectando la cosecha de esta semana.' }}</p>
                <p v-if="!searchQuery" class="text-sm text-basil-green-light mt-6 font-bold uppercase tracking-widest">¡Vuelve pronto para ver los productos frescos!</p>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <BentoCard v-for="product in filteredProducts" :key="product.id" :no-padding="true" class="group">
                    <div class="h-44 bg-basil-green/5 flex items-center justify-center relative overflow-hidden">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span v-if="product.marketState.totalAvailableKg == 0 && product.marketState.totalAvailableUnits == 0" 
                              class="absolute inset-x-0 bottom-4 text-center font-serif font-bold text-tomato-red uppercase tracking-widest text-xs z-10">
                              Agotado
                        </span>
                        
                        <div v-if="product.marketState.offerPhotos && product.marketState.offerPhotos.length > 0" class="absolute inset-0">
                           <img :src="product.marketState.offerPhotos[0].startsWith('http') ? product.marketState.offerPhotos[0] : apiBase + product.marketState.offerPhotos[0]" :alt="product.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           <div class="absolute inset-0 bg-black/10"></div>
                        </div>
                        <div v-else-if="product.imageUrl" class="absolute inset-0">
                           <img :src="product.imageUrl" :alt="product.name" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                           <div class="absolute inset-0 bg-black/5"></div>
                        </div>
                        <div v-else class="text-7xl drop-shadow-sm transition-transform duration-500 group-hover:scale-110">
                           {{ getEmoji(product.name) }}
                        </div>
                    </div>

                    <div class="p-5">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="text-xl font-serif font-bold text-white/90 leading-tight">{{ product.name }}</h3>
                            <div class="text-right text-basil-green-light font-black">
                               <span class="text-2xl">{{ product.estimatedPricePerUnit || product.pricePerKg || product.pricePerBunch || '2.50' }}</span>
                               <span class="text-xs ml-0.5">€</span>
                               <span v-if="product.unitType === 'weight_variable' || product.unitType === 'bunch'" class="text-[8px] block -mt-1 opacity-60 uppercase">Estimado/Ud</span>
                            </div>
                        </div>
                        
                        <p class="text-xs text-white/70 mb-3 line-clamp-2 h-8 leading-relaxed italic">{{ product.unitDescription || 'Recién cosechado de forma artesanal.' }}</p>
                        
                        <!-- Producer Attribution -->
                        <div v-if="product.primaryProducer" class="flex items-center gap-2 mb-4 group/producer cursor-pointer">
                           <div class="w-6 h-6 rounded-full bg-basil-green/20 flex items-center justify-center text-[10px] border border-basil-green/30">👨‍🌾</div>
                           <p class="text-[10px] font-bold text-white/50 tracking-wide">
                              Cosechado por <span class="text-basil-green group-hover/producer:text-basil-green-light transition-colors">{{ product.primaryProducer.name }}</span>
                           </p>
                        </div>
                        
                        <!-- Weight Warning -->
                        <div v-if="product.unitType === 'weight_variable'" class="mb-4 bg-basil-green/10 border border-basil-green/20 p-2 rounded-lg flex items-start gap-2">
                            <svg class="w-4 h-4 text-basil-green-dark mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p class="text-[10px] text-basil-green-dark leading-tight italic font-medium">
                              Precio estimado. El importe final se ajustará al peso real tras la cosecha.
                            </p>
                        </div>

                         <div class="flex flex-col gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 group-hover:bg-white/[0.07] transition-all">
                             <div class="flex justify-between items-center px-1">
                                 <div class="flex flex-col">
                                    <span class="text-[10px] font-bold text-basil-green-light uppercase tracking-widest">
                                      {{ product.unitType === 'bunch' ? formatQty(product.marketState.totalAvailableUnits) + ' Uds' : formatQty(product.marketState.totalAvailableKg) + ' Kg' }} disponible
                                    </span>
                                    <button @click="openProduct(product)" class="text-[9px] font-black text-white/40 hover:text-basil-green uppercase tracking-widest mt-1 mr-auto flex items-center gap-1 transition-colors">
                                       ⭐ Ver Valoraciones
                                    </button>
                                 </div>
                                 <div class="text-right">
                                    <!-- Optional: specific per-item price or total if chosen -->
                                 </div>
                             </div>
                             
                             <div class="flex items-center justify-between bg-black/40 rounded-2xl p-1 gap-1 border border-white/5 shadow-inner shadow-black/60">
                                  <button @click="cartStore.updateQty(product, -1)" 
                                          class="w-12 h-12 rounded-[14px] bg-white/5 flex items-center justify-center hover:bg-tomato-red/80 hover:text-white font-bold text-white/40 transition-all active:scale-90">
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" /></svg>
                                  </button>
                                  
                                  <div class="flex flex-col items-center flex-1">
                                     <span class="font-serif font-black text-white text-2xl leading-none">{{ cartStore.getQty(product.id) }}</span>
                                     <span class="text-[8px] font-black text-basil-green-light/70 uppercase tracking-[0.2em] mt-1.5">
                                       {{ product.unitType === 'bunch' || product.unitType === 'unit' ? 'Unidades' : 'Kilogramos' }}
                                     </span>
                                  </div>

                                  <button @click="cartStore.updateQty(product, 1)" 
                                          :disabled="cartStore.getQty(product.id) >= (product.unitType === 'bunch' ? product.marketState.totalAvailableUnits : (product.unitType === 'unit' ? product.marketState.totalAvailableUnits : product.marketState.totalAvailableKg))"
                                          class="w-12 h-12 rounded-[14px] bg-basil-green text-moss-green-dark flex items-center justify-center hover:bg-basil-green-light font-black shadow-[0_4px_20px_rgba(124,173,88,0.25)] disabled:opacity-20 transition-all hover:scale-105 active:scale-90">
                                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M12 4v16m8-8H4" /></svg>
                                  </button>
                             </div>
                         </div>
                    </div>
                </BentoCard>
            </div>
          </div>

          <div v-else-if="view === 'feed'">
             <SocialFeed />
          </div>
        </div>

        <!-- Cart Sidebar -->
        <div v-if="view === 'products'" class="w-full lg:w-80 h-fit sticky lg:top-24 mb-12 lg:mb-0">
            <BentoCard title="🛒 Tu Cesta">
                <template #header-action>
                  <span v-if="cartStore.totalItems > 0" class="bg-basil-green text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{{ cartStore.totalItems }}</span>
                </template>
                
                <div v-if="cartStore.items.length === 0" class="text-center py-16">
                    <div class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 opacity-20 text-3xl">🧺</div>
                    <p class="text-white/20 italic text-sm">Cesta vacía.</p>
                </div>
                
                <div v-else>
                    <ul class="space-y-5 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                        <li v-for="item in cartStore.items" :key="item.productId" class="flex justify-between items-start text-sm group p-3 rounded-2xl hover:bg-white/5 transition-all">
                            <div class="max-w-[160px]">
                                <p class="font-bold text-white/90 leading-tight">{{ item.name }}</p>
                                <p class="text-basil-green-light text-[10px] uppercase font-bold tracking-widest mt-1">{{ item.qty }} x {{ item.price }} €</p>
                            </div>
                            <span class="font-serif font-bold text-white text-lg">{{ (item.qty * item.price).toFixed(2) }}€</span>
                        </li>
                    </ul>
                    
                    <div class="border-t border-white/5 pt-6 mb-8">
                        <div class="flex justify-between items-center">
                            <span class="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em]">Total Estimado</span>
                            <span class="text-3xl font-serif font-bold text-white">{{ cartStore.totalPrice.toFixed(2) }}€</span>
                        </div>
                    </div>
                    
                    <button @click="checkout" :disabled="submitting || cartStore.totalItems === 0"
                        class="w-full py-4 bg-pumpkin-orange text-white rounded-2xl font-bold hover:bg-pumpkin-orange-hover disabled:opacity-50 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm uppercase tracking-widest">
                        {{ submitting ? 'Procesando...' : 'Confirmar Pedido' }}
                    </button>

                    <p class="mt-4 text-[9px] text-center text-white/20 font-bold uppercase tracking-[0.1em]">
                      Compromiso de recogida directa en el Agora el día {{ targetDate }}.
                    </p>
                </div>
            </BentoCard>
        </div>
      </div>

      <!-- Product Details Overlay -->
      <div v-if="selectedProduct" class="fixed inset-0 z-50 flex items-center justify-end p-4">
         <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="selectedProduct = null"></div>
          <div class="bg-forest-dark-card border-l border-white/10 w-full max-w-lg h-full rounded-[2.5rem] relative z-10 shadow-2xl overflow-hidden flex flex-col">
            <div class="h-64 bg-basil-green/5 flex items-center justify-center relative overflow-hidden">
               <div v-if="selectedProduct.marketState?.offerPhotos && selectedProduct.marketState.offerPhotos.length > 0" class="absolute inset-0">
                  <img :src="selectedProduct.marketState.offerPhotos[0].startsWith('http') ? selectedProduct.marketState.offerPhotos[0] : apiBase + selectedProduct.marketState.offerPhotos[0]" :alt="selectedProduct.name" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/20"></div>
               </div>
               <div v-else-if="selectedProduct.imageUrl" class="absolute inset-0">
                  <img :src="selectedProduct.imageUrl" :alt="selectedProduct.name" class="w-full h-full object-cover" />
                  <div class="absolute inset-0 bg-black/20"></div>
               </div>
               <div v-else class="text-[120px] filter drop-shadow-2xl">
                  {{ getEmoji(selectedProduct.name) }}
               </div>
               <button @click="selectedProduct = null" class="absolute top-8 right-8 w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-black/60 transition-all z-20">✕</button>
            </div>

            <div class="p-8 flex-grow overflow-y-auto custom-scrollbar">
               <div class="flex justify-between items-start mb-6">
                  <div>
                     <h2 class="text-4xl font-serif font-bold text-white mb-2">{{ selectedProduct.name }}</h2>
                     <p class="text-basil-green-light font-bold uppercase tracking-[0.2em] text-[10px]">Origen Directo • Producción Artesanal</p>
                  </div>
                  <div class="text-3xl font-serif font-bold text-basil-green-light">
                     {{ selectedProduct.estimatedPricePerUnit || selectedProduct.pricePerKg }}€
                  </div>
               </div>

               <p class="text-white/60 leading-relaxed italic mb-10">{{ selectedProduct.unitDescription }}</p>

               <!-- Reviews Section -->
               <div class="space-y-6">
                  <h3 class="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Valoraciones de la Comunidad</h3>
                  
                  <div v-if="loadingReviews" class="py-10 text-center">
                     <div class="animate-spin h-6 w-6 border-b-2 border-basil-green mx-auto"></div>
                  </div>

                  <div v-else-if="reviews.length === 0" class="p-8 bg-white/5 rounded-3xl text-center border border-dashed border-white/10">
                     <p class="text-white/30 italic text-sm">Aún no hay valoraciones para este producto. ¡Sé el primero en probarlo!</p>
                  </div>

                  <div v-else class="space-y-4">
                     <div v-for="r in reviews" :key="r.id" class="p-6 bg-white/5 rounded-3xl border border-white/5">
                        <div class="flex justify-between items-center mb-3">
                           <span class="text-basil-green text-lg">
                              {{ '★'.repeat(r.rating) }}{{ '☆'.repeat(5 - r.rating) }}
                           </span>
                           <span class="text-[8px] text-white/20 font-bold uppercase tracking-widest">{{ r.consumer.name }}</span>
                        </div>
                        <p class="text-sm text-white/80 leading-relaxed font-medium">"{{ r.comment }}"</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'
import SocialFeed from '~/components/SocialFeed.vue'

const auth = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const loading = ref(true)
const submitting = ref(false)
const products = ref<any[]>([])
const searchQuery = ref('')
const view = ref('products')

const filteredProducts = computed(() => {
  if (!products.value) return []
  const q = searchQuery.value?.toLowerCase() || ''
  const filtered = products.value.filter(p => !q || p.name?.toLowerCase().includes(q))
  
  const seenNames = new Set()
  return filtered.filter(p => {
    if (!p.name) return false
    const nameKey = p.name.trim().toLowerCase()
    if (seenNames.has(nameKey)) return false
    seenNames.add(nameKey)
    return true
  })
})

const selectedProduct = ref<any>(null)
const reviews = ref<any[]>([])
const loadingReviews = ref(false)

// Emoji Helper
const getEmoji = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('miel')) return '🍯'
  if (n.includes('miel') && n.includes('silvestre')) return '🐝'
  if (n.includes('broccoli') || n.includes('brócoli')) return '🥦'
  if (n.includes('carrot') || n.includes('zanahoria')) return '🥕'
  if (n.includes('tomato') || n.includes('tomate')) return '🍅'
  if (n.includes('berenjena')) return '🍆'
  if (n.includes('calabacín')) return '🥒'
  if (n.includes('pimiento')) return '🫑'
  if (n.includes('coliflor')) return '💮'
  if (n.includes('espárrago')) return '🎋'
  if (n.includes('judía')) return '🫘'
  if (n.includes('patata')) return '🥔'
  if (n.includes('batata')) return '🍠'
  if (n.includes('cebolla')) return '🧅'
  if (n.includes('ajo')) return '🧄'
  if (n.includes('acelga') || n.includes('espinaca') || n.includes('kale') || n.includes('rúcula')) return '🥬'
  if (n.includes('puerro')) return '🎋'
  if (n.includes('chirivía')) return '🥕' // Looks similar
  if (n.includes('rábano')) return '🎈'
  return '🥗'
}

const formatQty = (val: any) => {
    if (val === null || val === undefined) return '0'
    const n = Number(val)
    if (isNaN(n)) return '0'
    // If it is an integer, return it as is. If it has decimals, show up to 1.
    return Number.isInteger(n) ? n.toString() : n.toFixed(1)
}

// Date Logic
const targetDate = computed(() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  
  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const date = String(monday.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
})

const cartStore = useCartStore()

// Initial Load
onMounted(async () => {
    await fetchMarket()
})

const fetchMarket = async () => {
    loading.value = true
    try {
        const url = `${apiBase}/tenants/${tenantId}/market/products?week=${targetDate.value}`
        const data = await $fetch(url, {
            headers: { 'x-tenant-id': tenantId }
        })
        products.value = data as any[]
    } catch (e) {
        console.error('Fetch error:', e)
    } finally {
        loading.value = false
    }
}

// Checkout
const checkout = async () => {
    submitting.value = true
    try {
        const payload = {
            week: targetDate.value,
            items: cartStore.items.map(item => ({
                productId: item.productId,
                quantityKg: item.unitType !== 'bunch' && item.unitType !== 'unit' ? item.qty : undefined,
                units: (item.unitType === 'bunch' || item.unitType === 'unit') ? item.qty : undefined
            }))
        }
        
        await $fetch(`${apiBase}/tenants/${tenantId}/market/orders`, {
            method: 'POST',
            body: payload,
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
        
        alert('¡Pedido realizado con éxito! 🥦')
        cartStore.clear()
    } catch (e: any) {
        alert('Error al realizar el pedido: ' + (e.data?.message || e.message))
        console.error(e)
    } finally {
        submitting.value = false
    }
}

const openProduct = async (product: any) => {
    selectedProduct.value = product
    loadingReviews.value = true
    try {
        const data = await $fetch(`${apiBase}/tenants/${tenantId}/reviews/product/${product.id}`)
        reviews.value = (data as any[]) || []
    } catch (e) {
        console.error('Fetch reviews error:', e)
    } finally {
        loadingReviews.value = false
    }
}
</script>
