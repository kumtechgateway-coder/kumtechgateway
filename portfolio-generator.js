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
    div.className = 'group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-2xl hover:shadow-tech-blue/20 dark:hover:shadow-cyan/20 transition-all duration-500 hover:-translate-y-2 flex flex-col portfolio-card cursor-pointer reveal-up h-full';
    div.setAttribute('data-id', project.id);
    div.setAttribute('data-category', project.category);
    
    const srcset = getSrcset(project.image);

    // Optimization: Eager load the first few images to improve LCP
    // On homepage (index 0,1), on portfolio page (index 0,1,2,3)
    const isEager = (isPortfolioPage && index < 4) || (!isPortfolioPage && index < 2);
    const loadingMode = isEager ? 'eager' : 'lazy';
    const fetchPriority = isEager ? 'fetchpriority="high"' : '';

    div.innerHTML = `
        <div class="w-full relative overflow-hidden bg-soft-gray dark:bg-slate-700">
            <img src="${project.image}" 
                 srcset="${srcset}" 
                 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" 
                 alt="${project.title}" 
                 class="w-full h-40 object-cover transition-transform duration-700 group-hover:scale-105" 
                 loading="${loadingMode}" 
                 decoding="async" 
                 ${fetchPriority}
                 onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Image+Not+Found'">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                <h3 class="text-white font-bold text-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">${project.title}</h3>
            </div>
        </div>
        <div class="p-4 flex flex-col flex-1">
            <span class="inline-block py-1 px-3 rounded-full bg-cyan/10 text-cyan text-xs font-semibold tracking-wider uppercase mb-2 w-max">${project.category}</span>
            <h3 class="font-heading text-lg font-bold text-tech-blue dark:text-white mb-1 portfolio-title">${project.title}</h3>
            <p class="text-charcoal/70 dark:text-gray-400 text-sm line-clamp-3 portfolio-description mb-3 flex-1">${project.description}</p>
            <div class="pt-4 border-t border-gray-200 dark:border-white/10 mt-auto flex justify-end">
                <button class="group text-xs font-bold text-tech-blue dark:text-cyan rounded-full border border-tech-blue/40 dark:border-cyan/40 px-3 py-1.5 flex items-center gap-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:bg-tech-blue dark:hover:bg-cyan hover:text-white dark:hover:text-charcoal">View Detail <i class="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i></button>
            </div>
        </div>
    `;

    // Attach click event to open modal
    div.addEventListener('click', (e) => {
        if (typeof window.openModalWithData === 'function') {
            window.openModalWithData(project);
        }
    });

    return div;
}