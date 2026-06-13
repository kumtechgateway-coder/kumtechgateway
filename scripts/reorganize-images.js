const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const imagesDir = path.join(rootDir, 'images');

const targetDirs = ['site', 'flyers', 'brand-assets', 'web-projects'];
const textFileExtensions = new Set(['.html', '.js', '.json', '.xml', '.txt', '.md', '.css']);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function movePath(sourcePath, targetPath) {
  if (fs.existsSync(targetPath)) {
    return false;
  }

  ensureDir(path.dirname(targetPath));

  try {
    fs.renameSync(sourcePath, targetPath);
  } catch (error) {
    if (error.code !== 'EPERM') {
      throw error;
    }

    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
      fs.rmSync(sourcePath, { recursive: true, force: true });
    } else {
      fs.copyFileSync(sourcePath, targetPath);
      fs.unlinkSync(sourcePath);
    }
  }

  return true;
}

function getBucket(baseName) {
  const lower = baseName.toLowerCase();

  if (/^(flyer|poster|banner|socialmedia|marketing portfolio)/.test(lower)) {
    return 'flyers';
  }

  if (/^faithconstruction/.test(lower)) {
    return 'web-projects';
  }

  if (/^logo \(/.test(lower)) {
    return 'brand-assets';
  }

  if (/^(hero|psx_20251123_141018|logo(?:-|$))/.test(lower)) {
    return 'site';
  }

  if (
    /^(kumtech|rmcolor|rmmockup|rmmodel|rmlogo|goldencolor|goldenmockup|goldenmodel|goldenlogo|raphacolor|raphamodel|raphalogo|bold mockups|bold logo|3d bold logo|3d(?:-|$)|brand identity|blu logo2|chatgpt image|color palette|mockup1|mockup2|rmrdv-logo|rmrmresidence-logo|rmresidence-mockup4)/.test(
      lower
    )
  ) {
    return 'brand-assets';
  }

  return null;
}

function walkDir(dirPath, results = []) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }
      walkDir(fullPath, results);
      continue;
    }
    results.push(fullPath);
  }
  return results;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildReplacementVariants(oldRelPath, newRelPath) {
  const oldPosix = toPosixPath(oldRelPath);
  const newPosix = toPosixPath(newRelPath);
  const oldRootRelative = `/images/${oldPosix}`;
  const newRootRelative = `/images/${newPosix}`;
  const oldRelative = `images/${oldPosix}`;
  const newRelative = `images/${newPosix}`;
  const oldAbsolute = `https://kumtechgateway.com/images/${oldPosix}`;
  const newAbsolute = `https://kumtechgateway.com/images/${newPosix}`;
  const oldRootRelativeUriEncoded = encodeURI(oldRootRelative);
  const newRootRelativeUriEncoded = encodeURI(newRootRelative);
  const oldRelativeUriEncoded = encodeURI(oldRelative);
  const newRelativeUriEncoded = encodeURI(newRelative);
  const oldEncoded = oldPosix
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const newEncoded = newPosix
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  const oldUriEncoded = encodeURI(oldAbsolute);
  const newUriEncoded = encodeURI(newAbsolute);

  return [
    [oldRootRelative, newRootRelative],
    [oldRootRelativeUriEncoded, newRootRelativeUriEncoded],
    [oldRelative, newRelative],
    [oldRelativeUriEncoded, newRelativeUriEncoded],
    [oldAbsolute, newAbsolute],
    [oldUriEncoded, newUriEncoded],
    [`https://kumtechgateway.com/images/${oldEncoded}`, `https://kumtechgateway.com/images/${newEncoded}`],
  ];
}

function replaceInRepo(replacements) {
  const files = walkDir(rootDir).filter((filePath) => textFileExtensions.has(path.extname(filePath).toLowerCase()));
  let changedFiles = 0;

  for (const filePath of files) {
    const relative = path.relative(rootDir, filePath);
    if (relative.startsWith(`images${path.sep}`)) {
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    let updated = content;

    for (const [from, to] of replacements) {
      updated = updated.replace(new RegExp(escapeRegExp(from), 'g'), to);
    }

    if (updated !== content) {
      fs.writeFileSync(filePath, updated, 'utf8');
      changedFiles += 1;
    }
  }

  return changedFiles;
}

function main() {
  for (const dirName of targetDirs) {
    ensureDir(path.join(imagesDir, dirName));
  }

  const moveMap = new Map();
  let movedCount = 0;

  for (const entry of fs.readdirSync(imagesDir, { withFileTypes: true })) {
    if (targetDirs.includes(entry.name)) {
      continue;
    }

    const sourcePath = path.join(imagesDir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'grouped-business-flyers') {
        const targetPath = path.join(imagesDir, 'flyers', entry.name);
        if (movePath(sourcePath, targetPath)) {
          movedCount += 1;
        }
      }
      continue;
    }

    const bucket = getBucket(path.parse(entry.name).name);
    if (!bucket) {
      console.warn(`Skipped uncategorized file: ${entry.name}`);
      continue;
    }

    const targetPath = path.join(imagesDir, bucket, entry.name);
    if (movePath(sourcePath, targetPath)) {
      movedCount += 1;
    }

    moveMap.set(entry.name, `${bucket}/${entry.name}`);
  }

  for (const dirName of targetDirs) {
    const dirPath = path.join(imagesDir, dirName);
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (!entry.isFile()) {
        continue;
      }
      if (!moveMap.has(entry.name)) {
        moveMap.set(entry.name, `${dirName}/${entry.name}`);
      }
    }
  }

  const replacements = [];
  for (const [oldRelPath, newRelPath] of moveMap.entries()) {
    replacements.push(...buildReplacementVariants(oldRelPath, newRelPath));
  }

  replacements.sort((a, b) => b[0].length - a[0].length);
  const changedFiles = replaceInRepo(replacements);

  console.log(`Moved ${movedCount} file(s) into nested folders.`);
  console.log(`Indexed ${moveMap.size} file path mapping(s) for cleanup.`);
  console.log(`Updated references in ${changedFiles} text file(s).`);
}

main();
