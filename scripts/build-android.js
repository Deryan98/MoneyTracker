#!/usr/bin/env node
/**
 * Sube la version y compila un flavor/artefacto de Android.
 *
 * Uso (siempre a traves de los scripts `build:*` de package.json, no a
 * mano):
 *   node scripts/build-android.js <flavor> <apk|aab> [--bump=patch|minor|major|none] [--no-bump]
 *
 * flavor: dev | qa | prod
 * apk|aab: que artefacto generar (assemble* vs bundle*)
 *
 * Por que dev es "Debug" y qa/prod son "Release": dev es el build de
 * instalar-y-recargar en el emulador, no necesita minificar ni firmar
 * de verdad. qa se compila como Release (mismo `minifyEnabled` y el
 * mismo proguard que produccion) para que un fallo de proguard/R8 salga
 * en QA y no en produccion — es el propio sentido de tener un entorno
 * QA. Ambos, qa y prod, firman con `signingConfigs.release` si la
 * maquina tiene las propiedades `MONEYTRACKER_UPLOAD_*`; si no las
 * tiene, Gradle cae a `debug` (ver el comentario en build.gradle) y
 * el APK no es distribuible, pero el build no se rompe.
 */

const {execFileSync} = require('child_process');
const path = require('path');
const fs = require('fs');
const {bump} = require('./bump-version');

const ROOT = path.join(__dirname, '..');
const ANDROID_DIR = path.join(ROOT, 'android');

const FLAVORS = {
  dev: {gradleFlavor: 'Dev', buildType: 'Debug'},
  qa: {gradleFlavor: 'Qa', buildType: 'Release'},
  prod: {gradleFlavor: 'Prod', buildType: 'Release'},
};

function parseArgs(argv) {
  const [flavorArg, artifactArg, ...rest] = argv;
  if (!FLAVORS[flavorArg]) {
    throw new Error(`Flavor invalido "${flavorArg}". Usa: ${Object.keys(FLAVORS).join(', ')}`);
  }
  if (artifactArg !== 'apk' && artifactArg !== 'aab') {
    throw new Error(`Artefacto invalido "${artifactArg}". Usa: apk | aab`);
  }
  const noBump = rest.includes('--no-bump');
  const bumpArg = rest.find(a => a.startsWith('--bump='));
  const bumpType = bumpArg ? bumpArg.split('=')[1] : 'patch';
  return {flavor: flavorArg, artifact: artifactArg, noBump, bumpType};
}

function findOutputFile(dir, extension) {
  if (!fs.existsSync(dir)) return null;
  const match = fs
    .readdirSync(dir)
    .find(f => f.endsWith(extension) && !f.endsWith('.idsig'));
  return match ? path.join(dir, match) : null;
}

function main() {
  const {flavor, artifact, noBump, bumpType} = parseArgs(process.argv.slice(2));
  const {gradleFlavor, buildType} = FLAVORS[flavor];

  let versionInfo = null;
  if (noBump) {
    // eslint-disable-next-line no-console
    console.log('[build] --no-bump: se compila con la version actual, sin subirla.');
  } else {
    versionInfo = bump(bumpType);
    const {before, after} = versionInfo;
    // eslint-disable-next-line no-console
    console.log(
      `[build] version: ${before.versionName} (${before.versionCode}) -> ${after.versionName} (${after.versionCode})`,
    );
  }

  const gradleTaskPrefix = artifact === 'apk' ? 'assemble' : 'bundle';
  const task = `${gradleTaskPrefix}${gradleFlavor}${buildType}`;
  const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

  // eslint-disable-next-line no-console
  console.log(`[build] gradle -p android ${task}`);
  execFileSync(gradlew, [task], {cwd: ANDROID_DIR, stdio: 'inherit'});

  const variantDir = `${flavor}${buildType}`; // p.ej. "qaRelease"
  const outDir =
    artifact === 'apk'
      ? path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', flavor, buildType.toLowerCase())
      : path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'bundle', variantDir);
  const outFile = findOutputFile(outDir, artifact === 'apk' ? '.apk' : '.aab');

  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log(`[build] flavor=${flavor} buildType=${buildType} artifact=${artifact}`);
  if (versionInfo) {
    // eslint-disable-next-line no-console
    console.log(
      `[build] versionName=${versionInfo.after.versionName} versionCode=${versionInfo.after.versionCode}`,
    );
  }
  // eslint-disable-next-line no-console
  console.log(`[build] generado en: ${outFile || `${outDir} (no encontrado, revisa el log de Gradle)`}`);
}

main();
