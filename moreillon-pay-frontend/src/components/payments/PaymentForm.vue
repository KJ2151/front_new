<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="$emit('close')">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900">Record Payment</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Invoice Selection (if not provided) -->
        <div v-if="!invoice">
          <label class="block text-sm font-medium text-gray-700 mb-1">Select Invoice *</label>
          <select v-model="form.invoiceId" class="input-field" required>
            <option value="">Choose an invoice...</option>
            <option 
              v-for="inv in unpaidInvoices" 
              :key="inv._id" 
              :value="inv._id"
            >
              #{{ inv.number || inv._id.slice(-6) }} - {{ inv.client?.name }} - ${{ inv.balance?.toLocaleString() }}
            </option>
          </select>
        </div>

        <!-- Invoice Info (if provided) -->
        <div v-else class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-900">{{ invoice.client?.name }}</p>
              <p class="text-sm text-gray-600">Invoice #{{ invoice.number || invoice._id.slice(-6) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Balance Due</p>
              <p class="text-2xl font-bold text-gray-900">${{ invoice.balance?.toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- Payment Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
            <input
              v-model="form.date"
              type="date"
              class="input-field"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
            <input
              v-model.number="form.amount"
              type="number"
              step="0.01"
              min="0.01"
              :max="maxAmount"
              class="input-field"
              required
            />
            <p v-if="maxAmount" class="text-xs text-gray-500 mt-1">
              Max: ${{ maxAmount.toLocaleString() }}
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
          <select v-model="form.method" class="input-field" required>
            <option value="">Select payment method...</option>
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Reference Number</label>
          <input
            v-model="form.reference"
            type="text"
            class="input-field"
            placeholder="Transaction ID, check number, etc."
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="input-field"
            placeholder="Additional payment information"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Recording...' : 'Record Payment' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export default {
  name: 'PaymentForm',
  props: {
    invoice: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'saved'],
  setup(props, { emit }) {
    const store = useStore()
    const toast = useToast()
    const saving = ref(false)
    
    const form = reactive({
      invoiceId: props.invoice?._id || '',
      date: new Date().toISOString().split('T')[0],
      amount: props.invoice?.balance || 0,
      method: '',
      reference: '',
      notes: ''
    })
    
    const unpaidInvoices = computed(() => {
      return store.state.invoices.invoices.filter(inv => 
        inv.status !== 'paid' && (inv.balance || inv.total) > 0
      )
    })
    
    const selectedInvoice = computed(() => {
      if (props.invoice) return props.invoice
      return unpaidInvoices.value.find(inv => inv._id === form.invoiceId)
    })
    
    const maxAmount = computed(() => {
      return selectedInvoice.value?.balance || selectedInvoice.value?.total || null
    })
    
    const handleSubmit = async () => {
      if (form.amount > maxAmount.value) {
        toast.error('Payment amount cannot exceed invoice balance')
        return
      }
      
      saving.value = true
      
      try {
        const paymentData = {
          amount: form.amount,
          date: form.date,
          method: form.method,
          reference: form.reference,
          notes: form.notes
        }
        
        if (props.invoice) {
          await store.dispatch('payments/recordPayment', {
            invoiceId: props.invoice._id,
            paymentData
          })
        } else {
          await store.dispatch('payments/recordPayment', {
            invoiceId: form.invoiceId,
            paymentData
          })
        }
        
        // Refresh invoices
        await store.dispatch('invoices/fetchInvoices')
        
        emit('saved')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error recording payment')
      } finally {
        saving.value = false
      }
    }
    
    onMounted(async () => {
      if (!props.invoice) {
        await store.dispatch('invoices/fetchInvoices')
      }
    })
    
    return {
      saving,
      form,
      unpaidInvoices,
      maxAmount,
      handleSubmit
    }
  }
}
</script>