<template>
  <div class="app-shell">
    <div class="header">
      <RouterLink to="/" class="header-link" aria-label="Go to home">
        <span class="badge">Nitro + Vite + Vue</span>
        <h1>Waelio API UI</h1>
        <p class="lead">Explore the Waelio API with a Vue-powered shell.</p>
      </RouterLink>
      <button class="theme-toggle" @click="toggleTheme">{{ themeLabel }}</button>
    </div>

    <nav class="actions" aria-label="Primary">
      <RouterLink class="button secondary" to="/">Home</RouterLink>
      <RouterLink class="button secondary" to="/about">About</RouterLink>
      <RouterLink class="button secondary" to="/privacy">Privacy</RouterLink>
      <RouterLink class="button secondary" to="/terms">Terms</RouterLink>
      <a class="button" href="/api/_openapi" target="_blank">📖 OpenAPI JSON</a>
    </nav>

    <RouterView />

    <div class="footer">Built with Vue + Vite. Theme preference is saved locally.</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const theme = ref<'light' | 'dark'>('light')

const themeLabel = computed(() =>
  theme.value === 'dark' ? '☀️ Light mode' : '🌙 Dark mode',
)

const applyTheme = (value: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem('theme', value)
  theme.value = value
}

const toggleTheme = () => {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

onMounted(() => {
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(stored || (prefersDark ? 'dark' : 'light'))
})
</script>
