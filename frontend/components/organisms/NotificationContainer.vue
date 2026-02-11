<template>
  <div
    aria-live="assertive"
    class="fixed inset-x-0 bottom-10 flex flex-col items-center pointer-events-none z-[100] px-4"
  >
    <div class="flex flex-col items-center space-y-3 w-full max-w-sm">
      <TransitionGroup
        name="list"
        tag="div"
        class="flex flex-col items-center space-y-3 w-full"
      >
        <NotificationItem
          v-for="notification in store.notifications"
          :key="notification.id"
          :notification="notification"
          @close="store.removeNotification"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import NotificationItem from '../atoms/NotificationItem.vue'
const store = useNotificationStore()
</script>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.list-leave-active {
  position: absolute;
}
</style>
