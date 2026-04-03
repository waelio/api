#!/usr/bin/env node
// Dev runner: load dev-only runtime patches then run `nuxi dev`.
// Converted to TypeScript ESM from CJS

import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const args = process.argv.slice(2)
const cmd = 'npx'
const cmdArgs = ['nuxi', 'dev', ...args]

// Prefer a local patch next to this script; fall back to the project root patch if
// the local copy doesn't exist. This keeps the original intent but avoids
// crashing when the local file isn't present.
const localPatch = path.resolve(__dirname, '..', 'node-crypto-patch.cjs')
const rootPatch = path.resolve(__dirname, '..', '..', '..', 'node-crypto-patch.cjs')
const fallbackPatch = path.resolve(__dirname, '..', '..', '..', '..', 'node-crypto-patch.cjs')
let patchPath: string | null = localPatch

try {
    if (!existsSync(patchPath)) {
        if (existsSync(rootPatch)) patchPath = rootPatch
        else if (existsSync(fallbackPatch)) patchPath = fallbackPatch
        else patchPath = null
    }
} catch (e) {
    // best-effort - if fs isn't available for some reason, continue without patch
    patchPath = null
}

// Ensure child process preloads the dev patch (works like NODE_OPTIONS=--require=...)
const childEnv = { ...process.env }
const existing = (childEnv.NODE_OPTIONS || '').trim()
if (patchPath) {
    childEnv.NODE_OPTIONS = `--require=${patchPath} ${existing}`.trim()
} else {
    // no patch available; leave NODE_OPTIONS as-is
    childEnv.NODE_OPTIONS = existing
}

// WebSockets removed: do not start standalone socket server
let wsChild: ChildProcess | null = null

// Nuxt dev server
const child = spawn(cmd, cmdArgs, {
    stdio: 'inherit',
    env: childEnv,
})

child.on('exit', code => process.exit(code ?? 0))
child.on('error', (err) => {
    console.error('Failed to start dev server:', err)
    process.exit(1)
})

// Ensure both are cleaned up on exit
process.on('exit', () => { try { wsChild?.kill() } catch { } })
