<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="getHeaderClasses(column)"
            @click="handleSort(column)"
          >
            <div class="flex items-center">
              {{ column.label }}
              <svg
                v-if="column.sortable && sortBy === column.key"
                :class="sortDirection === 'asc' ? 'transform rotate-180' : ''"
                class="ml-2 h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="(row, index) in sortedData"
          :key="index"
          class="hover:bg-gray-50"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="getCellClasses(column)"
          >
            <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
              {{ row[column.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-if="!data || data.length === 0" class="text-center py-12">
      <slot name="empty">
        <p class="text-gray-500">No data available</p>
      </slot>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'Table',
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const sortBy = ref('')
    const sortDirection = ref('asc')
    
    const sortedData = computed(() => {
      if (!sortBy.value) return props.data
      
      return [...props.data].sort((a, b) => {
        let aVal = a[sortBy.value]
        let bVal = b[sortBy.value]
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase()
          bVal = bVal.toLowerCase()
        }
        
        if (sortDirection.value === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
    })
    
    const handleSort = (column) => {
      if (!column.sortable) return
      
      if (sortBy.value === column.key) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = column.key
        sortDirection.value = 'asc'
      }
    }
    
    const getHeaderClasses = (column) => {
      const base = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
      const sortable = column.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''
      return `${base} ${sortable}`
    }
    
    const getCellClasses = (column) => {
      const base = 'px-6 py-4 whitespace-nowrap text-sm'
      const align = column.align === 'right' ? 'text-right' : 'text-left'
      return `${base} ${align}`
    }
    
    return {
      sortBy,
      sortDirection,
      sortedData,
      handleSort,
      getHeaderClasses,
      getCellClasses
    }
  }
}
</script>