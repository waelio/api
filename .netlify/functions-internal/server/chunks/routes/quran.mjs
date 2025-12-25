import { e as eventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const quran = eventHandler(() => {
  return { status: "OK", message: "Quran route works!" };
});

export { quran as default };
//# sourceMappingURL=quran.mjs.map
