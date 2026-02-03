const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

async function optimizeImages() {
    if (!fs.existsSync(uploadsDir)) {
        console.log('Uploads directory not found.');
        return;
    }

    const files = fs.readdirSync(uploadsDir);
    console.log(`Found ${files.length} files in uploads/`);

    for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        if (file.startsWith('opt-') || fs.lstatSync(filePath).isDirectory()) continue;

        const tempPath = path.join(uploadsDir, `opt-${file}`);
        console.log(`Optimizing ${file}...`);

        try {
            const statsBefore = fs.statSync(filePath);
            await sharp(filePath)
                .resize(800, 800, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 80 })
                .toFile(tempPath);

            const statsAfter = fs.statSync(tempPath);

            // Only replace if it's actually smaller
            if (statsAfter.size < statsBefore.size) {
                fs.unlinkSync(filePath);
                fs.renameSync(tempPath, filePath);
                console.log(`  Reduced from ${(statsBefore.size / 1024 / 1024).toFixed(2)}MB to ${(statsAfter.size / 1024 / 1024).toFixed(2)}MB`);
            } else {
                fs.unlinkSync(tempPath);
                console.log(`  Optimization didn't reduce size much. Keeping original.`);
            }
        } catch (e) {
            console.error(`  Error optimizing ${file}:`, e.message);
        }
    }
}

optimizeImages();
