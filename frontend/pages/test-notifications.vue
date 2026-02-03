<template>
  <div class="p-8 space-y-4 bg-forest-dark min-h-screen">
    <h1 class="text-3xl font-bold text-paper-beige mb-8">Sistema de Notificaciones</h1>
    
    <div class="flex flex-wrap gap-4">
      <button 
        @click="toast.success('¡Pedido confirmado correctamente! 🌿')" 
        class="px-4 py-2 bg-basil-green text-white rounded-xl hover:bg-basil-green-dark transition"
      >
        Éxito
      </button>
      
      <button 
        @click="toast.error('Error al procesar el pago. 🍅')" 
        class="px-4 py-2 bg-tomato-red text-white rounded-xl hover:opacity-90 transition"
      >
        Error
      </button>
      
      <button 
        @click="toast.warning('Queda poco stock de este producto. 🎃')" 
        class="px-4 py-2 bg-pumpkin-orange text-white rounded-xl hover:bg-pumpkin-orange-hover transition"
      >
        Advertencia
      </button>
      
      <button 
        @click="toast.info('Tienes un nuevo mensaje del productor.')" 
        class="px-4 py-2 bg-moss-green-light text-white rounded-xl hover:bg-moss-green transition"
      >
        Información
      </button>
    </div>

    <div class="mt-8 p-6 bg-forest-dark-card rounded-2xl border border-moss-green/30">
      <h2 class="text-xl font-semibold text-basil-green mb-4">Manual de Uso</h2>
      <pre class="bg-pizarra p-4 rounded-lg text-sm text-paper-beige overflow-x-auto">
<code>
// 1. Importar el composable
const toast = useToast()

// 2. Usarlo en cualquier lugar
toast.success('Mensaje exitoso')
toast.error('Mensaje de error')
toast.warning('Mensaje de aviso')
toast.info('Mensaje informativo')

// Opcional: El segundo parámetro es el tiempo en ms (default 5000)
toast.success('Dura 10 segundos', 10000)
</code>
      </pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
</script>
