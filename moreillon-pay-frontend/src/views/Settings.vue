<template>
  <div class="max-w-4xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <p class="text-gray-600 mt-2">Configure your application preferences</p>
    </div>

    <div class="card mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-6">Invoice Settings</h2>
      <form @submit.prevent="saveSettings" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
          <input
            v-model="settings.invoicePrefix"
            type="text"
            class="input-field"
            placeholder="INV-"
          />
          <p class="text-xs text-gray-500 mt-1">Prefix for invoice numbers (e.g., INV-001)</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Next Invoice Number</label>
          <input
            v-model.number="settings.nextInvoiceNumber"
            type="number"
            class="input-field"
            min="1"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
          <input
            v-model.number="settings.defaultTaxRate"
            type="number"
            class="input-field"
            step="0.01"
            min="0"
            max="100"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payment Terms (Days)</label>
          <input
            v-model.number="settings.paymentTerms"
            type="number"
            class="input-field"
            min="0"
          />
          <p class="text-xs text-gray-500 mt-1">Default number of days until payment is due</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select v-model="settings.currency" class="input-field">
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
          </select>
        </div>

        <div class="flex justify-end">
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <h2 class="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
      <div class="space-y-4">
        <label class="flex items-center">
          <input
            v-model="settings.emailNotifications"
            type="checkbox"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="ml-2 text-gray-700">Email notifications for new payments</span>
        </label>
        
        <label class="flex items-center">
          <input
            v-model="settings.overdueReminders"
            type="checkbox"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="ml-2 text-gray-700">Send reminders for overdue invoices</span>
        </label>
        
        <label class="flex items-center">
          <input
            v-model="settings.paymentConfirmations"
            type="checkbox"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span class="ml-2 text-gray-700">Send payment confirmation emails</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toastification'

export default {
  name: 'Settings',
  setup() {
    const toast = useToast()
    const saving = ref(false)
    
    const settings = reactive({
      invoicePrefix: 'INV-',
      nextInvoiceNumber: 1,
      defaultTaxRate: 0,
      paymentTerms: 30,
      currency: 'USD',
      emailNotifications: true,
      overdueReminders: true,
      paymentConfirmations: true
    })
    
    const loadSettings = () => {
      // Load settings from localStorage or API
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        Object.assign(settings, JSON.parse(savedSettings))
      }
    }
    
    const saveSettings = async () => {
      saving.value = true
      try {
        // Save to localStorage or API
        localStorage.setItem('appSettings', JSON.stringify(settings))
        toast.success('Settings saved successfully')
      } catch (error) {
        toast.error('Error saving settings')
      } finally {
        saving.value = false
      }
    }
    
    onMounted(loadSettings)
    
    return {
      saving,
      settings,
      saveSettings
    }
  }
}
</script>