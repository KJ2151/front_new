<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="border-b border-gray-200 px-6 py-4">
      <slot name="header"></slot>
    </div>
    <div :class="bodyClasses">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="border-t border-gray-200 px-6 py-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Card',
  props: {
    padding: {
      type: String,
      default: 'normal',
      validator: (value) => ['none', 'sm', 'normal', 'lg'].includes(value)
    },
    shadow: {
      type: String,
      default: 'md',
      validator: (value) => ['none', 'sm', 'md', 'lg', 'xl'].includes(value)
    }
  },
  setup(props) {
    const cardClasses = computed(() => {
      const base = 'bg-white rounded-lg'
      const shadows = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl'
      }
      return `${base} ${shadows[props.shadow]}`
    })
    
    const bodyClasses = computed(() => {
      const paddings = {
        none: '',
        sm: 'p-4',
        normal: 'p-6',
        lg: 'p-8'
      }
      return paddings[props.padding]
    })
    
    return {
      cardClasses,
      bodyClasses
    }
  }
}
</script>