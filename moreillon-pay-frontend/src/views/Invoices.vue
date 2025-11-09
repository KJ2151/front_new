<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Invoices</h1>
        <p class="text-gray-600 mt-2">Manage your invoices and billing</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary">
        <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
        </svg>
        Create Invoice
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search invoices..."
            class="input-field"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.status" class="input-field">
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
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

    <!-- Invoice List -->
    <div class="card">
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else-if="filteredInvoices.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
        <div class="mt-6">
          <button @click="showCreateModal = true" class="btn-primary">
            Create Invoice
          </button>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="invoice in filteredInvoices" :key="invoice._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ invoice.number || invoice._id.slice(-6) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ invoice.client?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(invoice.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(invoice.dueDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                ${{ invoice.total?.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(invoice.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ invoice.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button @click="viewInvoice(invoice._id)" class="text-primary-600 hover:text-primary-900">
                  View
                </button>
                <button @click="editInvoice(invoice)" class="text-blue-600 hover:text-blue-900">
                  Edit
                </button>
                <button @click="deleteInvoice(invoice._id)" class="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Invoice Modal -->
    <InvoiceForm 
      v-if="showCreateModal"
      :invoice="selectedInvoice"
      @close="closeModal"
      @saved="handleInvoiceSaved"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { format } from 'date-fns'
import InvoiceForm from '@/components/invoices/InvoiceForm.vue'

export default {
  name: 'Invoices',
  components: {
    InvoiceForm
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const toast = useToast()
    
    const loading = ref(true)
    const showCreateModal = ref(false)
    const selectedInvoice = ref(null)
    
    const filters = ref({
      search: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    })
    
    const invoices = computed(() => store.state.invoices.invoices)
    
    const filteredInvoices = computed(() => {
      let result = [...invoices.value]
      
      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(inv => 
          inv.number?.toLowerCase().includes(search) ||
          inv.client?.name?.toLowerCase().includes(search)
        )
      }
      
      if (filters.value.status) {
        result = result.filter(inv => inv.status === filters.value.status)
      }
      
      if (filters.value.dateFrom) {
        result = result.filter(inv => new Date(inv.date) >= new Date(filters.value.dateFrom))
      }
      
      if (filters.value.dateTo) {
        result = result.filter(inv => new Date(inv.date) <= new Date(filters.value.dateTo))
      }
      
      return result
    })
    
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
    
    const viewInvoice = (id) => {
      router.push(`/invoices/${id}`)
    }
    
    const editInvoice = (invoice) => {
      selectedInvoice.value = invoice
      showCreateModal.value = true
    }
    
    const deleteInvoice = async (id) => {
      if (!confirm('Are you sure you want to delete this invoice?')) return
      
      try {
        await store.dispatch('invoices/deleteInvoice', id)
        toast.success('Invoice deleted successfully')
      } catch (error) {
        toast.error('Error deleting invoice')
      }
    }
    
    const closeModal = () => {
      showCreateModal.value = false
      selectedInvoice.value = null
    }
    
    const handleInvoiceSaved = () => {
      closeModal()
      toast.success('Invoice saved successfully')
    }
    
    onMounted(async () => {
      try {
        await store.dispatch('invoices/fetchInvoices')
      } catch (error) {
        toast.error('Error loading invoices')
      } finally {
        loading.value = false
      }
    })
    
    return {
      loading,
      showCreateModal,
      selectedInvoice,
      filters,
      filteredInvoices,
      formatDate,
      getStatusClass,
      viewInvoice,
      editInvoice,
      deleteInvoice,
      closeModal,
      handleInvoiceSaved
    }
  }
}
</script>