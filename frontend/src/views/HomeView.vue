<template>
  <main>
    <div class="actions">
      <button class="button" @click="checkHealth">⚡ Check /api/health</button>
      <a class="button secondary" href="/api/holynames" target="_blank">/api/holynames</a>
      <a class="button secondary" href="/api/quran" target="_blank">/api/quran</a>
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

    <div style="margin-top: 20px" class="card">
      <h3>Health response</h3>
      <div class="pre">{{ output }}</div>
    </div>

    <div id="docs" style="margin-top: 24px" class="card">
      <h3>Interactive docs</h3>
      <iframe
        class="docs-frame"
        src="/openapi.html"
        title="OpenAPI documentation"
        loading="lazy"
      ></iframe>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";

const output = ref('Click "Check /api/health" to fetch status.');

const checkHealth = async () => {
  output.value = "Loading...";
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    output.value = JSON.stringify(json, null, 2);
  } catch (err: any) {
    output.value = "Error: " + err.message;
  }
};
</script>
