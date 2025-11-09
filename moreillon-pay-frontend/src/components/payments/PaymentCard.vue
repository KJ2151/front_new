<template>
  <div class="card hover:shadow-lg transition-shadow duration-200">
    <div class="flex justify-between items-start mb-4">
      <div>
        <div class="flex items-center space-x-2 mb-2">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-sm font-medium text-gray-500">Payment Received</span>
        </div>
        <p class="text-3xl font-bold text-green-600">${{ formatCurrency(payment.amount) }}</p>
      </div>
      <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
        {{ payment.method || 'N/A' }}
      </span>
    </div>

    <div class="space-y-3 mb-4">
      <!-- Date -->
      <div class="flex items-center text-sm">
        <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <span class="text-gray-600">{{ formatDate(payment.date) }}</span>
      </div>

      <!-- Invoice -->
      <div class="flex items-center text-sm">
        <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <router-link 
          v-if="payment.invoice"
          :to="`/invoices/${getInvoiceId}`"
          class="text-primary-600 hover:text-primary-900 font-medium"
        >
          Invoice #{{ getInvoiceNumber }}
        </router-link>
        <span v-else class="text-gray-500">No invoice</span>
      </div>

      <!-- Client -->
      <div class="flex items-center text-sm">
        <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <span class="text-gray-600">{{ clientName }}</span>
      </div>

      <!-- Reference -->
      <div v-if="payment.reference" class="flex items-center text-sm">
        <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
        <span class="text-gray-600 truncate" :title="payment.reference">
          Ref: {{ payment.reference }}
        </span>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="payment.notes" class="mb-4 p-3 bg-gray-50 rounded-lg">
      <p class="text-xs font-medium text-gray-500 uppercase mb-1">Notes</p>
      <p class="text-sm text-gray-700 line-clamp-2">{{ payment.notes }}</p>
    </div>

    <!-- Actions -->
    <div class="flex justify-between items-center pt-4 border-t">
      <button 
        @click="$emit('view', payment)"
        class="flex-1 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium mr-2"
      >
        View Details
      </button>
      <button 
        v-if="allowDelete"
        @click="handleDelete"
        class="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
        title="Delete Payment"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
    </div>

    <!-- Success Badge -->
    <div 