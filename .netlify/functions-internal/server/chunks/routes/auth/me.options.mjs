import { d as defineEventHandler, h as handleCors } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const origin = ["https://peace2074.com", "https://www.peace2074.com"];
const allowedHeaders = ["content-type", "authorization", "x-requested-with"];
const me_options = defineEventHandler((event) => {
  if (handleCors(event, { origin, methods: ["OPTIONS", "GET"], credentials: true, allowHeaders: allowedHeaders })) return;
  event.node.res.statusCode = 204;
});

export { me_options as default };
//# sourceMappingURL=me.options.mjs.map
