<script setup lang="ts">
import type { BlogCollectionItem } from '@nuxt/content'
import { MiuixButton, MiuixCard, MiuixDivider, MiuixSlider, MiuixSwitch, MiuixText } from 'miuix-vue'

interface Props {
  page: BlogCollectionItem
}

const props = defineProps<Props>()

const likes = ref(0)
const accentOn = ref(true)
const radius = ref(16)
</script>

<template>
  <section class="space-y-6">
    <MiuixCard>
      <div class="p-5 sm:p-6">
        <MiuixText type="title3" weight="medium">
          交互式组件示例
        </MiuixText>
        <p class="mt-1.5 text-sm leading-6 text-app-text-variant">
          这一块完全由 Vue 组件驱动。Markdown 只负责提供标题、摘要和进入页面的路径。
        </p>

        <MiuixDivider class="my-5" />

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-[var(--m-radius-md)] bg-app-surface-container p-4">
            <MiuixText type="body2" color="var(--m-color-on-surface-secondary)">
              <span class="inline-flex items-center gap-1.5">
                <Icon name="thumb-up" :size="14" />
                点赞
              </span>
            </MiuixText>
            <div class="mt-3 flex items-center gap-3">
              <MiuixButton type="primary" @click="likes += 1">
                <span class="inline-flex items-center gap-1.5">
                  <Icon name="heart" :size="14" />
                  点个赞
                </span>
              </MiuixButton>
              <span class="text-2xl font-bold text-app-text">{{ likes }}</span>
            </div>
          </div>

          <div class="rounded-[var(--m-radius-md)] bg-app-surface-container p-4">
            <div class="flex items-center justify-between gap-3">
              <MiuixText type="body2" color="var(--m-color-on-surface-secondary)">
                <span class="inline-flex items-center gap-1.5">
                  <Icon name="palette" :size="14" />
                  强调色背景
                </span>
              </MiuixText>
              <MiuixSwitch v-model="accentOn" />
            </div>

            <div class="mt-4">
              <MiuixText type="footnote1" color="var(--m-color-on-surface-variant-summary)">
                圆角 {{ radius }}px
              </MiuixText>
              <MiuixSlider v-model="radius" :min="0" :max="32" :step="2" class="demo-slider mt-2" />
            </div>
          </div>
        </div>

        <div
          class="mt-5 flex min-h-32 items-center justify-center p-6 text-center transition-colors"
          :class="accentOn
            ? 'bg-app-primary-soft'
            : 'bg-app-surface-container'"
          :style="{ borderRadius: `${radius}px` }"
        >
          <p class="max-w-md text-sm font-medium leading-6 text-app-text">
            这段面板会跟随开关与滑块的数值变化，而文章仍然以
            <code class="rounded bg-app-bg/70 px-1.5 py-0.5 font-mono text-xs">.md</code>
            文件为入口。
          </p>
        </div>
      </div>
    </MiuixCard>

    <ContentRenderer :value="props.page" class="post-content" />
  </section>
</template>
