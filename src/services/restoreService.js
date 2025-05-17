import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function restoreAllFiles() {
  const sourceDir = path.join(__dirname, '../../public');
  const targetDir = path.join(__dirname, '../..');
  
  try {
    // Restore all files recursively
    await copyDirectory(sourceDir, targetDir);
    console.log('All files restored successfully');
  } catch (err) {
    console.error('Error restoring files:', err);
    throw err;
  }
}

async function copyDirectory(source, target) {
  try {
    await fs.mkdir(target, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  } catch (err) {
    console.error(`Error copying directory from ${source} to ${target}:`, err);
    throw err;
  }
}
