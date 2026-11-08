<script lang="ts">
import type { VNode } from 'vue'
import { MiuixCheckbox } from 'miuix-vue'
import { defineComponent, h } from 'vue'

interface CheckboxInputProps {
  type?: string
  checked?: unknown
}

/**
 * GFM task lists arrive as `<input type="checkbox" disabled>`. Replacing that
 * node with MiuixCheckbox keeps Markdown output visually identical to the rest
 * of the miuix UI without changing the Markdown source.
 */
export default defineComponent({
  name: 'ProseLi',
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return (): VNode => {
      const children = slots.default?.() ?? []
      const normalized = children.map((child): VNode => {
        if (typeof child.type === 'string' && child.type === 'input') {
          const inputProps = child.props as CheckboxInputProps | null

          if (inputProps?.type === 'checkbox') {
            return h(MiuixCheckbox, {
              modelValue: inputProps.checked !== undefined && inputProps.checked !== false && inputProps.checked !== null,
              disabled: true,
              class: 'prose-task-checkbox',
            })
          }
        }

        return child
      })

      return h('li', attrs, normalized)
    }
  },
})
</script>
