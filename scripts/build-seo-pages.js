const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const site = 'https://kumtechgateway.com';
const ga = 'G-H55QGC66WN';

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, content) => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
};
const wipe = (dir) => {
    const target = path.join(root, dir);
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
};
const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const abs = (value) => {
    const text = String(value ?? '').trim();
    if (!text) return `${site}/images/logo.png`;
    try { return new URL(text, `${site}/`).href; } catch { return `${site}/images/logo.png`; }
};
const iso = (value) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

function loadPortfolio() {
    const context = { module: { exports: null }, exports: {}, console };
    vm.runInNewContext(`${read('assets/data/portfolio-data.js')}\nmodule.exports = portfolioData;`, context, { filename: 'assets/data/portfolio-data.js' });
    return context.module.exports || [];
}

function loadBlog() {
    return JSON.parse(read('assets/data/blog.json'));
}

function head({ title, description, canonical, image, type = 'website', schema = [] }) {
    const url = abs(canonical);
    const img = abs(image);
    const scripts = schema.map((item) => `    <script type="application/ld+json">\n${JSON.stringify(item, null, 2)}\n    </script>`).join('\n');
    return `    <script async src="https://www.googletagmanager.com/gtag/js?id=${ga}"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${url}">
    <link rel="alternate" hreflang="en" href="${url}">
    <link rel="alternate" hreflang="x-default" href="${url}">
    <meta property="og:type" content="${esc(type)}">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(description)}">
    <meta property="og:image" content="${img}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(description)}">
    <meta name="twitter:image" content="${img}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" media="print" onload="this.media='all'">
    <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Poppins:wght@400;500;600;700&amp;family=Space+Grotesk:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="/images/logo.png">
    <link rel="stylesheet" href="/assets/css/tailwind.css">
    <link rel="stylesheet" href="/assets/css/style.css">
${scripts}`;
}

function shell(bodyClass, headMarkup, mainMarkup) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
${headMarkup}
</head>
<body class="${bodyClass}">
    <div id="cursor-dot" class="hidden md:block"></div>
    <div id="cursor-outline" class="hidden md:block"></div>
    <header id="navbar-placeholder"></header>
    <main>
${mainMarkup}
        <div id="footer-placeholder"></div>
        <button id="backToTop" class="hidden md:flex fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-orange to-soft-amber text-white rounded-full items-center justify-center text-lg shadow-custom cursor-pointer transition-all duration-300 opacity-0 invisible translate-y-5 hover:bg-tech-blue hover:from-tech-blue hover:to-tech-blue hover:-translate-y-1 z-50" aria-label="Back to top"><i class="fas fa-arrow-up"></i></button>
        <div id="whatsapp-container" class="fixed bottom-6 right-6 z-50 md:hidden opacity-0 invisible translate-y-5 transition-all duration-300">
            <div id="whatsapp-popup" class="absolute bottom-full right-0 mb-4 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden origin-bottom-right transition-all duration-300 opacity-0 scale-90 pointer-events-none border border-gray-100 dark:border-slate-700">
                <div class="bg-tech-blue p-4 flex items-center gap-3 relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-r from-tech-blue to-cyan opacity-90"></div><div class="relative z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white shrink-0"><i class="fas fa-headset"></i><div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-tech-blue rounded-full"></div></div><div class="relative z-10 flex-1"><h4 class="text-white font-bold text-sm leading-tight">Support Team</h4><p class="text-white/80 text-xs">Typically replies instantly</p></div><button id="close-whatsapp-popup" class="relative z-10 text-white/70 hover:text-white transition-colors p-1" aria-label="Close WhatsApp popup"><i class="fas fa-times"></i></button></div>
                <div class="p-4 bg-gray-50 dark:bg-slate-900/50"><div class="bg-white dark:bg-slate-700 p-3.5 rounded-2xl rounded-tl-none shadow-sm text-sm text-charcoal dark:text-gray-200 leading-relaxed border border-gray-100 dark:border-slate-600">Hi there! &#128075; How can we help you grow your business today?</div><div class="text-[10px] text-gray-400 mt-2 text-right font-medium">Just now</div></div>
            </div>
            <a href="https://wa.me/237679796638" id="whatsappMobileBtn" target="_blank" rel="noopener noreferrer" class="group relative w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-green-500/30" aria-label="Chat on WhatsApp"><i class="fab fa-whatsapp"></i><span class="absolute top-0 right-0 flex h-3.5 w-3.5 -mt-1 -mr-1"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white dark:border-slate-900"></span></span></a>
        </div>
    </main>
    <script type="module" src="/assets/js/app.js"></script>
</body>
</html>
`;
}

function blogPage(post, related) {
    const page = `/blog/${encodeURIComponent(post.id)}/`;
    const schema = [
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${site}/blog.html` },
            { '@type': 'ListItem', position: 3, name: post.title, item: `${site}${page}` }
        ]},
        { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt, image: [abs(post.image)], datePublished: iso(post.date), dateModified: iso(post.date), author: { '@type': 'Person', name: post.author }, publisher: { '@type': 'Organization', name: 'Kumtech Gateway', logo: { '@type': 'ImageObject', url: `${site}/images/logo.png` } }, mainEntityOfPage: `${site}${page}` }
    ];
    const relatedMarkup = related.length ? `
                <section class="mt-16 border-t border-gray-200 dark:border-white/10 pt-10">
                    <div class="flex items-center justify-between gap-4 mb-6"><h2 class="font-heading text-2xl font-bold text-tech-blue dark:text-white">More insights</h2><a href="/blog.html" data-track-event="blog_cta_click" data-track-category="cta" data-track-label="blog_related_view_all" class="text-sm font-semibold text-cyan hover:text-tech-blue transition-colors">View all articles</a></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
${related.map((item) => `                        <a href="/blog/${encodeURIComponent(item.id)}/" class="group rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-800 p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300"><span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase bg-cyan/10 text-cyan">${esc(item.category)}</span><h3 class="mt-4 text-xl font-bold text-tech-blue dark:text-white group-hover:text-cyan transition-colors">${esc(item.title)}</h3><p class="mt-3 text-sm text-charcoal/70 dark:text-gray-400 leading-relaxed">${esc(item.excerpt)}</p></a>`).join('\n')}
                    </div>
                </section>` : '';
    return shell('font-sans text-charcoal bg-white overflow-x-hidden leading-relaxed dark:bg-charcoal dark:text-white transition-colors duration-300', head({ title: `${post.title} | Kumtech Gateway Blog`, description: post.excerpt, canonical: page, image: post.image, type: 'article', schema }), `        <section class="pt-28 md:pt-40 pb-20 relative dark:bg-charcoal">
            <div class="container mx-auto px-5 max-w-[900px]">
                <nav class="text-sm text-charcoal/60 dark:text-gray-400 mb-6" aria-label="Breadcrumb"><a href="/" class="hover:text-cyan transition-colors">Home</a><span class="mx-2">&rsaquo;</span><a href="/blog.html" class="hover:text-cyan transition-colors">Blog</a><span class="mx-2">&rsaquo;</span><span aria-current="page">${esc(post.title)}</span></nav>
                <article class="rounded-[2rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-800 p-6 md:p-10 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.28)]">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.18em] uppercase bg-cyan/10 text-cyan">${esc(post.category)}</span>
                    <h1 class="mt-5 text-3xl md:text-5xl font-heading font-bold text-tech-blue dark:text-white leading-tight">${esc(post.title)}</h1>
                    <div class="mt-5 flex flex-wrap items-center gap-3 text-sm text-charcoal/60 dark:text-gray-400"><span class="inline-flex items-center gap-2"><i class="far fa-user"></i>${esc(post.author)}</span><span>&bull;</span><time datetime="${esc(iso(post.date))}">${esc(post.date)}</time></div>
                    <img src="${abs(post.image)}" alt="${esc(post.title)}" class="mt-8 w-full h-auto rounded-2xl shadow-lg max-h-[500px] object-cover" width="800" height="400">
                    <div class="prose prose-lg dark:prose-invert max-w-none text-charcoal/80 dark:text-gray-300 leading-relaxed mt-10">${post.content}</div>
                    <div class="mt-10 pt-8 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center gap-4"><span class="font-semibold text-tech-blue dark:text-white">Share:</span><a href="https://wa.me/?text=${encodeURIComponent(`${post.title} ${site}${page}`)}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:-translate-y-1 transition-transform" aria-label="Share on WhatsApp"><i class="fab fa-whatsapp"></i></a><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${site}${page}`)}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:-translate-y-1 transition-transform" aria-label="Share on Facebook"><i class="fab fa-facebook-f"></i></a><a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${site}${page}`)}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:-translate-y-1 transition-transform" aria-label="Share on X"><i class="fab fa-twitter"></i></a></div>
                </article>
${relatedMarkup}
            </div>
        </section>`);
}

function projectPage(project, related) {
    const page = `/projects/${encodeURIComponent(project.id)}/`;
    const data = project.fullData || {};
    const tech = Array.isArray(data.technologies) ? data.technologies : [];
    const gallery = [project.image, ...(Array.isArray(data.gallery) ? data.gallery : [])].filter(Boolean);
    const live = String(data.liveUrl ?? '').trim();
    const schema = [
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
            { '@type': 'ListItem', position: 2, name: 'Portfolio', item: `${site}/portfolio.html` },
            { '@type': 'ListItem', position: 3, name: project.title, item: `${site}${page}` }
        ]},
        { '@context': 'https://schema.org', '@type': 'CreativeWork', name: project.title, description: project.description, image: abs(project.image), creator: { '@type': 'Organization', name: 'Kumtech Gateway' }, keywords: [project.category, data.services].filter(Boolean).join(', '), url: `${site}${page}` }
    ];
    const relatedMarkup = related.length ? `
        <section class="py-16 bg-gray-50 dark:bg-dark-800/50 border-t border-gray-100 dark:border-gray-800">
            <div class="container max-w-7xl mx-auto px-5">
                <div class="flex flex-wrap items-center justify-between gap-4 mb-10"><h2 class="font-heading text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Related Projects</h2><a href="/portfolio.html" class="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-primary-500 transition-colors">View All<i class="fas fa-arrow-right text-sm"></i></a></div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
${related.map((item) => `                    <a href="/projects/${encodeURIComponent(item.id)}/" class="group block bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:-translate-y-1"><div class="aspect-video bg-slate-100 dark:bg-slate-700"><img src="${abs(item.image)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" alt="${esc(item.title)}"></div><div class="p-4"><p class="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">${esc(item.category)}</p><h3 class="mt-2 font-heading font-semibold text-gray-900 dark:text-white">${esc(item.title)}</h3><p class="mt-2 text-sm text-gray-600 dark:text-gray-400">${esc(item.description)}</p></div></a>`).join('\n')}
                </div>
            </div>
        </section>` : '';
    return shell('project-detail-page font-sans antialiased bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100', head({ title: `${project.title} | Kumtech Gateway Case Study`, description: project.description, canonical: page, image: project.image, type: 'article', schema }), `        <section class="py-12 md:py-16">
            <div class="container max-w-7xl mx-auto px-5">
                <nav class="text-sm text-charcoal/60 dark:text-gray-400 mb-8" aria-label="Breadcrumb"><a href="/" class="hover:text-cyan transition-colors">Home</a><span class="mx-2">&rsaquo;</span><a href="/portfolio.html" class="hover:text-cyan transition-colors">Portfolio</a><span class="mx-2">&rsaquo;</span><span aria-current="page">${esc(project.title)}</span></nav>
                <div class="lg:flex lg:gap-12 xl:gap-16">
                    <aside class="lg:w-80 xl:w-96 flex-shrink-0">
                        <div class="lg:sticky lg:top-24 space-y-6">
                            <div class="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                                <h2 class="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><i class="fas fa-clipboard-list text-primary-500"></i>Project Details</h2>
                                <ul class="space-y-4 text-sm">
                                    <li class="flex items-start gap-3"><i class="fas fa-user-tie w-5 text-primary-500 mt-0.5"></i><div><span class="block text-xs text-gray-500 dark:text-gray-400">Client</span><span class="font-medium text-gray-900 dark:text-white">${esc(data.client || 'Confidential client')}</span></div></li>
                                    <li class="flex items-start gap-3"><i class="fas fa-calendar-alt w-5 text-primary-500 mt-0.5"></i><div><span class="block text-xs text-gray-500 dark:text-gray-400">Timeline</span><span class="font-medium text-gray-900 dark:text-white">${esc(data.timeline || 'Custom engagement')}</span></div></li>
                                    <li class="flex items-start gap-3"><i class="fas fa-cog w-5 text-primary-500 mt-0.5"></i><div><span class="block text-xs text-gray-500 dark:text-gray-400">Services</span><span class="font-medium text-gray-900 dark:text-white">${esc(data.services || project.category)}</span></div></li>
                                </ul>
                                ${live && live !== '#' ? `<a href="${esc(live)}" target="_blank" rel="noopener noreferrer" class="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-primary-500/20"><span>Live Demo</span><i class="fas fa-arrow-right text-sm"></i></a>` : ''}
                            </div>
                            ${tech.length ? `<div class="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800"><h2 class="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-4">Technologies</h2><div class="flex flex-wrap gap-2">${tech.map((item) => `<span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan/10 text-cyan">${esc(item)}</span>`).join('')}</div></div>` : ''}
                        </div>
                    </aside>
                    <div class="lg:flex-1 mt-8 lg:mt-0 min-w-0">
                        <div class="mb-8"><span class="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-cyan uppercase rounded-full bg-cyan/10">${esc(project.category)}</span><h1 class="text-3xl md:text-5xl font-heading font-bold text-tech-blue dark:text-white leading-tight">${esc(project.title)}</h1><p class="mt-4 text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">${esc(project.description)}</p></div>
                        <div class="mb-12"><div class="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-800 aspect-video"><img src="${abs(project.image)}" alt="${esc(project.title)}" class="w-full h-full object-cover"></div>${gallery.length > 1 ? `<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">${gallery.slice(1, 5).map((item, index) => `<img src="${abs(item)}" class="w-full h-24 object-cover rounded-lg border border-gray-100 dark:border-gray-800" loading="lazy" alt="${esc(project.title)} preview ${index + 1}">`).join('')}</div>` : ''}</div>
                        <div class="space-y-10">
                            <div class="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"><h2 class="flex items-center gap-3 font-heading text-xl font-semibold text-gray-900 dark:text-white mb-4"><i class="fas fa-mountain text-primary-500"></i>The Challenge</h2><p class="text-gray-600 dark:text-gray-300 leading-relaxed">${esc(data.challenge || project.description)}</p></div>
                            <div class="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800"><h2 class="flex items-center gap-3 font-heading text-xl font-semibold text-gray-900 dark:text-white mb-4"><i class="fas fa-lightbulb text-primary-500"></i>The Solution</h2><p class="text-gray-600 dark:text-gray-300 leading-relaxed">${esc(data.solution || project.description)}</p></div>
                        </div>
                        <div class="mt-10 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-dark-800 rounded-2xl p-8 border border-primary-100 dark:border-primary-900/30"><h2 class="flex items-center gap-3 font-heading text-xl font-semibold text-gray-900 dark:text-white mb-6"><i class="fas fa-chart-line text-primary-500"></i>Key Results</h2><ul class="grid grid-cols-1 md:grid-cols-2 gap-4">${(Array.isArray(data.results) ? data.results : [project.description]).map((item) => `<li class="flex items-start gap-3 bg-white dark:bg-dark-800/50 p-4 rounded-xl"><i class="fas fa-check-circle text-primary-500 mt-1"></i><span>${esc(item)}</span></li>`).join('')}</ul></div>
                        <div class="mt-10 rounded-2xl bg-gradient-to-r from-tech-blue to-cyan text-white p-8 shadow-[0_20px_50px_-20px_rgba(2,132,199,0.55)]"><h2 class="font-heading text-2xl font-bold">Want a project like this?</h2><p class="mt-3 text-white/80 max-w-2xl">We help businesses launch stronger websites, sharper brands, and better-performing digital systems for local, national, and remote growth.</p><div class="mt-6 flex flex-wrap gap-4"><a href="/#contact" data-track-event="contact_cta_click" data-track-category="cta" data-track-label="project_start_project" class="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-tech-blue font-bold hover:-translate-y-0.5 transition-all duration-300 shadow-lg">Start a Project</a><a href="/services.html" data-track-event="services_cta_click" data-track-category="cta" data-track-label="project_explore_services" class="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/30 text-white font-bold hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300">Explore Services</a></div></div>
                    </div>
                </div>
            </div>
        </section>
${relatedMarkup}`);
}

function sitemap(blog, portfolio) {
    const pages = [
        ['/', 'weekly', '1.0'],
        ['/services.html', 'weekly', '0.9'],
        ['/pricing.html', 'weekly', '0.9'],
        ['/portfolio.html', 'weekly', '0.8'],
        ['/gallery.html', 'weekly', '0.7'],
        ['/blog.html', 'weekly', '0.8'],
        ...blog.map((post) => [`/blog/${encodeURIComponent(post.id)}/`, 'monthly', '0.7']),
        ...portfolio.filter((project) => project && project.id && project.fullData).map((project) => [`/projects/${encodeURIComponent(project.id)}/`, 'monthly', '0.7'])
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([loc, changefreq, priority]) => `  <url>\n    <loc>${esc(`${site}${loc}`)}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`).join('\n')}\n</urlset>\n`;
}

function main() {
    const blog = loadBlog();
    const portfolio = loadPortfolio();
    wipe('blog');
    wipe('projects');

    blog.forEach((post) => {
        const related = blog.filter((item) => item.id !== post.id).sort((left, right) => (left.category === post.category ? -1 : 1) - (right.category === post.category ? -1 : 1)).slice(0, 2);
        write(`blog/${post.id}/index.html`, blogPage(post, related));
    });

    portfolio.filter((project) => project && project.id && project.fullData).forEach((project) => {
        const related = portfolio.filter((item) => item.id !== project.id && item.category === project.category && item.fullData).slice(0, 3);
        write(`projects/${project.id}/index.html`, projectPage(project, related));
    });

    write('sitemap.xml', sitemap(blog, portfolio));
    console.log(`Generated ${blog.length} blog pages, ${portfolio.filter((project) => project && project.id && project.fullData).length} project pages, and sitemap.xml.`);
}

main();
