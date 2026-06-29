const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const SITE_URL = 'https://kumtechgateway.com';
const USER_FACING_TOP_LEVEL_PAGES = [
    'index.html',
    'services.html',
    'pricing.html',
    'portfolio.html',
    'blog.html',
    'branding-services.html',
    'web-design-services.html',
    'seo-services.html',
    'ads-management-services.html',
    'google-business-services.html',
    'gallery.html',
    'privacy-policy.html',
    'terms-of-service.html',
    'project-terms-refund-policy.html'
];

function read(file, baseDir = ROOT) {
    return fs.readFileSync(path.join(baseDir, file), 'utf8');
}

function exists(file, baseDir = ROOT) {
    return fs.existsSync(path.join(baseDir, file));
}

function listHtmlFiles(dir, baseDir = ROOT) {
    const start = path.join(baseDir, dir);
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
                files.push(path.relative(baseDir, target));
            }
        }
    }

    return files.sort();
}

function topLevelHtmlFiles(baseDir = ROOT) {
    return fs.readdirSync(baseDir, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
        .map((entry) => entry.name)
        .sort();
}

function allHtmlFiles(baseDir = ROOT) {
    return [...new Set([
        ...topLevelHtmlFiles(baseDir),
        ...listHtmlFiles('blog', baseDir),
        ...listHtmlFiles('projects', baseDir)
    ])].sort();
}

function loadPortfolio(baseDir = ROOT) {
    const context = { module: { exports: null }, exports: {}, console };
    vm.runInNewContext(
        `${read('assets/data/portfolio-data.js', baseDir)}\nmodule.exports = portfolioData;`,
        context,
        { filename: 'assets/data/portfolio-data.js' }
    );
    return context.module.exports || [];
}

function loadPricing(baseDir = ROOT) {
    const context = { window: {} };
    vm.runInNewContext(read('assets/data/pricing-data.js', baseDir), context, {
        filename: 'assets/data/pricing-data.js'
    });
    return context.window.pricingData;
}

function loadBlog(baseDir = ROOT) {
    return JSON.parse(read('assets/data/blog.json', baseDir));
}

function stripQueryAndHash(value) {
    return String(value || '').trim().split(/[?#]/, 1)[0];
}

function normalizeLocalAsset(assetPath) {
    return String(assetPath || '').trim().replace(/^\/+/, '');
}

function decodeRef(ref) {
    return decodeURIComponent(stripQueryAndHash(ref).replace(/^\/+/, ''));
}

function isRemoteRef(ref) {
    return /^(?:https?:)?\/\//i.test(String(ref || '').trim());
}

function isIgnoredRef(ref) {
    return /^(?:mailto:|tel:|javascript:|data:|#)/i.test(String(ref || '').trim());
}

function resolveAssetReference(currentFile, ref) {
    const cleanRef = stripQueryAndHash(ref);
    if (!cleanRef || isRemoteRef(cleanRef) || isIgnoredRef(cleanRef) || cleanRef === '/') {
        return null;
    }

    if (/^\/?(?:images|assets|components)\//i.test(cleanRef)) {
        return decodeRef(cleanRef);
    }

    if (/^(?:\.{0,2}\/)?(?:images|assets|components)\//i.test(cleanRef)) {
        return path.normalize(path.join(path.dirname(currentFile), decodeRef(cleanRef)));
    }

    return null;
}

function resolveInternalPage(currentFile, ref) {
    const cleanRef = stripQueryAndHash(ref);
    if (!cleanRef || isRemoteRef(cleanRef) || isIgnoredRef(cleanRef)) {
        return null;
    }

    if (cleanRef === '/') {
        return 'index.html';
    }

    if (/^\/blog\/[^/]+\/?$/i.test(cleanRef)) {
        const [, slug] = cleanRef.replace(/^\/+|\/+$/g, '').split('/');
        return path.join('blog', slug, 'index.html');
    }

    if (/^\/projects\/[^/]+\/?$/i.test(cleanRef)) {
        const [, slug] = cleanRef.replace(/^\/+|\/+$/g, '').split('/');
        return path.join('projects', slug, 'index.html');
    }

    if (/^\/.+\.html$/i.test(cleanRef)) {
        return cleanRef.replace(/^\/+/, '');
    }

    if (/^[^/].+\.html$/i.test(cleanRef)) {
        return path.normalize(path.join(path.dirname(currentFile), cleanRef));
    }

    return null;
}

function extractHtmlAttributeValues(content) {
    const values = [];
    const pattern = /\b(?:src|href|content)=["']([^"']+)["']/gi;
    let match;
    while ((match = pattern.exec(content))) {
        values.push(match[1]);
    }
    return values;
}

function extractCssUrls(content) {
    const values = [];
    const pattern = /url\(([^)]+)\)/gi;
    let match;
    while ((match = pattern.exec(content))) {
        const value = match[1].trim().replace(/^['"]|['"]$/g, '');
        values.push(value);
    }
    return values;
}

function requiredString(value, label) {
    assert.equal(typeof value, 'string', `${label} must be a string`);
    assert.notEqual(value.trim(), '', `${label} must not be empty`);
}

function unique(values, label) {
    assert.equal(new Set(values).size, values.length, `${label} must be unique`);
}

function runNodeScript(scriptPath, baseDir = ROOT) {
    return spawnSync(process.execPath, [scriptPath], {
        cwd: baseDir,
        encoding: 'utf8'
    });
}

function assertParsesWithNodeCheck(file, extension) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kumtech-parse-'));

    try {
        const tempFile = path.join(tempDir, `parse-target${extension}`);
        fs.writeFileSync(tempFile, read(file));
        const result = spawnSync(process.execPath, ['--check', tempFile], {
            encoding: 'utf8'
        });

        assert.equal(
            result.status,
            0,
            `${file} failed syntax validation.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
        );
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

function normalizeGeneratedContent(content) {
    return String(content).replace(/^\uFEFF/, '');
}

function normalizeGeneratedComparison(file, content) {
    const normalized = normalizeGeneratedContent(content);
    if (file !== 'sitemap.xml') {
        return normalized;
    }

    return normalized.replace(/<lastmod>[^<]+<\/lastmod>/g, '<lastmod>__NORMALIZED__</lastmod>');
}

test('existing production-check script passes', () => {
    const result = runNodeScript('scripts/production-check.js');
    assert.equal(
        result.status,
        0,
        `scripts/production-check.js failed.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
    );
});

test('browser JavaScript and data sources parse without syntax errors', async () => {
    for (const file of ['assets/js/app.js', 'assets/js/admin.js']) {
        assertParsesWithNodeCheck(file, '.mjs');
    }

    for (const file of ['assets/js/portfolio-generator.js']) {
        assertParsesWithNodeCheck(file, '.cjs');
    }

    assert.doesNotThrow(() => loadPortfolio(), 'portfolio-data.js should evaluate cleanly');
    assert.doesNotThrow(() => loadPricing(), 'pricing-data.js should evaluate cleanly');
    assert.doesNotThrow(() => loadBlog(), 'blog.json should parse cleanly');
});

test('blog, portfolio, and pricing modules satisfy core content contracts', () => {
    const blog = loadBlog();
    const portfolio = loadPortfolio();
    const pricing = loadPricing();

    assert.ok(Array.isArray(blog) && blog.length > 0, 'Blog data must be a non-empty array');
    assert.ok(Array.isArray(portfolio) && portfolio.length > 0, 'Portfolio data must be a non-empty array');
    assert.ok(pricing && Array.isArray(pricing.services) && pricing.services.length > 0, 'Pricing data must define services');

    unique(blog.map((post) => post.id), 'Blog ids');
    unique(portfolio.map((project) => project.id), 'Portfolio ids');
    unique(pricing.services.map((service) => service.id), 'Pricing service ids');

    for (const post of blog) {
        requiredString(post.id, `Blog post ${JSON.stringify(post)} id`);
        requiredString(post.title, `Blog post ${post.id} title`);
        requiredString(post.excerpt, `Blog post ${post.id} excerpt`);
        requiredString(post.content, `Blog post ${post.id} content`);
        requiredString(post.date, `Blog post ${post.id} date`);
        requiredString(post.author, `Blog post ${post.id} author`);
        requiredString(post.category, `Blog post ${post.id} category`);
        requiredString(post.image, `Blog post ${post.id} image`);
        assert.match(post.content, /<p\b/i, `Blog post ${post.id} content should include paragraph markup`);

        if (!isRemoteRef(post.image)) {
            assert.ok(
                exists(normalizeLocalAsset(post.image)),
                `Blog post ${post.id} image is missing: ${post.image}`
            );
        }
    }

    for (const project of portfolio) {
        requiredString(project.id, 'Portfolio project id');
        requiredString(project.category, `Portfolio project ${project.id} category`);
        requiredString(project.title, `Portfolio project ${project.id} title`);
        requiredString(project.description, `Portfolio project ${project.id} description`);
        requiredString(project.image, `Portfolio project ${project.id} image`);

        if (!isRemoteRef(project.image)) {
            assert.ok(
                exists(normalizeLocalAsset(project.image)),
                `Portfolio project ${project.id} hero image is missing: ${project.image}`
            );
        }

        if (!project.fullData) {
            continue;
        }

        requiredString(project.fullData.client, `Portfolio project ${project.id} client`);
        requiredString(project.fullData.timeline, `Portfolio project ${project.id} timeline`);
        requiredString(project.fullData.services, `Portfolio project ${project.id} services`);
        requiredString(project.fullData.challenge, `Portfolio project ${project.id} challenge`);
        requiredString(project.fullData.solution, `Portfolio project ${project.id} solution`);
        assert.ok(Array.isArray(project.fullData.results) && project.fullData.results.length > 0, `Portfolio project ${project.id} must include results`);
        assert.ok(Array.isArray(project.fullData.technologies) && project.fullData.technologies.length > 0, `Portfolio project ${project.id} must include technologies`);

        const gallery = Array.isArray(project.fullData.gallery) ? project.fullData.gallery : [];
        for (const asset of gallery) {
            if (!isRemoteRef(asset)) {
                assert.ok(
                    exists(normalizeLocalAsset(asset)),
                    `Portfolio project ${project.id} gallery asset is missing: ${asset}`
                );
            }
        }
    }

    for (const service of pricing.services) {
        requiredString(service.id, 'Pricing service id');
        requiredString(service.name, `Pricing service ${service.id} name`);
        requiredString(service.summary, `Pricing service ${service.id} summary`);
        requiredString(service.ctaHref, `Pricing service ${service.id} CTA href`);
        assert.ok(Array.isArray(service.highlights) && service.highlights.length > 0, `Pricing service ${service.id} must include highlights`);
        assert.ok(Array.isArray(service.plans) && service.plans.length > 0, `Pricing service ${service.id} must include plans`);

        const resolvedServicePage = resolveInternalPage('pricing.html', service.ctaHref);
        if (resolvedServicePage) {
            assert.ok(exists(resolvedServicePage), `Pricing service ${service.id} CTA target is missing: ${service.ctaHref}`);
        }

        unique(service.plans.map((plan) => plan.id), `Pricing plan ids within service ${service.id}`);
        for (const plan of service.plans) {
            requiredString(plan.id, `Pricing plan in ${service.id} id`);
            requiredString(plan.name, `Pricing plan ${plan.id} name`);
            requiredString(plan.price, `Pricing plan ${plan.id} price`);
            requiredString(plan.ctaHref, `Pricing plan ${plan.id} CTA href`);
            assert.ok(Array.isArray(plan.features) && plan.features.length > 0, `Pricing plan ${plan.id} must include features`);

            const resolvedPlanPage = resolveInternalPage('pricing.html', plan.ctaHref);
            if (resolvedPlanPage) {
                assert.ok(exists(resolvedPlanPage), `Pricing plan ${plan.id} CTA target is missing: ${plan.ctaHref}`);
            }
        }
    }
});

test('all local asset references and internal links resolve across HTML and CSS', () => {
    for (const file of allHtmlFiles()) {
        const content = read(file);
        for (const ref of extractHtmlAttributeValues(content)) {
            const assetPath = resolveAssetReference(file, ref);
            if (assetPath) {
                assert.ok(exists(assetPath), `Missing asset reference in ${file}: ${ref}`);
            }

            const internalPage = resolveInternalPage(file, ref);
            if (internalPage) {
                assert.ok(exists(internalPage), `Broken internal link in ${file}: ${ref}`);
            }
        }

        assert.ok(
            !content.includes('href="images/site/favicon-white.png"'),
            `${file} should use an absolute favicon path`
        );
    }

    for (const file of ['assets/css/style.css', 'assets/css/tailwind.css']) {
        const content = read(file);
        for (const ref of extractCssUrls(content)) {
            const assetPath = resolveAssetReference(file, ref);
            if (assetPath) {
                assert.ok(exists(assetPath), `Missing CSS asset reference in ${file}: ${ref}`);
            }
        }
    }
});

test('user-facing pages wire the core app shell and shared styles correctly', () => {
    for (const file of USER_FACING_TOP_LEVEL_PAGES) {
        const content = read(file);
        assert.match(content, /href="\/images\/site\/favicon-white\.png"/, `${file} should use the shared absolute favicon`);
        assert.match(content, /href="(?:\/)?assets\/css\/tailwind\.css"/, `${file} should include tailwind.css`);
        assert.match(content, /href="(?:\/)?assets\/css\/style\.css"/, `${file} should include style.css`);
        assert.match(content, /src="(?:\/)?assets\/js\/app\.js"/, `${file} should include app.js`);
        assert.ok(
            /id="navbar-placeholder"|id="navbar"/.test(content),
            `${file} should expose the navbar mount point`
        );
        assert.ok(
            /id="footer-placeholder"|<footer\b/i.test(content),
            `${file} should expose the footer mount point`
        );
    }
});

test('legacy redirect pages point to valid destinations', () => {
    const content = read('about.html');
    assert.match(content, /http-equiv="refresh" content="0; url=\/#about"/, 'about.html should redirect to /#about');
    assert.match(content, /window\.location\.replace\("\/#about"\)/, 'about.html should redirect via JavaScript fallback');
    assert.match(content, /href="\/#about"/, 'about.html should provide a manual fallback link');
});

test('generated blog/project pages and sitemap remain in sync with the source modules', () => {
    const blog = loadBlog();
    const portfolio = loadPortfolio().filter((project) => project && project.id && project.fullData);
    const sitemapXml = read('sitemap.xml');
    const sitemapLocs = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

    for (const post of blog) {
        const pagePath = path.join('blog', post.id, 'index.html');
        const content = read(pagePath);
        assert.match(content, new RegExp(post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Generated page ${pagePath} should include the blog title`);
        assert.match(content, new RegExp(post.excerpt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Generated page ${pagePath} should include the blog excerpt`);
        assert.match(content, new RegExp(`${SITE_URL}/blog/${post.id}/`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Generated page ${pagePath} should include its canonical URL`);
        assert.ok(sitemapLocs.includes(`${SITE_URL}/blog/${post.id}/`), `Sitemap must include ${SITE_URL}/blog/${post.id}/`);
    }

    for (const project of portfolio) {
        const pagePath = path.join('projects', project.id, 'index.html');
        const content = read(pagePath);
        assert.match(content, new RegExp(project.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Generated page ${pagePath} should include the project title`);
        assert.match(content, new RegExp(project.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Generated page ${pagePath} should include the project description`);
        assert.match(content, new RegExp(`${SITE_URL}/projects/${project.id}/`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Generated page ${pagePath} should include its canonical URL`);
        assert.ok(sitemapLocs.includes(`${SITE_URL}/projects/${project.id}/`), `Sitemap must include ${SITE_URL}/projects/${project.id}/`);
    }

    for (const staticPage of [
        '',
        '/services.html',
        '/branding-services.html',
        '/web-design-services.html',
        '/seo-services.html',
        '/google-business-services.html',
        '/ads-management-services.html',
        '/pricing.html',
        '/portfolio.html',
        '/gallery.html',
        '/blog.html',
        '/privacy-policy.html',
        '/terms-of-service.html',
        '/project-terms-refund-policy.html'
    ]) {
        assert.ok(
            sitemapLocs.includes(`${SITE_URL}${staticPage || '/'}`),
            `Sitemap must include ${SITE_URL}${staticPage || '/'}`
        );
    }
});

test('service worker precache entries point at real local files', () => {
    const serviceWorker = read('sw.js');
    const referencedFiles = [...serviceWorker.matchAll(/['"](\.?\/(?:assets|images|components|index\.html|services\.html|pricing\.html|portfolio\.html|blog\.html|gallery\.html|privacy-policy\.html|terms-of-service\.html|project-terms-refund-policy\.html)[^'"]*)['"]/g)]
        .map((match) => match[1]);

    assert.ok(referencedFiles.length > 0, 'sw.js should include explicit local precache entries');
    assert.match(serviceWorker, /pathname\.startsWith\('\/assets\/css\/'\)/, 'sw.js should keep CSS network-first behavior');

    for (const ref of referencedFiles) {
        const normalized = normalizeLocalAsset(ref.replace(/^\.\//, ''));
        assert.ok(exists(normalized), `Service worker references a missing local file: ${ref}`);
    }
});

test('SEO generation script is deterministic against the current generated output', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kumtech-deep-test-'));

    try {
        fs.mkdirSync(path.join(tempDir, 'assets'), { recursive: true });
        fs.cpSync(path.join(ROOT, 'scripts'), path.join(tempDir, 'scripts'), { recursive: true });
        fs.cpSync(path.join(ROOT, 'assets', 'data'), path.join(tempDir, 'assets', 'data'), { recursive: true });

        const result = runNodeScript('scripts/build-seo-pages.js', tempDir);
        assert.equal(
            result.status,
            0,
            `Temp SEO generation failed.\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
        );

        const currentGeneratedFiles = [
            'sitemap.xml',
            ...listHtmlFiles('blog'),
            ...listHtmlFiles('projects')
        ].sort();
        const tempGeneratedFiles = [
            'sitemap.xml',
            ...listHtmlFiles('blog', tempDir),
            ...listHtmlFiles('projects', tempDir)
        ].sort();

        assert.deepEqual(
            tempGeneratedFiles,
            currentGeneratedFiles,
            'Generated file sets differ between the temp rebuild and the current workspace output'
        );

        const mismatches = [];
        for (const file of tempGeneratedFiles) {
            const tempContent = normalizeGeneratedComparison(file, read(file, tempDir));
            const currentContent = normalizeGeneratedComparison(file, read(file));
            if (tempContent !== currentContent) {
                mismatches.push(file);
            }
        }

        assert.deepEqual(
            mismatches,
            [],
            `Generated output drift detected in ${mismatches.length} file(s): ${mismatches.slice(0, 10).join(', ')}`
        );
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
});
