/**
 * Portfolio Generator
 * Dynamically generates portfolio cards based on portfolio-data.js
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if portfolioData exists
    if (typeof portfolioData === 'undefined') {
        console.error('portfolioData is not defined. Make sure portfolio-data.js is included before this script.');
        return;
    }

    const portfolioGrid = document.querySelector('.portfolio-grid');
    
    // Only proceed if a portfolio grid exists on the page
    if (portfolioGrid) {
        generatePortfolio(portfolioGrid);
    }
});

function generatePortfolio(gridElement) {
    // Determine if we are on the homepage or portfolio page
    // We check for the presence of filters or specific page IDs to decide
    const isPortfolioPage = window.location.pathname.includes('portfolio.html') || document.getElementById('portfolio-page');
    
    // Homepage shows 4 items, Portfolio page shows all
    const itemsToShow = isPortfolioPage ? portfolioData : portfolioData.slice(0, 4);

    // Clear existing content (loading spinners or hardcoded items)
    gridElement.innerHTML = '';

    itemsToShow.forEach((project, index) => {
        const card = createPortfolioCard(project, index);
        gridElement.appendChild(card);
    });

    // Re-trigger scroll reveal animations if needed
    // (Assuming script.js handles the IntersectionObserver for .reveal-up)
    const revealElements = gridElement.querySelectorAll('.reveal-up');
    if (window.IntersectionObserver) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => observer.observe(el));
    }
}

function createPortfolioCard(project, index) {
    const div = document.createElement('div');
    div.className = 'group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-tech-blue/10 dark:border-white/5 shadow-md hover:shadow-2xl hover:shadow-tech-blue/10 transition-all duration-500 hover:-translate-y-2 flex flex-col portfolio-card cursor-pointer reveal-up';
    div.setAttribute('data-id', project.id);
    div.setAttribute('data-category', project.category);
    
    // Add animation delay based on index
    // div.style.animationDelay = `${index * 100}ms`; // Optional if using CSS animation

    div.innerHTML = `
        <div class="w-full relative aspect-[4/3] overflow-hidden bg-soft-gray flex items-center justify-center p-4">
            <img src="${project.image}" alt="${project.title}" class="w-auto h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Image+Not+Found'">
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
        // Call the function in script.js (to be implemented in next step)
        if (typeof openModalWithData === 'function') {
            openModalWithData(project);
        } else {
            console.warn('openModalWithData function not found. Please update script.js');
        }
    });

    return div;
}