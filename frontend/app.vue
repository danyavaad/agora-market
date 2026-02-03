<template>
  <div>
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
      <NotificationContainer />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import NotificationContainer from '~/components/organisms/NotificationContainer.vue'

const auth = useAuth()
onMounted(() => {
  auth.initialize()
})
</script>
