import { defineNitroConfig } from 'nitropack';

export default defineNitroConfig({
  compatibilityDate: '2025-12-20',
  srcDir: 'src',
  typescript: {
    strict: true,
  },
});