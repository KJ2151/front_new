<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center py-12">
      <Loading size="lg" text="Loading payments..." />
    </div>
    
    <div v-else-if="payments.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
      <p class="mt-1 text-sm text-gray-500">Start by recording a payment.</p>
      <div class="mt-6">
        <button @click="$emit('create')" class="btn-primary">
          <svg class="w-5 h-5 inline-block mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"></path>
          </svg>
          Record Payment
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
              v-for="payment in sortedPayments" 
              :key="payment._id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatDate(payment.date) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ formatTime(payment.createdAt) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <router-link 
                  v-if="payment.invoice"
                  :to="`/invoices/${payment.invoice._id || payment.invoice}`"
                  class="text-sm text-primary-600 hover:text-primary-900 font-medium"
                >
                  #{{ getInvoiceNumber(payment.invoice) }}
                </router-link>
                <span v-else class="text-sm text-gray-500">N/A</span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ getClientName(payment) }}</div>
                <div class="text-xs text-gray-500">{{ getClientEmail(payment) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-green-600">
                  ${{ formatCurrency(payment.amount) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ payment.method || 'N/A' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-600 max-w-xs truncate" :title="payment.notes">
                  {{ payment.notes || '-' }}
                </div>
                <div v-if="payment.reference" class="text-xs text-gray-400">
                  Ref: {{ payment.reference }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" @click.stop>
                <button 
                  @click="$emit('view', payment)" 
                  class="text-primary-600 hover:text-primary-900 mr-3"
                  title="View Details"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </button>
                <button 
                  v-if="allowDelete"
                  @click="handleDelete(payment)" 
                  class="text-red-600 hover:text-red-900"
                  title="Delete Payment"
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
        <PaymentCard
          v-for="payment in sortedPayments"
          :key="payment._id"
          :payment="payment"
          :allow-delete="allowDelete"
          @view="$emit('view', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>

      <!-- Summary -->
      <div v-if="showSummary" class="mt-6 bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p class="text-sm text-gray-500">Total Payments</p>
            <p class="text-2xl font-bold text-gray-900">{{ payments.length }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Amount</p>
            <p class="text-2xl font-bold text-green-600">${{ formatCurrency(totalAmount) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Average Payment</p>
            <p class="text-2xl font-bold text-blue-600">${{ formatCurrency(averagePayment) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import Loading from '@/components/common/Loading.vue'
import PaymentCard from './PaymentCard.vue'

export default {
  name: 'PaymentList',
  components: {
    Loading,
    PaymentCard
  },
  props: {
    payments: {
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
    allowDelete: {
      type: Boolean,
      default: true
    },
    showSummary: {
      type: Boolean,
      default: false
    }
  },
  emits: ['view', 'delete', 'create'],
  setup(props, { emit }) {
    const sortKey = ref('date')
    const sortOrder = ref('desc')

    const columns = [
      { key: 'date', label: 'Date' },
      { key: 'invoice', label: 'Invoice' },
      { key: 'client', label: 'Client' },
      { key: 'amount', label: 'Amount' },
      { key: 'method', label: 'Method' },
      { key: 'notes', label: 'Notes' }
    ]

    const sortedPayments = computed(() => {
      const paymentsCopy = [...props.payments]
      
      return paymentsCopy.sort((a, b) => {
        let aVal = a[sortKey.value]
        let bVal = b[sortKey.value]

        // Handle nested properties
        if (sortKey.value === 'client') {
          aVal = a.invoice?.client?.name || ''
          bVal = b.invoice?.client?.name || ''
        }

        // Handle dates
        if (sortKey.value === 'date') {
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

    const totalAmount = computed(() => {
      return props.payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
    })

    const averagePayment = computed(() => {
      if (props.payments.length === 0) return 0
      return totalAmount.value / props.payments.length
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

    const formatTime = (date) => {
      if (!date) return ''
      return format(new Date(date), 'HH:mm')
    }

    const formatCurrency = (amount) => {
      if (!amount) return '0.00'
      return Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    const getInvoiceNumber = (invoice) => {
      if (!invoice) return 'N/A'
      if (typeof invoice === 'object') {
        return invoice.number || invoice._id?.slice(-6) || 'N/A'
      }
      return invoice.slice(-6)
    }

    const getClientName = (payment) => {
      return payment.invoice?.client?.name || payment.client?.name || 'N/A'
    }

    const getClientEmail = (payment) => {
      return payment.invoice?.client?.email || payment.client?.email || ''
    }

    const handleDelete = (payment) => {
      if (confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
        emit('delete', payment._id)
      }
    }

    return {
      columns,
      sortKey,
      sortOrder,
      sortedPayments,
      totalAmount,
      averagePayment,
      handleSort,
      formatDate,
      formatTime,
      formatCurrency,
      getInvoiceNumber,
      getClientName,
      getClientEmail,
      handleDelete
    }
  }
}
</script>