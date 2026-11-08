<template>
  <div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
    <div v-if="$slots.hero" class="mb-6">
      <slot name="hero" />
    </div>

    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_19rem]">
      <main class="min-w-0">
        <slot />
      </main>

      <aside class="app-sidebar min-w-0 space-y-4">
        <slot name="sidebar" />
      </aside>
    </div>
  </div>
</template>
