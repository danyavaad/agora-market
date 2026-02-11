<template>
  <div class="py-8 max-w-5xl mx-auto px-4">
    <!-- Header -->
    <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
          <div class="flex items-center gap-2 text-basil-green-light text-xs font-bold uppercase tracking-widest mb-2">
            <NuxtLink to="/producer" class="hover:underline">Panel</NuxtLink>
            <span>/</span>
            <span class="text-white/40">Logística</span>
          </div>
          <h1 class="text-4xl font-serif font-bold text-white">Hoja de Reparto</h1>
          <p class="text-white/40">Listado de pedidos a preparar para esta semana.</p>
      </div>
      <button @click="openMyQr" class="bg-basil-green text-moss-green-dark px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-basil-green-light transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
          Mi Identificación
      </button>
    </header>

    <!-- Week Filter (Simple for now) -->
    <div class="flex items-center justify-between mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div class="flex items-center gap-4">
            <span class="text-2xl">📅</span>
            <div>
                <p class="text-[10px] font-black text-basil-green-light uppercase tracking-widest">Semana del</p>
                <p class="text-white font-bold">{{ targetDateDisplay }}</p>
            </div>
        </div>
        <div class="text-right">
             <p class="text-2xl font-serif font-bold text-white">{{ totalItems }} <span class="text-sm font-sans text-white/30 font-normal">items</span></p>
             <p class="text-[10px] text-white/30 uppercase tracking-widest">{{ totalOrders }} pedidos distintos</p>
        </div>
    </div>

    <!-- Content -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-basil-green"></div>
    </div>
    
    <div v-else-if="orders.length === 0" class="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
      <div class="text-4xl mb-4 opacity-50">🚚</div>
      <p class="text-white/40 font-medium">No hay entregas asignadas para esta semana.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BentoCard v-for="(group, index) in groupedOrders" :key="index" :title="`Balda #${group.binNumber}`" class="relative group border-white/5 hover:border-basil-green/30 transition-all">
            <template #header-action>
                <div class="flex items-center gap-2">
                    <span class="text-[9px] font-black text-white/30 uppercase tracking-widest">{{ group.customer }}</span>
                    <NuxtLink to="/chat" class="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-basil-green-light hover:bg-basil-green hover:text-white transition-all" title="Enviar Mensaje">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </NuxtLink>
                </div>
            </template>
            
            <div class="space-y-4">
                <div v-for="item in group.items" :key="item.id" class="flex items-center gap-4 p-3 bg-white/5 rounded-2xl">
                    <div class="w-12 h-12 rounded-xl bg-basil-green/10 flex items-center justify-center text-xl">
                        {{ getEmoji(item.product.name) }}
                    </div>
                    <div>
                        <p class="font-bold text-white text-sm">{{ item.product.name }}</p>
                        <p class="text-[10px] font-black text-basil-green-light uppercase tracking-widest">
                            {{ (item.product.unitType === 'bunch' || item.product.unitType === 'unit') ? item.estimatedUnits : item.estimatedQuantityKg }} {{ (item.product.unitType === 'bunch' || item.product.unitType === 'unit') ? 'Uds' : 'Kg' }}
                        </p>
                    </div>
                    <div class="ml-auto">
                        <input type="checkbox" class="w-6 h-6 rounded-lg border-white/20 bg-white/5 checked:bg-basil-green transition-all" />
                    </div>
                </div>
            </div>
        </BentoCard>
    </div>

    <!-- QR Modal -->
    <Transition name="fade">
      <div v-if="showQrModal" @click="showQrModal = false" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-dark/95 backdrop-blur-xl">
          <div @click.stop class="bg-forest-dark-card border border-white/10 p-8 rounded-[3rem] shadow-2xl max-w-sm w-full text-center relative">
              <button @click="showQrModal = false" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
                  ✕
              </button>
              
              <h3 class="text-2xl font-serif font-bold text-white mb-2">Mi Identificación</h3>
              <p class="text-xs text-white/40 mb-8 uppercase tracking-widest font-bold">Muestra este código al Capitán</p>
              
              <div class="bg-white p-4 rounded-3xl inline-block mx-auto mb-6 shadow-inner">
                  <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="w-64 h-64 object-contain mix-blend-multiply" />
                  <div v-else class="w-64 h-64 flex items-center justify-center text-basil-green-dark">
                      <span class="animate-pulse">Generando...</span>
                  </div>
              </div>
              
              <p class="text-[10px] text-basil-green font-mono uppercase bg-basil-green/10 py-2 px-4 rounded-lg inline-block">{{ auth.user?.name || 'Productor' }}</p>
          </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import BentoCard from '~/components/BentoCard.vue'

const config = useRuntimeConfig()
const apiBase = config.public.apiBase || '/api'
const auth = useAuth()
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const loading = ref(true)
const rawItems = ref<any[]>([])

const targetWeekISO = computed(() => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  return monday.toISOString().split('T')[0]
})

const targetDateDisplay = computed(() => {
    return new Date(targetWeekISO.value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
})

onMounted(async () => {
    try {
        const data = await $fetch(`${apiBase}/tenants/${tenantId}/market/picking-list?week=${targetWeekISO.value}`, {
            headers: { 
              'x-tenant-id': tenantId,
              'Authorization': `Bearer ${auth.token}`
            }
        })
        rawItems.value = (data as any[]) || []
    } catch (e) {
        console.error('Fetch picking list error:', e)
    } finally {
        loading.value = false
    }
})

// Group items by Order (Bin Number)
const groupedOrders = computed(() => {
    const groups: Record<string, any> = {}
    
    rawItems.value.forEach(item => {
        const orderId = item.orderId
        const bin = item.order?.binNumber
        if (!groups[orderId]) {
            groups[orderId] = {
                orderId,
                binNumber: bin,
                customer: item.order?.consumer?.name || 'Consumidor',
                items: []
            }
        }
        groups[orderId].items.push(item)
    })
    
    return Object.values(groups).sort((a: any, b: any) => a.binNumber - b.binNumber)
})

const orders = computed(() => rawItems.value) // Just checking if empty, logic wise groupedOrders is main

const totalItems = computed(() => rawItems.value.length)
const totalOrders = computed(() => groupedOrders.value.length)

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
const showQrModal = ref(false)
const qrDataUrl = ref('')

const openMyQr = async () => {
    try {
        // Dynamic import to avoid SSR issues if library assumes window
        const QRCode = await import('qrcode')
        const code = `PRODUCER:${auth.user?.id}`
        qrDataUrl.value = await QRCode.toDataURL(code, { 
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300,
            color: {
                dark: '#1a4731', // moss-green-dark
                light: '#ffffff'
            }
        })
        showQrModal.value = true
    } catch (e) {
        console.error('Error generating QR', e)
    }
}
</script>

<style scoped>
/* Modal Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
