<template>
  <div class="card" style="margin-top: 20px">
    <h3>About Waelio API</h3>
    <p class="lead" style="margin-bottom: 12px">
      This UI is a small Vue + Vite shell around the Waelio API running on Nitro
      and Netlify.
    </p>
    <p>
      It provides shortcuts to common endpoints like <code>/api/health</code>,
      <code>/api/holynames</code>, and <code>/api/quran</code>, plus a direct
      link to the generated OpenAPI schema.
    </p>
    <p style="margin-top: 10px">
      The visual style mirrors <code>waelio.com</code> with a shared
      light/dark theme controlled via <code>data-theme</code> on the
      <code>&lt;html&gt;</code> element.
    </p>
  </div>
</template>

<script setup lang="ts"></script>
