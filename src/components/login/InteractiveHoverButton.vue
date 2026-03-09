<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

interface Props {
  text?: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Button',
  className: '',
  type: 'button',
  disabled: false,
});

defineEmits(['click']);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="cn(
      'group relative w-full cursor-pointer overflow-hidden rounded-full border bg-background px-6 py-2 text-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )"
    @click="$emit('click', $event)"
  >
    <span class="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
      <slot>{{ text }}</slot>
    </span>
    <div class="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-primary text-primary-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 rounded-full">
      <span><slot>{{ text }}</slot></span>
      <slot name="icon">
        <ArrowRight class="h-4 w-4" />
      </slot>
    </div>
  </button>
</template>
