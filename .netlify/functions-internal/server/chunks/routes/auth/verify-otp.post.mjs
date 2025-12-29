import { d as defineEventHandler, h as handleCors, r as readBody } from '../../nitro/nitro.mjs';
import { b as authConfigError, i as isValidEmail, v as verifyOtp, s as setSessionCookie } from '../../_/auth.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const origin = ["https://peace2074.com", "https://www.peace2074.com"];
const verifyOtp_post = defineEventHandler(async (event) => {
  if (handleCors(event, { origin, methods: ["POST", "OPTIONS"], credentials: true })) return;
  const configErr = authConfigError();
  if (configErr) {
    event.node.res.statusCode = 503;
    return { error: true, message: configErr };
  }
  const body = await readBody(event);
  const email = ((body == null ? void 0 : body.email) || "").trim().toLowerCase();
  const code = ((body == null ? void 0 : body.code) || "").trim();
  if (!email || !isValidEmail(email)) {
    event.node.res.statusCode = 400;
    return { error: true, message: "Invalid email" };
  }
  if (!verifyOtp(email, code)) {
    event.node.res.statusCode = 400;
    return { error: true, message: "Invalid or expired code" };
  }
  setSessionCookie(event, { email });
  return { ok: true, user: { email } };
});

export { verifyOtp_post as default };
//# sourceMappingURL=verify-otp.post.mjs.map
