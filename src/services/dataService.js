import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // ms

export async function saveData(fileName, data) {
    if (!data) {
        console.error('Invalid data provided to saveData');
        return false;
    }

    const paths = [
        path.join(process.cwd(), 'public', 'data', fileName),
        path.join(process.cwd(), 'data', fileName),
        path.join(process.cwd(), fileName)
    ];
    
    // Validate JSON before saving
    try {
        JSON.stringify(data);
    } catch (err) {
        console.error('Invalid JSON data:', err);
        return false;
    }
    
    try {
        const jsonData = JSON.stringify(data, null, 2);
        if (!jsonData) {
            throw new Error('Invalid data format');
        }

        await Promise.all(paths.map(async (filePath) => {
            const dirPath = path.dirname(filePath);
            await fs.mkdir(dirPath, { recursive: true });
            
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    const tmpPath = `${filePath}.tmp`;
                    await fs.writeFile(tmpPath, jsonData, 'utf8');
                    
                    const fileHandle = await fs.open(tmpPath, 'r+');
                    await fileHandle.sync();
                    await fileHandle.close();
                    
                    await fs.rename(tmpPath, filePath);
                    console.log(`[DataService] Successfully saved ${fileName} to ${filePath}`);
                    break;
                } catch (error) {
                    console.error(`[DataService] Attempt ${attempt} failed for ${filePath}:`, error);
                    if (attempt === MAX_RETRIES) throw error;
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                }
            }
        }));
        
        return true;
    } catch (error) {
        console.error(`[DataService] Error saving ${fileName}:`, error);
        return false;
    }
}

export async function loadData(fileName) {
    const paths = [
        path.join(process.cwd(), 'public', 'data', fileName),
        path.join(process.cwd(), 'data', fileName),
        path.join(process.cwd(), fileName)
    ];
    
    for (const filePath of paths) {
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            continue;
        }
    }
    
    return null;
}
