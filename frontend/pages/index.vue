<template>
  <div class="py-10">
    <div class="text-center mb-16">
      <h1 class="text-5xl md:text-7xl font-serif font-bold text-white mb-6 tracking-tight">Bienvenido a su Huerta</h1>
      <p class="text-basil-green-light text-sm md:text-xl font-bold uppercase tracking-[0.4em] italic opacity-80">Cooperación Directa • Calidad Artesanal</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <!-- Marketplace Card -->
      <NuxtLink to="/shop" class="group">
        <BentoCard title="🧺 El Puesto de la Huerta" class="h-full">
          <div class="py-10 flex flex-col items-center gap-6 px-4">
            <div class="text-7xl transition-transform group-hover:scale-110 duration-500 filter drop-shadow-2xl">🧺</div>
            <p class="text-white/40 text-sm text-center font-medium italic">
              Haz tu pedido directo de productos frescos y de temporada.
            </p>
            <span class="mt-4 text-[10px] font-black text-basil-green-light uppercase tracking-widest group-hover:underline">Ir al puesto →</span>
          </div>
        </BentoCard>
      </NuxtLink>

      <!-- Seasons Card -->
      <NuxtLink to="/seasons" class="group">
        <BentoCard title="🌱 Planificación" class="h-full">
          <div class="py-8 flex flex-col items-center gap-6 px-4">
            <div class="text-7xl transition-transform group-hover:scale-110 duration-500 filter drop-shadow-2xl">📅</div>
            <p class="text-white/40 text-sm text-center font-medium italic">
              Gestiona las temporadas de cultivo y el sistema de prioridades (Draft).
            </p>
            <span class="mt-4 text-[10px] font-black text-basil-green-light uppercase tracking-widest group-hover:underline">Ver temporadas →</span>
          </div>
        </BentoCard>
      </NuxtLink>

      <!-- Profile/Producer Stats -->
      <BentoCard title="🚜 Estado del Nodo" class="h-full">
        <div class="p-4 space-y-6">
          <div class="flex justify-between items-end border-b border-white/5 pb-3">
            <span class="text-[10px] font-bold text-white/20 uppercase tracking-widest">Productores</span>
            <span class="text-2xl font-serif font-bold text-white">12</span>
          </div>
          <div class="flex justify-between items-end border-b border-white/5 pb-3">
            <span class="text-[10px] font-bold text-white/20 uppercase tracking-widest">Siguiente Cosecha</span>
            <span class="text-xs font-black text-basil-green-light uppercase tracking-widest">En 3 días</span>
          </div>
          <div class="pt-2">
             <div class="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 p-0.5">
                <div class="bg-gradient-to-r from-basil-green to-basil-green-light h-full w-[70%] rounded-full shadow-[0_0_10px_rgba(124,173,88,0.3)]" title="Progreso de Cosecha"></div>
             </div>
             <p class="text-[9px] text-white/20 mt-3 font-bold uppercase tracking-widest text-center">Cosecha estimada: 450Kg</p>
          </div>
        </div>
      </BentoCard>

    </div>
  </div>
</template>
