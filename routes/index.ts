import { defineEventHandler } from "h3";

export default defineEventHandler(() => {
  return "<h1>Nitro is running! (Watcher Active)</h1>";
});