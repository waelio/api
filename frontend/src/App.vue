<template>
  <div class="app-shell">
    <div class="header">
      <div>
        <span class="badge">Nitro + Vite + Vue</span>
        <h1>Waelio API UI</h1>
        <p class="lead">Responsive Vue frontend with API shortcuts and live health check.</p>
      </div>
      <button class="theme-toggle" @click="toggleTheme">{{ themeLabel }}</button>
    </div>

    <div class="actions">
      <button class="button" @click="checkHealth">⚡ Check /api/health</button>
      <a class="button secondary" href="/api/_openapi" target="_blank">📖 OpenAPI JSON</a>
      <a class="button secondary" href="#docs">🧭 Interactive Docs</a>
    </div>

    <div class="grid">
      <div class="card">
        <h3>/api/health</h3>
        <p>Quick status probe</p>
        <button class="button secondary" @click="checkHealth">Run</button>
      </div>
      <div class="card">
        <h3>/api/holynames</h3>
        <p>Browse names; filter via <code>?name=Allah</code></p>
        <a class="button secondary" href="/api/holynames" target="_blank">Open</a>
      </div>
      <div class="card">
        <h3>/api/quran</h3>
        <p>List chapters; single via <code>?s=1</code></p>
        <a class="button secondary" href="/api/quran" target="_blank">Open</a>
      </div>
      <div class="card">
        <h3>OpenAPI</h3>
        <p>Explore the schema directly</p>
        <a class="button secondary" href="/api/_openapi" target="_blank">JSON</a>
      </div>
    </div>

    <div style="margin-top: 20px;" class="card">
      <h3>Health response</h3>
      <div class="pre">{{ output }}</div>
    </div>

    <div id="docs" style="margin-top: 24px;" class="card">
      <h3>Interactive docs</h3>
      <iframe class="docs-frame" src="/openapi.html" title="OpenAPI documentation" loading="lazy"></iframe>
    </div>

    <div class="footer">Built with Vue + Vite. Theme preference is saved locally.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const output = ref('Click "Check /api/health" to fetch status.')
const theme = ref<'light' | 'dark'>('light')

const themeLabel = computed(() => (theme.value === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'))

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

const checkHealth = async () => {
  output.value = 'Loading...'
  try {
    const res = await fetch('/api/health')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    output.value = JSON.stringify(json, null, 2)
  } catch (err: any) {
    output.value = 'Error: ' + err.message
  }
}
</script>
