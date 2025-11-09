<template>
  <div 
    class="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
    @click="$emit('click', invoice)"
  >
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">
          #{{ invoice.number || invoice._id?.slice(-6) }}
        </h3>
        <p class="text-sm text-gray-500">{{ formatDate(invoice.date) }}</p>
      </div>
      <span 
        :class="getStatusClass(invoice.status)" 
        class="px-2 py-1 text-xs font-semibold rounded-full"
      >
        {{ invoice.status }}
      </span>
    </div>

    <div class="mb-4">
      <div class="flex items-center mb-2">
        <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <span class="text-sm font-medium text-gray-900">{{ invoice.client?.name || 'N/A' }}</span>
      </div>
      <div class="flex items-center text-sm text-gray-500">
        <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
        {{ invoice.client?.email || 'N/A' }}
      </div>
    </div>

    <div class="border-t pt-4 mb-4">
      <div class="flex justify-between items-center mb-2">
        <span class="text-sm text-gray-500">Total Amount</span>
        <span class="text-lg font-bold text-gray-900">${{ formatCurrency(invoice.total) }}</span>
      </div>
      <div v-if="invoice.amountPaid > 0" class="flex justify-between items-center mb-2">
        <span class="text-sm text-gray-500">Paid</span>
        <span class="text-sm font-medium text-green-600">-${{ formatCurrency(invoice.amountPaid) }}</span>
      </div>
      <div v-if="invoice.balance > 0" class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-700">Balance Due</span>
        <span class="text-lg font-bold text-red-600">${{ formatCurrency(invoice.balance) }}</span>
      </div>
    </div>

    <div class="border-t pt-4">
      <div class="flex justify-between items-center text-sm text-gray-500 mb-3">
        <span>Due Date</span>
        <span :class="isDueToday || isOverdue ? 'text-red-600 font-semibold' : ''">
          {{ formatDate(invoice.dueDate) }}
        </span>
      </div>

      <div class="flex justify-between items-center space-x-2" @click.stop>
        <button 
          @click="$emit('view', invoice._id)"
          class="flex-1 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
        >
          View
        </button>
        <button 
          @click="$emit('edit', invoice)"
          class="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
        >
          Edit
        </button>
        <button 
          @click="handleDelete"
          class="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          title="Delete"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Overdue Badge -->
    <div v-if="isOverdue" class="absolute top-2 right-2">
      <span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
        OVERDUE
      </span>
    </div>

    <!-- Due Soon Badge -->
    <div v-else-if="isDueSoon" class="absolute top-2 right-2">
      <span class="px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
        DUE SOON
      </span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { format, isToday, isBefore, differenceInDays } from 'date-fns'

export default {
  name: 'InvoiceCard',
  props: {
    invoice: {
      type: Object,
      required: true
    }
  },
  emits: ['click', 'view', 'edit', 'delete'],
  setup(props, { emit }) {
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

    const isDueToday = computed(() => {
      if (!props.invoice.dueDate) return false
      return isToday(new Date(props.invoice.dueDate))
    })

    const isOverdue = computed(() => {
      if (!props.invoice.dueDate || props.invoice.status === 'paid') return false
      return isBefore(new Date(props.invoice.dueDate), new Date())
    })

    const isDueSoon = computed(() => {
      if (!props.invoice.dueDate || props.invoice.status === 'paid') return false
      const daysUntilDue = differenceInDays(new Date(props.invoice.dueDate), new Date())
      return daysUntilDue > 0 && daysUntilDue <= 7
    })

    const handleDelete = () => {
      if (confirm('Are you sure you want to delete this invoice?')) {
        emit('delete', props.invoice._id)
      }
    }

    return {
      formatDate,
      formatCurrency,
      getStatusClass,
      isDueToday,
      isOverdue,
      isDueSoon,
      handleDelete
    }
  }
}
</script>