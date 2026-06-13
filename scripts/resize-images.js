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

function walkFiles(dirPath, baseDir = dirPath) {
    const files = [];

    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            files.push(...walkFiles(fullPath, baseDir));
        } else {
            files.push(path.relative(baseDir, fullPath));
        }
    }

    return files;
}

function toPosixPath(filePath) {
    return filePath.split(path.sep).join('/');
}

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
    console.error(`Error: Directory not found: ${imagesDir}`);
    process.exit(1);
}

console.log('Starting image processing and data generation...');

(async () => {
    let files;

    try {
        files = walkFiles(imagesDir);
    } catch (err) {
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
        const sourceKey = path.join(path.dirname(file), name);

        if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext) || name.match(/-\d+w$/) || name.endsWith('-placeholder')) {
            return;
        }

        const current = preferredSources.get(sourceKey);
        const rank = sourceRank[ext] || 0;

        if (!current || rank > current.rank) {
            preferredSources.set(sourceKey, { file, rank });
        }
    });

    const processingPromises = [...preferredSources.values()].map(async ({ file }) => {
        const ext = path.extname(file).toLowerCase();
        const name = path.basename(file, ext);
        const filePath = path.join(imagesDir, file);
        const outputDir = path.dirname(filePath);
        const relativeSource = toPosixPath(file);

        const imagePipeline = sharp(filePath);
        
        try {
            const metadata = await imagePipeline.metadata();

            const placeholderFilename = `${name}-placeholder.webp`;
            const placeholderPath = path.join(outputDir, placeholderFilename);
            const relativePlaceholder = toPosixPath(path.join(path.dirname(file), placeholderFilename));

            await imagePipeline
                .clone()
                .resize({ width: placeholderWidth })
                .webp({ quality: 20, alphaQuality: 20 })
                .toFile(placeholderPath);

            const curatedEntry = curatedGalleryEntries[name];
            const categoryMatch = name.match(/(flyer|banner|poster|socialmedia)/i);

            if (curatedEntry && galleryData.hasOwnProperty(curatedEntry.bucket)) {
                galleryData[curatedEntry.bucket].push({
                    id: name,
                    src: `images/${relativeSource}`,
                    placeholder: `images/${relativePlaceholder}`,
                    alt: curatedEntry.alt,
                    category: curatedEntry.category,
                    width: metadata.width,
                    height: metadata.height
                });
            } else if (categoryMatch) {
                const keyword = categoryMatch[0].toLowerCase();
                const singularCategory = keyword === 'socialmedia' ? 'social-media' : keyword;
                const pluralCategoryKey = { 'flyer': 'flyers', 'banner': 'banners', 'poster': 'posters', 'socialmedia': 'social-media' }[keyword];

                if (pluralCategoryKey && galleryData.hasOwnProperty(pluralCategoryKey)) {
                    galleryData[pluralCategoryKey].push({
                        id: name,
                        src: `images/${relativeSource}`,
                        placeholder: `images/${relativePlaceholder}`,
                        alt: `${singularCategory.replace('-', ' ')} ${name.replace(new RegExp(categoryMatch[0], 'i'), '')}`.trim(),
                        category: singularCategory,
                        width: metadata.width,
                        height: metadata.height
                    });
                }
            }

            const resizePromises = responsiveSizes.map((width) => {
                const outputFilename = `${name}-${width}w.webp`;
                const outputPath = path.join(outputDir, outputFilename);

                return imagePipeline
                    .clone()
                    .resize({ width, withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(outputPath)
                    .then(() => console.log(`Resized: ${toPosixPath(path.join(path.dirname(file), outputFilename))}`));
            });

            await Promise.all(resizePromises);
        } catch (err) {
            console.error(`Error processing ${file}:`, err.message);
        }
    });

    await Promise.all(processingPromises);

    for (const category in galleryData) {
        galleryData[category].sort((a, b) => {
            const numA = parseInt((a.id.match(/\d+$/) || ['0'])[0], 10);
            const numB = parseInt((b.id.match(/\d+$/) || ['0'])[0], 10);
            return numA - numB;
        });
    }

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
})();
