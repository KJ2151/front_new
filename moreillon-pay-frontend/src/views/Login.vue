<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
      <div>
        <h1 class="text-center text-4xl font-extrabold text-primary-600">
          Moreillon Pay
        </h1>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          {{ isLogin ? 'Sign in to your account' : 'Create new account' }}
        </h2>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <div v-if="!isLogin">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="input-field"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              autocomplete="email"
              required
              class="input-field"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              autocomplete="current-password"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>
          
          <div v-if="!isLogin">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              required
              class="input-field"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ error }}
              </h3>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up') }}
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            @click="toggleMode"
            class="text-sm text-primary-600 hover:text-primary-500"
          >
            {{ isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

export default {
  name: 'Login',
  setup() {
    const store = useStore()
    const router = useRouter()
    const toast = useToast()
    
    const isLogin = ref(true)
    const loading = ref(false)
    const error = ref(null)
    
    const formData = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
    
    const toggleMode = () => {
      isLogin.value = !isLogin.value
      error.value = null
      formData.name = ''
      formData.email = ''
      formData.password = ''
      formData.confirmPassword = ''
    }
    
    const handleSubmit = async () => {
      error.value = null
      
      if (!isLogin.value && formData.password !== formData.confirmPassword) {
        error.value = 'Passwords do not match'
        return
      }
      
      loading.value = true
      
      try {
        if (isLogin.value) {
          await store.dispatch('auth/login', {
            email: formData.email,
            password: formData.password
          })
          toast.success('Logged in successfully!')
        } else {
          await store.dispatch('auth/register', {
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
          toast.success('Account created successfully!')
        }
        
        router.push('/')
      } catch (err) {
        error.value = err.response?.data?.message || 'An error occurred. Please try again.'
        toast.error(error.value)
      } finally {
        loading.value = false
      }
    }
    
    return {
      isLogin,
      loading,
      error,
      formData,
      toggleMode,
      handleSubmit
    }
  }
}
</script>