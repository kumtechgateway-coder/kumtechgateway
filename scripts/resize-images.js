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

const rootDir = path.resolve(__dirname, '..');
const imagesDir = path.join(rootDir, 'images');
const responsiveSizes = [400, 800, 1200];
const placeholderWidth = 30;
const galleryDataPath = path.join(rootDir, 'assets', 'data', 'gallery-data.js');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
    console.error(`Error: Directory not found: ${imagesDir}`);
    process.exit(1);
}

console.log('Starting image processing and data generation...');

fs.readdir(imagesDir, async (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    const galleryData = {
        flyers: [],
        banners: [],
        posters: [],
        'social-media': [],
        'brand-assets': []
    };

    const curatedGalleryEntries = {
        'bold logo': { bucket: 'brand-assets', category: 'brand-assets', alt: 'BOLD logo presentation' },
        '3d bold logo': { bucket: 'brand-assets', category: 'brand-assets', alt: 'BOLD 3D logo render' },
        'logo (2)': { bucket: 'brand-assets', category: 'brand-assets', alt: 'Demaco Real Estate logo presentation' },
        'blu logo2': { bucket: 'brand-assets', category: 'brand-assets', alt: 'Bluebells Empire logo presentation' },
        'ChatGPT Image Mar 23, 2026, 08_17_22 AM': { bucket: 'brand-assets', category: 'brand-assets', alt: 'Bluebells Empire 3D logo render' },
        'mockup1': { bucket: 'brand-assets', category: 'brand-assets', alt: 'RichWil Beauty Spa brand mockup set' },
        '3d': { bucket: 'brand-assets', category: 'brand-assets', alt: 'RichWil Beauty Spa 3D logo render' },
        'color palette': { bucket: 'brand-assets', category: 'brand-assets', alt: 'RichWil Beauty Spa color palette board' },
        'marketing portfolio-01': { bucket: 'flyers', category: 'flyer', alt: 'Market Basket campaign creative 1' },
        'marketing portfolio-02': { bucket: 'flyers', category: 'flyer', alt: 'Market Basket campaign creative 2' }
    };

    const sourceRank = { '.png': 4, '.jpg': 3, '.jpeg': 3, '.webp': 2 };
    const preferredSources = new Map();

    files.forEach((file) => {
        const ext = path.extname(file).toLowerCase();
        const name = path.basename(file, ext);

        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext) || name.match(/-\d+w$/) || name.endsWith('-placeholder')) {
            return;
        }

        const current = preferredSources.get(name);
        const rank = sourceRank[ext] || 0;

        if (!current || rank > current.rank) {
            preferredSources.set(name, { file, rank });
        }
    });

    const processingPromises = [...preferredSources.values()].map(async ({ file }) => {
        const ext = path.extname(file).toLowerCase();
        const name = path.basename(file, ext);
        const filePath = path.join(imagesDir, file);

        const imagePipeline = sharp(filePath);
        
        try {
            // 1. Get Metadata
            const metadata = await imagePipeline.metadata();

            // 2. Generate placeholder
            const placeholderFilename = `${name}-placeholder.webp`;
            const placeholderPath = path.join(imagesDir, placeholderFilename);
            await imagePipeline
                .clone()
                .resize({ width: placeholderWidth })
                .webp({ quality: 20, alphaQuality: 20 })
                .toFile(placeholderPath);

            // 3. Add to gallery data object
            // Make regex less strict: match keyword anywhere in the filename
            const curatedEntry = curatedGalleryEntries[name];
            const categoryMatch = name.match(/(flyer|banner|poster|socialmedia)/i);

            if (curatedEntry && galleryData.hasOwnProperty(curatedEntry.bucket)) {
                galleryData[curatedEntry.bucket].push({
                    id: name,
                    src: `images/${file}`,
                    placeholder: `images/${placeholderFilename}`,
                    alt: curatedEntry.alt,
                    category: curatedEntry.category,
                    width: metadata.width,
                    height: metadata.height
                });
            } else if (categoryMatch) {
                const keyword = categoryMatch[0].toLowerCase();
                const singularCategory = keyword === 'socialmedia' ? 'social-media' : keyword;
                const pluralCategoryKey = { 'flyer': 'flyers', 'banner': 'banners', 'poster': 'posters', 'socialmedia': 'social-media' }[keyword];

                // Ensure the derived key is valid before proceeding
                if (pluralCategoryKey && galleryData.hasOwnProperty(pluralCategoryKey)) {
                    galleryData[pluralCategoryKey].push({
                        id: name,
                        src: `images/${file}`,
                        placeholder: `images/${placeholderFilename}`,
                        alt: `${singularCategory.replace('-', ' ')} ${name.replace(new RegExp(categoryMatch[0], 'i'), '')}`.trim(),
                        category: singularCategory, // Use singular form for filtering
                        width: metadata.width,
                        height: metadata.height
                    });
                }
            }

            // 4. Generate responsive sizes
            const resizePromises = responsiveSizes.map(width => {
                const outputFilename = `${name}-${width}w.webp`;
                const outputPath = path.join(imagesDir, outputFilename);

                return imagePipeline
                    .clone()
                    .resize({ width: width, withoutEnlargement: true }) // Don't upscale small images
                    .webp({ quality: 80 })
                    .toFile(outputPath)
                    .then(() => console.log(`Resized: ${outputFilename}`));
            });
            await Promise.all(resizePromises);

        } catch (err) {
            console.error(`Error processing ${file}:`, err.message);
        }
    });

    // Wait for all file processing to be initiated
    await Promise.all(processingPromises);

    // Sort images numerically within each category for consistent order
    for (const category in galleryData) {
        galleryData[category].sort((a, b) => {
            const numA = parseInt((a.id.match(/\d+$/) || ['0'])[0], 10);
            const numB = parseInt((b.id.match(/\d+$/) || ['0'])[0], 10);
            return numA - numB;
        });
    }

    // 3. Write the new gallery-data.js file
    const fileContent = `/**
 * Gallery Data Source
 * Automatically generated by resize-images.js on ${new Date().toISOString()}
 */
const galleryData = ${JSON.stringify(galleryData, null, 2)};
`;

    fs.writeFile(galleryDataPath, fileContent, 'utf8', (writeErr) => {
        if (writeErr) {
            console.error('Error writing gallery-data.js:', writeErr);
        } else {
            // Log a summary of images found
            console.log('\n--- Generation Summary ---');
            let totalImages = 0;
            for (const category in galleryData) {
                const count = galleryData[category].length;
                console.log(`Found ${count} image(s) for category: ${category}`);
                totalImages += count;
            }
            console.log(`Total images processed: ${totalImages}`);
            console.log('\x1b[32m%s\x1b[0m', 'Successfully generated gallery-data.js!');
        }
    });
});
