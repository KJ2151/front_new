<template>
  <div>
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="invoice">
      <!-- Header -->
      <div class="mb-6 flex justify-between items-start">
        <div>
          <button @click="$router.back()" class="text-gray-600 hover:text-gray-900 mb-2 flex items-center">
            <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </button>
          <h1 class="text-3xl font-bold text-gray-900">Invoice {{ invoice.number || invoice._id.slice(-6) }}</h1>
          <p class="text-gray-600 mt-2">Created on {{ formatDate(invoice.createdAt) }}</p>
        </div>
        <div class="flex space-x-2">
          <button @click="downloadPDF" class="btn-secondary">
            <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Download PDF
          </button>
          <button @click="sendInvoice" class="btn-primary" :disabled="sending">
            <svg class="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            {{ sending ? 'Sending...' : 'Send Invoice' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Invoice Details -->
        <div class="lg:col-span-2">
          <div class="card mb-6">
            <div class="border-b pb-4 mb-4">
              <div class="flex justify-between items-start">
                <div>
                  <h2 class="text-2xl font-bold text-gray-900">INVOICE</h2>
                  <p class="text-gray-600">#{{ invoice.number || invoice._id.slice(-6) }}</p>
                </div>
                <span :class="getStatusClass(invoice.status)" class="px-3 py-1 text-sm font-semibold rounded-full">
                  {{ invoice.status?.toUpperCase() }}
                </span>
              </div>
            </div>

            <!-- Client Info -->
            <div class="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-sm font-semibold text-gray-500 mb-2">BILL TO</h3>
                <p class="font-semibold text-gray-900">{{ invoice.client?.name }}</p>
                <p class="text-gray-600">{{ invoice.client?.email }}</p>
                <p class="text-gray-600">{{ invoice.client?.address }}</p>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-gray-500 mb-2">INVOICE DETAILS</h3>
                <div class="space-y-1">
                  <p class="text-gray-600">
                    <span class="font-medium">Date:</span> {{ formatDate(invoice.date) }}
                  </p>
                  <p class="text-gray-600">
                    <span class="font-medium">Due Date:</span> {{ formatDate(invoice.dueDate) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <div class="overflow-x-auto mb-6">
              <table class="min-w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="(item, index) in invoice.items" :key="index">
                    <td class="px-4 py-3 text-gray-900">{{ item.description }}</td>
                    <td class="px-4 py-3 text-right text-gray-600">{{ item.quantity }}</td>
                    <td class="px-4 py-3 text-right text-gray-600">${{ item.rate?.toLocaleString() }}</td>
                    <td class="px-4 py-3 text-right font-medium text-gray-900">${{ (item.quantity * item.rate).toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Totals -->
            <div class="flex justify-end">
              <div class="w-64 space-y-2">
                <div class="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${{ invoice.subtotal?.toLocaleString() }}</span>
                </div>
                <div v-if="invoice.tax" class="flex justify-between text-gray-600">
                  <span>Tax ({{ invoice.taxRate }}%):</span>
                  <span>${{ invoice.tax?.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                  <span>Total:</span>
                  <span>${{ invoice.total?.toLocaleString() }}</span>
                </div>
                <div v-if="invoice.amountPaid > 0" class="flex justify-between text-green-600">
                  <span>Paid:</span>
                  <span>-${{ invoice.amountPaid?.toLocaleString() }}</span>
                </div>
                <div v-if="invoice.balance > 0" class="flex justify-between text-lg font-bold text-red-600 pt-2 border-t">
                  <span>Balance Due:</span>
                  <span>${{ invoice.balance?.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="invoice.notes" class="mt-6 pt-6 border-t">
              <h3 class="text-sm font-semibold text-gray-500 mb-2">NOTES</h3>
              <p class="text-gray-600">{{ invoice.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Payment History -->
          <div class="card">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
            <div v-if="invoice.payments && invoice.payments.length > 0" class="space-y-3">
              <div 
                v-for="payment in invoice.payments" 
                :key="payment._id"
                class="p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex justify-between items-start mb-1">
                  <span class="font-semibold text-gray-900">${{ payment.amount?.toLocaleString() }}</span>
                  <span class="text-xs text-gray-500">{{ formatDate(payment.date) }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ payment.method }}</p>
                <p v-if="payment.notes" class="text-xs text-gray-500 mt-1">{{ payment.notes }}</p>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-500">
              No payments recorded
            </div>
            <button 
              v-if="invoice.balance > 0"
              @click="showPaymentModal = true"
              class="mt-4 w-full btn-primary"
            >
              Record Payment
            </button>
          </div>

          <!-- Actions -->
          <div class="card">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Actions</h3>
            <div class="space-y-2">
              <button @click="editInvoice" class="w-full btn-secondary text-left">
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Invoice
              </button>
              <button @click="duplicateInvoice" class="w-full btn-secondary text-left">
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Duplicate
              </button>
              <button @click="deleteInvoice" class="w-full btn-danger text-left">
                <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Modal -->
    <PaymentForm
      v-if="showPaymentModal"
      :invoice="invoice"
      @close="showPaymentModal = false"
      @saved="handlePaymentRecorded"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import PaymentForm from '@/components/payments/PaymentForm.vue'

export default {
  name: 'InvoiceDetail',
  components: {
    PaymentForm
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const toast = useToast()
    
    const loading = ref(true)
    const sending = ref(false)
    const showPaymentModal = ref(false)
    
    const invoice = computed(() => store.state.invoices.currentInvoice)
    
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return format(new Date(date), 'MMM dd, yyyy')
    }
    
    const getStatusClass = (status) => {
      const classes = {
        paid: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        sent: 'bg-blue-100 text-blue-800',
        draft: 'bg-gray-100 text-gray-800',
        overdue: 'bg-red-100 text-red-800'
      }
      return classes[status] || classes.draft
    }
    
    const downloadPDF = async () => {
      try {
        // Implement PDF download
        toast.info('PDF download feature coming soon')
      } catch (error) {
        toast.error('Error downloading PDF')
      }
    }
    
    const sendInvoice = async () => {
      sending.value = true
      try {
        await store.dispatch('invoices/sendInvoice', invoice.value._id)
        toast.success('Invoice sent successfully')
        await loadInvoice()
      } catch (error) {
        toast.error('Error sending invoice')
      } finally {
        sending.value = false
      }
    }
    
    const editInvoice = () => {
      router.push(`/invoices?edit=${invoice.value._id}`)
    }
    
    const duplicateInvoice = () => {
      router.push(`/invoices?duplicate=${invoice.value._id}`)
    }
    
    const deleteInvoice = async () => {
      if (!confirm('Are you sure you want to delete this invoice?')) return
      
      try {
        await store.dispatch('invoices/deleteInvoice', invoice.value._id)
        toast.success('Invoice deleted successfully')
        router.push('/invoices')
      } catch (error) {
        toast.error('Error deleting invoice')
      }
    }
    
    const handlePaymentRecorded = async () => {
      showPaymentModal.value = false
      toast.success('Payment recorded successfully')
      await loadInvoice()
    }
    
    const loadInvoice = async () => {
      loading.value = true
      try {
        await store.dispatch('invoices/fetchInvoice', route.params.id)
      } catch (error) {
        toast.error('Error loading invoice')
        router.push('/invoices')
      } finally {
        loading.value = false
      }
    }
    
    onMounted(loadInvoice)
    
    return {
      loading,
      sending,
      showPaymentModal,
      invoice,
      formatDate,
      getStatusClass,
      downloadPDF,
      sendInvoice,
      editInvoice,
      duplicateInvoice,
      deleteInvoice,
      handlePaymentRecorded
    }
  }
}
</script>