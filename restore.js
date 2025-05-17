import { restoreAllFiles } from './src/services/restoreService.js';

async function restore() {
  try {
    await restoreAllFiles();
    console.log('Restoration completed successfully');
  } catch (err) {
    console.error('Restoration failed:', err);
    process.exit(1);
  }
}

restore();
