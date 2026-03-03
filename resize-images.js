const fs = require('fs');
const path = require('path');

// Check if sharp is installed
try {
    require.resolve('sharp');
} catch (e) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: "sharp" library is not installed.');
    console.error('Please run the following command in your terminal:');
    console.error('\x1b[36m%s\x1b[0m', 'npm install sharp');
    process.exit(1);
}

const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'images');
const sizes = [400, 800, 1200];

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
    console.error(`Error: Directory not found: ${imagesDir}`);
    process.exit(1);
}

console.log('Starting image resizing process...');

fs.readdir(imagesDir, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        const name = path.basename(file, ext);
        const filePath = path.join(imagesDir, file);

        // Process only images (jpg, png, webp) and skip already resized ones (ending in -400w, etc.)
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext) && !name.match(/-\d+w$/)) {
            
            sizes.forEach(width => {
                const outputFilename = `${name}-${width}w.webp`;
                const outputPath = path.join(imagesDir, outputFilename);

                // Only generate if it doesn't exist yet
                if (!fs.existsSync(outputPath)) {
                    sharp(filePath)
                        .resize({ width: width, withoutEnlargement: true }) // Don't upscale small images
                        .toFormat('webp', { quality: 80 })
                        .toFile(outputPath)
                        .then(() => console.log(`Generated: ${outputFilename}`))
                        .catch(err => console.error(`Error processing ${file}:`, err.message));
                }
            });
        }
    });
});