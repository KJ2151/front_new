<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="$emit('close')">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-gray-900">
          {{ invoice ? 'Edit Invoice' : 'Create New Invoice' }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Client Information -->
        <div class="border-b pb-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Client Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
              <input
                v-model="form.client.name"
                type="text"
                class="input-field"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="form.client.email"
                type="email"
                class="input-field"
                required
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                v-model="form.client.address"
                type="text"
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                v-model="form.client.phone"
                type="tel"
                class="input-field"
              />
            </div>
          </div>
        </div>

        <!-- Invoice Details -->
        <div class="border-b pb-6">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input
                v-model="form.number"
                type="text"
                class="input-field"
                placeholder="Auto-generated"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Date *</label>
              <input
                v-model="form.date"
                type="date"
                class="input-field"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                v-model="form.dueDate"
                type="date"
                class="input-field"
                required
              />
            </div>
          </div>
        </div>

        <!-- Line Items -->
        <div class="border-b pb-6">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-gray-900">Line Items</h4>
            <button type="button" @click="addItem" class="btn-secondary text-sm">
              <svg class="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
              </svg>
              Add Item
            </button>
          </div>

          <div class="space-y-3">
            <div v-for="(item, index) in form.items" :key="index" class="flex gap-2 items-start">
              <div class="flex-1">
                <input
                  v-model="item.description"
                  type="text"
                  placeholder="Description"
                  class="input-field"
                  required
                />
              </div>
              <div class="w-24">
                <input
                  v-model.number="item.quantity"
                  type="number"
                  placeholder="Qty"
                  class="input-field"
                  min="1"
                  required
                  @input="calculateTotals"
                />
              </div>
              <div class="w-32">
                <input
                  v-model.number="item.rate"
                  type="number"
                  placeholder="Rate"
                  class="input-field"
                  step="0.01"
                  min="0"
                  required
                  @input="calculateTotals"
                />
              </div>
              <div class="w-32">
                <input
                  :value="(item.quantity * item.rate).toFixed(2)"
                  type="text"
                  class="input-field bg-gray-50"
                  readonly
                />
              </div>
              <button
                type="button"
                @click="removeItem(index)"
                class="mt-2 text-red-600 hover:text-red-800"
                :disabled="form.items.length === 1"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="flex justify-end">
          <div class="w-80 space-y-3">
            <div class="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span class="font-semibold">${{ form.subtotal.toFixed(2) }}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <label class="text-gray-700">Tax Rate (%):</label>
              <input
                v-model.number="form.taxRate"
                type="number"
                class="input-field w-24 text-right"
                step="0.01"
                min="0"
                max="100"
                @input="calculateTotals"
              />
            </div>
            
            <div class="flex justify-between text-gray-700">
              <span>Tax:</span>
              <span class="font-semibold">${{ form.tax.toFixed(2) }}</span>
            </div>
            
            <div class="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t">
              <span>Total:</span>
              <span>${{ form.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="input-field"
            placeholder="Additional notes or payment instructions"
          ></textarea>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="form.status" class="input-field">
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useToast } from 'vue-toastification'

export default {
  name: 'InvoiceForm',
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
      number: '',
      client: {
        name: '',
        email: '',
        address: '',
        phone: ''
      },
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          description: '',
          quantity: 1,
          rate: 0
        }
      ],
      subtotal: 0,
      taxRate: 0,
      tax: 0,
      total: 0,
      notes: '',
      status: 'draft'
    })
    
    const calculateTotals = () => {
      form.subtotal = form.items.reduce((sum, item) => {
        return sum + (item.quantity * item.rate)
      }, 0)
      
      form.tax = (form.subtotal * form.taxRate) / 100
      form.total = form.subtotal + form.tax
    }
    
    const addItem = () => {
      form.items.push({
        description: '',
        quantity: 1,
        rate: 0
      })
    }
    
    const removeItem = (index) => {
      if (form.items.length > 1) {
        form.items.splice(index, 1)
        calculateTotals()
      }
    }
    
    const handleSubmit = async () => {
      saving.value = true
      
      try {
        const invoiceData = {
          number: form.number,
          client: form.client,
          date: form.date,
          dueDate: form.dueDate,
          items: form.items,
          subtotal: form.subtotal,
          taxRate: form.taxRate,
          tax: form.tax,
          total: form.total,
          notes: form.notes,
          status: form.status
        }
        
        if (props.invoice) {
          await store.dispatch('invoices/updateInvoice', {
            id: props.invoice._id,
            data: invoiceData
          })
        } else {
          await store.dispatch('invoices/createInvoice', invoiceData)
        }
        
        emit('saved')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error saving invoice')
      } finally {
        saving.value = false
      }
    }
    
    // Load invoice data if editing
    onMounted(() => {
      if (props.invoice) {
        form.number = props.invoice.number || ''
        form.client = { ...props.invoice.client }
        form.date = props.invoice.date ? new Date(props.invoice.date).toISOString().split('T')[0] : form.date
        form.dueDate = props.invoice.dueDate ? new Date(props.invoice.dueDate).toISOString().split('T')[0] : form.dueDate
        form.items = props.invoice.items || form.items
        form.taxRate = props.invoice.taxRate || 0
        form.notes = props.invoice.notes || ''
        form.status = props.invoice.status || 'draft'
        calculateTotals()
      }
    })
    
    watch(() => form.items, () => {
      calculateTotals()
    }, { deep: true })
    
    return {
      saving,
      form,
      calculateTotals,
      addItem,
      removeItem,
      handleSubmit
    }
  }
}
</script>