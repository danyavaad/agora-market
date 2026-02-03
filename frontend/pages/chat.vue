<template>
  <div class="py-8 max-w-6xl mx-auto px-4 h-[85vh] flex flex-col">
    <!-- Header -->
    <header class="mb-8 shrink-0">
      <h1 class="text-4xl font-serif font-bold text-white mb-2">Mensajes</h1>
      <p class="text-white/40 italic">Conversaciones directas en el Ágora.</p>
    </header>

    <div class="flex-grow flex gap-6 overflow-hidden min-h-0">
      <!-- Conversation List -->
      <div class="w-1/3 flex flex-col bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div class="p-6 border-b border-white/5 shrink-0">
           <p class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Tus Contactos</p>
        </div>
        <div class="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar">
           <div v-if="conversations.length === 0" class="text-center py-20">
              <p class="text-white/10 italic text-sm">Sin conversaciones aún.</p>
           </div>
           <button v-for="c in conversations" :key="c.partner.id"
                   @click="selectConversation(c.partner.id)"
                   :class="activePartnerId === c.partner.id ? 'bg-basil-green/20 border-basil-green/40' : 'hover:bg-white/5 border-transparent'"
                   class="w-full text-left p-5 rounded-3xl border transition-all group relative">
              <div class="flex items-center gap-4">
                 <div class="w-10 h-10 rounded-full bg-basil-green/10 flex items-center justify-center font-bold text-basil-green-light shadow-inner">
                    {{ c.partner.name.substring(0, 1) }}
                 </div>
                 <div class="overflow-hidden flex-grow">
                    <p class="font-bold text-white/90 truncate">{{ c.partner.name }}</p>
                    <p class="text-[10px] text-white/30 truncate">{{ c.lastMessage }}</p>
                 </div>
                 <div v-if="c.unreadCount > 0" class="bg-tomato-red text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                    {{ c.unreadCount }}
                 </div>
              </div>
           </button>
        </div>
      </div>

      <!-- Message Area -->
      <div class="flex-grow flex flex-col bg-white/[0.02] rounded-[2.5rem] border border-white/5 overflow-hidden backdrop-blur-3xl relative">
        <div v-if="!activePartnerId" class="flex-grow flex flex-col items-center justify-center p-12 text-center">
            <div class="text-6xl mb-6 opacity-20">💬</div>
            <h3 class="text-xl font-serif font-bold text-white/40 mb-2">Selecciona una conversación</h3>
            <p class="text-sm text-white/20 max-w-xs">Habla directamente con productores o consumidores para coordinar vuestros pedidos.</p>
        </div>

        <template v-else>
           <!-- Chat Header -->
           <div class="p-6 border-b border-white/10 shrink-0 flex justify-between items-center bg-white/5">
              <div class="flex items-center gap-4">
                 <div class="w-10 h-10 rounded-full bg-basil-green flex items-center justify-center font-bold text-moss-green-dark">
                    {{ partner?.name?.substring(0, 1) }}
                 </div>
                 <h3 class="font-serif font-bold text-white">{{ partner?.name }}</h3>
              </div>
           </div>

           <!-- Messages -->
           <div id="message-container" class="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div v-for="m in messages" :key="m.id" 
                   :class="m.senderId === auth.user?.id ? 'items-end' : 'items-start'"
                   class="flex flex-col">
                 <div :class="m.senderId === auth.user?.id ? 'bg-basil-green text-moss-green-dark rounded-br-none' : 'bg-white/10 text-white rounded-bl-none'"
                      class="max-w-[80%] p-4 rounded-3xl text-sm shadow-xl">
                    {{ m.content }}
                 </div>
                 <span class="text-[8px] text-white/20 mt-2 font-bold uppercase tracking-widest px-2">{{ formatTime(m.createdAt) }}</span>
              </div>
           </div>

           <!-- Input -->
           <div class="p-6 shrink-0 bg-white/5 border-t border-white/10">
              <form @submit.prevent="sendMessage" class="flex gap-3">
                 <input v-model="newMessage" 
                        placeholder="Escribe un mensaje..."
                        class="flex-grow bg-white/5 border border-white/10 p-5 rounded-2xl focus:ring-4 focus:ring-basil-green/20 outline-none text-white transition-all" />
                 <button type="submit" 
                         :disabled="!newMessage.trim()"
                         class="px-8 bg-basil-green text-moss-green-dark rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-basil-green-light transition-all active:scale-95 disabled:opacity-20">
                    Enviar
                 </button>
              </form>
           </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || 'http://localhost:3001'
const auth = useAuth()
const route = useRoute()
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const conversations = ref<any[]>([])
const messages = ref<any[]>([])
const activePartnerId = ref<string | null>(null)
const partner = ref<any>(null)
const newMessage = ref('')
let pollInterval: any = null

onMounted(async () => {
    await fetchConversations()
    const queryWith = route.query.with as string
    if (queryWith) {
        selectConversation(queryWith)
    }
})

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval)
})

const fetchConversations = async () => {
    try {
        const data = await $fetch(`${apiBase}/tenants/${tenantId}/chat/conversations`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
        conversations.value = (data as any[]) || []
    } catch (e) {
        console.error('Fetch conversations error:', e)
    }
}

const selectConversation = async (id: string) => {
    activePartnerId.value = id
    
    // Find partner in conversations
    const existing = conversations.value.find(c => c.partner.id === id)
    if (existing) {
        partner.value = existing.partner
    } else {
        // If not in list, we might need to fetch user details (future)
        partner.value = { id, name: 'Cargando...' }
    }
    
    // Mark as read
    try {
        await $fetch(`${apiBase}/tenants/${tenantId}/chat/conversation/${id}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
        fetchConversations() // Update list to clear badge
    } catch (e) {
        console.error('Mark as read error:', e)
    }

    await fetchMessages()
    
    // Start polling
    if (pollInterval) clearInterval(pollInterval)
    pollInterval = setInterval(fetchMessages, 3000)
}

const fetchMessages = async () => {
    if (!activePartnerId.value) return
    try {
        const data = await $fetch(`${apiBase}/tenants/${tenantId}/chat/conversation/${activePartnerId.value}`, {
            headers: { 'Authorization': `Bearer ${auth.token}` }
        })
        messages.value = (data as any[]) || []
        
        // Scroll to bottom
        nextTick(() => {
            const container = document.getElementById('message-container')
            if (container) container.scrollTop = container.scrollHeight
        })
    } catch (e) {
        console.error('Fetch messages error:', e)
    }
}

const sendMessage = async () => {
    if (!newMessage.value.trim() || !activePartnerId.value) return
    const content = newMessage.value
    newMessage.value = ''
    
    try {
        await $fetch(`${apiBase}/tenants/${tenantId}/chat/send`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${auth.token}` },
            body: { receiverId: activePartnerId.value, content }
        })
        await fetchMessages()
        await fetchConversations()
    } catch (e) {
        alert('Error al enviar mensaje')
    }
}

const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
