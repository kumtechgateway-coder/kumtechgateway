/**
 * Portfolio Generator
 * Dynamically generates portfolio cards based on portfolio-data.js
 */

// Helper to generate srcset locally to ensure availability and performance
function getSrcset(src) {
    if (!src || (!src.endsWith('.webp') && !src.endsWith('.png') && !src.endsWith('.jpg') && !src.endsWith('.jpeg'))) return '';
    const base = src.substring(0, src.lastIndexOf('.'));
    const sizes = [400, 800, 1200]; 
    return sizes.map(w => `${base}-${w}w.webp ${w}w`).join(', ');
}

function generatePortfolio(gridElement) {
    // Determine if we are on the homepage or portfolio page
    const isPortfolioPage = window.location.pathname.includes('portfolio.html') || document.getElementById('portfolio-page');
    
    // Homepage shows 4 items, Portfolio page shows all
    const itemsToShow = isPortfolioPage ? portfolioData : portfolioData.slice(0, 4);

    // Clear existing content
    gridElement.innerHTML = '';

    itemsToShow.forEach((project, index) => {
        const card = createPortfolioCard(project, index, isPortfolioPage);
        gridElement.appendChild(card);
    });

    // Re-trigger scroll reveal animations
    const revealElements = gridElement.querySelectorAll('.reveal-up');
    if (window.IntersectionObserver) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));
    }
}

function createPortfolioCard(project, index, isPortfolioPage) {
    const cardLink = document.createElement('a');
    cardLink.href = `/projects/${encodeURIComponent(project.id)}/`;
    cardLink.className = 'group bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 portfolio-card reveal-up flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-200 dark:border-slate-700 no-underline';
    cardLink.setAttribute('data-id', project.id);

    // Combine category and services for comprehensive filtering
    const filterTerms = new Set();
    const normalize = term => term.trim().toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');

    if (project.category) {
        filterTerms.add(normalize(project.category));
    }
    if (project.fullData && project.fullData.services) {
        project.fullData.services.split(',').forEach(service => filterTerms.add(normalize(service)));
    }
    cardLink.setAttribute('data-category', [...filterTerms].join(' '));
    
    const isEager = (isPortfolioPage && index < 4) || (!isPortfolioPage && index < 2);
    const loadingMode = isEager ? 'eager' : 'lazy';
    const fetchPriority = isEager ? 'fetchpriority="high"' : '';

    // Generate Tech Stack HTML
    let techStackHTML = '';
    if (project.fullData && project.fullData.technologies && Array.isArray(project.fullData.technologies)) {
        const techs = project.fullData.technologies.slice(0, 3);
        techStackHTML = `
            <div class="flex flex-wrap gap-2 mt-3">
                ${techs.map(tech => `<span class="text-[10px] font-medium px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded">${tech}</span>`).join('')}
            </div>
        `;
    }

    // New HTML structure for the card content.
    cardLink.innerHTML = `
        <!-- Image -->
        <div class="rounded-xl overflow-hidden">
            <img src="${project.image}" 
                 alt="${project.title}" 
                 class="w-full h-[170px] object-cover transition-transform duration-500 group-hover:scale-105" 
                 loading="${loadingMode}" 
                 decoding="async" 
                 ${fetchPriority}
                 onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Image+Not+Found'">
        </div>

        <!-- Content -->
        <div class="mt-4 flex flex-col flex-1">

            <!-- Tag -->
            <span class="bg-tech-blue/10 text-tech-blue dark:bg-cyan/20 dark:text-cyan-300 text-xs font-semibold px-3 py-1 rounded-full self-start uppercase">
                ${project.category}
            </span>

            <!-- Title -->
            <h3 class="mt-3 text-tech-blue dark:text-white font-bold leading-tight text-base portfolio-title transition-colors duration-300 group-hover:text-cyan">
                ${project.title}
            </h3>

            <!-- Description -->
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed line-clamp-3 portfolio-description flex-1">
                ${project.description}
            </p>

            <!-- Technologies -->
            ${techStackHTML}

            <!-- Button -->
            <div class="flex justify-end mt-4">
                <span class="portfolio-card-btn group/btn flex items-center gap-2 text-gray-600 dark:text-gray-300 text-sm border border-gray-300 dark:border-gray-600 px-3 py-1 rounded-full transition-all duration-300 group-hover:bg-tech-blue group-hover:text-white group-hover:border-tech-blue dark:group-hover:bg-cyan dark:group-hover:text-charcoal dark:group-hover:border-cyan">
                    View Details
                    <span class="text-lg leading-none -mt-px transition-transform duration-300 group-hover/btn:translate-x-1">&raquo;</span>
                </span>
            </div>

        </div>
    `;

    return cardLink;
}
