const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const criticalFiles = [
    'blog-post.html',
    'project-detail.html',
    'assets/js/app.js',
    'assets/js/portfolio-generator.js',
    'assets/data/blog.json',
    'firebase.json',
    'sw.js',
    'sitemap.xml'
];

function read(file) {
    return fs.readFileSync(path.join(root, file), 'utf8');
}

function exists(file) {
    return fs.existsSync(path.join(root, file));
}

function loadPortfolio() {
    const context = { module: { exports: null }, exports: {}, console };
    vm.runInNewContext(`${read('assets/data/portfolio-data.js')}\nmodule.exports = portfolioData;`, context, {
        filename: 'assets/data/portfolio-data.js'
    });
    return context.module.exports || [];
}

function walkHtmlFiles(dir) {
    const start = path.join(root, dir);
    if (!fs.existsSync(start)) return [];

    const files = [];
    const stack = [start];

    while (stack.length) {
        const current = stack.pop();
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const target = path.join(current, entry.name);
            if (entry.isDirectory()) {
                stack.push(target);
                continue;
            }

            if (entry.isFile() && target.endsWith('.html')) {
                files.push(path.relative(root, target));
            }
        }
    }

    return files;
}

function normalizeLocalAsset(assetPath) {
    return String(assetPath || '').trim().replace(/^\/+/, '');
}

function isRemoteAsset(assetPath) {
    return /^https?:\/\//i.test(String(assetPath || '').trim());
}

function assert(condition, message, failures) {
    if (!condition) {
        failures.push(message);
    }
}

function assertIncludes(content, value, message, failures) {
    assert(content.includes(value), message, failures);
}

function main() {
    const failures = [];
    const blog = JSON.parse(read('assets/data/blog.json'));
    const portfolio = loadPortfolio();
    const generatedHtmlFiles = [...walkHtmlFiles('blog'), ...walkHtmlFiles('projects')];
    const blogShell = read('blog-post.html');
    const projectShell = read('project-detail.html');

    for (const file of criticalFiles) {
        assert(exists(file), `Missing required file: ${file}`, failures);
    }

    for (const file of [...criticalFiles, ...generatedHtmlFiles]) {
        const content = read(file);
        assert(!content.includes('placehold.co'), `Placeholder asset found in ${file}`, failures);
    }

    for (const post of blog) {
        const generatedPath = path.join('blog', post.id, 'index.html');
        assert(exists(generatedPath), `Missing generated blog page: ${generatedPath}`, failures);

        if (!isRemoteAsset(post.image)) {
            const imagePath = normalizeLocalAsset(post.image);
            assert(exists(imagePath), `Missing blog image asset: ${imagePath}`, failures);
        }
    }

    const projectEntries = portfolio.filter((project) => project && project.id && project.fullData);
    for (const project of projectEntries) {
        const generatedPath = path.join('projects', project.id, 'index.html');
        assert(exists(generatedPath), `Missing generated project page: ${generatedPath}`, failures);

        const localAssets = [project.image, ...(Array.isArray(project.fullData.gallery) ? project.fullData.gallery : [])]
            .filter(Boolean)
            .filter((asset) => !isRemoteAsset(asset))
            .map(normalizeLocalAsset);

        for (const assetPath of localAssets) {
            assert(exists(assetPath), `Missing project asset: ${assetPath}`, failures);
        }
    }

    assertIncludes(blogShell, 'meta name="robots" content="noindex, follow"', 'Blog shell must be noindex.', failures);
    assertIncludes(blogShell, 'link rel="canonical" href="https://kumtechgateway.com/blog.html"', 'Blog shell canonical must point to the blog index.', failures);
    assertIncludes(blogShell, 'link rel="icon" type="image/png" href="/images/logo.png"', 'Blog shell favicon path must be absolute.', failures);
    assertIncludes(projectShell, 'meta name="robots" content="noindex, follow"', 'Project shell must be noindex.', failures);
    assertIncludes(projectShell, 'link rel="canonical" href="https://kumtechgateway.com/portfolio.html"', 'Project shell canonical must point to the portfolio index.', failures);

    if (failures.length) {
        console.error('Production check failed:\n');
        failures.forEach((failure) => console.error(`- ${failure}`));
        process.exit(1);
    }

    console.log(`Production check passed for ${blog.length} blog posts and ${projectEntries.length} portfolio projects.`);
}

main();
