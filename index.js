#!/usr/bin/env node

import { fileURLToPath } from 'url';
import path from 'path';
import readline from 'readline/promises';
import { mkdir, copyFile, readdir, stat, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const templateDir = path.join(__dirname, 'template');

async function copy(srcDir, destDir) {
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copy(src, dest);
    } else {
      await copyFile(src, dest);
    }
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const name = await rl.question('Project name: ');
  const inputDir = await rl.question('Source folder (default: src): ') || 'src';
  const outputDir = await rl.question('Output folder (default: dist): ') || 'dist';
  const layoutDir = await rl.question('Layout folder (default: src/.layouts): ') || 'src/.layouts';
  const componentDir = await rl.question('Component folder (default: src/.components): ') || 'src/.components';
  rl.close();

  const targetDir = path.resolve(process.cwd(), name || 'unify-site');
  await copy(templateDir, targetDir);

  const pkgPath = path.join(targetDir, 'package.json');
  const pkgJson = {
    name: name || 'unify-site',
    type: 'module',
    scripts: {
      build: `npx @fwdslsh/unify build ${inputDir} ${outputDir} --layouts ${layoutDir} --components ${componentDir}`,
      serve: `npx @fwdslsh/unify serve ${outputDir}`
    }
  };
  await writeFile(pkgPath, JSON.stringify(pkgJson, null, 2), 'utf-8');

  console.log(`✔ Project scaffolded in ${targetDir}`);

  console.log('🎉 Done! Run:');
  console.log(`  cd ${name}`);
  console.log('  npm run build');
  console.log('  npm run serve');
}

main();
