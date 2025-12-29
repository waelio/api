import { d as defineEventHandler, h as handleCors } from '../../nitro/nitro.mjs';
import { a as currentUserFromEvent } from '../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const origin = ["https://peace2074.com", "https://www.peace2074.com"];
const allowedHeaders = ["content-type", "authorization", "x-requested-with"];
const me_get = defineEventHandler((event) => {
  if (handleCors(event, { origin, methods: ["GET", "OPTIONS"], credentials: true, allowHeaders: allowedHeaders })) return;
  const user = currentUserFromEvent(event);
  if (!user) {
    event.node.res.statusCode = 401;
    return { error: true, message: "Unauthorized" };
  }
  return { ok: true, user };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
