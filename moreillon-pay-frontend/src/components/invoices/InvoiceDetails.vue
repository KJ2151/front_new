<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 text-white">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-bold mb-2">INVOICE</h1>
          <p class="text-primary-100">Invoice #{{ invoice.number || invoice._id?.slice(-6) }}</p>
        </div>
        <div class="text-right">
          <span 
            :class="getStatusBadgeClass(invoice.status)" 
            class="px-4 py-2 rounded-full text-sm font-bold"
          >
            {{ invoice.status?.toUpperCase() }}
          </span>
        </div>
      </div>
    </div>

    <div class="p-8">
      <!-- Company & Client Info -->
      <div class="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">From</h3>
          <div class="text-gray-900">
            <p class="font-bold text-lg">{{ companyInfo.name || 'Your Company' }}</p>
            <p class="text-sm text-gray-600">{{ companyInfo.address }}</p>
            <p class="text-sm text-gray-600">{{ companyInfo.email }}</p>
            <p class="text-sm text-gray-600">{{ companyInfo.phone }}</p>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
          <div class="text-gray-900">
            <p class="font-bold text-lg">{{ invoice.client?.name }}</p>
            <p class="text-sm text-gray-600">{{ invoice.client?.address }}</p>
            <p class="text-sm text-gray-600">{{ invoice.client?.email }}</p>
            <p class="text-sm text-gray-600">{{ invoice.client?.phone }}</p>
          </div>
        </div>
      </div>

      <!-- Invoice Details -->
      <div class="grid grid-cols-3 gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Invoice Date</p>
          <p class="text-gray-900 font-medium">{{ formatDate(invoice.date) }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Due Date</p>
          <p :class="getDueDateClass" class="font-medium">{{ formatDate(invoice.dueDate) }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Payment Terms</p>
          <p class="text-gray-900 font-medium">{{ paymentTerms }}</p>
        </div>
      </div>

      <!-- Line Items -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Items</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b-2 border-gray-300">
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Qty</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Rate</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="(item, index) in invoice.items" :key="index" class="hover:bg-gray-50">
                <td class="px-4 py-4">
                  <p class="text-gray-900 font-medium">{{ item.description }}</p>
                  <p v-if="item.details" class="text-sm text-gray-500">{{ item.details }}</p>
                </td>
                <td class="px-4 py-4 text-center text-gray-700">{{ item.quantity }}</td>
                <td class="px-4 py-4 text-right text-gray-700">${{ formatCurrency(item.rate) }}</td>
                <td class="px-4 py-4 text-right font-semibold text-gray-900">
                  ${{ formatCurrency(item.quantity * item.rate) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals -->
      <div class="flex justify-end mb-8">
        <div class="w-80">
          <div class="space-y-3">
            <div class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Subtotal:</span>
              <span class="font-semibold text-gray-900">${{ formatCurrency(invoice.subtotal) }}</span>
            </div>
            
            <div v-if="invoice.discount > 0" class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Discount {{ invoice.discountRate ? `(${invoice.discountRate}%)` : '' }}:</span>
              <span class="font-semibold text-green-600">-${{ formatCurrency(invoice.discount) }}</span>
            </div>
            
            <div v-if="invoice.tax > 0" class="flex justify-between py-2 border-b">
              <span class="text-gray-600">Tax {{ invoice.taxRate ? `(${invoice.taxRate}%)` : '' }}:</span>
              <span class="font-semibold text-gray-900">${{ formatCurrency(invoice.tax) }}</span>
            </div>
            
            <div class="flex justify-between py-3 border-t-2 border-gray-300">
              <span class="text-lg font-bold text-gray-900">Total:</span>
              <span class="text-2xl font-bold text-primary-600">${{ formatCurrency(invoice.total) }}</span>
            </div>
            
            <div v-if="invoice.amountPaid > 0" class="flex justify-between py-2 bg-green-50 px-3 rounded">
              <span class="text-green-700 font-medium">Amount Paid:</span>
              <span class="font-semibold text-green-700">-${{ formatCurrency(invoice.amountPaid) }}</span>
            </div>
            
            <div v-if="invoice.balance > 0" class="flex justify-between py-3 bg-red-50 px-3 rounded">
              <span class="text-lg font-bold text-red-700">Balance Due:</span>
              <span class="text-2xl font-bold text-red-700">${{ formatCurrency(invoice.balance) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes & Terms -->
      <div v-if="invoice.notes || invoice.terms" class="border-t pt-6 space-y-4">
        <div v-if="invoice.notes">
          <h3 class="text-sm font-semibold text-gray-700 uppercase mb-2">Notes</h3>
          <p class="text-gray-600 whitespace-pre-line">{{ invoice.notes }}</p>
        </div>
        
        <div v-if="invoice.terms">
          <h3 class="text-sm font-semibold text-gray-700 uppercase mb-2">Terms & Conditions</h3>
          <p class="text-gray-600 text-sm whitespace-pre-line">{{ invoice.terms }}</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 pt-6 border-t text-center text-sm text-gray-500">
        <p>Thank you for your business!</p>
        <p v-if="companyInfo.website" class="mt-1">{{ companyInfo.website }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { format, differenceInDays, isBefore } from 'date-fns'

export default {
  name: 'InvoiceDetails',
  props: {
    invoice: {
      type: Object,
      required: true
    },
    companyInfo: {
      type: Object,
      default: () => ({
        name: 'Your Company',
        address: '',
        email: '',
        phone: '',
        website: ''
      })
    }
  },
  setup(props) {
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return format(new Date(date), 'MMMM dd, yyyy')
    }

    const formatCurrency = (amount) => {
      if (!amount) return '0.00'
      return Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }

    const paymentTerms = computed(() => {
      if (!props.invoice.date || !props.invoice.dueDate) return 'N/A'
      const days = differenceInDays(new Date(props.invoice.dueDate), new Date(props.invoice.date))
      return `Net ${days} days`
    })

    const getDueDateClass = computed(() => {
      if (!props.invoice.dueDate || props.invoice.status === 'paid') return 'text-gray-900'
      
      const isOverdue = isBefore(new Date(props.invoice.dueDate), new Date())
      return isOverdue ? 'text-red-600 font-bold' : 'text-gray-900'
    })

    const getStatusBadgeClass = (status) => {
      const classes = {
        paid: 'bg-green-500 text-white',
        pending: 'bg-yellow-500 text-white',
        sent: 'bg-blue-500 text-white',
        draft: 'bg-gray-500 text-white',
        overdue: 'bg-red-500 text-white'
      }
      return classes[status] || classes.draft
    }

    return {
      formatDate,
      formatCurrency,
      paymentTerms,
      getDueDateClass,
      getStatusBadgeClass
    }
  }
}
</script>