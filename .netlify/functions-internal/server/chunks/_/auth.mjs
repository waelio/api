import { createHmac } from 'node:crypto';
import { a as deleteCookie, b as getCookie, s as setCookie } from '../nitro/nitro.mjs';

const SESSION_COOKIE = "waelio_session";
const SESSION_DAYS = 7;
const OTP_WINDOW_MS = 10 * 60 * 1e3;
const now = () => Date.now();
const hasAuthConfig = () => {
  const secret = process.env.AUTH_SECRET;
  return Boolean(secret);
};
const requireAuthSecret = () => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Auth not configured: missing AUTH_SECRET");
  }
  return secret;
};
const sign = (value) => {
  const secret = requireAuthSecret();
  return createHmac("sha256", secret).update(value).digest("base64url");
};
const generateOtp = (email, at = now()) => {
  const secret = requireAuthSecret();
  const window = Math.floor(at / OTP_WINDOW_MS);
  const hmac = createHmac("sha1", secret).update(`${email}:${window}`).digest();
  const offset = hmac[hmac.length - 1] & 15;
  const binCode = (hmac[offset] & 127) << 24 | (hmac[offset + 1] & 255) << 16 | (hmac[offset + 2] & 255) << 8 | hmac[offset + 3] & 255;
  const code = (binCode % 1e6).toString().padStart(6, "0");
  return code;
};
const verifyOtp = (email, code, at = now()) => {
  const trimmed = (code || "").trim();
  if (!trimmed || trimmed.length !== 6) return false;
  const windows = [at, at - OTP_WINDOW_MS];
  return windows.some((ts) => generateOtp(email, ts) === trimmed);
};
const encodeSession = (user) => {
  const exp = now() + SESSION_DAYS * 24 * 60 * 60 * 1e3;
  const payload = `${user.email}:${exp}`;
  const sig = sign(payload);
  return `${payload}:${sig}`;
};
const decodeSession = (token) => {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [email, expStr, sig] = parts;
  if (!email || !expStr || !sig) return null;
  const payload = `${email}:${expStr}`;
  if (sign(payload) !== sig) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || now() > exp) return null;
  return { email };
};
const setSessionCookie = (event, user) => {
  const token = encodeSession(user);
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });
};
const clearSessionCookie = (event) => {
  deleteCookie(event, SESSION_COOKIE, { path: "/" });
};
const currentUserFromEvent = (event) => {
  const token = getCookie(event, SESSION_COOKIE);
  return decodeSession(token);
};
const isValidEmail = (email) => /.+@.+\..+/.test(email);
const authConfigError = () => !hasAuthConfig() ? "Auth not configured" : null;

export { currentUserFromEvent as a, authConfigError as b, clearSessionCookie as c, generateOtp as g, isValidEmail as i, setSessionCookie as s, verifyOtp as v };
//# sourceMappingURL=auth.mjs.map
