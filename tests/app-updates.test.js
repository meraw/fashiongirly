import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The Android app updates its web app from GitHub Pages (README, "Android app"). These pieces must agree.
const pages = readFileSync('.github/workflows/pages.yml', 'utf8');
const build = readFileSync('scripts/build.mjs', 'utf8');
const updates = readFileSync('android/app/src/main/java/app/fashiongirly/AppUpdates.java', 'utf8');

test('Pages deploys every merge to main with the whole history and app.zip', () => {
  assert.match(pages, /on:\n {2}push:\n {4}branches: \[main\]/);
  assert.match(pages, /fetch-depth: 0/);
  assert.match(pages, /zip -qrX \.\.\/app\.zip \. && mv \.\.\/app\.zip app\.zip/);
  assert.ok(pages.indexOf('npm run build') < pages.indexOf('zip -qrX'), 'app.zip is packed after the build');
  assert.ok(pages.indexOf('zip -qrX') < pages.indexOf('upload-pages-artifact'), 'app.zip is packed before the upload');
});

test('the build numbers itself by commit count, as the APK does', () => {
  assert.match(build, /rev-list', '--count', 'HEAD'/);
  assert.match(build, /writeFile\('dist\/version\.json', JSON\.stringify\(\{ version \}\)/);
});

test('the Android app reads version.json and app.zip from the Pages site', () => {
  assert.match(updates, /SITE = "https:\/\/meraw\.github\.io\/fashiongirly\/"/);
  assert.match(updates, /fetch\("version\.json"\)/);
  assert.match(updates, /open\("app\.zip"\)/);
});
