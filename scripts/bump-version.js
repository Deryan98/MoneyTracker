#!/usr/bin/env node
/**
 * Sube versionCode/versionName en android/version.properties.
 *
 * Por que existe: el dueno pidio que "cada vez que se pida generar un
 * APK o un AAB se suba automaticamente el numero de version y el de
 * build". Esta app no tiene backend ni CLI de release, asi que ese
 * numero vivia hardcodeado en android/app/build.gradle. Ahora vive en
 * un fichero versionado (android/version.properties) que este script
 * lee y reescribe, y que build.gradle lee en cada build via
 * `Properties`.
 *
 * Que sube y cuando:
 *   - versionCode SIEMPRE +1. Es un contador opaco para Play, no tiene
 *     forma "correcta" de agruparlo por entorno, y los tres flavors
 *     (dev/qa/prod) comparten applicationId's DISTINTOS pero un unico
 *     contador: mas simple que tres contadores independientes y nunca
 *     puede colisionar entre entornos si algun dia conviven en el
 *     mismo track de Play.
 *   - versionName sube de "patch" por defecto (1.0.2 -> 1.0.3). Se
 *     puede pedir --bump=minor o --bump=major. --bump=none deja el
 *     versionName intacto y sube solo versionCode (utilidad: recompilar
 *     el mismo versionName con un build numerico distinto).
 *
 * Que NO hace: esto no se ejecuta en `yarn android` / `yarn ios`. Un
 * dev iterando en el emulador todo el dia no debe gastar versionCode.
 * Solo lo llaman los scripts `build:*` de package.json, justo antes de
 * invocar Gradle.
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, '..', 'android', 'version.properties');

function parsePropertiesFile(contents) {
  const values = {};
  for (const rawLine of contents.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    values[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return values;
}

function readVersion() {
  if (!fs.existsSync(VERSION_FILE)) {
    throw new Error(`No existe ${VERSION_FILE}. No se puede leer/subir la version.`);
  }
  const contents = fs.readFileSync(VERSION_FILE, 'utf8');
  const values = parsePropertiesFile(contents);
  const versionCode = parseInt(values.VERSION_CODE, 10);
  const versionName = values.VERSION_NAME;
  // `Number.isInteger(-5)` es true, asi que el chequeo de entero solo no
  // basta: un VERSION_CODE negativo o cero pasaria y produciria un APK que
  // Play rechaza sin explicar bien por que. Se corta aqui.
  if (!Number.isInteger(versionCode) || versionCode < 1 || !versionName) {
    throw new Error(
      `${VERSION_FILE} no tiene VERSION_CODE/VERSION_NAME validos ` +
        `(VERSION_CODE debe ser un entero >= 1, leido: ${values.VERSION_CODE}).`,
    );
  }
  return {versionCode, versionName};
}

function bumpVersionName(versionName, bumpType) {
  const parts = versionName.split('.').map(n => parseInt(n, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`VERSION_NAME "${versionName}" no tiene forma MAJOR.MINOR.PATCH.`);
  }
  let [major, minor, patch] = parts;
  switch (bumpType) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor += 1;
      patch = 0;
      break;
    case 'none':
      break;
    case 'patch':
    default:
      patch += 1;
      break;
  }
  return `${major}.${minor}.${patch}`;
}

/**
 * Reescribe el fichero preservando el comentario de cabecera: solo se
 * tocan las lineas VERSION_CODE / VERSION_NAME.
 */
function writeVersion({versionCode, versionName}) {
  const contents = fs.readFileSync(VERSION_FILE, 'utf8');
  const updated = contents
    .replace(/^VERSION_CODE=.*$/m, `VERSION_CODE=${versionCode}`)
    .replace(/^VERSION_NAME=.*$/m, `VERSION_NAME=${versionName}`);
  fs.writeFileSync(VERSION_FILE, updated);
}

function bump(bumpType = 'patch') {
  const before = readVersion();
  const after = {
    versionCode: before.versionCode + 1,
    versionName: bumpVersionName(before.versionName, bumpType),
  };
  writeVersion(after);
  return {before, after};
}

if (require.main === module) {
  const arg = process.argv.find(a => a.startsWith('--bump='));
  const bumpType = arg ? arg.split('=')[1] : 'patch';
  const {before, after} = bump(bumpType);
  // eslint-disable-next-line no-console
  console.log(
    `[version] ${before.versionName} (${before.versionCode}) -> ${after.versionName} (${after.versionCode}) [bump=${bumpType}]`,
  );
}

module.exports = {readVersion, bump, VERSION_FILE};
