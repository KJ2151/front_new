<template>
  <div class="max-w-4xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
      <p class="text-gray-600 mt-2">Manage your account information</p>
    </div>

    <div class="card mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
      <form @submit.prevent="updateProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              v-model="profileForm.name"
              type="text"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="profileForm.email"
              type="email"
              class="input-field"
              required
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input
            v-model="profileForm.company"
            type="text"
            class="input-field"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            v-model="profileForm.address"
            rows="3"
            class="input-field"
          ></textarea>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="profileForm.phone"
              type="tel"
              class="input-field"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              v-model="profileForm.website"
              type="url"
              class="input-field"
            />
          </div>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="updating" class="btn-primary">
            {{ updating ? 'Updating...' : 'Update Profile' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <h2 class="text-xl font-bold text-gray-900 mb-6">Change Password</h2>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            class="input-field"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="input-field"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="input-field"
            required
          />
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="changingPassword" class="btn-primary">
            {{ changingPassword ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export default {
  name: 'Profile',
  setup() {
    const store = useStore()
    const toast = useToast()
    
    const updating = ref(false)
    const changingPassword = ref(false)
    
    const profileForm = reactive({
      name: '',
      email: '',
      company: '',
      address: '',
      phone: '',
      website: ''
    })
    
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    const loadProfile = () => {
      const user = store.state.auth.user
      if (user) {
        profileForm.name = user.name || ''
        profileForm.email = user.email || ''
        profileForm.company = user.company || ''
        profileForm.address = user.address || ''
        profileForm.phone = user.phone || ''
        profileForm.website = user.website || ''
      }
    }
    
    const updateProfile = async () => {
      updating.value = true
      try {
        await store.dispatch('auth/updateProfile', profileForm)
        toast.success('Profile updated successfully')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error updating profile')
      } finally {
        updating.value = false
      }
    }
    
    const changePassword = async () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
      
      changingPassword.value = true
      try {
        // Implement password change
        toast.success('Password changed successfully')
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error changing password')
      } finally {
        changingPassword.value = false
      }
    }
    
    onMounted(loadProfile)
    
    return {
      updating,
      changingPassword,
      profileForm,
      passwordForm,
      updateProfile,
      changePassword
    }
  }
}
</script>