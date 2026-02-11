<template>
  <div class="h-screen bg-neutral-50 p-6 font-sans text-neutral-800">
    <div class="max-w-4xl mx-auto">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-green-800">Offer Management</h1>
          <p class="text-neutral-500">Set available quantities for your crops.</p>
        </div>
        <div class="flex gap-4">
             <NuxtLink :to="`/seasons/${route.params.id}/allocations`" class="text-green-600 hover:underline">
                View Allocations
            </NuxtLink>
            <NuxtLink :to="`/seasons/${route.params.id}`" class="text-green-600 hover:underline">
            &larr; Back to Season
            </NuxtLink>
        </div>
      </header>

      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
        <p class="mt-4 text-neutral-500">Loading your assigned crops...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 p-4 rounded-xl text-red-700">
        {{ error }}
      </div>

      <div v-else>
        <!-- Mock Data for now until Backend Offer API is ready, reusing structure based on CSV -->
        <div class="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <table class="w-full text-left">
                <thead class="bg-green-50 text-green-800 font-bold uppercase text-xs">
                    <tr>
                        <th class="p-4">Product</th>
                        <th class="p-4">Unit</th>
                        <th class="p-4">Available Qty</th>
                         <th class="p-4">Ref. Price (€)</th>
                        <th class="p-4">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-neutral-100">
                    <tr v-for="product in myProducts" :key="product.id" class="hover:bg-neutral-50 transition-colors">
                        <td class="p-4 font-medium">{{ product.name }}</td>
                        <td class="p-4 text-neutral-500">{{ product.unitDescription || product.unitType }}</td>
                        <td class="p-4">
                            <input type="number" v-model="product.quantity" class="w-24 p-2 border rounded-lg text-center" placeholder="0" />
                        </td>
                         <td class="p-4 text-neutral-500">
                            {{ product.pricePerKg || 'TBD' }} 
                        </td>
                        <td class="p-4">
                            <button @click="saveOffer(product)" class="text-green-600 hover:text-green-800 font-bold text-sm">Update</button>
                        </td>
                    </tr>
                     <tr v-if="myProducts.length === 0">
                        <td colspan="5" class="p-8 text-center text-neutral-400 italic">
                            No products assigned to you yet. Check Allocations.
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const auth = useAuth()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase || '/api'
const tenantId = auth.user?.tenantId || 'nodo-caceres-id'

const loading = ref(true)
const error = ref('')
const myProducts = ref<any[]>([])

// Logic:
// 1. Fetch "My Allocations" to see what I should offer.
// 2. Fetch "My Existing Offers" to pre-fill quantities.
// 3. Merge them.

const fetchData = async () => {
    loading.value = true
    try {
        const token = auth.token;
        
        // 1. Allocations
        const { data: allocData, error: allocError } = await useFetch(`${apiBase}/tenants/${tenantId}/seasons/${route.params.id}/allocations`, {
            headers: { 'x-tenant-id': tenantId }
        })
        if (allocError.value) throw new Error(allocError.value.message)
        
        // 2. My Offers
         const { data: offersData, error: offersError } = await useFetch(`${apiBase}/tenants/${tenantId}/offers/my-offers`, {
             headers: { 
                 'Authorization': `Bearer ${token}`,
                 'x-tenant-id': tenantId
             }
         })
         // If 404/error on offers, just assume empty? 
         // For now let's hope it returns empty array []
         
        const allocations = (allocData.value as any[])
            .filter(a => a.producerId === auth.user?.id) // Filter client side for now
        
        const existingOffers = (offersData.value as any[]) || []
        
        // 3. Merge
        myProducts.value = allocations.map(alloc => {
            const product = alloc.product;
            // Find existing offer for this product?
            // Note: Offers are per WEEK. We need a week selector!
            // For MVP, let's assume "Current Week" or "Next Delivery". 
            // I'll default to next Monday.
            const nextMonday = getNextMonday().toISOString().split('T')[0];
            
            const offer = existingOffers.find((o: any) => o.productId === product.id && o.week.startsWith(nextMonday))
            
            return {
                ...product,
                currentOfferId: offer?.id,
                quantity: offer?.availableQuantityKg || 0,
                targetWeek: nextMonday
            }
        })

    } catch (e) {
        console.error(e)
        error.value = 'Failed to load data.'
    } finally {
        loading.value = false
    }
}

const saveOffer = async (product: any) => {
    try {
         const token = auth.token;
         const tenantId = 'default-tenant-id';
         
         const payload: any = {
             productId: product.id,
             week: product.targetWeek,
         }

         // Simple logic: If unit is Kg, save to Kg. Else save to Units.
         // This depends on how strictly we define UnitType.
         // Assuming 'Kg' is the identifier for Kilograms.
         const isKg = product.unitType === 'Kg' || product.unitType === 'KG';
         
         if (isKg) {
             payload.availableQuantityKg = parseFloat(product.quantity);
             payload.availableUnits = null; 
         } else {
             payload.availableUnits = parseInt(product.quantity);
             payload.availableQuantityKg = null;
         }
         
         const { data, error } = await useFetch(`${apiBase}/tenants/${tenantId}/offers`, {
             method: 'POST',
             body: payload,
             headers: { 
                 'Authorization': `Bearer ${token}`,
                 'x-tenant-id': tenantId
             }
         })
         
         if (error.value) throw new Error(error.value.message)
         alert('Offer updated!')
         
    } catch (e) {
        alert('Failed to save offer')
    }
}

// Helper
function getNextMonday() {
  const d = new Date();
  d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7));
  d.setHours(0,0,0,0);
  return d;
}

onMounted(() => {
    if (auth.isAuthenticated) {
        fetchData()
    }
})
</script>
