import * as fs from 'fs';
import { join, extname } from 'path';
import sharp from 'sharp';

const UPLOADS_DIR = join(process.cwd(), 'uploads');

async function optimizeImages() {
    if (!fs.existsSync(UPLOADS_DIR)) {
        console.error('Uploads directory not found:', UPLOADS_DIR);
        return;
    }

    const files = fs.readdirSync(UPLOADS_DIR);
    console.log(`Found ${files.length} files in uploads directory.`);

    for (const file of files) {
        const filePath = join(UPLOADS_DIR, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory() || file.startsWith('opt-')) continue;

        const ext = extname(file).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

        console.log(`Optimizing ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)...`);

        const tempPath = join(UPLOADS_DIR, `opt-${file}`);
        
        try {
            await sharp(filePath)
                .resize(1000, 1000, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 80 })
                .toFile(tempPath);

            const newStats = fs.statSync(tempPath);
            console.log(`  -> Optimized: ${(newStats.size / 1024 / 1024).toFixed(2)} MB (${((1 - newStats.size / stats.size) * 100).toFixed(1)}% reduction)`);

            // Overwrite original with optimized content (keeping same name for DB compatibility)
            fs.unlinkSync(filePath);
            fs.renameSync(tempPath, filePath);
        } catch (err) {
            console.error(`  Error optimizing ${file}:`, err);
        }
    }

    console.log('Optimization complete.');
}

optimizeImages();
