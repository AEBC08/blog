<script setup lang="ts">
interface Props {
  code?: string
  language?: string | null
  filename?: string | null
  highlights?: unknown[]
  meta?: string | null
  class?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  code: '',
  language: null,
  filename: null,
  highlights: () => [],
  meta: null,
  class: null,
})

const preRef = ref<HTMLElement | null>(null)
const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

function fallbackCopy(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  textarea.remove()

  return ok
}

async function copyCode(): Promise<void> {
  const text = preRef.value?.querySelector('code')?.textContent ?? props.code

  if (!text) {
    return
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    }
    else {
      fallbackCopy(text)
    }
  }
  catch {
    fallbackCopy(text)
  }

  copied.value = true

  if (resetTimer) {
    clearTimeout(resetTimer)
  }

  resetTimer = setTimeout(() => {
    copied.value = false
  }, 1600)
}

onBeforeUnmount(() => {
  if (resetTimer) {
    clearTimeout(resetTimer)
  }
})
</script>

<template>
  <div class="prose-code">
    <pre ref="preRef" :class="props.class"><slot /></pre>
    <button
      type="button"
      class="prose-copy"
      :class="{ 'is-copied': copied }"
      :aria-label="copied ? '已复制' : '复制代码'"
      :title="copied ? '已复制' : '复制代码'"
      @click="copyCode"
    >
      <Icon v-if="!copied" name="miuix:Copy" :size="16" />
      <Icon v-else name="miuix:Ok" :size="16" />
    </button>
  </div>
</template>
