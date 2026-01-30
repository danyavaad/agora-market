<template>
  <div class="h-screen bg-neutral-50 p-6 font-sans text-neutral-800">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-green-800">Season Allocations</h1>
          <p class="text-neutral-500">Conflict Resolution Results</p>
        </div>
        <NuxtLink :to="`/seasons/${route.params.id}`" class="text-green-600 hover:underline">
          &larr; Back to Priorities
        </NuxtLink>
      </header>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
        <p class="mt-4 text-neutral-500">Loading allocations...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 p-4 rounded-xl text-red-700">
        {{ error }}
      </div>
      
      <div v-else>
        <div v-if="allocations.length === 0" class="bg-white p-8 rounded-2xl shadow-sm text-center">
            <p class="text-lg text-neutral-600 mb-4">No allocations yet.</p>
            <p class="text-sm text-neutral-500">Wait for an administrator to run the conflict resolution.</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Group by Producer -->
             <div v-for="(products, producerName) in groupedAllocations" :key="producerName" 
                  class="bg-white rounded-2xl shadow-sm p-6 border border-neutral-100">
                <div class="flex items-center gap-3 mb-4">
                    <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                        {{ producerName.charAt(0) }}
                    </div>
                    <h3 class="text-xl font-bold">{{ producerName }}</h3>
                </div>

                <ul class="space-y-3">
                    <li v-for="alloc in products" :key="alloc.productId" 
                        class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <span class="font-medium text-neutral-700">{{ alloc.productName }}</span>
                        <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Primary Crop</span>
                    </li>
                </ul>
             </div>
        </div>
      </div>
      
      <!-- Admin Controls (Only visible if admin/captain, simplified for now) -->
      <div class="mt-12 p-6 bg-white rounded-2xl border border-dashed border-neutral-300 text-center">
          <h3 class="text-lg font-bold mb-2">Admin Zone</h3>
          <p class="text-neutral-500 mb-4">Manually trigger conflict resolution (Draft Mode).</p>
          <button @click="triggerResolution" :disabled="resolving"
            class="px-6 py-3 bg-neutral-800 text-white rounded-xl font-bold hover:bg-neutral-700 disabled:opacity-50 transition-all">
            {{ resolving ? 'Resolving...' : 'Run Conflict Resolution' }}
          </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const auth = useAuth()
const loading = ref(true)
const resolving = ref(false)
const error = ref('')
const allocations = ref<any[]>([])

// Fetch allocations
// We need a new endpoint for this: GET /seasons/:id/allocations
// For now, I'll allow the resolution response to populate this or assume we add the endpoint.
// Actually, conflict resolution returns them, but we need to fetch them on load.
// I will assume I need to ADD that endpoint to backend first. 
// For this step, I'll mock or try to use the response from resolution if triggered.

const groupedAllocations = computed(() => {
    const groups: Record<string, any[]> = {}
    allocations.value.forEach(a => {
        const pName = a.producer?.name || 'Unknown Producer' // Need include: producer
        if (!groups[pName]) groups[pName] = []
        groups[pName].push({
            productId: a.productId,
            productName: a.product?.name || 'Unknown Product' // Need include: product
        })
    })
    return groups
})

onMounted(async () => {
    loading.value = true
    error.value = ''
    try {
        const { data, error: fetchError } = await useFetch(`http://localhost:3001/tenants/default-tenant-id/seasons/${route.params.id}/allocations`)
        if (fetchError.value) throw new Error(fetchError.value.message)
        allocations.value = data.value as any[]
    } catch (e) {
        error.value = 'Failed to load allocations.'
        console.error(e)
    } finally {
        loading.value = false
    }
})

const triggerResolution = async () => {
    resolving.value = true
    error.value = ''
    try {
        // Hardcoded tenantId for now
        const token = auth.token
        const { data, error: fetchError } = await useFetch(`http://localhost:3001/tenants/default-tenant-id/seasons/${route.params.id}/resolve`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        
        if (fetchError.value) throw new Error(fetchError.value.message)
        
        // Refresh data
        // The endpoint returns { message, allocations: [...] }
        // Note: The allocations returned by createMany don't include relations (names).
        // I might need to re-fetch or improve the backend return to include names.
        alert('Resolution Complete! (Reload to see fully hydrated data if backend supports it)')
        
    } catch (e) {
        error.value = 'Failed to resolve conflicts.'
        console.error(e)
    } finally {
        resolving.value = false
    }
}
</script>
