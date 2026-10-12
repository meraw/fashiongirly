// Builds the Android app: the web app (npm run build) packed into a small WebView shell (android/), signed with the
// shared key in android/fashiongirly.keystore so each new APK installs over the last. Writes dist/fashiongirly.apk.
// Needs a JDK (17 or newer) and the Android SDK: set ANDROID_HOME, or write sdk.dir=... in android/local.properties.
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';

const run = (cmd, args, cwd = '.') => execFileSync(cmd, args, { cwd, stdio: 'inherit' });
if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT && !existsSync('android/local.properties')) {
  console.error('Android SDK not found: set ANDROID_HOME, or write sdk.dir=/path/to/sdk in android/local.properties.');
  process.exit(1);
}
run('node', ['scripts/build.mjs']);
// The number of commits: it only grows, so every new APK is newer than the last.
const versionCode = execFileSync('git', ['rev-list', '--count', 'HEAD']).toString().trim();
run(process.platform === 'win32' ? 'gradlew.bat' : './gradlew', ['assembleRelease', `-PversionCode=${versionCode}`, '--no-daemon'], 'android');
copyFileSync('android/app/build/outputs/apk/release/app-release.apk', 'dist/fashiongirly.apk');
console.log(`Built dist/fashiongirly.apk (version 1.0.${versionCode}).`);
