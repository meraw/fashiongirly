import { execFileSync } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/node_modules/three/build', { recursive: true });
for (const file of ['index.html', 'illustration.html']) await cp(file, 'dist/' + file);
await cp('src', 'dist/src', { recursive: true });
for (const file of ['three.module.js', 'three.core.js']) await cp('node_modules/three/build/' + file, 'dist/node_modules/three/build/' + file);
await cp('node_modules/three/LICENSE', 'dist/node_modules/three/LICENSE');
// The build's number, as for the APK: the number of commits. The Android app downloads a published build only when its
// number is higher than the copy it has (see android/.../AppUpdates.java). 0 outside a git checkout.
let version = 0;
try { version = Number(execFileSync('git', ['rev-list', '--count', 'HEAD']).toString().trim()) || 0; } catch { /* Not a git checkout. */ }
await writeFile('dist/version.json', JSON.stringify({ version }) + '\n');
console.log('Built static doll studio in dist/');
