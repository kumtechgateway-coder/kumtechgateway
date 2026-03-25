import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDK-VZPOkgebi-Obl-JG7Z-283cJmiUDm4",
  authDomain: "kumtechgateway-237.firebaseapp.com",
  projectId: "kumtechgateway-237",
  storageBucket: "kumtechgateway-237.firebasestorage.app",
  messagingSenderId: "909947059277",
  appId: "1:909947059277:web:40b0e5ddad2eef0991f004",
  measurementId: "G-30MVBTWFKJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
 
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
    filter: {
        currentPage: 1,
        itemsPerPage: 12, // Changed to 12 for a 4-column layout
        history: ['all'],
        historyIndex: 0,
        activeCategory: 'all'
    }
};

function trackEvent(eventName, params = {}) {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function' || !eventName) {
        return;
    }

    window.gtag('event', eventName, {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        ...params
    });
}

function initConversionTracking() {
    const resolveTrackLabel = (element, fallbackLabel) => {
        if (!element) return fallbackLabel || 'unknown';

        const explicitLabel = element.getAttribute('data-track-label');
        if (explicitLabel) return explicitLabel;

        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel.trim();

        const text = element.textContent ? element.textContent.replace(/\s+/g, ' ').trim() : '';
        return text || fallbackLabel || 'unknown';
    };

    document.addEventListener('click', (event) => {
        const trackableElement = event.target.closest('[data-track-event]');
        if (trackableElement) {
            trackEvent(trackableElement.getAttribute('data-track-event'), {
                category: trackableElement.getAttribute('data-track-category') || 'cta',
                label: resolveTrackLabel(trackableElement, 'tracked_cta')
            });
        }

        const whatsappLink = event.target.closest('a[href^="https://wa.me/"]');
        if (whatsappLink) {
            trackEvent('contact_whatsapp_click', {
                category: 'contact',
                label: resolveTrackLabel(whatsappLink, 'whatsapp_link')
            });
        }

        const phoneLink = event.target.closest('a[href^="tel:"]');
        if (phoneLink) {
            trackEvent('contact_phone_click', {
                category: 'contact',
                label: resolveTrackLabel(phoneLink, 'phone_link')
            });
        }
    });
}

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
        fetch('/assets/data/translations.json')
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

/**
 * Loads shared HTML components like the navbar and footer.
 * @returns {Promise<void>} A promise that resolves when all components are loaded.
 */
async function loadComponents() {
    const components = [
        { placeholderId: 'navbar-placeholder', url: '/components/navbar.html' },
        { placeholderId: 'footer-placeholder', url: '/components/footer.html' }
    ];

    const promises = components.map(async ({ placeholderId, url }) => {
        const placeholder = document.getElementById(placeholderId);
        if (placeholder) {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const html = await response.text();
                placeholder.outerHTML = html;
            } catch (error) {
                console.error(`Error loading component ${url}:`, error);
                if(placeholder) placeholder.innerHTML = `<p class="text-red-500 text-center py-4">Error loading component.</p>`;
            }
        }
    });

    await Promise.all(promises);
}


/**
 * Initializes all application functionality.
 */
function main() {    
    // Portfolio generation is now handled within initPortfolioPage()
    I18n.init();
    initConversionTracking();
    initCustomCursor();
    initHeroParticles();
    initNavAndState();
    initScrollBehaviors();
    initCounters();
    initPortfolioPage();
    initTestimonialSlider();
    initFloatingButtons();
    initModal();
    initLightbox();
    initThemeToggle();
    initContactForm();
    initBlogPages();
    initGalleryPage();
    initProjectDetailPage();
    initGalleryPreview();
    initPricingSections();
    initReviews();
 
    // Set current year in footer
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    // Global Image Error Handler (Fallback)
    document.addEventListener('error', function(e) {
        if (e.target.tagName.toLowerCase() === 'img') {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found';
            e.target.classList.add('object-contain', 'bg-gray-50');
        }
    }, true);

    // Console greeting
    console.log('Kumtech Gateway Portfolio Website loaded successfully.');
    console.log('Brand Colors: #FFFFFF, #00B4D8, #1F3C88, #0F172A, #F97316, #FDBA74');
}

function getPricingToneClasses(tone, featured) {
    if (featured) {
        return {
            ring: 'ring-2 ring-orange/30 dark:ring-orange/40',
            badge: 'bg-gradient-to-r from-orange to-soft-amber text-white',
            accent: 'from-orange to-soft-amber',
            subtle: 'bg-orange/10 text-orange'
        };
    }

    if (tone === 'orange') {
        return {
            ring: 'ring-1 ring-orange/15 dark:ring-orange/20',
            badge: 'bg-orange/10 text-orange',
            accent: 'from-orange to-soft-amber',
            subtle: 'bg-orange/10 text-orange'
        };
    }

    return {
        ring: 'ring-1 ring-cyan/15 dark:ring-cyan/20',
        badge: 'bg-cyan/10 text-cyan',
        accent: 'from-tech-blue to-cyan',
        subtle: 'bg-cyan/10 text-cyan'
    };
}

function renderPricingPlan(plan) {
    const tones = getPricingToneClasses(plan.tone, plan.featured);
    const features = (plan.features || []).map(feature => `
        <li class="flex items-start gap-3 text-sm text-charcoal/75 dark:text-gray-300">
            <span class="mt-0.5 w-5 h-5 rounded-full ${tones.subtle} flex items-center justify-center text-[10px] shrink-0">
                <i class="fas fa-check"></i>
            </span>
            <span>${escapeHtml(feature)}</span>
        </li>
    `).join('');

    return `
        <article class="relative rounded-[2rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-800 p-8 shadow-[0_18px_50px_-22px_rgba(15,23,42,0.28)] ${tones.ring} ${plan.featured ? 'xl:-translate-y-3' : ''}">
            <div class="flex items-start justify-between gap-4 mb-6">
                <div>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase ${tones.badge}">${escapeHtml(plan.badge)}</span>
                    <h3 class="font-heading text-2xl font-bold text-tech-blue dark:text-white mt-4">${escapeHtml(plan.name)}</h3>
                </div>
                ${plan.featured ? '<span class="text-orange text-xl"><i class="fas fa-crown"></i></span>' : ''}
            </div>
            <p class="text-charcoal/70 dark:text-gray-400 leading-relaxed min-h-[72px]">${escapeHtml(plan.description)}</p>
            <div class="mt-8 mb-8">
                <div class="flex items-end gap-3 flex-wrap">
                    <span class="font-heading text-4xl font-bold text-charcoal dark:text-white">${escapeHtml(plan.price)}</span>
                    <span class="text-sm uppercase tracking-[0.18em] text-charcoal/45 dark:text-gray-500 pb-1">${escapeHtml(plan.period)}</span>
                </div>
            </div>
            <ul class="space-y-3 mb-8">
                ${features}
            </ul>
            <a href="${escapeHtml(plan.ctaHref)}" class="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-full font-bold text-white bg-gradient-to-r ${tones.accent} hover:-translate-y-0.5 transition-all duration-300 shadow-lg">
                ${escapeHtml(plan.ctaLabel)}
            </a>
        </article>
    `;
}

function renderPricingServicePreview(service) {
    const tones = getPricingToneClasses(service.tone, false);
    const highlights = (service.highlights || []).map((item) => `
        <li class="flex items-start gap-3 text-sm text-charcoal/75 dark:text-gray-300">
            <span class="mt-0.5 w-5 h-5 rounded-full ${tones.subtle} flex items-center justify-center text-[10px] shrink-0">
                <i class="fas fa-check"></i>
            </span>
            <span>${escapeHtml(item)}</span>
        </li>
    `).join('');

    return `
        <article class="rounded-[2rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-800 p-8 shadow-[0_18px_50px_-22px_rgba(15,23,42,0.28)] ${tones.ring}">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase ${tones.badge}">${escapeHtml(service.eyebrow)}</span>
            <h3 class="font-heading text-2xl font-bold text-tech-blue dark:text-white mt-5">${escapeHtml(service.name)}</h3>
            <p class="mt-4 text-charcoal/70 dark:text-gray-400 leading-relaxed min-h-[96px]">${escapeHtml(service.summary)}</p>
            <div class="mt-7">
                <div class="flex items-end gap-3 flex-wrap">
                    <span class="font-heading text-4xl font-bold text-charcoal dark:text-white">${escapeHtml(service.startingPrice)}</span>
                    <span class="text-sm uppercase tracking-[0.18em] text-charcoal/45 dark:text-gray-500 pb-1">${escapeHtml(service.pricingNote)}</span>
                </div>
            </div>
            <ul class="space-y-3 my-8">
                ${highlights}
            </ul>
            <a href="${escapeHtml(service.ctaHref)}" class="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-full font-bold text-white bg-gradient-to-r ${tones.accent} hover:-translate-y-0.5 transition-all duration-300 shadow-lg">
                ${escapeHtml(service.ctaLabel)}
            </a>
        </article>
    `;
}

function renderPricingServiceSection(service) {
    const plans = Array.isArray(service.plans) ? service.plans : [];

    return `
        <section id="service-${escapeHtml(service.id)}" class="rounded-[2.25rem] border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 md:p-8 xl:p-10 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.38)]">
            <div class="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 mb-10">
                <div class="max-w-3xl">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase ${getPricingToneClasses(service.tone, false).badge}">${escapeHtml(service.eyebrow)}</span>
                    <h3 class="font-heading text-3xl md:text-4xl font-bold text-tech-blue dark:text-white mt-4">${escapeHtml(service.name)}</h3>
                    <p class="mt-4 text-lg text-charcoal/70 dark:text-gray-400 leading-relaxed">${escapeHtml(service.summary)}</p>
                </div>
                <div class="xl:text-right">
                    <div class="text-sm uppercase tracking-[0.2em] text-charcoal/45 dark:text-gray-500">${escapeHtml(service.pricingNote)}</div>
                    <div class="font-heading text-3xl md:text-4xl font-bold text-charcoal dark:text-white mt-2">${escapeHtml(service.startingPrice)}</div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                ${plans.map(renderPricingPlan).join('')}
            </div>
        </section>
    `;
}

function initPricingSections() {
    const pricingSource = window.pricingData;
    if (!pricingSource || !Array.isArray(pricingSource.services)) return;

    const services = pricingSource.services;

    document.querySelectorAll('[data-pricing-grid]').forEach((grid) => {
        const variant = grid.getAttribute('data-pricing-variant') || 'full';
        const limit = Number(grid.getAttribute('data-pricing-limit')) || 3;

        if (variant === 'preview') {
            grid.innerHTML = services.slice(0, limit).map(renderPricingServicePreview).join('');
            return;
        }

        grid.innerHTML = services.map(renderPricingServiceSection).join('');
    });

    document.querySelectorAll('[data-pricing-nav]').forEach((navContainer) => {
        navContainer.innerHTML = services.map((service) => `
            <a href="#service-${escapeHtml(service.id)}" class="inline-flex items-center justify-center px-5 py-3 rounded-full border border-tech-blue/15 dark:border-white/10 bg-white/80 dark:bg-slate-800 text-tech-blue dark:text-white font-semibold hover:bg-tech-blue hover:text-white dark:hover:bg-cyan dark:hover:text-charcoal transition-all duration-300">
                ${escapeHtml(service.name)}
            </a>
        `).join('');
    });

    document.querySelectorAll('[data-pricing-faq]').forEach((faqContainer) => {
        const faqs = Array.isArray(pricingSource.faqs) ? pricingSource.faqs : [];
        faqContainer.innerHTML = faqs.map((faq) => `
            <details class="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 px-6 py-5 shadow-sm">
                <summary class="list-none cursor-pointer flex items-center justify-between gap-4 font-semibold text-tech-blue dark:text-white">
                    <span>${escapeHtml(faq.question)}</span>
                    <span class="text-cyan transition-transform duration-300 group-open:rotate-45"><i class="fas fa-plus"></i></span>
                </summary>
                <p class="mt-4 text-charcoal/70 dark:text-gray-400 leading-relaxed">${escapeHtml(faq.answer)}</p>
            </details>
        `).join('');
    });
}

/**
 * Initializes the custom cursor functionality.
 */
function initCustomCursor() {
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

            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
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
}

/**
 * Initializes the particle animation in the hero section.
 */
function initHeroParticles() {
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
}

/**
 * Initializes navigation, state restoration, and service worker.
 */
function initNavAndState() {
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
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed: ', err));
        });    
    }
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

    /**
     * Generates a srcset attribute string for responsive images.
     * Assumes resized images exist with '-<width>w.webp' suffix.
     * @param {string} src - The original image source URL.
     * @returns {string} The generated srcset string.
     */
    function generateSrcset(src) {
        if (!src || (!src.endsWith('.webp') && !src.endsWith('.png') && !src.endsWith('.jpg') && !src.endsWith('.jpeg'))) return '';
        const base = src.substring(0, src.lastIndexOf('.'));
        const sizes = [400, 800, 1200]; // Must match sizes in resize-images.js
        // The resize script always outputs webp
        return sizes.map(w => `${base}-${w}w.webp ${w}w`).join(', ');
    }


/**
 * Initializes scroll-related behaviors like navigation, animations, and parallax.
 */
function initScrollBehaviors() {
    // Get DOM elements
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    const setMenuState = (isOpen) => {
        if (!menuToggle || !navMenu) return;

        navMenu.classList.toggle('active', isOpen);
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        navMenu.setAttribute('aria-hidden', String(!isOpen));

        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        }

        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    // Mobile menu toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            setMenuState(!navMenu.classList.contains('active'));
        });
    }
    
    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            setMenuState(false);
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu && menuToggle) {
            const isClickInsideMenu = navMenu.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (navMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnToggle) {
                setMenuState(false);
            }
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            setMenuState(false);
            menuToggle.focus();
        }
    });
    
    // Navigation Highlighting Logic
    const path = window.location.pathname;
    const normalizedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
    const currentPage = normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1) || 'index.html';
    const resolvedPage = normalizedPath.startsWith('/blog/') ? 'blog.html'
        : normalizedPath.startsWith('/projects/') ? 'portfolio.html'
        : currentPage;
    const normalizeNavHref = (value) => {
        if (!value) return '';

        let normalizedValue = value.trim();
        if (normalizedValue.startsWith('/')) normalizedValue = normalizedValue.slice(1);
        if (!normalizedValue || normalizedValue === '#') return 'index.html';
        if (normalizedValue.startsWith('#')) return 'index.html';

        return normalizedValue.split('#')[0] || 'index.html';
    };

    if (resolvedPage !== 'index.html') {
        // Logic for non-homepage pages
        navLinks.forEach(link => {
            const linkPage = normalizeNavHref(link.getAttribute('href'));

            if (linkPage === resolvedPage) {
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
                        const linkHref = link.getAttribute('href') || '';
                        const normalizedHref = linkHref.startsWith('/') ? linkHref.slice(1) : linkHref;
                        const linkSection = normalizedHref.includes('#') ? normalizedHref.split('#')[1] : (normalizedHref === 'index.html' || normalizedHref === '' ? 'home' : '');
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
    
}

/**
 * Initializes animated counters that count up when in view.
 */
function initCounters() {
    const counters = document.querySelectorAll('[data-target]');
    if (counters.length === 0) return;

    const animateCounter = (counter) => {
        const target = +counter.getAttribute('data-target');
        const duration = 1500; // Animation duration in ms (was 2000)
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * target);
            counter.innerText = currentValue;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Check if it has already been animated
                if (!entry.target.dataset.animated) {
                    animateCounter(entry.target);
                    entry.target.dataset.animated = 'true';
                }
                // Unobserve after animation to save resources
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the element is visible
    });

    counters.forEach(counter => observer.observe(counter));
}

/**
 * Generates filter buttons dynamically from portfolio data categories.
 */
function generateFilterButtons() {
    const container = document.getElementById('filter-buttons');
    if (!container) return;

    // Specific filters requested
    const sortedFilters = [
        'Web Design',
        'Graphic Design',
        'Web Development',
        'Ads Management',
        'Google Business'
    ];

    // Generate HTML for buttons
    const buttonsHTML = sortedFilters.map(filter => {
        // Normalize filter name for the data-filter attribute
        const filterValue = filter.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        return `<button class="filter-btn px-4 py-2 text-xs md:text-sm rounded-full border border-gray-200 dark:border-white/20 text-charcoal/80 dark:text-gray-300 cursor-pointer transition-all font-medium hover:bg-gray-100 dark:hover:bg-white/10 hover:border-tech-blue/50 dark:hover:border-cyan hover:text-tech-blue dark:hover:text-cyan" data-filter="${filterValue}">${filter}</button>`;
    }).join('');

    // Add the 'All' button at the beginning
    container.innerHTML = `
        <button class="filter-btn px-4 py-2 text-xs md:text-sm rounded-full border border-gray-200 dark:border-white/20 text-charcoal/80 dark:text-gray-300 cursor-pointer transition-all font-medium hover:bg-gray-100 dark:hover:bg-white/10 hover:border-tech-blue/50 dark:hover:border-cyan hover:text-tech-blue dark:hover:text-cyan" data-filter="all">All</button>
        ${buttonsHTML}
    `;
}

function initPortfolioPage() {
    // This function now handles BOTH homepage portfolio preview AND the full portfolio page.
    const portfolioGrid = document.querySelector('#portfolio .portfolio-grid');
    if (!portfolioGrid) return;

    // Enforce a standard grid layout instead of masonry (pinterest-style)
    // This ensures all cards in a row have the same height.
    portfolioGrid.classList.remove('columns-1', 'sm:columns-2', 'lg:columns-4');
    portfolioGrid.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');

    // Step 1: Generate the portfolio cards. 
    // The generatePortfolio function is smart enough to know whether to render
    // a partial list (homepage) or a full list (portfolio page).
    if (typeof generatePortfolio === 'function' && typeof portfolioData !== 'undefined') {
        generatePortfolio(portfolioGrid);
    } else {
        // Safety: Clear the loading spinner if data is missing or generator fails
        if (portfolioGrid) portfolioGrid.innerHTML = '';
    }

    // Step 2: If we are on the full portfolio page, initialize the filtering and infinite scroll logic.
    // We can detect this by looking for an element unique to portfolio.html, like the search input.
    const searchInput = document.getElementById('portfolioSearch');
    if (searchInput) {
        // This is the portfolio page, so run the filtering logic.
        generateFilterButtons();

        const filterBtns = document.querySelectorAll('.filter-btn');
        const sentinel = document.getElementById('portfolio-sentinel');
        
        // Inject Empty State Container
        if (portfolioGrid && !document.querySelector('.empty-state')) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `<i class="fas fa-search"></i><h3 class="text-xl font-bold text-charcoal dark:text-white">No items found</h3><p class="text-charcoal/60 dark:text-gray-400">Try adjusting your search or filter to find what you're looking for.</p>`;
            portfolioGrid.appendChild(emptyState);
        }
        const portfolioItems = document.querySelectorAll('.portfolio-card:not(.no-filter)');

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
                resetAndFilter();
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

            let displayedItems = [];

            const applyFilterAndSearch = () => {
                const activeBtn = document.querySelector('.filter-btn.active');
                const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter').toLowerCase().trim() : 'all';
                const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

                displayedItems = [];
                portfolioItems.forEach(item => {
                    const categoryAttr = item.getAttribute('data-category');
                    const categories = categoryAttr ? categoryAttr.toLowerCase().split(/[\s,]+/) : [];
                    const title = item.querySelector('.portfolio-title').textContent.toLowerCase();
                    const desc = item.querySelector('.portfolio-description').textContent.toLowerCase();

                    const matchesFilter = activeFilter === 'all' || categories.includes(activeFilter);
                    const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);

                    if (matchesFilter && matchesSearch) {
                        displayedItems.push(item);
                    }
                });
            };

            const renderBatch = () => {
                const startIndex = (filter.currentPage - 1) * filter.itemsPerPage;
                const endIndex = startIndex + filter.itemsPerPage;
                const batch = displayedItems.slice(startIndex, endIndex);

                batch.forEach(item => {
                    item.classList.remove('hidden');
                    // Trigger animation
                    requestAnimationFrame(() => {
                        item.classList.add('active');
                    });
                });

                // Update sentinel visibility
                if (sentinel) {
                    if (endIndex >= displayedItems.length) {
                        sentinel.style.display = 'none';
                    } else {
                        sentinel.style.display = 'flex';
                    }
                }

                // Empty State Toggle
                const emptyState = document.querySelector('.empty-state');
                if (emptyState) {
                    if (displayedItems.length === 0) emptyState.classList.add('visible');
                    else emptyState.classList.remove('visible');
                }
            };

            const resetAndFilter = () => {
                filter.currentPage = 1;
                // First, hide all items to clear the current view.
                portfolioItems.forEach(item => {
                    item.classList.add('hidden');
                    item.classList.remove('active');
                });

                // Then, calculate the new view and render the first page.
                applyFilterAndSearch();
                renderBatch();
            };

            // Filter button click events
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const filter = btn.getAttribute('data-filter');
                    updateFilterUI(filter);
                    addToHistory(filter);
                    resetAndFilter();
                });
            });
            
            // Search input event
            if (searchInput) {
                searchInput.addEventListener('keyup', debounce(resetAndFilter, 300));
            }

            // Infinite Scroll with Intersection Observer
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    filter.currentPage++;
                    renderBatch();
                }
            }, { rootMargin: '400px' });

            if (sentinel) {
                observer.observe(sentinel);
            }

            // Initial load
            // Set the first filter button as active
            const firstButton = document.querySelector('.filter-btn[data-filter="all"]');
            if(firstButton) firstButton.classList.add('active');

            resetAndFilter();
            
            // Keyboard Shortcuts
            document.addEventListener('keydown', (e) => {
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
    }
}

function initTestimonialSlider() {
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
}

function initFloatingButtons() {
    // WhatsApp Button & Popup
    const whatsappContainer = document.getElementById('whatsapp-container');
    if (whatsappContainer) {
        const whatsappPopup = document.getElementById('whatsapp-popup');
        const closePopupBtn = document.getElementById('close-whatsapp-popup');

        // Add the requested message to the popup
        if (whatsappPopup) {
            const messageElement = whatsappPopup.querySelector('p');
            if (messageElement) {
                messageElement.innerHTML += '<br>Contact us on WhatsApp for a quick response!';
            }
        }

        const handleScroll = () => {
            if (window.scrollY > 300) {
                whatsappContainer.classList.remove('opacity-0', 'invisible', 'translate-y-5');
                whatsappContainer.classList.add('opacity-100', 'visible', 'translate-y-0');

                if (whatsappPopup && !sessionStorage.getItem('whatsappPopupClosed')) {
                    if (whatsappPopup.classList.contains('opacity-0')) {
                        setTimeout(() => {
                            whatsappPopup.classList.remove('opacity-0', 'scale-90', 'pointer-events-none');
                            whatsappPopup.classList.add('opacity-100', 'scale-100', 'pointer-events-auto');
                        }, 500);
                    }
                }
            } else {
                whatsappContainer.classList.add('opacity-0', 'invisible', 'translate-y-5');
                whatsappContainer.classList.remove('opacity-100', 'visible', 'translate-y-0');
            }
        };

        // Initial check
        handleScroll();
        
        // Show/hide based on scroll
        window.addEventListener('scroll', throttle(handleScroll), { passive: true });

        // Handle Close Button
        if (closePopupBtn && whatsappPopup) {
            closePopupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                whatsappPopup.classList.add('opacity-0', 'scale-90', 'pointer-events-none');
                whatsappPopup.classList.remove('opacity-100', 'scale-100', 'pointer-events-auto');
                sessionStorage.setItem('whatsappPopupClosed', 'true');
            });
        }
    }
}

/**
 * Initializes the case study modal, including injection and event listeners.
     * Injects the Case Study Modal HTML into the DOM.
     * Consolidates duplicate code from HTML files.
     */
    function injectModalComponent() {
        if (document.getElementById('caseStudyModal')) return;

        const modalHTML = `
        <div id="caseStudyModal" class="fixed inset-0 z-[100] hidden items-center justify-center" aria-hidden="true">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-charcoal/80 dark:bg-charcoal/90 backdrop-blur-md transition-opacity opacity-0" id="modalOverlay"></div>
            
            <!-- Modal Content -->
            <div class="relative flex flex-col w-full h-full overflow-hidden transition-all duration-300 transform scale-95 bg-white shadow-2xl opacity-0 dark:bg-slate-900 md:max-w-6xl md:max-h-[90vh] md:mx-4 md:rounded-2xl md:flex-row" id="modalContent">
                
                <!-- Global Close Button -->
                <button class="absolute top-4 right-4 z-50 flex items-center justify-center w-10 h-10 transition-all duration-300 rounded-full cursor-pointer bg-black/20 hover:bg-black/40 text-white" id="closeModalBtn">
                    <i class="text-xl fas fa-times"></i>
                </button>
                
                <!-- Left Pane: Image Slider -->
                <div class="relative w-full h-56 md:h-auto md:w-1/2 bg-soft-gray dark:bg-charcoal group overflow-hidden">
                    <div id="modalSliderTrack" class="flex h-full transition-transform duration-500 ease-out w-full" data-lightbox-container>
                        <!-- Slides injected here -->
                    </div>
                    
                    <button id="modalPrevBtn" class="absolute top-1/2 z-10 flex items-center justify-center w-10 h-10 text-white transition-all -translate-y-1/2 rounded-full cursor-pointer opacity-0 left-4 bg-black/30 hover:bg-black/50 backdrop-blur-sm group-hover:opacity-100">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button id="modalNextBtn" class="absolute top-1/2 z-10 flex items-center justify-center w-10 h-10 text-white transition-all -translate-y-1/2 rounded-full cursor-pointer opacity-0 right-4 bg-black/30 hover:bg-black/50 backdrop-blur-sm group-hover:opacity-100">
                        <i class="fas fa-chevron-right"></i>
                    </button>

                    <div id="modalSliderDots" class="absolute z-10 flex gap-2 bottom-4 left-1/2 -translate-x-1/2"></div>
                </div>

                <!-- Right Pane: Details (Scrollable) -->
                <div class="relative flex flex-col w-full flex-1 overflow-hidden md:w-1/2">

                    <!-- Scrollable Content Area -->
                    <div id="modal-scroll-content" class="flex-1 p-6 overflow-y-auto custom-scrollbar md:p-10">
                        <!-- Header -->
                        <div class="mb-6">
                            <span id="modalCategory" class="inline-block px-3 py-1 mb-3 text-xs font-semibold tracking-wider text-cyan uppercase rounded-full bg-cyan/10"></span>
                            <h2 id="modalTitle" class="text-3xl font-bold leading-tight md:text-4xl font-heading text-tech-blue dark:text-white"></h2>
                        </div>

                        <!-- Meta Info -->
                        <div class="grid grid-cols-2 gap-6 py-6 my-6 border-t border-b md:grid-cols-3 border-gray-100 dark:border-white/10">
                            <div>
                                <span class="block mb-1 text-xs font-bold tracking-wide text-cyan uppercase">Client</span>
                                <span id="modalClient" class="font-medium text-tech-blue dark:text-gray-200"></span>
                            </div>
                            <div>
                                <span class="block mb-1 text-xs font-bold tracking-wide text-cyan uppercase">Timeline</span>
                                <span id="modalTimeline" class="font-medium text-tech-blue dark:text-gray-200"></span>
                            </div>
                            <div>
                                <span class="block mb-1 text-xs font-bold tracking-wide text-cyan uppercase">Services</span>
                                <span id="modalServices" class="font-medium text-tech-blue dark:text-gray-200"></span>
                            </div>
                        </div>

                        <!-- Body Content -->
                        <div class="max-w-none prose-lg prose dark:prose-invert text-charcoal/80 dark:text-gray-300 space-y-8">
                            <div>
                                <h3 class="flex items-center gap-3 mb-3 text-lg font-bold not-prose text-tech-blue dark:text-cyan">
                                    <i class="w-5 text-center fas fa-mountain text-cyan"></i> The Challenge
                                </h3>
                                <p id="modalChallenge" class="leading-relaxed"></p>
                            </div>
                            <div>
                                <h3 class="flex items-center gap-3 mb-3 text-lg font-bold not-prose text-tech-blue dark:text-cyan">
                                    <i class="w-5 text-center fas fa-lightbulb text-cyan"></i> The Solution
                                </h3>
                                <p id="modalSolution" class="leading-relaxed"></p>
                            </div>
                        </div>
                        
                        <!-- Key Results -->
                        <div class="p-6 my-6 border rounded-xl bg-soft-gray dark:bg-white/5 border-tech-blue/10 dark:border-white/10">
                            <h3 class="flex items-center gap-3 mb-4 text-lg font-bold text-tech-blue dark:text-cyan">
                                <i class="w-5 text-center fas fa-chart-line text-cyan"></i> Key Results
                            </h3>
                            <ul id="modalResults" class="space-y-3"></ul>
                        </div>

                        <!-- Gallery Grid -->
                        <div id="modalGallery" class="hidden grid-cols-2 gap-4 mt-8" data-lightbox-container></div>
                        
                        <!-- Related Projects -->
                        <div id="modalRelated" class="hidden pt-8 mt-10 border-t border-gray-100 dark:border-white/10">
                            <h3 class="mb-6 text-xl font-bold text-tech-blue dark:text-white">Related Projects</h3>
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2" id="relatedProjectsGrid"></div>
                        </div>
                    </div>
                    
                    <!-- Sticky CTA Footer -->
                    <div class="p-6 mt-auto bg-white border-t border-gray-100 dark:bg-slate-900 dark:border-white/10">
                         <a href="/#contact" class="inline-flex items-center justify-center w-full py-3.5 font-bold text-white transition-colors transform rounded-xl bg-tech-blue hover:bg-cyan shadow-lg hover:shadow-cyan/30 hover:-translate-y-0.5">
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

function initModal() {

    // Modal Logic Variables
    const modal = document.getElementById('caseStudyModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalContent = document.getElementById('modalContent');
    const body = document.body;
    let previouslyFocusedElement = null;

    /**
     * Opens the case study modal with data for a given project object.
     * This function is called by the event listener in portfolio-generator.js
     * @param {object} project - The project object from portfolioData.
     */
    function openModalWithData(project) {
        if (!project || !project.fullData) {
            console.error('Invalid project data for modal:', project);
            Toast.show('Could not load project details.', 'error');
            return;
        }

        const study = project.fullData;

        // Helper to set text content directly
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if(el) el.textContent = value;
        };

        setText('modalCategory', project.category);
        setText('modalTitle', project.title);
        setText('modalClient', study.client);
        setText('modalTimeline', study.timeline);
        setText('modalServices', study.services);
        setText('modalChallenge', study.challenge);
        setText('modalSolution', study.solution);
        
        // --- Image Slider Logic ---
        const sliderTrack = document.getElementById('modalSliderTrack');
        const prevBtn = document.getElementById('modalPrevBtn');
        const nextBtn = document.getElementById('modalNextBtn');
        const dotsContainer = document.getElementById('modalSliderDots');

        // Combine main image and gallery images
        const images = [project.image];
        if (study.gallery && Array.isArray(study.gallery)) {
            images.push(...study.gallery);
        }

        let currentIndex = 0;

        // Render Slides
        if (sliderTrack) {
            sliderTrack.style.transform = 'translateX(0)';
            sliderTrack.innerHTML = images.map((img, idx) => `
                <div class="min-w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 relative">
                    <img src="${img}" class="w-full h-full object-cover cursor-zoom-in" alt="${project.title} ${idx + 1}" loading="${idx === 0 ? 'eager' : 'lazy'}">
                </div>
            `).join('');
        }

        // Update Dots & Navigation
        const updateSliderUI = () => {
            if (sliderTrack) sliderTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            if (dotsContainer) {
                dotsContainer.innerHTML = images.map((_, idx) => `
                    <button class="transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'} h-2" data-index="${idx}"></button>
                `).join('');
            }
        };
        updateSliderUI();

        // Event Listeners for Slider
        if (prevBtn) {
            prevBtn.style.display = images.length > 1 ? 'flex' : 'none';
            prevBtn.onclick = (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex === 0) ? images.length - 1 : currentIndex - 1;
                updateSliderUI();
            };
        }
        if (nextBtn) {
            nextBtn.style.display = images.length > 1 ? 'flex' : 'none';
            nextBtn.onclick = (e) => {
                e.stopPropagation();
                currentIndex = (currentIndex === images.length - 1) ? 0 : currentIndex + 1;
                updateSliderUI();
            };
        }
        if (dotsContainer) {
            dotsContainer.style.display = images.length > 1 ? 'flex' : 'none';
            dotsContainer.onclick = (e) => {
                if (e.target.tagName === 'BUTTON') {
                    e.stopPropagation();
                    currentIndex = parseInt(e.target.dataset.index);
                    updateSliderUI();
                }
            };
        }

        const resultsList = document.getElementById('modalResults');
        if (resultsList) {
            resultsList.innerHTML = '';
            if (study.results && study.results.length > 0) {
                study.results.forEach(result => {
                    const li = document.createElement('li');
                    li.className = 'flex items-start gap-3 text-charcoal/80 dark:text-gray-300';
                    li.innerHTML = `<i class="fas fa-check-circle text-cyan mt-1 shrink-0"></i><span>${result}</span>`;
                    resultsList.appendChild(li);
                });
            }
        }

        // Hide old Gallery Grid (since images are now in slider)
        const galleryContainer = document.getElementById('modalGallery');
        if (galleryContainer) {
            galleryContainer.classList.add('hidden');
        }

        // Related Projects Logic
        const relatedContainer = document.getElementById('modalRelated');
        const relatedGrid = document.getElementById('relatedProjectsGrid');
        
        if (relatedContainer && relatedGrid && typeof portfolioData !== 'undefined') {
            relatedGrid.innerHTML = '';
            
            // Filter related projects: same category, not current project
            const related = portfolioData
                .filter(p => p.id !== project.id && p.category === project.category)
                .slice(0, 2); // Limit to 2

            if (related.length > 0) {
                relatedContainer.classList.remove('hidden');
                related.forEach(relatedProject => {
                    const srcset = generateSrcset(relatedProject.image);
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <button class="group w-full text-left cursor-pointer bg-soft-gray dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg p-3 transition-colors duration-300 flex items-center gap-4">
                            <div class="w-16 h-16 rounded-md overflow-hidden shrink-0">
                                <img src="${relatedProject.image}" srcset="${srcset}" sizes="5vw" alt="${relatedProject.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://placehold.co/100x100?text=Img'">
                            </div>
                            <div>
                                <h4 class="font-bold text-tech-blue dark:text-white mb-1 text-sm line-clamp-1">${relatedProject.title}</h4>
                                <p class="text-xs text-charcoal/60 dark:text-gray-400 uppercase tracking-wider">${relatedProject.category}</p>
                            </div>
                        </button>
                    `;
                    div.querySelector('button').addEventListener('click', () => {
                        // Scroll to top of modal content
                        const scrollContainer = document.getElementById('modal-scroll-content');
                        if (scrollContainer) scrollContainer.scrollTop = 0;
                        openModalWithData(relatedProject);
                    });
                    relatedGrid.appendChild(div);
                });
            } else {
                relatedContainer.classList.add('hidden');
            }
        }

        if (modal) {
            previouslyFocusedElement = document.activeElement;
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            modal.classList.add('flex'); // Use flex for centering
            setTimeout(() => {
                if (modalOverlay) modalOverlay.classList.remove('opacity-0');
                if (modalContent) {
                    modalContent.classList.remove('opacity-0', 'scale-95');
                    modalContent.classList.add('scale-100');
                }
                // Focus the close button for accessibility
                if(closeModalBtn) closeModalBtn.focus();
            }, 10);
            body.style.overflow = 'hidden';
        }
    }
    
    // Expose function globally for portfolio-generator.js
    window.openModalWithData = openModalWithData;

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
            if (modal) {
                modal.classList.add('hidden');
                modal.setAttribute('aria-hidden', 'true');
                modal.classList.remove('flex');
            }
            body.style.overflow = '';
            // Restore focus to the element that opened the modal
            if (previouslyFocusedElement) {
                previouslyFocusedElement.focus();
            }
        }, 300);
    }

    if (modal) {
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
}

function initLightbox() {
    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const closeLightboxBtn = document.getElementById('closeLightbox');
    const prevLightboxBtn = document.getElementById('prevLightboxBtn');
    const nextLightboxBtn = document.getElementById('nextLightboxBtn');
    
    if (!lightbox || !lightboxImage || !closeLightboxBtn || !prevLightboxBtn || !nextLightboxBtn) return;

    let currentImages = [];
    let currentImageIndex = 0;

    const showImage = (index) => {
        if (currentImages.length === 0) return;
        if (index < 0) index = currentImages.length - 1;
        if (index >= currentImages.length) index = 0;
        currentImageIndex = index;
        
        const imgData = currentImages[currentImageIndex];
        
        lightboxImage.style.opacity = '0.5';
        lightboxImage.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
            lightboxImage.src = imgData.highResSrc;
            lightboxImage.alt = imgData.alt;
            lightboxImage.style.opacity = '1';
            lightboxImage.style.transform = 'scale(1)';
        }, 150);
    };

    const openLightbox = (images, startIndex) => {
        currentImages = images;
        currentImageIndex = startIndex;
        
        const imgData = currentImages[currentImageIndex];
        lightboxImage.src = imgData.highResSrc;
        lightboxImage.alt = imgData.alt;

        lightbox.classList.remove('hidden');
        requestAnimationFrame(() => {
            lightbox.classList.remove('opacity-0');
            lightboxImage.classList.remove('scale-95');
            lightboxImage.classList.add('scale-100');
        });
        document.body.style.overflow = 'hidden';
        
        if (currentImages.length > 1) {
            prevLightboxBtn.classList.remove('hidden');
            nextLightboxBtn.classList.remove('hidden');
        } else {
            prevLightboxBtn.classList.add('hidden');
            nextLightboxBtn.classList.add('hidden');
        }
    };
    
    const closeLightbox = () => {
        lightbox.classList.add('opacity-0');
        lightboxImage.classList.remove('scale-100');
        lightboxImage.classList.add('scale-95');
        setTimeout(() => {
            lightbox.classList.add('hidden');
            lightboxImage.src = '';
        }, 300);
        document.body.style.overflow = '';
    };
    
    closeLightboxBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    prevLightboxBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentImageIndex - 1); });
    nextLightboxBtn.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentImageIndex + 1); });
    
        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('hidden')) return;
            
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showImage(currentImageIndex - 1);
            if (e.key === 'ArrowRight') showImage(currentImageIndex + 1);
        });

    // Swipe Gesture Support
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) showImage(currentImageIndex + 1);
        if (touchEndX > touchStartX + 50) showImage(currentImageIndex - 1);
    }, { passive: true });

    // Event Delegation for opening the lightbox
    document.body.addEventListener('click', (e) => {
        const clickedImg = e.target;
        const lightboxContainer = clickedImg.closest('[data-lightbox-container]');

        // Check if an image inside a lightbox-enabled container was clicked
        if (!clickedImg.matches('img') || !lightboxContainer) {
            return;
        }
        
        // Prevent lightbox on portfolio cards that open a modal
        if (clickedImg.closest('.portfolio-card[data-id]')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Gather all images within this specific container
        const allImagesInContainer = Array.from(lightboxContainer.querySelectorAll('img'));
        const clickedIndex = allImagesInContainer.findIndex(img => img === clickedImg);

        if (clickedIndex === -1) return;

        // Create the dataset for the lightbox
        const imageDataSet = allImagesInContainer.map(img => ({
            src: img.src,
            alt: img.alt,
            highResSrc: img.src
        }));

        openLightbox(imageDataSet, clickedIndex);
    });
}

function initThemeToggle() {
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
}

function initContactForm() {
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
                trackEvent('contact_method_select', {
                    category: 'contact',
                    label: method || 'unknown'
                });
                
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
        const successSound = new Audio('/assets/audio/success.mp3');

        if (emailForm && sendBtn) {
            emailForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Honeypot Check (Spam Prevention)
                const honeypot = document.getElementById('website_check');
                if (honeypot && honeypot.value) {
                    return; // Silent rejection
                }

                // Validation
                const inputs = emailForm.querySelectorAll('input:not(.honeypot), select, textarea');
                let isValid = true;
                
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                inputs.forEach(input => {
                    const isEmailField = input.type === 'email';
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('border-red-500');
                    } else if (isEmailField && !emailRegex.test(input.value)) {
                        isValid = false;
                        input.classList.add('border-red-500');
                        Toast.show('Please enter a valid email address', 'error');
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

                const serviceID = 'service_616vx27';
                const templateID = 'template_io83jnh';

                emailjs.sendForm(serviceID, templateID, emailForm)
                    .then(() => {
                    trackEvent('contact_form_submit_success', {
                        category: 'lead',
                        label: 'email_contact_form'
                    });
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
                    trackEvent('contact_form_submit_error', {
                        category: 'lead',
                        label: 'email_contact_form'
                    });
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
}

function initBlogPages() {
    // Blog Listing Page (blog.html)
    const blogGrid = document.getElementById('blog-grid');
    if (blogGrid) {
        fetch('/assets/data/blog.json')
            .then(response => response.json())
            .then(posts => {
                blogGrid.innerHTML = ''; // Clear loading spinner
                
                posts.forEach((post, index) => {
                    const delay = index * 100;
                    const postUrl = getBlogPostUrl(post.id);
                    const imageUrl = sanitizeContentUrl(post.image);
                    const safeTitle = escapeHtml(post.title);
                    const safeCategory = escapeHtml(post.category);
                    const safeDate = escapeHtml(post.date);
                    const safeAuthor = escapeHtml(post.author);
                    const safeExcerpt = escapeHtml(post.excerpt);
                    const html = `
                        <div class="blog-card group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 dark:border-white/5 hover:border-cyan/30 transition-all duration-300 flex flex-col reveal-up mb-8 break-inside-avoid" style="animation-delay: ${delay}ms">
                            <a href="${postUrl}" class="block overflow-hidden relative bg-soft-gray dark:bg-slate-700">
                                <img src="${imageUrl}" alt="${safeTitle}" class="w-full h-auto transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async">
                                <div class="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div class="absolute top-4 left-4 bg-gradient-to-r from-tech-blue to-cyan text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                                    ${safeCategory}
                                </div>
                            </a>
                            <div class="p-6 flex flex-col flex-1 relative">
                                <div class="flex items-center gap-3 text-xs text-charcoal/60 dark:text-gray-400 mb-3">
                                    <span class="flex items-center gap-1"><i class="far fa-calendar-alt text-cyan"></i> ${safeDate}</span>
                                    <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                    <span class="flex items-center gap-1"><i class="far fa-user text-cyan"></i> ${safeAuthor}</span>
                                </div>
                                <h3 class="text-xl font-bold text-tech-blue dark:text-white mb-3 leading-tight group-hover:text-cyan transition-colors">
                                    <a href="${postUrl}">${safeTitle}</a>
                                </h3>
                                <p class="text-charcoal/70 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                                    ${safeExcerpt}
                                </p>
                                <a href="${postUrl}" class="inline-flex items-center text-tech-blue dark:text-cyan font-bold text-sm group/link mt-auto">
                                    Read Article <i class="fas fa-arrow-right ml-2 transform group-hover/link:translate-x-1 transition-transform"></i>
                                </a>
                            </div>
                        </div>
                    `;
                    blogGrid.insertAdjacentHTML('beforeend', html);
                });

                // Trigger animations
                setTimeout(() => {
                    document.querySelectorAll('.reveal-up').forEach(el => el.classList.add('active'));
                }, 100);
            })
            .catch(err => {
                console.error('Error loading blog posts:', err);
                blogGrid.innerHTML = '<p class="text-center col-span-full text-red-500">Failed to load blog posts.</p>';
            });
    }

    // Single Blog Post Page (blog-post.html)
    const postContainer = document.getElementById('post-container');
    if (postContainer) {
        // Handle clean URLs like /blog/post-id and fallback to ?id=...
        const path = window.location.pathname; 
        const pathSegments = path.split('/').filter(segment => segment);
        let postId = null;

        if (path.startsWith('/blog/')) {
            postId = decodeURIComponent(pathSegments[pathSegments.length - 1] || '');
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            postId = urlParams.get('id');
        }

        if (postId) {
            fetch('/assets/data/blog.json')
                .then(res => res.json())
                .then(posts => {
                    const post = posts.find(p => p.id === postId);
                    if (post) {                        // ==========================================
                        // DYNAMIC SEO & METADATA UPDATE
                        // ==========================================
                        const currentUrl = window.location.href;
                        const safeTitle = escapeHtml(post.title);
                        const safeCategory = escapeHtml(post.category);
                        const safeDate = escapeHtml(post.date);
                        const safeAuthor = escapeHtml(post.author);
                        const safeImageUrl = sanitizeContentUrl(post.image);
                        const safePostContent = sanitizeRichHtml(post.content);
                        const authorInitial = getAuthorInitial(post.author);
                        const metaImageUrl = safeImageUrl || 'https://kumtechgateway.com/images/logo.png';
                        
                        // 1. Update Title & Description
                        document.title = `${post.title} | Kumtech Gateway Blog`;
                        
                        const metaDesc = document.querySelector('meta[name="description"]');
                        if (metaDesc) metaDesc.setAttribute('content', post.excerpt);

                        // 2. Update Canonical URL
                        const canonical = document.querySelector('link[rel="canonical"]');
                        if (canonical) canonical.setAttribute('href', currentUrl);

                        // 3. Update Open Graph (Facebook/LinkedIn)
                        const setMeta = (selector, attr, value) => {
                            const el = document.querySelector(selector);
                            if (el) el.setAttribute(attr, value);
                        };

                        setMeta('meta[property="og:title"]', 'content', post.title);
                        setMeta('meta[property="og:description"]', 'content', post.excerpt);
                        setMeta('meta[property="og:image"]', 'content', metaImageUrl);
                        setMeta('meta[property="og:url"]', 'content', currentUrl);

                        // 4. Update Twitter Card
                        setMeta('meta[name="twitter:title"]', 'content', post.title);
                        setMeta('meta[name="twitter:description"]', 'content', post.excerpt);
                        setMeta('meta[name="twitter:image"]', 'content', metaImageUrl);

                        // 5. Inject JSON-LD Schema Markup (Google Rich Results)
                        const schemaData = {
                            "@context": "https://schema.org",
                            "@type": "BlogPosting",
                            "headline": post.title,
                            "image": [metaImageUrl],
                            "datePublished": new Date(post.date).toISOString(),
                            "dateModified": new Date(post.date).toISOString(),
                            "author": [{
                                "@type": "Person",
                                "name": post.author,
                                "url": "https://kumtechgateway.com"
                            }],
                            "publisher": {
                                "@type": "Organization",
                                "name": "Kumtech Gateway",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": "https://kumtechgateway.com/images/logo.png"
                                }
                            },
                            "description": post.excerpt,
                            "mainEntityOfPage": {
                                "@type": "WebPage",
                                "@id": currentUrl
                            }
                        };

                        // Remove any existing JSON-LD to prevent duplicates on re-renders
                        const existingSchema = document.getElementById('dynamic-schema');
                        if (existingSchema) existingSchema.remove();

                        const script = document.createElement('script');
                        script.id = 'dynamic-schema';
                        script.type = 'application/ld+json';
                        script.text = JSON.stringify(schemaData);
                        document.head.appendChild(script);

                        postContainer.innerHTML = `
                            <div class="mb-8">
                                <span class="text-cyan font-bold tracking-wider uppercase text-sm mb-2 block">${safeCategory}</span>
                                <h1 class="text-3xl md:text-5xl font-heading font-bold text-tech-blue dark:text-white mb-6 leading-tight">${safeTitle}</h1>
                                <div class="post-meta flex items-center gap-4 text-charcoal/60 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-white/10 pb-6">
                                    <span class="flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-charcoal">${authorInitial}</div> ${safeAuthor}</span>
                                    <span>&bull;</span>
                                    <span>${safeDate}</span>
                                </div>
                            </div>
                            <img src="${safeImageUrl}" alt="${safeTitle}" class="w-full h-auto rounded-2xl shadow-lg mb-10 max-h-[500px]" width="800" height="400">
                            <div class="prose prose-lg dark:prose-invert max-w-none text-charcoal/80 dark:text-gray-300 leading-relaxed">
                                ${safePostContent}
                            </div>
                            <div class="share-buttons mt-12 pt-8 border-t border-gray-200 dark:border-white/10">
                                <h3 class="text-xl font-bold text-tech-blue dark:text-white mb-4">Share this article</h3>
                                <div class="flex gap-4">
                                    <a href="https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:-translate-y-1 transition-transform"><i class="fab fa-whatsapp"></i></a>
                                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:-translate-y-1 transition-transform"><i class="fab fa-facebook-f"></i></a>
                                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:-translate-y-1 transition-transform"><i class="fab fa-twitter"></i></a>
                                </div>
                            </div>
                        `;
                    } else {
                        // Set 404 status for prerenderers
                        const meta = document.createElement('meta');
                        meta.name = "prerender-status-code";
                        meta.content = "404";
                        document.head.appendChild(meta);
                        
                        document.title = "404 - Post Not Found | Kumtech Gateway";
                        postContainer.innerHTML = '<div class="text-center py-20"><h2 class="text-2xl font-bold mb-4">Post Not Found</h2><p class="text-charcoal/60 mb-6">The article you are looking for does not exist or has been moved.</p><a href="/blog.html" class="inline-block px-6 py-3 rounded-full bg-tech-blue text-white font-bold hover:bg-cyan transition-colors">Return to Blog</a></div>';
                    }
                });
        } else {
            window.location.href = '/blog.html';
        }
    }
}

function initGalleryPreview() {
    const grid = document.getElementById('gallery-preview-grid');
    if (grid && typeof galleryData !== 'undefined') {
        const allImages = [...galleryData.flyers, ...galleryData.banners, ...galleryData.posters, ...galleryData['social-media']];
        
        // Shuffle and pick 8 for a denser display
        const previewImages = allImages.sort(() => 0.5 - Math.random()).slice(0, 8);

        grid.innerHTML = ''; // Clear any placeholders

        previewImages.forEach((img, i) => {
            const srcset = generateSrcset(img.src);
            const delay = ['delay-100', 'delay-200', 'delay-300', 'delay-400'][i % 4];
            
            const cardHTML = `
            <div class="mb-4 break-inside-avoid group reveal-up ${delay} relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800">
                <img src="${img.src}" srcset="${srcset}"
                     sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                     alt="${img.alt}"
                     width="${img.width || 600}"
                     height="${img.height || 800}"
                     class="w-full h-auto rounded-2xl shadow-md group-hover:shadow-xl transition-all duration-500 group-hover:scale-105 cursor-zoom-in"
                     loading="lazy" decoding="async" onerror="this.onerror=null;this.src='https://placehold.co/${img.width || 600}x${img.height || 800}?text=Image+Error'">
                
                <!-- Hover Overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
                    <span class="inline-block px-3 py-1 bg-cyan/90 text-white text-xs font-bold rounded-full mb-2 w-max transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">${img.category ? img.category.replace('-', ' ') : 'Design'}</span>
                    <p class="text-white text-sm font-medium opacity-90 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"><i class="fas fa-search-plus mr-2"></i>View Full Size</p>
                </div>
            </div>`;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Re-run reveal observer for these new elements
        const revealElements = grid.querySelectorAll('.reveal-up');
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        revealElements.forEach(el => revealObserver.observe(el));
    }
}

/**
 * Generates gallery filter buttons dynamically from gallery data.
 */
function generateGalleryFilters() {
    const container = document.getElementById('gallery-filters');
    if (!container || typeof galleryData === 'undefined') return;

    const categories = ['all', ...Object.keys(galleryData)];
    
    container.innerHTML = categories.map(cat => {
        const catName = cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        
        // Calculate count
        let count = 0;
        if (cat === 'all') {
            Object.values(galleryData).forEach(arr => count += arr.length);
        } else {
            count = galleryData[cat] ? galleryData[cat].length : 0;
        }

        return `<button class="filter-btn px-4 py-2 text-xs md:text-sm rounded-full border border-gray-200 dark:border-white/20 text-charcoal/80 dark:text-gray-300 cursor-pointer transition-all font-medium hover:bg-gray-100 dark:hover:bg-white/10 hover:border-tech-blue/50 dark:hover:border-cyan hover:text-tech-blue dark:hover:text-cyan ${cat === 'all' ? 'active' : ''}" data-filter="${cat}">
            ${catName} <span class="text-[10px] opacity-60 ml-1">(${count})</span>
        </button>`;
    }).join('');
}

function initGalleryPage() {
    generateGalleryFilters();
    const grid = document.querySelector('#gallery .portfolio-grid');
    const sentinel = document.getElementById('gallery-sentinel');
    const filterBtns = document.querySelectorAll('#gallery .filter-btn, #gallery-filters .filter-btn');

    if (grid && sentinel && filterBtns.length > 0 && typeof galleryData !== 'undefined') {
        // Enforce 4-column layout for gallery
        grid.classList.remove('lg:columns-3');
        grid.classList.add('columns-1', 'sm:columns-2', 'lg:columns-4', 'gap-4');

        grid.setAttribute('data-lightbox-container', '');
        const allImages = [...galleryData.flyers, ...galleryData.banners, ...galleryData.posters, ...galleryData['social-media']];
        let displayImages = [];
        let loadedCount = 0;
        const batchSize = 12;

        const emptyStateHTML = `<div class="empty-state text-center py-16 reveal-up active" style="column-span: all;">
                                    <i class="fas fa-camera-retro text-4xl text-cyan mb-4"></i>
                                    <h3 class="text-xl font-bold text-charcoal dark:text-white">No Images Found</h3>
                                    <p class="text-charcoal/60 dark:text-gray-400">There are no images in this category yet. Try another one!</p>
                                </div>`;

        const itemRevealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const highResSrc = img.dataset.src;
                    const highResSrcset = img.dataset.srcset;
                    if (!highResSrc) return;

                    const tempImg = new Image();
                    tempImg.src = highResSrc;
                    if (highResSrcset) tempImg.srcset = highResSrcset;

                    tempImg.onload = () => {
                        img.src = highResSrc;
                        if (highResSrcset) img.srcset = highResSrcset;
                        img.classList.add('loaded');
                    };
                    tempImg.onerror = () => {
                        img.onerror();
                    };
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        const renderBatch = () => {
            const fragment = document.createDocumentFragment();
            const nextLimit = Math.min(loadedCount + batchSize, displayImages.length);
            const batch = displayImages.slice(loadedCount, nextLimit);

            batch.forEach((imgData, i) => {
                const srcset = generateSrcset(imgData.src);
                const isEager = loadedCount === 0 && i < 6;
                const delay = isEager ? '' : ['delay-100', 'delay-200', 'delay-300'][i % 3];
                const placeholderSrc = imgData.placeholder || `https://placehold.co/30x40?text=+`;

                const div = document.createElement('div');
                div.className = `mb-4 break-inside-avoid group reveal-up ${delay} relative rounded-[10px] overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1`;
                div.setAttribute('data-category', imgData.category);
                div.style.aspectRatio = `${imgData.width || 600} / ${imgData.height || 800}`;

                const imgHTML = `
                    <img src="${isEager ? imgData.src : placeholderSrc}"
                         ${isEager ? `srcset="${srcset}"` : `data-src="${imgData.src}" data-srcset="${srcset}"`}
                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                         alt="${imgData.alt}"
                         width="${imgData.width || 600}"
                         height="${imgData.height || 800}"
                         class="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-500 ${!isEager ? 'img-blur-up' : ''}"
                         ${isEager ? 'loading="eager" fetchPriority="high"' : 'loading="lazy"'}
                         decoding="async"
                         onerror="this.onerror=null; this.src='https://placehold.co/${imgData.width || 600}x${imgData.height || 800}?text=Image+Error'; this.classList.add('loaded');">
                    <div class="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
                    <span class="inline-block px-3 py-1 bg-cyan/90 text-white text-xs font-bold rounded-full mb-2 w-max transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">${imgData.category ? imgData.category.replace('-', ' ') : 'Design'}</span>
                    <p class="text-white text-sm font-medium opacity-90 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"><i class="fas fa-search-plus mr-2"></i>View Full Size</p>
                    </div>`;

                div.innerHTML = imgHTML;
                fragment.appendChild(div);

                const imgEl = div.querySelector('img');
                if (!isEager) {
                    lazyLoadObserver.observe(imgEl);
                }
                itemRevealObserver.observe(div);
            });
            grid.appendChild(fragment);
            loadedCount = nextLimit;
        };

        const loadNextBatch = () => {
            if (loadedCount >= displayImages.length) {
                sentinel.style.display = 'none';
                return;
            }
            sentinel.style.display = 'flex';
            renderBatch();
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) setTimeout(loadNextBatch, 300);
        }, { rootMargin: '200px' });

        function applyFilter(filter) {
            grid.classList.add('gallery-fading');

            setTimeout(() => {
                grid.innerHTML = '';
                loadedCount = 0;
                displayImages = (filter === 'all') ? [...allImages] : allImages.filter(img => img.category === filter);

                if (filter === 'all') {
                    shuffle(displayImages);
                }

                if (displayImages.length > 0) {
                    observer.observe(sentinel);
                    loadNextBatch();
                } else {
                    grid.innerHTML = emptyStateHTML;
                    sentinel.style.display = 'none';
                    observer.unobserve(sentinel);
                }

                requestAnimationFrame(() => {
                    grid.classList.remove('gallery-fading');
                });
            }, 250);
        }

        filterBtns.forEach(btn => btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilter(btn.dataset.filter);
        }));

        applyFilter('all');
        observer.observe(sentinel);
    }
}

/**
 * Initializes the Review System
 */
function initReviews() {
    const reviewModal = document.getElementById('reviewModal');
    const openBtn = document.getElementById('openReviewForm');
    const closeBtn = document.getElementById('closeReviewBtn');
    const overlay = document.getElementById('reviewOverlay');
    const content = document.getElementById('reviewContent');
    const form = document.getElementById('reviewForm');
    let previouslyFocusedElement = null;

    // 1. Load Reviews
    loadReviews();

    // 2. Modal Logic
    if (reviewModal && openBtn) {
        const openModal = () => {
            previouslyFocusedElement = document.activeElement;
            reviewModal.classList.remove('hidden');
            reviewModal.classList.add('flex');
            reviewModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            // Animation
            requestAnimationFrame(() => {
                overlay.classList.remove('opacity-0');
                content.classList.remove('opacity-0', 'scale-95');
                content.classList.add('scale-100');
                if (closeBtn) closeBtn.focus();
            });
        };

        const closeModal = () => {
            overlay.classList.add('opacity-0');
            content.classList.remove('scale-100');
            content.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                reviewModal.classList.add('hidden');
                reviewModal.classList.remove('flex');
                reviewModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
                    previouslyFocusedElement.focus();
                }
            }, 300);
        };

        openBtn.addEventListener('click', openModal);
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !reviewModal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    // 3. Handle Submission
    if (form) {
        form.addEventListener('submit', handleReviewSubmission);
    }
}

async function loadReviews() {
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    
    const hideSliderButtons = () => {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    };
    
    try {
        // Fetch approved reviews ordered by newest first, limited to 20
        const q = query(
            collection(db, "reviews"),
            where("approved", "==", true),
            orderBy("createdAt", "desc"),
            limit(20)
        );
        const querySnapshot = await getDocs(q);
        const reviews = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            reviews.push(data);
        });

        if (reviews.length > 0) {
            renderReviews(reviews);
        } else {
            hideSliderButtons();
        }
    } catch (error) {
        console.error("Error loading reviews:", error);
        hideSliderButtons();
    }
}

/**
 * Escapes HTML characters to prevent XSS attacks.
 * @param {string} str - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
}

function sanitizeContentUrl(value) {
    if (typeof value !== 'string') return '';

    const trimmedValue = value.trim();
    if (!trimmedValue) return '';

    try {
        const parsedUrl = new URL(trimmedValue, window.location.origin);
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            return parsedUrl.href;
        }
    } catch (error) {
        return '';
    }

    return '';
}

function getBlogPostUrl(postId) {
    return `/blog/${encodeURIComponent(String(postId || '').trim())}/`;
}

function getProjectDetailUrl(projectId) {
    return `/projects/${encodeURIComponent(String(projectId || '').trim())}/`;
}

function getAuthorInitial(authorName) {
    const safeName = typeof authorName === 'string' ? authorName.trim() : '';
    return safeName ? escapeHtml(safeName.charAt(0).toUpperCase()) : '?';
}

function sanitizeRichHtml(html) {
    if (typeof html !== 'string' || !html.trim()) return '';

    const template = document.createElement('template');
    template.innerHTML = html;

    template.content.querySelectorAll('script, style, iframe, object, embed, link, meta').forEach((node) => {
        node.remove();
    });

    template.content.querySelectorAll('*').forEach((element) => {
        [...element.attributes].forEach((attribute) => {
            const attrName = attribute.name.toLowerCase();
            const attrValue = attribute.value.trim();

            if (attrName.startsWith('on')) {
                element.removeAttribute(attribute.name);
                return;
            }

            if ((attrName === 'href' || attrName === 'src') && /^javascript:/i.test(attrValue)) {
                element.removeAttribute(attribute.name);
            }
        });
    });

    return template.innerHTML;
}

function renderReviews(reviews) {
    const track = document.getElementById('testimonialTrack');
    if (!track) return;
    track.innerHTML = ''; // Clear existing reviews before rendering new ones

    reviews.forEach(review => {
        // Generate Initials
        const initials = review.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        // Generate Stars
        const starsHTML = Array(5).fill(0).map((_, i) => 
            `<i class="fas fa-star ${i < review.rating ? '' : 'text-gray-300'}"></i>`
        ).join('');

        const card = document.createElement('div');
        card.className = 'min-w-full md:min-w-[calc(33.333%-1.33rem)] snap-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg shadow-gray-100 dark:shadow-none border border-gray-50 dark:border-white/5 relative hover:-translate-y-2 transition-transform duration-300';
        
        card.innerHTML = `
            <div class="text-4xl text-cyan/20 absolute top-6 right-8"><i class="fas fa-quote-right"></i></div>
            <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-tech-blue to-cyan text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">${initials}</div>
                <div>
                    <h4 class="font-bold text-tech-blue dark:text-white">${escapeHtml(review.name)}</h4>
                    <p class="text-xs text-cyan uppercase tracking-wider font-semibold">${escapeHtml(review.company || 'Client')}</p>
                </div>
            </div>
            <div class="flex gap-1 text-orange text-xs mb-4">
                ${starsHTML}
            </div>
            <p class="text-charcoal/80 dark:text-gray-300 italic leading-relaxed relative z-10">"${escapeHtml(review.review)}"</p>
        `;

        track.appendChild(card);
    });
}

async function handleReviewSubmission(e) {
    e.preventDefault();
    const form = e.target;
    
    if (form.website_check.value) return;

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    const showSuccessAndReset = (title, text) => {
        const reviewModal = document.getElementById('reviewModal');
        const overlay = document.getElementById('reviewOverlay');
        const content = document.getElementById('reviewContent');
        if (!overlay || !content) return;

        // The success message is now configurable.
        overlay.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            reviewModal.classList.add('hidden');
            reviewModal.classList.remove('flex');
            document.body.style.overflow = '';
            
            const successModal = document.getElementById('successModal');
            const successTitleEl = document.getElementById('successTitle');
            const successTextEl = document.getElementById('successText');
            if (successModal) {
                if(successTitleEl) successTitleEl.textContent = title;
                if(successTextEl) successTextEl.textContent = text;
                successModal.classList.add('active');
                if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#00B4D8', '#F97316'] });
            }
            form.reset();
            btn.disabled = false;
            btn.innerText = originalText;
        }, 300);
    };

    const name = form.querySelector('[name="name"]').value;
    const company = form.querySelector('[name="company"]').value;
    const rating = parseInt(form.querySelector('[name="rating"]').value, 10);
    const review = form.querySelector('[name="review"]').value;

    try {
        await addDoc(collection(db, "reviews"), {
            name: name,
            company: company,
            rating: rating,
            review: review,
            approved: false,
            createdAt: serverTimestamp()
        });

        showSuccessAndReset(
            'Review Submitted!',
            'Thank you for your feedback. It will be visible after moderation.'
        );
        trackEvent('review_submit_success', {
            category: 'engagement',
            label: 'website_review_form'
        });
        loadReviews(); // Refresh the reviews list to show the new submission
    } catch (error) {
        console.error('Submission Error:', error);
        trackEvent('review_submit_error', {
            category: 'engagement',
            label: 'website_review_form'
        });
        Toast.show('Sorry, there was an error submitting your review.', 'error');
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}


function initProjectDetailPage() {
    const container = document.getElementById('project-detail-container');
    if (!container) return;
    
    const loader = document.getElementById('project-loader');
    const content = document.getElementById('project-content');
    
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(segment => segment);
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = path.startsWith('/projects/')
        ? decodeURIComponent(pathSegments[pathSegments.length - 1] || '')
        : urlParams.get('id');
    const project = portfolioData.find(p => p.id === projectId);
    const normalizeLiveUrl = (value) => {
        if (typeof value !== 'string') return '';

        const trimmedValue = value.trim();
        if (!trimmedValue || trimmedValue === '#') return '';

        try {
            const parsedUrl = new URL(trimmedValue, window.location.origin);
            return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' ? parsedUrl.href : '';
        } catch (error) {
            return '';
        }
    };
    
    if (!project || !project.fullData) {
        container.innerHTML = `<div class="text-center py-20"><h2 class="text-2xl font-bold mb-4">Project Not Found</h2><p class="text-charcoal/60 mb-6">The project you are looking for does not exist or has been moved.</p><a href="/portfolio.html" class="inline-block px-6 py-3 rounded-full bg-tech-blue text-white font-bold hover:bg-cyan transition-colors">Return to Portfolio</a></div>`;
        document.title = "404 - Project Not Found | Kumtech Gateway";
        return;
    }
    
    // ==========================================
    // DYNAMIC SEO & METADATA UPDATE
    // ==========================================
    const currentUrl = window.location.href;
    const pageTitle = `${project.title} | Kumtech Gateway Project`;
    const pageDescription = project.description;
    // Ensure we have a full URL for the image
    const pageImage = project.image.startsWith('http') ? project.image : `https://kumtechgateway.com/${project.image}`;

    // 1. Update Title & Description
    document.title = pageTitle;
    
    const setMeta = (selector, attr, value) => {
        const el = document.querySelector(selector);
        if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', 'content', pageDescription);

    // 2. Update Canonical URL
    setMeta('link[rel="canonical"]', 'href', currentUrl);

    // 3. Update Open Graph (Facebook/LinkedIn)
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', pageDescription);
    setMeta('meta[property="og:image"]', 'content', pageImage);
    setMeta('meta[property="og:url"]', 'content', currentUrl);

    // 4. Update Twitter Card
    setMeta('meta[property="twitter:title"]', 'content', pageTitle);
    setMeta('meta[property="twitter:description"]', 'content', pageDescription);
    setMeta('meta[property="twitter:image"]', 'content', pageImage);
    setMeta('meta[property="twitter:url"]', 'content', currentUrl);

    // --- Populate Page Data ---
    const mainImage = document.getElementById('project-main-image');
    const thumbnailsContainer = document.getElementById('project-thumbnails');
    const categoryEl = document.getElementById('project-category');
    const titleEl = document.getElementById('project-title');
    const descriptionEl = document.getElementById('project-description');
    
    // Info Box elements
    const clientEl = document.getElementById('project-client');
    const timelineEl = document.getElementById('project-timeline');
    const servicesEl = document.getElementById('project-services');
    const liveSiteLink = document.getElementById('live-site-link');
    const techStackCard = document.getElementById('tech-stack-card');
    const techStackList = document.getElementById('tech-stack-list');
    
    const challengeEl = document.getElementById('project-challenge');
    const solutionEl = document.getElementById('project-solution');
    const resultsContainer = document.getElementById('project-results-container');
    const resultsEl = document.getElementById('project-results');
    const relatedGrid = document.getElementById('related-projects-grid');
    const relatedSection = document.getElementById('related-projects-section');
    
    // Basic Info
    if (categoryEl) categoryEl.textContent = project.category;
    if (titleEl) titleEl.textContent = project.title;
    if (descriptionEl) descriptionEl.textContent = project.description;
    if (challengeEl) challengeEl.textContent = project.fullData.challenge;
    if (solutionEl) solutionEl.textContent = project.fullData.solution;
    
    // Info Box
    if (clientEl) clientEl.textContent = project.fullData.client;
    if (timelineEl) timelineEl.textContent = project.fullData.timeline;
    if (servicesEl) servicesEl.textContent = project.fullData.services;
    
    // Live Site Link
    if (liveSiteLink) {
        const liveSiteUrl = normalizeLiveUrl(project.fullData.liveUrl);
        const liveSiteLabel = liveSiteLink.querySelector('span');
        const activeLinkClasses = ['bg-primary-600', 'hover:bg-primary-700', 'text-white', 'shadow-lg', 'shadow-primary-500/20', 'hover:-translate-y-0.5'];
        const disabledLinkClasses = ['pointer-events-none', 'cursor-not-allowed', 'opacity-50', 'bg-slate-300', 'text-slate-600', 'shadow-none', 'dark:bg-slate-700', 'dark:text-slate-300'];

        liveSiteLink.classList.remove('hidden');

        if (liveSiteUrl) {
            liveSiteLink.href = liveSiteUrl;
            liveSiteLink.target = '_blank';
            liveSiteLink.rel = 'noopener noreferrer';
            liveSiteLink.removeAttribute('aria-disabled');
            liveSiteLink.removeAttribute('tabindex');
            liveSiteLink.removeAttribute('title');
            liveSiteLink.classList.remove(...disabledLinkClasses);
            liveSiteLink.classList.add(...activeLinkClasses);

            if (liveSiteLabel) {
                liveSiteLabel.textContent = 'Live Demo';
            }
        } else {
            liveSiteLink.removeAttribute('href');
            liveSiteLink.removeAttribute('target');
            liveSiteLink.removeAttribute('rel');
            liveSiteLink.setAttribute('aria-disabled', 'true');
            liveSiteLink.setAttribute('tabindex', '-1');
            liveSiteLink.setAttribute('title', 'Live demo is not available for this project yet.');
            liveSiteLink.classList.remove(...activeLinkClasses);
            liveSiteLink.classList.add(...disabledLinkClasses);

            if (liveSiteLabel) {
                liveSiteLabel.textContent = 'Live Demo Unavailable';
            }
        }
    }
    
    // Key Results
    if (resultsEl && project.fullData.results && project.fullData.results.length > 0) {
        resultsEl.innerHTML = project.fullData.results.map(r =>
            `<li class="flex items-start gap-3 text-charcoal/80 dark:text-gray-300"><i class="fas fa-check-circle text-cyan mt-1 shrink-0"></i><span>${r}</span></li>`
        ).join('');
    } else if (resultsContainer) {
        resultsContainer.classList.add('hidden');
    }
    
    // Tech Stack
    if (techStackCard && techStackList && project.fullData.technologies && project.fullData.technologies.length > 0) {
        techStackList.innerHTML = project.fullData.technologies.map(tech =>
            `<span class="px-3 py-1.5 bg-gray-100 dark:bg-dark-800 text-gray-700 dark:text-gray-300 text-sm rounded-lg">${escapeHtml(tech)}</span>`
        ).join('');
        techStackCard.classList.remove('hidden');
    } else if (techStackCard) {
        techStackCard.classList.add('hidden');
    }
    
    // Image Gallery
    const images = [project.image, ...(project.fullData.gallery || [])];
    if (mainImage) mainImage.src = images[0]; // Set initial image
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = images.map((imgSrc, index) =>
            `<img src="${imgSrc}" alt="${project.title} thumbnail ${index + 1}" class="w-28 h-16 object-cover rounded-lg shadow-md cursor-pointer border-2 ${index === 0 ? 'border-cyan scale-105 opacity-100' : 'border-transparent opacity-60'} hover:opacity-100 hover:scale-105 transition-all" data-src="${imgSrc}">`
        ).join('');
        
        thumbnailsContainer.addEventListener('click', e => {
            if (e.target.tagName === 'IMG') {
                // Add a fade effect for the main image
                if (mainImage) {
                    mainImage.style.opacity = 0;
                    setTimeout(() => {
                        mainImage.src = e.target.dataset.src;
                        mainImage.style.opacity = 1;
                    }, 200);
                }
                thumbnailsContainer.querySelectorAll('img').forEach(img => {
                    img.classList.remove('border-cyan', 'scale-105', 'opacity-100');
                    img.classList.add('border-transparent', 'opacity-60');
                });
                e.target.classList.remove('border-transparent', 'opacity-60');
                e.target.classList.add('border-cyan', 'scale-105', 'opacity-100');
            }
        });
    }
    
    // Related Projects
    if (relatedGrid && relatedSection) {
        const related = portfolioData
            .filter(p => p.id !== project.id && p.category === project.category)
            .slice(0, 3);
        
        if (related.length > 0) {
            relatedGrid.innerHTML = related.map(rp => `
                <a href="${getProjectDetailUrl(rp.id)}" class="group block bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 dark:border-slate-700 hover:-translate-y-1">
                    <div class="aspect-video bg-slate-100 dark:bg-slate-700">
                        <img src="${rp.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" alt="${rp.title}">
                    </div>
                    <div class="p-4">
                        <h3 class="font-heading font-bold text-tech-blue dark:text-white line-clamp-2 mb-1">${rp.title}</h3>
                        <p class="text-xs text-cyan uppercase font-semibold">${rp.category}</p>
                    </div>
                </a>
            `).join('');
        } else {
            relatedSection.classList.add('hidden');
        }
    }
    
    // Show content and hide loader
    if (loader && content) {
        loader.style.display = 'none';
        content.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadComponents().then(main);
});
