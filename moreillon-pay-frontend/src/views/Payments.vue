<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Payments</h1>
        <p class="text-gray-600 mt-2">Track all payment transactions</p>
      </div>
      <button @click="showPaymentModal = true" class="btn-primary">
        <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
        </svg>
        Record Payment
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search payments..."
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
          <input
            v-model="filters.dateTo"
            type="date"
            class="input-field"
          />
        </div>
      </div>
    </div>

    <!-- Payment List -->
    <div class="card">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else-if="filteredPayments.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No payments</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by recording a payment.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="payment in filteredPayments" :key="payment._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(payment.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <router-link 
                  :to="`/invoices/${payment.invoice?._id}`"
                  class="text-primary-600 hover:text-primary-900"
                >
                  #{{ payment.invoice?.number || payment.invoice?._id?.slice(-6) }}
                </router-link>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ payment.invoice?.client?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                ${{ payment.amount?.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ payment.method }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ payment.notes || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentForm
      v-if="showPaymentModal"
      @close="showPaymentModal = false"
      @saved="handlePaymentSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import PaymentForm from '@/components/payments/PaymentForm.vue'

export default {
  name: 'Payments',
  components: {
    PaymentForm
  },
  setup() {
    const store = useStore()
    const toast = useToast()
    
    const loading = ref(true)
    const showPaymentModal = ref(false)
    
    const filters = ref({
      search: '',
      dateFrom: '',
      dateTo: ''
    })
    
    const payments = computed(() => store.state.payments.payments)
    
    const filteredPayments = computed(() => {
      let result = [...payments.value]
      
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(payment => 
          payment.invoice?.number?.toLowerCase().includes(search) ||
          payment.invoice?.client?.name?.toLowerCase().includes(search)
        )
      }
      
      if (filters.value.dateFrom) {
        result = result.filter(payment => new Date(payment.date) >= new Date(filters.value.dateFrom))
      }
      
      if (filters.value.dateTo) {
        result = result.filter(payment => new Date(payment.date) <= new Date(filters.value.dateTo))
      }
      
      return result
    })
    
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return format(new Date(date), 'MMM dd, yyyy')
    }
    
    const handlePaymentSaved = () => {
      showPaymentModal.value = false
      toast.success('Payment recorded successfully')
    }
    
    onMounted(async () => {
      try {
        await store.dispatch('payments/fetchPayments')
      } catch (error) {
        toast.error('Error loading payments')
      } finally {
        loading.value = false
      }
    })
    
    return {
      loading,
      showPaymentModal,
      filters,
      filteredPayments,
      formatDate,
      handlePaymentSaved
    }
  }
}
</script>