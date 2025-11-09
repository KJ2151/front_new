<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <div class="flex">
      <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />
      
      <main class="flex-1 p-6 lg:ml-64 mt-16">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import Navbar from './Navbar.vue'
import Sidebar from './Sidebar.vue'

export default {
  name: 'MainLayout',
  components: {
    Navbar,
    Sidebar
  },
  setup() {
    const sidebarOpen = ref(false)
    
    return {
      sidebarOpen
    }
  }
}
</script>