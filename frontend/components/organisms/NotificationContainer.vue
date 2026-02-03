<template>
  <div
    aria-live="assertive"
    class="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-[100]"
  >
    <div class="flex flex-col items-center space-y-4 w-full sm:items-end">
      <TransitionGroup
        name="list"
        tag="div"
        class="flex flex-col items-center space-y-4 w-full sm:items-end"
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
  transform: translateX(30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
