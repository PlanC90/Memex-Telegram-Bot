import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../public/data');
const backupDir = path.join(__dirname, '../../backups');

async function ensureBackupDir() {
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (err) {
    console.error('Error creating backup directory:', err);
  }
}

export async function createBackup() {
  await ensureBackupDir();
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const files = ['users.json', 'tasks.json', 'referrals.json', 'withdrawals.json', 'text.json', 'gonderildi.json'];
  
  for (const file of files) {
    try {
      const sourceFile = path.join(dataDir, file);
      const backupFile = path.join(backupDir, `${file.replace('.json', '')}_${timestamp}.json`);
      
      const data = await fs.readFile(sourceFile, 'utf8');
      await fs.writeFile(backupFile, data);
      console.log(`Backup created for ${file}`);
    } catch (err) {
      console.error(`Error backing up ${file}:`, err);
    }
  }
}
