import { d as defineEventHandler, h as handleCors } from '../../nitro/nitro.mjs';
import { c as clearSessionCookie } from '../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const origin = ["https://peace2074.com", "https://www.peace2074.com"];
const logout_post = defineEventHandler((event) => {
  if (handleCors(event, { origin, methods: ["POST", "OPTIONS"], credentials: true })) return;
  clearSessionCookie(event);
  return { ok: true };
});

export { logout_post as default };
//# sourceMappingURL=logout.post.mjs.map
