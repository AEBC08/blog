<template>
  <div class="flex min-h-screen flex-col">
    <TopBar />

    <div class="flex-1 py-6">
      <slot />
    </div>

    <FooterBar />
    <BackToTop />
  </div>
</template>
