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

    <!-- Tabs Navigation -->
    <div class="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 mb-8 max-w-md">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
        :class="activeTab === tab.id ? 'bg-basil-green text-moss-green-dark shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="relative overflow-hidden">
      <!-- Tab: Mi Puesto Actual -->
      <transition 
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-x-4"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-200 ease-in absolute inset-0"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 -translate-x-4"
      >
        <div v-if="activeTab === 'current'" class="space-y-6">
          <BentoCard title="Productos en tu Puesto">
            <template #header-action>
               <button @click="activeTab = 'add'" class="text-[9px] font-black text-basil-green-light uppercase tracking-widest hover:underline flex items-center gap-1">
                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
                 Añadir más
               </button>
            </template>

            <div v-if="loadingOffers" class="flex justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-basil-green"></div>
            </div>
            
            <div v-else-if="myOffers.length === 0" class="text-center py-20 px-6">
              <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 opacity-20 text-3xl">📭</div>
              <p class="text-white/40 font-medium">No has puesto productos para esta semana todavía.</p>
              <button @click="activeTab = 'add'" class="mt-8 px-6 py-3 bg-basil-green text-moss-green-dark rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-basil-green-light transition-all shadow-xl">
                Empezar a añadir productos
              </button>
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div v-for="offer in myOffers" :key="offer.id" class="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
                  <div class="flex items-center gap-4">
                     <div class="w-14 h-14 rounded-2xl overflow-hidden bg-basil-green/5 flex items-center justify-center border border-white/5 group-hover:border-basil-green/20 transition-all">
                        <img v-if="(offer.product.imageUrl || offer.photoUrl) && !failedImages.has(offer.id)" 
                             :src="(offer.photoUrl || offer.product.imageUrl).startsWith('http') ? (offer.photoUrl || offer.product.imageUrl) : apiBase + (offer.photoUrl || offer.product.imageUrl)" 
                             :alt="offer.product.name" 
                             @error="onImageError(offer.id)"
                             class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <span v-else class="text-2xl drop-shadow-sm">{{ getEmoji(offer.product.name) }}</span>
                     </div>
                     <div>
                        <span class="font-bold text-white group-hover:text-basil-green-light transition-colors">{{ offer.product.name }}</span>
                        <div class="flex items-center gap-2 mt-1">
                           <span class="text-[10px] font-black text-basil-green-light bg-basil-green/10 px-2 py-0.5 rounded-md uppercase tracking-widest">{{ offer.availableQuantityKg || offer.availableUnits }} {{ offer.product.unitType === 'bunch' ? 'uds' : 'kg' }}</span>
                        </div>
                     </div>
                  </div>
                  <button @click="removeOffer(offer.id)" class="w-10 h-10 flex items-center justify-center rounded-xl bg-tomato-red/5 text-tomato-red/40 hover:bg-tomato-red/20 hover:text-tomato-red transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
               </div>
            </div>
          </BentoCard>
        </div>

        <!-- Tab: Añadir al Puesto -->
        <div v-else-if="activeTab === 'add'" class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <BentoCard title="Catálogo de Productos">
            <!-- Search Bar -->
            <div class="mb-6 relative">
               <input 
                 v-model="catalogueSearchQuery" 
                 type="text" 
                 placeholder="BUSCAR EN CATÁLOGO..." 
                 class="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 pl-12 text-[10px] font-black tracking-widest text-white placeholder:text-white/30 focus:outline-none focus:border-basil-green/50 transition-all uppercase"
               />
               <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>

            <div v-if="loadingProducts" class="flex justify-center py-10">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-basil-green"></div>
            </div>
            <div v-else class="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <div v-for="product in filteredCatalogue" :key="product.id" 
                   @click="selectProduct(product)"
                   class="p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between"
                   :class="isProductSelected(product.id) ? 'border-basil-green bg-basil-green/10 shadow-lg' : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10'">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl overflow-hidden bg-basil-green/5 flex items-center justify-center border border-white/5">
                     <img v-if="product.imageUrl && !failedImages.has(product.id)" 
                          :src="product.imageUrl" 
                          :alt="product.name" 
                          @error="onImageError(product.id)"
                          class="w-full h-full object-cover" />
                     <span v-else class="text-2xl drop-shadow-md">{{ getEmoji(product.name) }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-white/90 group-hover:text-white">{{ product.name }}</p>
                    <p class="text-[9px] text-basil-green-light uppercase font-black tracking-widest mt-1">Precio: {{ product.pricePerKg || product.pricePerBunch }}€ / {{ product.unitType === 'bunch' ? 'Ud' : 'Kg' }}</p>
                  </div>
                </div>
                <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-white/5 text-white/20"
                     :class="isProductSelected(product.id) ? 'bg-basil-green text-basil-green-dark' : 'group-hover:text-white group-hover:bg-white/10'">
                  <svg v-if="isProductSelected(product.id)" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
                </div>
              </div>
            </div>
          </BentoCard>

          <!-- Selected Product Form -->
          <transition 
            enter-active-class="transition duration-500 ease-out"
            enter-from-class="opacity-0 translate-y-8"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-if="selectedProduct" class="space-y-6">
              <BentoCard title="Ajustes de la Oferta">
                <form @submit.prevent="submitOffer" class="space-y-8">
                  <div class="relative h-48 rounded-[2rem] overflow-hidden bg-white/5 border border-white/5 flex items-center justify-center group shadow-2xl">
                      <img v-if="selectedProduct.imageUrl" :src="selectedProduct.imageUrl" :alt="selectedProduct.name" class="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" />
                      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div class="relative z-10 flex flex-col items-center">
                         <h3 class="text-3xl font-serif font-black text-white drop-shadow-xl text-center px-6">{{ selectedProduct.name }}</h3>
                      </div>
                  </div>

                  <div class="space-y-4">
                     <label class="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] pl-2">
                        Cantidad Disponible para el puesto
                     </label>
                     
                     <div class="flex items-center justify-between bg-black/40 border border-white/10 rounded-[2.5rem] p-3 group hover:border-basil-green/30 transition-all shadow-inner">
                        <button type="button" 
                                @click="decrement"
                                class="w-16 h-16 flex items-center justify-center rounded-[1.5rem] bg-white/5 hover:bg-tomato-red/20 text-white transition-all active:scale-90 border border-white/5">
                          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M20 12H4" /></svg>
                        </button>

                        <div class="flex flex-col items-center px-4">
                          <div class="text-5xl font-serif font-black text-white tracking-tighter">
                            {{ form.quantity.toLocaleString('es-ES') }}
                          </div>
                          <div class="text-[9px] font-black text-basil-green-light uppercase tracking-[0.2em] mt-2 bg-basil-green/10 px-3 py-1 rounded-full">
                            {{ selectedProduct.unitType === 'bunch' ? 'Unidades' : 'Kilogramos' }}
                          </div>
                        </div>

                        <button type="button" 
                                @click="increment"
                                class="w-20 h-20 flex items-center justify-center rounded-[2rem] bg-basil-green text-moss-green-dark hover:bg-basil-green-light transition-all shadow-xl active:scale-90 ring-4 ring-basil-green/10">
                           <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4" /></svg>
                        </button>
                     </div>
                  </div>

                  <div class="space-y-4">
                     <div class="flex items-center justify-between pl-2">
                        <label class="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
                           Fotografía Real de Hoy
                        </label>
                        <span v-if="form.photoUrl" class="text-[8px] font-black text-basil-green-light uppercase tracking-widest bg-basil-green/10 px-2 py-1 rounded-lg animate-pulse">Foto Lista ✨</span>
                     </div>
                     
                     <div class="flex items-center gap-6">
                        <input type="file" ref="fileInput" class="hidden" accept="image/*" capture="environment" @change="handleFileChange" />

                        <!-- Camera Button -->
                        <button type="button" 
                                @click="fileInput?.click()"
                                class="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white/30 hover:bg-white/10 hover:border-basil-green/30 hover:text-basil-green transition-all group shadow-xl relative overflow-hidden">
                           <div class="absolute inset-0 bg-basil-green/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <svg class="w-8 h-8 group-hover:scale-110 transition-transform mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                           <span class="text-[8px] font-black uppercase tracking-tighter">Cámara</span>
                        </button>

                        <div class="flex flex-col">
                           <span class="text-[10px] font-black text-white/50 uppercase tracking-widest pl-1">Sube tu cosecha</span>
                           <p class="text-[9px] text-white/20 italic pl-1 mt-1 leading-relaxed max-w-[160px]">A los clientes les encanta ver el producto fresco tal cual está hoy.</p>
                        </div>
                     </div>

                      <div v-if="form.photoUrl" class="mt-4 rounded-3xl overflow-hidden border border-white/10 bg-white/5 p-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                         <div class="relative group">
                            <img :src="form.photoUrl.startsWith('http') || form.photoUrl.startsWith('data:') ? form.photoUrl : apiBase + form.photoUrl" class="w-full h-40 object-cover rounded-2xl" />
                            <button @click="form.photoUrl = ''" class="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-xl rounded-xl text-white/40 hover:text-tomato-red transition-all transform hover:scale-110 shadow-lg">✕</button>
                         </div>
                     </div>
                  </div>

                  <div class="pt-4 space-y-4">
                    <button type="submit" 
                            :disabled="submitting || form.quantity <= 0" 
                            class="w-full py-6 bg-basil-green text-moss-green-dark rounded-[2rem] font-black hover:bg-basil-green-light transition-all shadow-[0_20px_40px_rgba(124,173,88,0.25)] active:scale-[0.98] disabled:opacity-30 disabled:grayscale text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                      <span v-if="!submitting">PONER EN EL PUESTO</span>
                      <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-moss-green-dark"></div>
                    </button>
                    <button type="button" @click="selectedProduct = null" class="w-full py-4 text-[10px] text-white/20 font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Cancelar Selección</button>
                  </div>
                </form>
              </BentoCard>
            </div>
            <div v-else class="flex flex-col items-center justify-center h-full py-20 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] opacity-40">
               <div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-4xl">🧺</div>
               <p class="text-xs uppercase font-black tracking-widest text-center px-10 leading-relaxed">Selecciona un producto del catálogo para configurar tu oferta</p>
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const config = useRuntimeConfig()
const toast = useToast()

const apiBase = config.public.apiBase || 'http://localhost:3001'
const auth = useAuth()
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

// Tabs
const activeTab = ref('current')
const tabs = [
  { id: 'current', label: 'En el Puesto' },
  { id: 'add', label: 'Añadir Productos' }
]

const catalogue = ref<any[]>([])
const catalogueSearchQuery = ref('')
const myOffers = ref<any[]>([])
const loadingProducts = ref(true)
const loadingOffers = ref(true)
const submitting = ref(false)
const failedImages = ref(new Set<string>())

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
      toast.error('Error al subir la imagen')
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

const onImageError = (id: string) => {
  failedImages.value.add(id)
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
    
    toast.success(`${selectedProduct.value.name} añadido al puesto 🧺`, 'Puesto Actualizado')
    selectedProduct.value = null
    await fetchMyOffers()
    activeTab.value = 'current'
  } catch (e) {
    toast.error('No se pudo añadir el producto al puesto', 'Error')
    console.error('Submit offer error:', e)
  } finally {
    submitting.value = false
  }
}

const removeOffer = async (id: string) => {
  const offerToRemove = myOffers.value.find(o => o.id === id)
  toast.confirm({
    title: '¿Quitar del Puesto?',
    message: `¿Seguro que quieres quitar ${offerToRemove?.product?.name || 'este producto'} del puesto?`,
    actionLabel: 'Sí, Quitar',
    onAction: async () => {
      try {
        await $fetch(`${apiBase}/tenants/${tenantId}/offers/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${auth.token}`,
            'x-tenant-id': tenantId
          }
        })
        toast.success('Producto quitado del puesto 🗑️', 'Puesto Actualizado')
        await fetchMyOffers()
      } catch (e) {
        console.error('Remove offer error:', e)
        toast.error('Error al eliminar la oferta')
      }
    }
  })
}
</script>
