<template>
  <div class="min-h-screen bg-forest-dark flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute inset-0 opacity-40 pointer-events-none">
       <div class="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-basil-green/20 rounded-full blur-[120px]"></div>
       <div class="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-moss-green/30 rounded-full blur-[120px]"></div>
    </div>

    <!-- Main Register Card -->
    <div class="w-full max-w-md z-10 animate-fade-in px-4">
        <div class="relative bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden">
            
            <!-- Paper Texture overlay -->
            <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

            <div class="p-8 pb-10">
                <div class="text-center mb-10">
                    <h1 class="text-3xl font-serif font-bold text-white tracking-tight">Crea tu Cuenta</h1>
                    <p class="text-[10px] font-bold text-basil-green-light uppercase tracking-[0.3em] mt-1">Venta Directa • Agora</p>
                </div>

                <form @submit.prevent="handleRegister" class="space-y-6">
                    <div class="grid grid-cols-1 gap-6">
                        <div class="space-y-1">
                            <label class="block text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Nombre Completo</label>
                            <input v-model="form.name" 
                                   type="text" 
                                   placeholder="Juan Pérez"
                                   required
                                   class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-basil-green/20 outline-none text-white font-medium placeholder:text-white/20" />
                        </div>

                        <div class="space-y-1">
                            <label class="block text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Email</label>
                            <input v-model="form.email" 
                                   type="email" 
                                   placeholder="tu@email.com"
                                   required
                                   class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-basil-green/20 outline-none text-white font-medium placeholder:text-white/20" />
                        </div>

                        <div class="space-y-1">
                            <label class="block text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Contraseña</label>
                            <input v-model="form.password" 
                                   type="password" 
                                   placeholder="••••••••"
                                   required
                                   class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-basil-green/20 outline-none text-white font-medium placeholder:text-white/20" />
                        </div>

                        <div class="space-y-1">
                            <label class="block text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Selecciona tu Nodo / Agora</label>
                            <div class="relative">
                                <select v-model="form.tenantId" 
                                        required
                                        class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-basil-green/20 outline-none text-white font-medium appearance-none">
                                    <option value="" disabled class="bg-forest-dark text-white">Elige un nodo...</option>
                                    <option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id" class="bg-forest-dark text-white">
                                        {{ tenant.name }}
                                    </option>
                                </select>
                                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="block text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Tu Rol</label>
                            <div class="grid grid-cols-2 gap-4">
                                <button type="button" 
                                        @click="form.role = 'consumer'"
                                        :class="[form.role === 'consumer' ? 'bg-basil-green text-white border-basil-green shadow-lg scale-105' : 'bg-white/5 text-white/40 border-white/10']"
                                        class="p-4 border rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                                    Consumidor
                                </button>
                                <button type="button" 
                                        @click="form.role = 'producer'"
                                        :class="[form.role === 'producer' ? 'bg-basil-green text-white border-basil-green shadow-lg scale-105' : 'bg-white/5 text-white/40 border-white/10']"
                                        class="p-4 border rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                                    Productor
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="pt-6">
                        <button type="submit" 
                                :disabled="loading" 
                                class="w-full py-5 bg-pumpkin-orange text-white rounded-2xl font-bold hover:bg-pumpkin-orange-hover transition-all shadow-[0_10px_30px_rgba(230,138,62,0.3)] hover:shadow-[0_15px_40px_rgba(230,138,62,0.4)] active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-[0.2em]">
                            {{ loading ? 'Creando Cuenta...' : 'Registrarme' }}
                        </button>
                    </div>

                    <div v-if="error" class="bg-tomato-red/10 border border-tomato-red/20 p-4 rounded-2xl text-center">
                        <p class="text-[10px] text-tomato-red font-bold uppercase tracking-widest">{{ error }}</p>
                    </div>
                </form>

                <div class="mt-10 pt-8 border-t border-white/5 text-center">
                    <p class="text-[10px] text-white/40 font-medium tracking-tight">
                        ¿Ya tienes cuenta? <NuxtLink to="/login" class="text-basil-green-light font-bold hover:underline">Inicia Sesión</NuxtLink>
                    </p>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'consumer',
  tenantId: ''
})

const tenants = ref<any[]>([])
const error = ref('')
const loading = ref(false)
const auth = useAuth()
const config = useRuntimeConfig()
const router = useRouter()

onMounted(async () => {
  try {
    const data: any = await $fetch(`${config.public.apiBase}/tenants`)
    tenants.value = data
    if (tenants.value.length > 0) {
      form.value.tenantId = tenants.value[0].id
    }
  } catch (e) {
    console.error('Error fetching tenants:', e)
  }
})

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await auth.register(form.value)
    alert('¡Cuenta creada! Ahora puedes iniciar sesión.')
    router.push('/login')
  } catch (e) {
    error.value = 'Error al registrar la cuenta'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
