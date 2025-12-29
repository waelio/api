import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const health_get = defineEventHandler(() => {
  return {
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
});

export { health_get as default };
//# sourceMappingURL=health.get.mjs.map
