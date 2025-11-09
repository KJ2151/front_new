<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center py-12">
      <Loading size="lg" text="Loading invoices..." />
    </div>
    
    <div v-else-if="invoices.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No invoices found</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new invoice.</p>
      <div class="mt-6">
        <button @click="$emit('create')" class="btn-primary">
          <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
          </svg>
          Create Invoice
        </button>
      </div>
    </div>

    <div v-else>
      <!-- List View -->
      <div v-if="viewMode === 'list'" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th 
                v-for="column in columns" 
                :key="column.key"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="handleSort(column.key)"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  <svg 
                    v-if="sortKey === column.key"
                    :class="sortOrder === 'asc' ? 'transform rotate-180' : ''"
                    class="w-4 h-4"
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="invoice in sortedInvoices" 
              :key="invoice._id"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
              @click="$emit('select', invoice)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  #{{ invoice.number || invoice._id.slice(-6) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ invoice.client?.name || 'N/A' }}</div>
                <div class="text-sm text-gray-500">{{ invoice.client?.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(invoice.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(invoice.dueDate) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900">
                  ${{ formatCurrency(invoice.total) }}
                </div>
                <div v-if="invoice.balance > 0" class="text-xs text-red-600">
                  Balance: ${{ formatCurrency(invoice.balance) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(invoice.status)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ invoice.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3" @click.stop>
                <button 
                  @click="$emit('view', invoice._id)" 
                  class="text-primary-600 hover:text-primary-900"
                  title="View Invoice"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button 
                  @click="$emit('edit', invoice)" 
                  class="text-blue-600 hover:text-blue-900"
                  title="Edit Invoice"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button 
                  @click="$emit('delete', invoice._id)" 
                  class="text-red-600 hover:text-red-900"
                  title="Delete Invoice"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Grid View -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InvoiceCard
          v-for="invoice in sortedInvoices"
          :key="invoice._id"
          :invoice="invoice"
          @click="$emit('select', invoice)"
          @view="$emit('view', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-700">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
          {{ pagination.total }} results
        </div>
        <div class="flex space-x-2">
          <button
            @click="$emit('page-change', pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="$emit('page-change', page)"
            :class="[
              'px-3 py-1 border rounded-md',
              page === pagination.page ? 'bg-primary-600 text-white' : 'hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
          <button
            @click="$emit('page-change', pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import Loading from '@/components/common/Loading.vue'
import InvoiceCard from './InvoiceCard.vue'

export default {
  name: 'InvoiceList',
  components: {
    Loading,
    InvoiceCard
  },
  props: {
    invoices: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    viewMode: {
      type: String,
      default: 'list',
      validator: (value) => ['list', 'grid'].includes(value)
    },
    pagination: {
      type: Object,
      default: null
    }
  },
  emits: ['select', 'view', 'edit', 'delete', 'create', 'page-change'],
  setup(props) {
    const sortKey = ref('date')
    const sortOrder = ref('desc')

    const columns = [
      { key: 'number', label: 'Invoice #' },
      { key: 'client', label: 'Client' },
      { key: 'date', label: 'Date' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'total', label: 'Amount' },
      { key: 'status', label: 'Status' }
    ]

    const sortedInvoices = computed(() => {
      const invoicesCopy = [...props.invoices]
      
      return invoicesCopy.sort((a, b) => {
        let aVal = a[sortKey.value]
        let bVal = b[sortKey.value]

        // Handle nested properties
        if (sortKey.value === 'client') {
          aVal = a.client?.name || ''
          bVal = b.client?.name || ''
        }

        // Handle dates
        if (sortKey.value === 'date' || sortKey.value === 'dueDate') {
          aVal = new Date(aVal).getTime()
          bVal = new Date(bVal).getTime()
        }

        // Handle strings
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal?.toLowerCase() || ''
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
        return sortOrder.value === 'asc' ? comparison : -comparison
      })
    })

    const visiblePages = computed(() => {
      if (!props.pagination) return []
      
      const total = props.pagination.totalPages
      const current = props.pagination.page
      const delta = 2
      const pages = []

      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        pages.push(i)
      }

      if (current - delta > 2) {
        pages.unshift('...')
      }
      if (current + delta < total - 1) {
        pages.push('...')
      }

      pages.unshift(1)
      if (total > 1) {
        pages.push(total)
      }

      return pages
    })

    const handleSort = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortKey.value = key
        sortOrder.value = 'asc'
      }
    }

    const formatDate = (date) => {
      if (!date) return 'N/A'
      return format(new Date(date), 'MMM dd, yyyy')
    }

    const formatCurrency = (amount) => {
      if (!amount) return '0.00'
      return Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
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

    return {
      columns,
      sortKey,
      sortOrder,
      sortedInvoices,
      visiblePages,
      handleSort,
      formatDate,
      formatCurrency,
      getStatusClass
    }
  }
}
</script>