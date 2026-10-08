import { cp, mkdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist/node_modules/three/build', { recursive: true });
for (const file of ['index.html', 'illustration.html']) await cp(file, 'dist/' + file);
await cp('src', 'dist/src', { recursive: true });
for (const file of ['three.module.js', 'three.core.js']) await cp('node_modules/three/build/' + file, 'dist/node_modules/three/build/' + file);
await cp('node_modules/three/LICENSE', 'dist/node_modules/three/LICENSE');
console.log('Built static doll studio in dist/');
