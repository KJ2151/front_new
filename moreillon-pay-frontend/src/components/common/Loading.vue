<template>
  <div :class="containerClasses">
    <div :class="spinnerClasses">
      <svg class="animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <p v-if="text" :class="textClasses">{{ text }}</p>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Loading',
  props: {
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    text: {
      type: String,
      default: ''
    },
    center: {
      type: Boolean,
      default: false
    },
    fullscreen: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const containerClasses = computed(() => {
      const base = 'flex flex-col items-center justify-center'
      if (props.fullscreen) {
        return `${base} fixed inset-0 bg-white bg-opacity-90 z-50`
      }
      if (props.center) {
        return `${base} py-12`
      }
      return base
    })
    
    const spinnerClasses = computed(() => {
      const sizes = {
        sm: 'h-6 w-6',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-24 w-24'
      }
      return `${sizes[props.size]} text-primary-600`
    })
    
    const textClasses = computed(() => {
      return 'mt-4 text-gray-600 text-sm'
    })
    
    return {
      containerClasses,
      spinnerClasses,
      textClasses
    }
  }
}
</script>