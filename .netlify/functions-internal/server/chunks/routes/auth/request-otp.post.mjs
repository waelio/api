import { d as defineEventHandler, h as handleCors, r as readBody } from '../../nitro/nitro.mjs';
import { b as authConfigError, i as isValidEmail, g as generateOtp } from '../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const origin = ["https://peace2074.com", "https://www.peace2074.com"];
const allowedHeaders = ["content-type"];
const requestOtp_post = defineEventHandler(async (event) => {
  if (handleCors(event, { origin, methods: ["POST", "OPTIONS"], credentials: true, allowHeaders: allowedHeaders })) return;
  const configErr = authConfigError();
  if (configErr) {
    event.node.res.statusCode = 503;
    return { error: true, message: configErr };
  }
  const body = await readBody(event);
  const email = ((body == null ? void 0 : body.email) || "").trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    event.node.res.statusCode = 400;
    return { error: true, message: "Invalid email" };
  }
  generateOtp(email);
  console.info(`[auth] OTP generated for ${email}`);
  return { ok: true, ttlSeconds: 600 };
});

export { requestOtp_post as default };
//# sourceMappingURL=request-otp.post.mjs.map
