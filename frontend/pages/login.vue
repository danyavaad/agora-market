<template>
  <div class="min-h-screen bg-forest-dark flex items-center justify-center p-6 relative overflow-hidden">
    <!-- Macro Artistic Background -->
    <div class="absolute inset-0 z-0 opacity-50">
      <img src="/images/orchard-macro.png" 
           alt="Orchard Background" 
           loading="lazy"
           class="w-full h-full object-cover scale-105 blur-[2px] grayscale-[0.2]">
      <div class="absolute inset-0 bg-gradient-to-b from-forest-dark/90 via-forest-dark/40 to-forest-dark/90"></div>
    </div>

    <!-- Main Login Card -->
    <div class="w-full max-w-sm z-10 animate-fade-in">
        <div class="relative bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
            
            <!-- Paper Texture overlay -->
            <div class="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>


            <div class="p-8 pb-10">
                <div class="text-center mb-10">
                    <div class="w-16 h-16 rounded-full bg-basil-green/10 flex items-center justify-center mx-auto mb-4 border border-basil-green/20">
                      <span class="text-3xl">🌿</span>
                    </div>
                    <h1 class="text-4xl font-serif font-bold text-white tracking-tight">Huertify</h1>
                    <p class="text-[10px] font-bold text-basil-green-light uppercase tracking-[0.3em] mt-1">Artesanal • Cooperativo • Directo</p>
                </div>

                <form @submit.prevent="handleLogin" class="space-y-6">
                    <div class="space-y-1">
                        <label class="block text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Email</label>
                        <input v-model="email" 
                               type="email" 
                               placeholder="hola@tu-huerto.com"
                               required
                               class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-basil-green/20 outline-none text-white font-medium transition-all placeholder:text-white/20" />
                    </div>

                    <div class="space-y-1">
                        <label class="block text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Contraseña</label>
                        <input v-model="password" 
                               type="password" 
                               placeholder="••••••••"
                               required
                               class="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:ring-2 focus:ring-basil-green/20 outline-none text-white font-medium transition-all placeholder:text-white/20" />
                    </div>

                    <div class="pt-2">
                        <button type="submit" 
                                :disabled="loading" 
                                class="w-full py-4 bg-pumpkin-orange text-white rounded-2xl font-bold hover:bg-pumpkin-orange-hover transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 text-sm uppercase tracking-widest">
                            {{ loading ? 'Entrando...' : 'Entrar' }}
                        </button>
                    </div>

                    <div v-if="error" class="bg-tomato-red/10 border border-tomato-red/20 p-3 rounded-xl text-center">
                        <p class="text-[11px] text-tomato-red font-bold uppercase tracking-wider">{{ error }}</p>
                    </div>
                </form>

                <div class="mt-8 pt-8 border-t border-white/5 text-center">
                    <p class="text-[10px] text-white/40 font-medium tracking-tight">
                        ¿No tienes cuenta? <NuxtLink to="/register" class="text-basil-green-light font-bold hover:underline">Únete a la Cooperativa</NuxtLink>
                    </p>
                </div>
            </div>
        </div>

        <p class="text-center mt-8 text-[10px] text-white/30 font-bold uppercase tracking-widest">
            Sin intermediarios. Del surco al Ágora.
        </p>
    </div>
  </div>
</template>

<script setup lang="ts">
// We use definePageMeta to disable the default layout for the login page
definePageMeta({
  layout: false
})

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuth()
const toast = useToast()
const router = useRouter()

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    await auth.login({ email: email.value, password: password.value })
    if (auth.user?.role === 'producer') {
      router.push('/producer')
    } else if (auth.user?.role === 'captain') {
      router.push('/captain')
    } else {
      router.push('/shop')
    }
    } catch (e) {
    toast.error('Credenciales no válidas')
    error.value = 'Credenciales no válidas'
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
