import { e as eventHandler } from '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const index = eventHandler(() => {
  return "<h1>Welcome to the API</h1>";
});

export { index as default };
//# sourceMappingURL=index.mjs.map
