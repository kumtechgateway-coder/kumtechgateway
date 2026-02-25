/**
 * Kumtech Gateway Portfolio Website
 * JavaScript for interactive functionality
 * 
 * Features:
 * - Smooth scrolling navigation
 * - Active section highlighting
 * - Mobile menu toggle
 * - Sticky navbar
 * - Current year in footer
 */

/**
 * Centralized Application State
 * @type {Object}
 */
const AppState = {
    caseStudies: {},
    filter: {
        currentPage: 1,
        itemsPerPage: 6,
        history: ['all'],
        historyIndex: 0,
        activeCategory: 'all'
    }
};

/**
 * Toast Notification System
 */
const Toast = {
    init() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
    },
    show(message, type = 'info') {
        this.init();
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle text-red-500' : type === 'success' ? 'fa-check-circle text-green-500' : 'fa-info-circle text-tech-blue'}"></i>
            <span class="font-medium text-sm">${message}</span>
        `;
        container.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => toast.classList.add('show'));
        
        // Remove after 3s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

/**
 * Internationalization (i18n) System
 */
const I18n = {
    translations: {},
    init() {
        // Detect language (default to 'en')
        const userLang = navigator.language || navigator.userLanguage;
        const lang = userLang.startsWith('fr') ? 'fr' : 'en';
        
        // Fetch translations
        fetch('translations.json')
            .then(response => response.json())
            .then(data => {
                this.translations = data;
                this.apply(lang);
            })
            .catch(error => console.error('Error loading translations:', error));
    },
    apply(lang) {
        document.documentElement.lang = lang;
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (this.translations[lang] && this.translations[lang][key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = this.translations[lang][key];
                } else {
                    el.innerHTML = this.translations[lang][key];
                }
            }
        });
    }
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Internationalization
    I18n.init();

    // Custom Cursor Logic
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    const bodyForCursor = document.body;

    if (cursorDot && cursorOutline) {
        window.addEventListener('mousemove', function(e) {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Ensure cursor is visible on move
            if (window.innerWidth > 768) {
                if (!bodyForCursor.classList.contains('cursor-active')) bodyForCursor.classList.add('cursor-active');
            } else {
                bodyForCursor.classList.remove('cursor-active');
            }

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: 'forwards' });
        });

        bodyForCursor.addEventListener('mouseenter', () => {
            if (window.innerWidth > 768) { // Only show on desktop
                bodyForCursor.classList.add('cursor-active');
            }
        });

        bodyForCursor.addEventListener('mouseleave', () => {
            bodyForCursor.classList.remove('cursor-active');
        });

        document.querySelectorAll('a, button, .cursor-pointer, [data-id], .filter-btn').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('hover');
                cursorDot.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('hover');
                cursorDot.classList.remove('hover');
            });
        });
    }

    // Hero Particle Animation
    const particleContainer = document.getElementById('hero-particle-bg');
    if (particleContainer) {
        const numParticles = 25;
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = Math.random() * 5 + 1;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.bottom = `-${size}px`;
            particle.style.animationDelay = `${Math.random() * 25}s`;
            particle.style.setProperty('--x-end', (Math.random() - 0.5) * 400);
            particleContainer.appendChild(particle);
        }
    }

    // Restore State (Scroll + Pagination)
    const stateKey = `appState-${window.location.pathname}`;
    const savedState = JSON.parse(sessionStorage.getItem(stateKey));
    
    if (savedState) {
        if (savedState.currentPage) AppState.filter.currentPage = savedState.currentPage;
        if (savedState.scrollY) {
            // Delay scroll to allow content to render
            setTimeout(() => window.scrollTo(0, savedState.scrollY), 100);
        }
    }
    
    window.addEventListener('beforeunload', () => {
        const stateToSave = {
            scrollY: window.scrollY,
            currentPage: AppState.filter.currentPage
        };
        sessionStorage.setItem(stateKey, JSON.stringify(stateToSave));
    });

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed: ', err));
        });
    }

    /**
     * Throttles a function to limit its execution rate.
     * @param {Function} func - The function to throttle.
     * @returns {Function} - The throttled function.
     */
     function throttle(func) {
        let ticking = false;
        return function(...args) {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    func.apply(this, args);
                    ticking = false;
                });
                ticking = true;
            }
        };
    }

    /**
     * Debounces a function to delay its execution.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - The delay in milliseconds.
     * @returns {Function} - The debounced function.
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Global Image Error Handler (Fallback)
    document.addEventListener('error', function(e) {
        if (e.target.tagName.toLowerCase() === 'img') {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found';
            e.target.classList.add('object-contain', 'bg-gray-50');
        }
    }, true);

    /**
     * Initializes skeleton loading states for images.
     */
    const initSkeletons = () => {
        document.querySelectorAll('.portfolio-card img:not(.loaded)').forEach(img => {
            if (!img.complete) {
                img.parentElement.classList.add('skeleton');
                img.classList.add('opacity-0', 'transition-opacity', 'duration-500');
                img.addEventListener('load', () => {
                    img.parentElement.classList.remove('skeleton');
                    img.classList.remove('opacity-0');
                    img.classList.add('loaded');
                });
            }
        });
    };
    initSkeletons();

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Get DOM elements
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    // Mobile menu toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu && menuToggle) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu && menuToggle) {
            const isClickInsideMenu = navMenu.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (navMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnToggle) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
    
    // Navigation Highlighting Logic
    const path = window.location.pathname;
    const currentPage = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    if (currentPage !== 'index.html') {
        // Logic for non-homepage pages
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('#')[0];
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    } else {
        // Homepage scroll spy logic using IntersectionObserver
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    let activeLink = null;
                    navLinks.forEach(link => {
                        const linkHref = link.getAttribute('href');
                        const linkSection = linkHref.includes('#') ? linkHref.split('#')[1] : (linkHref === 'index.html' ? 'home' : '');
                        if (linkSection === id) activeLink = link;
                    });

                    if (activeLink) {
                        navLinks.forEach(link => link.classList.remove('active'));
                        activeLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            if (section.id) observer.observe(section);
        });
    }

    // Scroll Spinner Logic
    const spinner = document.getElementById('scroll-spinner');
    if (spinner) {
        window.addEventListener('scroll', throttle(() => {
            const rotation = window.scrollY / 2;
            spinner.style.transform = `rotate(${rotation}deg)`;
        }), { passive: true });
    }

    // About Section Parallax
    const aboutParallax = document.getElementById('about-parallax');
    if (aboutParallax) {
        window.addEventListener('scroll', throttle(() => {
            const scrollY = window.scrollY;
            const section = document.getElementById('about');
            
            if (section) {
                const sectionTop = section.offsetTop;
                const relativeScroll = scrollY - sectionTop;
                const shape1 = aboutParallax.children[0];
                const shape2 = aboutParallax.children[1];
                
                if (shape1) shape1.style.transform = `translateY(${relativeScroll * 0.15}px)`;
                if (shape2) shape2.style.transform = `translateY(${relativeScroll * -0.1}px)`;
            }
        }), { passive: true });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"], a[href^="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            
            let targetId = this.getAttribute('href');
            if (targetId.startsWith('index.html#')) {
                targetId = targetId.replace('index.html', '');
            }
            
            if (targetId === '#' || !targetId.startsWith('#')) return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Complex Scroll Animations
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom, .reveal-pop');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger slightly later
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
    
    // Portfolio Filtering and Search
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-card:not(.no-filter)');
    const searchInput = document.getElementById('portfolioSearch');
    
    // Inject Empty State Container
    const portfolioGrid = document.querySelector('.portfolio-grid');
    if (portfolioGrid && !document.querySelector('.empty-state')) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `<i class="fas fa-search"></i><h3 class="text-xl font-bold text-charcoal dark:text-white">No items found</h3><p class="text-charcoal/60 dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>`;
        portfolioGrid.appendChild(emptyState);
    }

    if (filterBtns.length > 0 && portfolioItems.length > 0) {
        // Use AppState for filter logic
        const { filter } = AppState;

        const updateFilterUI = (filterName) => {
            filterBtns.forEach(btn => {
                if (btn.getAttribute('data-filter') === filterName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        const applyFilterFromHistory = () => {
            const filterName = filter.history[filter.historyIndex];
            updateFilterUI(filterName);
            filter.currentPage = 1;
            filterItems();
        };

        const addToHistory = (filterName) => {
            if (filterName === filter.history[filter.historyIndex]) return;
            
            // Remove any forward history if we were in the middle of the stack
            if (filter.historyIndex < filter.history.length - 1) {
                filter.history = filter.history.slice(0, filter.historyIndex + 1);
            }
            
            filter.history.push(filterName);
            filter.historyIndex++;
        };

        // "Load More" button functionality
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        // Filter function
        const filterItems = () => {
            const activeBtn = document.querySelector('.filter-btn.active');
            const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter').toLowerCase().trim() : 'all';
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            
            // FLIP Animation: Record start positions
            const startPositions = new Map();
            portfolioItems.forEach(item => {
                if (!item.classList.contains('hidden')) {
                    startPositions.set(item, item.getBoundingClientRect());
                }
            });

            let totalMatches = 0;
            let currentMatchIndex = 0;
            const endIndex = filter.currentPage * filter.itemsPerPage;

            // Apply filtering
            portfolioItems.forEach(item => {
                const categoryAttr = item.getAttribute('data-category');
                const categories = categoryAttr ? categoryAttr.toLowerCase().split(/[\s,]+/) : [];
                const title = item.querySelector('.portfolio-title').textContent.toLowerCase();
                const desc = item.querySelector('.portfolio-description').textContent.toLowerCase();
                
                const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
                const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);
                
                if (matchesFilter && matchesSearch) {
                    totalMatches++;
                    
                    // Check if item falls within current page slice
                    if (currentMatchIndex < endIndex) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                    currentMatchIndex++;
                } else {
                    item.classList.add('hidden');
                }
            });
            
            // Empty State Toggle
            const emptyState = document.querySelector('.empty-state');
            if (emptyState) {
                if (totalMatches === 0) emptyState.classList.add('visible');
                else emptyState.classList.remove('visible');
            }

            // Update Load More Button Visibility
            if (loadMoreBtn) {
                if (totalMatches > endIndex) {
                    loadMoreBtn.classList.remove('hidden');
                } else {
                    loadMoreBtn.classList.add('hidden');
                }
            }

            // FLIP Animation: Apply transforms
            portfolioItems.forEach(item => {
                if (item.classList.contains('hidden')) return;

                const startRect = startPositions.get(item);
                const endRect = item.getBoundingClientRect();

                // Item was visible and is still visible (Move)
                if (startRect) {
                    const deltaX = startRect.left - endRect.left;
                    const deltaY = startRect.top - endRect.top;

                    if (deltaX !== 0 || deltaY !== 0) {
                        // Invert
                        item.style.transition = 'none';
                        item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
                        
                        // Play
                        requestAnimationFrame(() => {
                            item.getBoundingClientRect(); // Force reflow
                            item.style.transition = 'transform 0.6s cubic-bezier(0.2, 0, 0.2, 1)';
                            item.style.transform = '';
                        });
                    }
                } 
                // Item is entering
                else {
                    item.style.transition = 'none';
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9) translateY(20px)';
                    
                    requestAnimationFrame(() => {
                        item.getBoundingClientRect(); // Force reflow
                        item.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.2, 0, 0.2, 1)';
                        item.style.opacity = '1';
                        item.style.transform = '';
                    });
                }
            });
        };

        // Filter button click events
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                updateFilterUI(filter);
                addToHistory(filter);
                filter.currentPage = 1; // Reset to first page on filter change
                filterItems();
            });
        });
        
        // Search input event
        if (searchInput) {
            searchInput.addEventListener('keyup', debounce(() => {
                filter.currentPage = 1; // Reset to first page on search
                filterItems();
            }, 300));
        }

		if (loadMoreBtn) {
			loadMoreBtn.addEventListener('click', () => {
                loadMoreBtn.classList.add('btn-loading');
                // Simulate network delay for better UX
                setTimeout(() => {
                    filter.currentPage++;
                    filterItems();
                    loadMoreBtn.classList.remove('btn-loading');
                }, 600);
			});
		}

        // Initial load
        filterItems();

        // Search Overlay Logic
        const searchTrigger = document.getElementById('searchTrigger');
        const searchOverlay = document.getElementById('searchOverlay');
        const closeSearchBtn = document.getElementById('closeSearchBtn');

        if (searchTrigger && searchOverlay && closeSearchBtn) {
            function openSearch() {
                searchOverlay.classList.remove('hidden');
                setTimeout(() => {
                    searchOverlay.classList.remove('opacity-0');
                    if (searchInput) searchInput.focus();
                }, 10);
                document.body.style.overflow = 'hidden';
            }

            function closeSearch() {
                searchOverlay.classList.add('opacity-0');
                setTimeout(() => {
                    searchOverlay.classList.add('hidden');
                }, 300);
                document.body.style.overflow = '';
            }

            searchTrigger.addEventListener('click', openSearch);
            closeSearchBtn.addEventListener('click', closeSearch);
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
                    closeSearch();
                }
            });
        }

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            // Search (Press 's')
            if (e.key.toLowerCase() === 's' && 
                !['input', 'textarea', 'select'].includes(document.activeElement.tagName.toLowerCase()) &&
                !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                if (searchTrigger) searchTrigger.click();
            }

            // Undo/Redo (Ctrl+Z / Ctrl+Y)
            if ((e.ctrlKey || e.metaKey) && !['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
                if (e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey && filter.historyIndex < filter.history.length - 1) {
                        filter.historyIndex++; // Redo (Ctrl+Shift+Z)
                        applyFilterFromHistory();
                    } else if (!e.shiftKey && filter.historyIndex > 0) {
                        filter.historyIndex--; // Undo (Ctrl+Z)
                        applyFilterFromHistory();
                    }
                } else if (e.key.toLowerCase() === 'y' && filter.historyIndex < filter.history.length - 1) {
                    e.preventDefault();
                    filter.historyIndex++; // Redo (Ctrl+Y)
                    applyFilterFromHistory();
                }
            }
        });
    }
    
    // Testimonial Slider Logic
    const testimonialContainer = document.getElementById('testimonialTrack')?.parentElement;
    const testimonialTrack = document.getElementById('testimonialTrack');
    const prevTestimonialBtn = document.getElementById('prevTestimonial');
    const nextTestimonialBtn = document.getElementById('nextTestimonial');

    if (testimonialContainer && testimonialTrack && prevTestimonialBtn && nextTestimonialBtn) {
        let autoScrollInterval;

        const getScrollAmount = () => {
            const card = testimonialTrack.firstElementChild;
            if (!card) return 0;
            return card.offsetWidth + 32; // card width + gap
        };

        const scrollNext = () => {
            // If we are near the end of the scroll, loop back to the start
            if (testimonialTrack.scrollLeft + testimonialTrack.clientWidth >= testimonialTrack.scrollWidth - 10) {
                testimonialTrack.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                testimonialTrack.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
            }
        };

        const startAutoScroll = () => {
            clearInterval(autoScrollInterval); // Clear to avoid multiple intervals
            autoScrollInterval = setInterval(scrollNext, 5000);
        };

        const stopAutoScroll = () => {
            clearInterval(autoScrollInterval);
        };

        prevTestimonialBtn.addEventListener('click', () => {
            testimonialTrack.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
        });

        nextTestimonialBtn.addEventListener('click', () => {
            testimonialTrack.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
        });

        // Pause auto-scroll on hover
        testimonialContainer.addEventListener('mouseenter', stopAutoScroll);
        testimonialContainer.addEventListener('mouseleave', startAutoScroll);

        // Start auto-scrolling
        startAutoScroll();
    }

    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    const whatsappMobileBtn = document.getElementById('whatsappMobileBtn');
    
    const scrollableButtons = [backToTopBtn, whatsappMobileBtn].filter(Boolean);

    if (scrollableButtons.length > 0) {
        window.addEventListener('scroll', throttle(() => {
            if (window.scrollY > 300) {
                scrollableButtons.forEach(btn => {
                    btn.classList.remove('opacity-0', 'invisible', 'translate-y-5');
                    btn.classList.add('opacity-100', 'visible', 'translate-y-0');
                });
            } else {
                scrollableButtons.forEach(btn => {
                    btn.classList.add('opacity-0', 'invisible', 'translate-y-5');
                    btn.classList.remove('opacity-100', 'visible', 'translate-y-0');
                });
            }
        }), { passive: true });
    }
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Console greeting (optional, can be removed in production)
    console.log('Kumtech Gateway Portfolio Website loaded successfully.');
    console.log('Brand Colors: #FFFFFF, #00B4D8, #1F3C88, #0F172A, #F97316, #FDBA74');

    // Fetch Case Study Data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            AppState.caseStudies = data;
        })
        .catch(error => {
            console.error('Error loading case studies:', error);
            Toast.show('Failed to load project data. Please check your connection.', 'error');
        });

    /**
     * Injects the Case Study Modal HTML into the DOM.
     * Consolidates duplicate code from HTML files.
     */
    function injectModalComponent() {
        if (document.getElementById('caseStudyModal')) return;

        const modalHTML = `
        <div id="caseStudyModal" class="fixed inset-0 z-[100] hidden flex items-center justify-center" aria-hidden="true">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-charcoal/90 backdrop-blur-sm transition-opacity opacity-0" id="modalOverlay"></div>
            
            <!-- Modal Content -->
            <div class="relative w-full max-w-5xl max-h-[90vh] mx-5 bg-white rounded-2xl shadow-2xl overflow-hidden transform scale-95 opacity-0 transition-all duration-300 flex flex-col" id="modalContent">
                <!-- Close Button -->
                <button class="absolute top-4 right-4 z-20 w-10 h-10 bg-black/5 hover:bg-black/10 text-charcoal rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer" id="closeModalBtn">
                    <i class="fas fa-times text-xl"></i>
                </button>

                <!-- Scrollable Content Area -->
                <div class="overflow-y-auto custom-scrollbar w-full h-full p-8 md:p-10 block">
                    <!-- Image (Floated) -->
                    <div class="w-full md:w-[40%] md:float-left md:mr-10 mb-8 rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-100">
                        <img src="" alt="" id="modalImage" class="w-full h-auto object-cover aspect-square" loading="lazy">
                    </div>

                    <!-- Header -->
                    <div class="mb-8">
                        <span id="modalCategory" class="inline-block py-1 px-3 rounded-full bg-cyan/10 text-cyan text-xs font-semibold tracking-wider uppercase mb-3"></span>
                        <h2 id="modalTitle" class="text-3xl md:text-4xl font-heading font-bold text-tech-blue leading-tight"></h2>
                        
                        <div class="flex flex-wrap gap-6 mt-6 border-b border-tech-blue/10 pb-6">
                            <div>
                                <span class="block text-xs text-cyan font-bold uppercase tracking-wide mb-1">Client</span>
                                <span id="modalClient" class="text-tech-blue font-medium"></span>
                            </div>
                            <div>
                                <span class="block text-xs text-cyan font-bold uppercase tracking-wide mb-1">Timeline</span>
                                <span id="modalTimeline" class="text-tech-blue font-medium"></span>
                            </div>
                            <div>
                                <span class="block text-xs text-cyan font-bold uppercase tracking-wide mb-1">Services</span>
                                <span id="modalServices" class="text-tech-blue font-medium"></span>
                            </div>
                        </div>
                    </div>

                    <!-- Body Content -->
                    <div class="space-y-8">
                        <div>
                            <h3 class="text-lg font-bold text-tech-blue mb-3 flex items-center gap-2">
                                <i class="fas fa-mountain text-cyan"></i> The Challenge
                            </h3>
                            <p id="modalChallenge" class="text-charcoal/80 leading-relaxed"></p>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-tech-blue mb-3 flex items-center gap-2">
                                <i class="fas fa-lightbulb text-cyan"></i> The Solution
                            </h3>
                            <p id="modalSolution" class="text-charcoal/80 leading-relaxed"></p>
                        </div>
                        <div class="bg-soft-gray p-6 rounded-xl border border-tech-blue/10">
                            <h3 class="text-lg font-bold text-tech-blue mb-4 flex items-center gap-2">
                                <i class="fas fa-chart-line text-cyan"></i> Key Results
                            </h3>
                            <ul id="modalResults" class="space-y-3"></ul>
                        </div>
                    </div>

                    <!-- Gallery Grid -->
                    <div id="modalGallery" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 clear-both hidden"></div>
                    
                    <!-- Related Projects -->
                    <div id="modalRelated" class="mt-10 pt-8 border-t border-tech-blue/10 hidden">
                        <h3 class="text-xl font-bold text-tech-blue mb-6">Related Projects</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6" id="relatedProjectsGrid"></div>
                    </div>
                    
                    <!-- CTA -->
                    <div class="mt-10 pt-6 border-t border-tech-blue/10">
                         <a href="index.html#contact" class="inline-flex items-center justify-center w-full py-4 bg-tech-blue text-white rounded-xl font-medium hover:bg-cyan transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                            Start a Project Like This
                         </a>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Inject Modal
    injectModalComponent();

    // Modal Logic Variables
    const modal = document.getElementById('caseStudyModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalContent = document.getElementById('modalContent');
    const body = document.body;

    /**
     * Opens the case study modal with data for the given ID.
     * @param {string} id - The ID of the case study to display.
     */
    function openModal(id) {
        const study = AppState.caseStudies[id];
        if (!study) return;

        // Helper to toggle skeleton
        const setSkeleton = (id, value) => {
            const el = document.getElementById(id);
            if(el) {
                el.classList.add('skeleton-text');
                el.textContent = 'Loading...'; // Placeholder text to give height
                setTimeout(() => {
                    el.textContent = value;
                    el.classList.remove('skeleton-text');
                }, 300); // Simulate fetch delay
            }
        };

        setSkeleton('modalCategory', study.category);
        setSkeleton('modalTitle', study.title);
        setSkeleton('modalClient', study.client);
        setSkeleton('modalTimeline', study.timeline);
        setSkeleton('modalServices', study.services);
        setSkeleton('modalChallenge', study.challenge);
        setSkeleton('modalSolution', study.solution);
        
        const img = document.getElementById('modalImage');
        if (img) {
            img.parentElement.classList.add('skeleton');
            img.classList.add('opacity-0');
            
            const baseUrl = study.image.split('?')[0];
            img.src = `${baseUrl}?q=80&w=800&auto=format`;
            img.alt = study.title;
            img.srcset = `${baseUrl}?q=80&w=400&auto=format 400w, 
                          ${baseUrl}?q=80&w=800&auto=format 800w, 
                          ${baseUrl}?q=80&w=1200&auto=format 1200w`;
            img.sizes = "(max-width: 768px) 90vw, 450px";
            
            img.onload = () => {
                img.parentElement.classList.remove('skeleton');
                img.classList.remove('opacity-0');
            };
            img.onerror = () => {
                img.parentElement.classList.remove('skeleton');
                img.src = 'https://placehold.co/800x600?text=Image+Error';
                img.classList.remove('opacity-0');
                Toast.show('Failed to load project image', 'error');
            };

            // Full Screen / Lightbox Logic for Modal Image
            img.onclick = (e) => {
                e.stopPropagation();
                const lightbox = document.getElementById('lightbox');
                const lightboxImage = document.getElementById('lightboxImage');
                
                if (lightbox && lightboxImage) {
                    lightboxImage.src = img.src;
                    lightboxImage.alt = img.alt;
                    
                    // Hide nav buttons for single image view from modal
                    if(prevLightboxBtn) prevLightboxBtn.classList.add('hidden');
                    if(nextLightboxBtn) nextLightboxBtn.classList.add('hidden');
                    
                    lightbox.classList.remove('hidden');
                    requestAnimationFrame(() => {
                        lightbox.classList.remove('opacity-0');
                        lightboxImage.classList.remove('scale-95');
                        lightboxImage.classList.add('scale-100');
                    });
                    document.body.style.overflow = 'hidden';
                }
            };
        }

        const resultsList = document.getElementById('modalResults');
        if (resultsList) {
            resultsList.innerHTML = '';
            if (study.results && study.results.length > 0) {
                study.results.forEach(result => {
                    const li = document.createElement('li');
                    li.className = 'flex items-start gap-3 text-charcoal/80';
                    li.innerHTML = `<i class="fas fa-check-circle text-cyan mt-1 shrink-0"></i><span>${result}</span>`;
                    resultsList.appendChild(li);
                });
            }
        }

        // Gallery Logic
        const galleryContainer = document.getElementById('modalGallery');
        if (galleryContainer) {
            galleryContainer.innerHTML = '';
            galleryContainer.classList.add('hidden');
            
            if (study.gallery && Array.isArray(study.gallery) && study.gallery.length > 0) {
                galleryContainer.classList.remove('hidden');
                study.gallery.forEach(imgSrc => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'rounded-xl overflow-hidden shadow-md border border-gray-100 group h-48 bg-gray-50';
                    const cleanSrc = imgSrc.split('?')[0];
                    imgContainer.innerHTML = `<img src="${cleanSrc}?q=80&w=600&auto=format" class="w-full h-full object-contain hover:scale-105 transition-transform duration-500 cursor-pointer" loading="lazy" onclick="document.getElementById('modalImage').src = '${cleanSrc}?q=80&w=800&auto=format'">`;
                    galleryContainer.appendChild(imgContainer);
                });
            }
        }

        // Related Projects Logic
        const relatedContainer = document.getElementById('modalRelated');
        const relatedGrid = document.getElementById('relatedProjectsGrid');
        
        if (relatedContainer && relatedGrid) {
            relatedGrid.innerHTML = '';
            
            // Filter related projects: same category (or partial match), not current project
            const related = Object.entries(AppState.caseStudies)
                .filter(([key, data]) => key !== id && (data.category === study.category || study.category.includes(data.category) || data.category.includes(study.category)))
                .slice(0, 2); // Limit to 2

            if (related.length > 0) {
                relatedContainer.classList.remove('hidden');
                related.forEach(([key, data]) => {
                    const div = document.createElement('div');
                    div.className = 'group cursor-pointer border border-tech-blue/10 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white';
                    div.innerHTML = `
                        <div class="h-40 overflow-hidden relative">
                            <img src="${data.image.split('?')[0]}?q=80&w=400&auto=format&fit=crop" alt="${data.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                            <div class="absolute inset-0 bg-tech-blue/0 group-hover:bg-tech-blue/10 transition-colors duration-300"></div>
                        </div>
                        <div class="p-4">
                            <h4 class="font-bold text-tech-blue mb-1 text-sm group-hover:text-cyan transition-colors line-clamp-1">${data.title}</h4>
                            <p class="text-xs text-charcoal/60 uppercase tracking-wider">${data.category}</p>
                        </div>
                    `;
                    div.addEventListener('click', () => {
                        // Scroll to top of modal content
                        const scrollContainer = document.querySelector('#modalContent .overflow-y-auto');
                        if(scrollContainer) scrollContainer.scrollTop = 0;
                        openModal(key);
                    });
                    relatedGrid.appendChild(div);
                });
            } else {
                relatedContainer.classList.add('hidden');
            }
        }

        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                if (modalOverlay) modalOverlay.classList.remove('opacity-0');
                if (modalContent) {
                    modalContent.classList.remove('opacity-0', 'scale-95');
                    modalContent.classList.add('scale-100');
                }
            }, 10);
            body.style.overflow = 'hidden';
        }
    }

    /**
     * Closes the case study modal.
     */
    function closeModal() {
        if (modalOverlay) modalOverlay.classList.add('opacity-0');
        if (modalContent) {
            modalContent.classList.add('opacity-0', 'scale-95');
            modalContent.classList.remove('scale-100');
        }
        
        setTimeout(() => {
            if (modal) modal.classList.add('hidden');
            body.style.overflow = '';
        }, 300);
    }

    if (modal) {
        document.addEventListener('click', function(e) {
            const card = e.target.closest('.portfolio-card');
            
            if (card) {
                const id = card.getAttribute('data-id');
                if (id) {
                    e.preventDefault();
                    openModal(id);
                }
            }
        });

        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });

        // Close modal when clicking the CTA button inside it
        const modalCta = modal.querySelector('a[href*="contact"]');
        if (modalCta) {
            modalCta.addEventListener('click', closeModal);
        }
    }

    // Gallery Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const closeLightboxBtn = document.getElementById('closeLightbox');
    const prevLightboxBtn = document.getElementById('prevLightboxBtn');
    const nextLightboxBtn = document.getElementById('nextLightboxBtn');
    
    if (lightbox && lightboxImage) {
        // Select images specifically within portfolio cards to avoid selecting logos/icons
        const galleryImages = document.querySelectorAll('.portfolio-card img');
        let currentImageIndex = 0;

        const showImage = (index) => {
            if (index < 0) index = galleryImages.length - 1;
            if (index >= galleryImages.length) index = 0;
            currentImageIndex = index;
            
            const img = galleryImages[currentImageIndex];
            
            // Fade effect for transition
            lightboxImage.style.opacity = '0.5';
            lightboxImage.style.transform = 'scale(0.98)';
            
            setTimeout(() => {
                lightboxImage.src = img.src;
                lightboxImage.alt = img.alt;
                lightboxImage.style.opacity = '1';
                lightboxImage.style.transform = 'scale(1)';
            }, 150);
        };
        
        galleryImages.forEach((img, index) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                currentImageIndex = index;
                lightboxImage.src = img.src;
                lightboxImage.alt = img.alt;
                lightbox.classList.remove('hidden');
                // Small delay to allow display:block to apply before opacity transition
                requestAnimationFrame(() => {
                    lightbox.classList.remove('opacity-0');
                    lightboxImage.classList.remove('scale-95');
                    lightboxImage.classList.add('scale-100');
                });
                document.body.style.overflow = 'hidden';
            });
        });
        
        const closeLightbox = () => {
            lightbox.classList.add('opacity-0');
            lightboxImage.classList.remove('scale-100');
            lightboxImage.classList.add('scale-95');
            setTimeout(() => {
                lightbox.classList.add('hidden');
                lightboxImage.src = '';
                
                // Restore nav buttons in case they were hidden by modal view
                if(prevLightboxBtn) prevLightboxBtn.classList.remove('hidden');
                if(nextLightboxBtn) nextLightboxBtn.classList.remove('hidden');
            }, 300);
            document.body.style.overflow = '';
        };
        
        if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
        
        if (prevLightboxBtn) {
            prevLightboxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showImage(currentImageIndex - 1);
            });
        }

        if (nextLightboxBtn) {
            nextLightboxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showImage(currentImageIndex + 1);
            });
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
        
        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('hidden')) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showImage(currentImageIndex - 1);
            if (e.key === 'ArrowRight') showImage(currentImageIndex + 1);
        });

        // Swipe Gesture Support
        let touchStartX = 0;
        let touchEndX = 0;
        
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchEndX < touchStartX - 50) showImage(currentImageIndex + 1); // Swipe Left -> Next
            if (touchEndX > touchStartX + 50) showImage(currentImageIndex - 1); // Swipe Right -> Prev
        }, { passive: true });
    }

    // Navbar Theme Logic
    const nav = document.getElementById('navbar');
    const darkSections = document.querySelectorAll('[data-theme="dark"]');

    window.addEventListener('scroll', throttle(() => {
        // Navbar Theme
        if (nav && darkSections.length > 0) {
            const navHeight = nav.offsetHeight;
            const triggerPoint = navHeight / 2;
            let isDark = false;
            
            darkSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top <= triggerPoint && rect.bottom >= triggerPoint) {
                    isDark = true;
                }
            });
            
            if (isDark) {
                nav.classList.add('navbar-dark');
            } else {
                nav.classList.remove('navbar-dark');
            }
        }
    }), { passive: true });

    // Theme Toggle Logic
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Check for saved user preference, if any, on load
    if (localStorage.theme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (html.classList.contains('dark')) {
                html.classList.remove('dark');
                localStorage.theme = 'light';
            } else {
                html.classList.add('dark');
                localStorage.theme = 'dark';
            }
        });
    }

    // Contact Form Logic
    const contactFormContainer = document.getElementById('contact-form-container');
    if (contactFormContainer) {
        const methodBtns = document.querySelectorAll('.contact-method-btn');
        const emailForm = document.getElementById('contactForm');
        const whatsappView = document.getElementById('whatsappView');
        const phoneView = document.getElementById('phoneView');
        const views = {
            'email': emailForm,
            'whatsapp': whatsappView,
            'phone': phoneView
        };

        // Switch Methods
        methodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update buttons
                methodBtns.forEach(b => b.classList.remove('active', 'border-tech-blue', 'bg-tech-blue/5'));
                btn.classList.add('active');
                
                const method = btn.getAttribute('data-method');
                
                // Hide all views
                Object.values(views).forEach(el => {
                    if(el) el.classList.add('hidden');
                    if(el) el.classList.remove('flex');
                });

                // Show selected
                const selectedView = views[method];
                if (selectedView) {
                    if (method === 'email') {
                        selectedView.classList.remove('hidden');
                    } else {
                        selectedView.classList.remove('hidden');
                        selectedView.classList.add('flex');
                    }
                }
            });
        });

        // Form Submission
        const sendBtn = document.getElementById('sendBtn');
        const sendIcon = document.getElementById('sendIcon');
        const successModal = document.getElementById('successModal');
        const resetFormBtn = document.getElementById('resetFormBtn');
        const successSound = new Audio('sounds/success.mp3');

        if (emailForm && sendBtn) {
            emailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validation
                const inputs = emailForm.querySelectorAll('input, select, textarea');
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('border-red-500');
                    } else {
                        input.classList.remove('border-red-500');
                    }
                });

                if (!isValid) {
                    emailForm.classList.add('shake');
                    setTimeout(() => emailForm.classList.remove('shake'), 500);
                    Toast.show('Please fill in all fields', 'error');
                    return;
                }

                // Send Email via EmailJS
                sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                sendBtn.disabled = true;

                // REPLACE WITH YOUR EMAILJS SERVICE ID AND TEMPLATE ID
                const serviceID = 'YOUR_SERVICE_ID'; 
                const templateID = 'YOUR_TEMPLATE_ID';

                emailjs.sendForm(serviceID, templateID, emailForm)
                    .then(() => {
                    // Success Animation
                    const iconRect = sendIcon.getBoundingClientRect();
                    const flyIcon = document.createElement('div');
                    flyIcon.innerHTML = '<i class="fas fa-paper-plane text-white text-xl"></i>';
                    flyIcon.className = 'flying-icon bg-gradient-to-r from-tech-blue to-cyan w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,180,216,0.6)] z-[9999]';
                    flyIcon.style.left = `${iconRect.left}px`;
                    flyIcon.style.top = `${iconRect.top}px`;
                    document.body.appendChild(flyIcon);

                    // Target position (Success Icon in Modal)
                    const successIcon = document.getElementById('successIcon');
                    let targetX, targetY;

                    if (successIcon) {
                        // Temporarily remove scale transform to measure actual position
                        const wasScaled = successIcon.classList.contains('scale-0');
                        if (wasScaled) successIcon.classList.remove('scale-0');
                        
                        const destRect = successIcon.getBoundingClientRect();
                        targetX = destRect.left + destRect.width / 2 - 28; // Center - half flyIcon width
                        targetY = destRect.top + destRect.height / 2 - 28;
                        
                        if (wasScaled) successIcon.classList.add('scale-0');
                    } else {
                        targetX = window.innerWidth / 2 - 28;
                        targetY = window.innerHeight / 2 - 28;
                    }

                    requestAnimationFrame(() => {
                        flyIcon.style.left = `${targetX}px`;
                        flyIcon.style.top = `${targetY}px`;
                        flyIcon.style.transform = 'scale(1.7)';
                    });

                    setTimeout(() => {
                        // Morph into checkmark
                        flyIcon.style.transition = 'all 0.3s ease';
                        flyIcon.classList.remove('bg-gradient-to-r', 'from-tech-blue', 'to-cyan');
                        flyIcon.style.background = '#dcfce7'; // bg-green-100
                        flyIcon.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.4)';
                        flyIcon.innerHTML = '<i class="fas fa-check text-green-500 text-3xl"></i>';
                        
                        // Play Success Sound
                        successSound.currentTime = 0;
                        successSound.play().catch(e => console.warn('Audio playback failed:', e));

                        setTimeout(() => {
                            flyIcon.remove();
                            successModal.classList.add('active');
                            
                            // Handle Success Icon instant appearance
                            const successIcon = document.getElementById('successIcon');
                            if (successIcon) {
                                successIcon.style.transition = 'none';
                                successIcon.classList.remove('scale-0', 'delay-300');
                                successIcon.classList.add('scale-100');
                            }

                            // Trigger Confetti
                            if (typeof confetti === 'function') {
                                confetti({
                                    particleCount: 150,
                                    spread: 70,
                                    origin: { y: 0.6 },
                                    colors: ['#00B4D8', '#1F3C88', '#F97316', '#FDBA74'] // Brand colors
                                });
                            }

                            sendBtn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';
                            sendBtn.disabled = false;
                            emailForm.reset();
                        }, 300);
                    }, 800); // Flight time
                })
                .catch((err) => {
                    console.error('EmailJS Error:', err);
                    sendBtn.innerHTML = '<span>Send Message</span> <i class="fas fa-paper-plane"></i>';
                    sendBtn.disabled = false;
                    emailForm.classList.add('shake');
                    setTimeout(() => emailForm.classList.remove('shake'), 500);
                    Toast.show('Failed to send message. Please check your connection.', 'error');
                });
            });
        }

        if (resetFormBtn) {
            const resetModal = () => {
                successModal.classList.remove('active');
                const successIcon = document.getElementById('successIcon');
                if (successIcon) {
                    setTimeout(() => {
                        successIcon.style.transition = '';
                        successIcon.classList.add('scale-0', 'delay-300');
                        successIcon.classList.remove('scale-100');
                    }, 500);
                }
            };

            resetFormBtn.addEventListener('click', resetModal);
            
            // Close on overlay click
            const successOverlay = document.getElementById('successOverlay');
            if (successOverlay) {
                successOverlay.addEventListener('click', resetModal);
            }
        }
    }
});