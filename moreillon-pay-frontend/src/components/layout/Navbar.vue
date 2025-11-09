<template>
  <nav class="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
    <div class="px-3 py-3 lg:px-5 lg:pl-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-start">
          <button 
            @click="$emit('toggle-sidebar')"
            class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
            </svg>
          </button>
          <router-link to="/" class="flex ml-2 md:mr-24">
            <span class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-primary-600">
              Moreillon Pay
            </span>
          </router-link>
        </div>
        
        <div class="flex items-center">
          <div class="flex items-center ml-3">
            <div class="relative">
              <button 
                @click="dropdownOpen = !dropdownOpen"
                class="flex items-center text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
              >
                <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  {{ userInitials }}
                </div>
              </button>
              
              <div 
                v-if="dropdownOpen"
                @click="dropdownOpen = false"
                class="absolute right-0 z-50 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow"
              >
                <div class="px-4 py-3">
                  <p class="text-sm text-gray-900">{{ user?.name || 'User' }}</p>
                  <p class="text-sm font-medium text-gray-500 truncate">{{ user?.email }}</p>
                </div>
                <ul class="py-1">
                  <li>
                    <router-link to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </router-link>
                  </li>
                  <li>
                    <router-link to="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </router-link>
                  </li>
                  <li>
                    <a @click.prevent="handleLogout" href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Sign out
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

export default {
  name: 'Navbar',
  emits: ['toggle-sidebar'],
  setup() {
    const store = useStore()
    const router = useRouter()
    const toast = useToast()
    const dropdownOpen = ref(false)
    
    const user = computed(() => store.state.auth.user)
    const userInitials = computed(() => {
      const name = user.value?.name || 'U'
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    })
    
    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        toast.success('Logged out successfully')
        router.push('/login')
      } catch (error) {
        toast.error('Error logging out')
      }
    }
    
    return {
      dropdownOpen,
      user,
      userInitials,
      handleLogout
    }
  }
}
</script>