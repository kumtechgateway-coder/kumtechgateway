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
    const div = document.createElement('div');
    div.className = 'group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-tech-blue/10 dark:border-white/5 shadow-md hover:shadow-2xl hover:shadow-tech-blue/10 transition-all duration-500 hover:-translate-y-2 flex flex-col portfolio-card cursor-pointer reveal-up mb-6 break-inside-avoid';
    div.setAttribute('data-id', project.id);
    div.setAttribute('data-category', project.category);
    
    const srcset = getSrcset(project.image);

    // Optimization: Eager load the first few images to improve LCP
    // On homepage (index 0,1), on portfolio page (index 0,1,2,3)
    const isEager = (isPortfolioPage && index < 4) || (!isPortfolioPage && index < 2);
    const loadingMode = isEager ? 'eager' : 'lazy';
    const fetchPriority = isEager ? 'fetchpriority="high"' : '';

    div.innerHTML = `
        <div class="w-full relative overflow-hidden bg-soft-gray dark:bg-slate-700 aspect-[4/3]">
            <img src="${project.image}" 
                 srcset="${srcset}" 
                 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" 
                 alt="${project.title}" 
                 class="w-full h-full object-cover transition-transform duration-700" 
                 loading="${loadingMode}" 
                 decoding="async" 
                 ${fetchPriority}
                 onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Image+Not+Found'">
            <div class="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                <span class="text-cyan text-xs font-bold uppercase tracking-wider mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">${project.category}</span>
                <h3 class="text-white font-bold text-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">${project.title}</h3>
            </div>
        </div>
        <div class="p-6 flex flex-col flex-1">
            <h3 class="font-heading text-lg font-bold text-tech-blue dark:text-white mb-2 portfolio-title">${project.title}</h3>
            <p class="text-charcoal/70 dark:text-gray-400 text-sm line-clamp-2 portfolio-description mb-4 flex-1">${project.description}</p>
            <div class="pt-4 border-t border-gray-100 dark:border-white/10 mt-auto">
                <button class="text-sm font-bold text-tech-blue dark:text-cyan group-hover:underline flex items-center gap-2">View Case Study <i class="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i></button>
            </div>
        </div>
    `;

    // Attach click event to open modal
    div.addEventListener('click', (e) => {
        e.preventDefault();
        // Dispatch a custom event that the main script can listen for
        div.dispatchEvent(new CustomEvent('open-case-study', { detail: { project }, bubbles: true }));
    });

    return div;
}