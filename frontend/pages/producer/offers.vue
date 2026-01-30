<template>
  <div class="py-8 max-w-5xl mx-auto px-4">
    <!-- Header -->
    <header class="mb-10">
      <div class="flex items-center gap-2 text-basil-green-light text-xs font-bold uppercase tracking-widest mb-2">
        <NuxtLink to="/producer" class="hover:underline">Panel</NuxtLink>
        <span>/</span>
        <span class="text-white/40">Mi Puesto</span>
      </div>
      <h1 class="text-4xl font-serif font-bold text-white">Gestión del Puesto</h1>
      <p class="text-white/40">Indica qué productos pondrás en el puesto para la semana del <strong class="text-basil-green-light">{{ targetDate }}</strong>.</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Catalogue Selection -->
      <div class="lg:col-span-2 space-y-6">
        <BentoCard title="Catálogo de Productos">
          <!-- Search Bar for Catalogue -->
          <div class="mb-6 relative">
             <input 
               v-model="catalogueSearchQuery" 
               type="text" 
               placeholder="BUSCAR EN CATÁLOGO..." 
               class="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 pl-10 text-[10px] font-bold tracking-widest text-white placeholder:text-white/60 focus:outline-none focus:border-basil-green/50 transition-all uppercase"
             />
             <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
             </svg>
          </div>

          <div v-if="loadingProducts" class="flex justify-center py-10">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-basil-green"></div>
          </div>
          <div v-else-if="filteredCatalogue.length === 0" class="text-center py-10 text-white/20 italic text-sm">
            No se encontraron productos coincidentes.
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="product in filteredCatalogue" :key="product.id" 
                 @click="selectProduct(product)"
                 class="p-5 rounded-3xl border transition-all cursor-pointer group flex items-center justify-between"
                 :class="isProductSelected(product.id) ? 'border-basil-green bg-basil-green/10 shadow-[0_0_20px_rgba(124,173,88,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl overflow-hidden bg-basil-green/5 flex items-center justify-center">
                   <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name" class="w-full h-full object-cover" />
                   <span v-else class="text-2xl grayscale group-hover:grayscale-0 transition-all filter drop-shadow-md">{{ getEmoji(product.name) }}</span>
                </div>
                <div>
                  <p class="font-bold text-white/90 group-hover:text-white">{{ product.name }}</p>
                  <p class="text-[10px] text-basil-green-light uppercase font-bold tracking-widest mt-0.5">Precio: {{ product.pricePerKg || product.pricePerBunch }}€ / {{ product.unitType === 'bunch' ? 'Ud' : 'Kg' }}</p>
                </div>
              </div>
              <div v-if="isProductSelected(product.id)" class="text-basil-green-light">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
              </div>
            </div>
          </div>
        </BentoCard>

        <!-- Current Offers List -->
        <BentoCard title="Productos en tu Puesto">
           <div v-if="loadingOffers" class="flex justify-center py-6">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-basil-green"></div>
          </div>
          <div v-else-if="myOffers.length === 0" class="text-center py-10 text-white/20 italic text-sm">
            No has puesto productos para esta semana todavía.
          </div>
          <div v-else class="space-y-3">
             <div v-for="offer in myOffers" :key="offer.id" class="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                <div class="flex items-center gap-4">
                   <div class="w-10 h-10 rounded-xl overflow-hidden bg-basil-green/5 flex items-center justify-center">
                      <img v-if="offer.product.imageUrl" :src="offer.product.imageUrl" :alt="offer.product.name" class="w-full h-full object-cover" />
                      <span v-else class="text-xl">{{ getEmoji(offer.product.name) }}</span>
                   </div>
                   <span class="font-bold text-base text-white/90">{{ offer.product.name }}</span>
                </div>
                <div class="flex items-center gap-6">
                   <span class="text-sm font-bold text-basil-green-light bg-basil-green/10 px-3 py-1 rounded-lg">{{ offer.availableQuantityKg || offer.availableUnits }} {{ offer.product.unitType === 'bunch' ? 'uds' : 'kg' }}</span>
                   <button @click="removeOffer(offer.id)" class="text-tomato-red/30 hover:text-tomato-red transition-all transform hover:scale-110">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
             </div>
          </div>
        </BentoCard>
      </div>

      <!-- Offer Form -->
      <div class="space-y-6">
        <BentoCard title="Añadir al Puesto">
          <div v-if="!selectedProduct" class="text-center py-16 px-6">
             <div class="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 opacity-30 text-4xl border border-white/5">🧺</div>
             <p class="text-sm text-white/20 italic">Selecciona un producto del catálogo para ponerlo en tu puesto.</p>
          </div>
          <form v-else @submit.prevent="submitOffer" class="space-y-8">
            <div class="relative h-48 rounded-3xl overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center">
                <img v-if="selectedProduct.imageUrl" :src="selectedProduct.imageUrl" :alt="selectedProduct.name" class="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div class="relative z-10 flex flex-col items-center">
                   <h3 class="text-2xl font-serif font-black text-white drop-shadow-md text-center px-4">{{ selectedProduct.name }}</h3>
                </div>
            </div>

            <div class="space-y-4">
               <label class="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] pl-1">
                  Cantidad Disponible
               </label>
               
               <div class="flex items-center justify-between bg-white/5 border border-white/10 rounded-3xl p-2 group hover:border-white/20 transition-all">
                  <button type="button" 
                          @click="decrement"
                          class="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-tomato-red/20 text-white transition-all active:scale-90">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" /></svg>
                  </button>

                  <div class="flex flex-col items-center">
                    <div class="text-4xl font-serif font-black text-white">
                      {{ form.quantity.toLocaleString('es-ES') }}
                    </div>
                    <div class="text-[10px] font-bold text-basil-green-light uppercase tracking-widest mt-1">
                      {{ selectedProduct.unitType === 'bunch' ? 'Unidades' : 'Kilogramos' }}
                    </div>
                  </div>

                  <button type="button" 
                          @click="increment"
                          class="w-16 h-16 flex items-center justify-center rounded-2xl bg-basil-green text-basil-green-dark hover:bg-basil-green-light transition-all shadow-lg active:scale-90">
                     <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
                  </button>
               </div>
            </div>

            <div class="space-y-4">
               <div class="flex items-center justify-between pl-1">
                  <label class="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
                     Añadir Foto del Producto
                  </label>
                  <span v-if="form.photoUrl" class="text-[9px] font-black text-basil-green-light uppercase tracking-widest bg-basil-green/10 px-2 py-0.5 rounded-md">Foto seleccionada ✨</span>
               </div>
               
               <div class="flex items-center gap-4">
                  <!-- Hidden File Input -->
                  <input type="file" 
                         ref="fileInput" 
                         class="hidden" 
                         accept="image/*" 
                         capture="environment"
                         @change="handleFileChange" />

                  <!-- Camera Button -->
                  <button type="button" 
                          @click="fileInput?.click()"
                          class="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white/40 hover:bg-white/10 hover:border-basil-green/30 hover:text-basil-green transition-all group shadow-lg">
                     <svg class="w-7 h-7 group-hover:scale-110 transition-transform mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     <span class="text-[8px] font-black uppercase tracking-tighter">Cámara</span>
                  </button>

                  <!-- Plus Button -->
                  <button type="button" 
                          @click="promptUrl"
                          class="w-16 h-16 rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center text-white/10 hover:border-basil-green/20 hover:text-basil-green/60 transition-all group">
                     <svg class="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  </button>

                  <div class="flex flex-col">
                     <span class="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Añadir foto</span>
                     <p class="text-[9px] text-white/20 italic pl-1 leading-tight max-w-[120px]">Sube una imagen real de tu cosecha hoy.</p>
                  </div>
               </div>

                <div v-if="form.photoUrl" class="mt-4 rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-2">
                   <div class="relative group">
                      <img :src="form.photoUrl.startsWith('http') || form.photoUrl.startsWith('data:') ? form.photoUrl : apiBase + form.photoUrl" class="w-full h-32 object-cover rounded-xl" />
                      <button @click="form.photoUrl = ''" class="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white/60 hover:text-tomato-red transition-colors">✕</button>
                   </div>
               </div>
            </div>

            <div class="space-y-3">
              <button type="submit" 
                      :disabled="submitting" 
                      class="w-full py-5 bg-basil-green text-moss-green-dark rounded-2xl font-black hover:bg-basil-green-light transition-all shadow-[0_10px_30px_rgba(124,173,88,0.2)] active:scale-95 disabled:opacity-50 text-xs uppercase tracking-[0.2em]">
                {{ submitting ? 'Guardando...' : 'Poner en el Puesto' }}
              </button>
              <button type="button" @click="selectedProduct = null" class="w-full py-3 text-[10px] text-white/20 font-bold uppercase tracking-widest hover:text-white transition-colors">Cancelar</button>
            </div>
          </form>
        </BentoCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'
const auth = useAuth()
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const catalogue = ref<any[]>([])
const catalogueSearchQuery = ref('')
const myOffers = ref<any[]>([])
const loadingProducts = ref(true)
const loadingOffers = ref(true)
const submitting = ref(false)

const filteredCatalogue = computed(() => {
  if (!catalogue.value) return []
  const q = catalogueSearchQuery.value?.toLowerCase() || ''
  const filtered = catalogue.value.filter(p => !q || p.name?.toLowerCase().includes(q))
  
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
const form = ref({
  quantity: 0,
  photoUrl: ''
})

const fileInput = ref<HTMLInputElement | null>(null)

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      submitting.value = true
      const data = await $fetch(`${apiBase}/tenants/${tenantId}/uploads/image`, {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${auth.token}` }
      }) as any
      
      form.value.photoUrl = data.url
    } catch (e) {
      alert('Error al subir la imagen')
      console.error(e)
    } finally {
      submitting.value = false
    }
  }
}

const promptUrl = () => {
  const url = prompt('Introduce la URL de la imagen (opcional):')
  if (url) form.value.photoUrl = url
}

// Emoji Helper
const getEmoji = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('broccoli') || n.includes('brócoli')) return '🥦'
  if (n.includes('carrot') || n.includes('zanahoria')) return '🥕'
  if (n.includes('tomato') || n.includes('tomate')) return '🍅'
  if (n.includes('pumpkin') || n.includes('calabaza')) return '🎃'
  if (n.includes('basil') || n.includes('albahaca')) return '🌿'
  return '🥗'
}

// Date Logic
const targetDate = computed(() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
})

const targetWeekISO = computed(() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
})

const selectProduct = (product: any) => {
  selectedProduct.value = product
  form.value.quantity = 0
  form.value.photoUrl = ''
}

const isProductSelected = (id: string) => selectedProduct.value?.id === id

const increment = () => {
  const step = selectedProduct.value?.unitType === 'bunch' ? 1 : 0.5
  form.value.quantity = Number((form.value.quantity + step).toFixed(1))
}

const decrement = () => {
  const step = selectedProduct.value?.unitType === 'bunch' ? 1 : 0.5
  if (form.value.quantity >= step) {
    form.value.quantity = Number((form.value.quantity - step).toFixed(1))
  } else {
    form.value.quantity = 0
  }
}

onMounted(async () => {
  await Promise.all([fetchCatalogue(), fetchMyOffers()])
})

const fetchCatalogue = async () => {
    loadingProducts.value = true
    try {
        const data = await $fetch(`${apiBase}/tenants/${tenantId}/products`, {
            headers: { 'x-tenant-id': tenantId }
        })
        catalogue.value = (data as any[]) || []
    } catch (e) {
        console.error('Fetch catalogue error:', e)
    } finally {
        loadingProducts.value = false
    }
}

const fetchMyOffers = async () => {
    loadingOffers.value = true
    try {
        const data = await $fetch(`${apiBase}/tenants/${tenantId}/offers/my-offers`, {
            headers: { 
              'x-tenant-id': tenantId,
              'Authorization': `Bearer ${auth.token}`
            }
        })
        myOffers.value = ((data as any[]) || []).filter(o => o.week.startsWith(targetWeekISO.value))
    } catch (e) {
        console.error('Fetch offers error:', e)
    } finally {
        loadingOffers.value = false
    }
}

const submitOffer = async () => {
  submitting.value = true
  try {
    const payload = {
      productId: selectedProduct.value.id,
      week: targetWeekISO.value,
      availableQuantityKg: selectedProduct.value.unitType !== 'bunch' ? form.value.quantity : undefined,
      availableUnits: selectedProduct.value.unitType === 'bunch' ? form.value.quantity : undefined,
      photoUrl: form.value.photoUrl || undefined
    }

    const { error } = await useFetch(`${apiBase}/tenants/${tenantId}/offers`, {
      method: 'POST',
      body: payload,
      headers: { 
        'x-tenant-id': tenantId,
        'Authorization': `Bearer ${auth.token}`
      }
    })

    if (error.value) throw new Error(error.value.message)
    
    selectedProduct.value = null
    await fetchMyOffers()
  } catch (e) {
    console.error('Submit offer error:', e)
  } finally {
    submitting.value = false
  }
}

const removeOffer = async (id: string) => {
  if (!confirm('¿Seguro que quieres quitar este producto del puesto?')) return
  try {
    await $fetch(`${apiBase}/tenants/${tenantId}/offers/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${auth.token}`,
        'x-tenant-id': tenantId
      }
    })
    await fetchMyOffers()
  } catch (e) {
    console.error('Remove offer error:', e)
    alert('Error al eliminar la oferta')
  }
}
</script>
