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

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Utility: Throttle function for scroll events
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

    // Utility: Debounce function for search input
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Get DOM elements
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    // Mobile menu toggle
    menuToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navMenu.contains(event.target);
        const isClickOnToggle = menuToggle.contains(event.target);
        
        if (navMenu.classList.contains('active') && !isClickInsideMenu && !isClickOnToggle) {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Scroll event listener
    window.addEventListener('scroll', throttle(function() {
        // Update active nav link based on scroll position
        if (document.getElementById('home')) {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (window.scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === `#${current}` || href === `index.html#${current}` || (current === 'home' && href === 'index.html')) {
                    link.classList.add('active');
                }
            });
        }
    }), { passive: true });
    
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
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-zoom');
    
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
    
    // Testimonial Slider
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slides.length > 0) {
        let currentSlide = 0;
        
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            currentSlide = index;
        }
        
        function nextSlide() {
            let index = currentSlide + 1;
            if (index >= slides.length) index = 0;
            showSlide(index);
        }
        
        function prevSlide() {
            let index = currentSlide - 1;
            if (index < 0) index = slides.length - 1;
            showSlide(index);
        }
        
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });
        
        // Auto slide every 5 seconds
        let slideInterval = setInterval(nextSlide, 5000);

        // Pause on hover
        const sliderContainer = document.querySelector('.testimonial-track') || slides[0].parentElement;
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        sliderContainer.addEventListener('mouseleave', () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
    }
    
    // Portfolio Filtering and Search
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-card');
    const searchInput = document.getElementById('portfolioSearch');
    const itemsPerPage = 20;
    let currentPage = 1;
    
    if (filterBtns.length > 0 && portfolioItems.length > 0) {
        // Create pagination container
        const portfolioContainer = document.querySelector('.portfolio-grid').closest('.container');
        let paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-controls flex justify-center gap-2 mt-12';
        portfolioContainer.appendChild(paginationContainer);

        const renderPagination = (totalItems) => {
            paginationContainer.innerHTML = '';
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            
            if (totalPages <= 1) return;

            const createBtn = (text, page, isDisabled = false, isActive = false) => {
                const btn = document.createElement('button');
                btn.innerText = text;
                btn.className = `px-4 py-2 border border-tech-blue/30 bg-transparent text-charcoal rounded cursor-pointer transition-all font-medium hover:bg-gradient-to-r hover:from-orange hover:to-soft-amber hover:text-white hover:border-orange disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-gradient-to-r from-orange to-soft-amber text-white border-orange' : ''}`;
                btn.disabled = isDisabled;
                
                if (!isDisabled) {
                    btn.addEventListener('click', () => {
                        currentPage = page;
                        filterItems();
                        // Scroll to top of grid
                        const grid = document.querySelector('.portfolio-grid');
                        const headerOffset = 150;
                        const elementPosition = grid.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    });
                }
                return btn;
            };

            // Prev Button
            paginationContainer.appendChild(createBtn('Prev', currentPage - 1, currentPage === 1));

            // Page Numbers
            for (let i = 1; i <= totalPages; i++) {
                paginationContainer.appendChild(createBtn(i, i, false, i === currentPage));
            }

            // Next Button
            paginationContainer.appendChild(createBtn('Next', currentPage + 1, currentPage === totalPages));
        };

        // Filter function
        const filterItems = () => {
            const activeBtn = document.querySelector('.filter-btn.active');
            const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter').toLowerCase().trim() : 'all';
            const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
            
            let totalMatches = 0;
            let currentMatchIndex = 0;
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            // First pass: Count total matches to determine pagination
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
                    if (currentMatchIndex >= startIndex && currentMatchIndex < endIndex) {
                        item.classList.remove('hidden');
                        item.style.animation = 'none';
                        item.offsetHeight; /* trigger reflow */
                        item.style.animation = '';
                    } else {
                        item.classList.add('hidden');
                    }
                    currentMatchIndex++;
                } else {
                    item.classList.add('hidden');
                }
            });
            
            renderPagination(totalMatches);
        };
        
        // Filter button click events
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active classes (bg-orange text-white border-orange) and add default hover classes
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active classes
                btn.classList.add('active');
                currentPage = 1; // Reset to first page on filter change
                filterItems();
            });
        });
        
        // Search input event
        if (searchInput) {
            searchInput.addEventListener('keyup', debounce(() => {
                currentPage = 1; // Reset to first page on search
                filterItems();
            }, 300));
        }
        
        // Initial load
        filterItems();
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

    // Case Study Data
    const caseStudies = {
        'novatech': {
            title: 'NovaTech Brand Identity',
            category: 'Branding & Identity',
            client: 'NovaTech Solutions',
            timeline: '6 Weeks',
            services: 'Logo Design, Brand Guidelines, Stationery',
            image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop',
            challenge: 'NovaTech, a promising AI startup, struggled with a disjointed visual identity that failed to communicate their cutting-edge technology and reliability to enterprise clients.',
            solution: 'We developed a comprehensive brand identity centered around the concept of "Human-Centric Innovation." The new logo combines organic curves with geometric precision, symbolizing the harmony between technology and humanity.',
            results: [
                '40% increase in brand recognition within 3 months',
                'Successfully secured Series B funding',
                'Positive feedback from 95% of stakeholders'
            ]
        },
        'luxestore': {
            title: 'LuxeStore E-commerce Platform',
            category: 'E-commerce Development',
            client: 'LuxeStore Inc.',
            timeline: '3 Months',
            services: 'Web Development, UI/UX, Payment Integration',
            image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=800&auto=format&fit=crop',
            challenge: 'LuxeStore needed a high-performance e-commerce platform that could handle high traffic volumes while providing a premium, seamless shopping experience for luxury goods.',
            solution: 'We built a custom headless e-commerce solution using modern frameworks. The platform features instant page loads, a streamlined checkout process, and a bespoke admin dashboard for inventory management.',
            results: [
                'Page load speed improved by 60%',
                'Conversion rate increased by 25%',
                'Mobile sales grew by 45%'
            ]
        },
        'fittrack': {
            title: 'FitTrack Mobile App',
            category: 'UI/UX Design',
            client: 'FitTrack Health',
            timeline: '2 Months',
            services: 'User Research, Wireframing, Prototyping',
            image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
            challenge: 'FitTrack wanted to redesign their mobile app to improve user retention. The existing interface was cluttered and users found it difficult to track their daily progress.',
            solution: 'We conducted extensive user research to understand pain points. The new design focuses on simplicity and gamification, with a clean dashboard and intuitive navigation that encourages daily usage.',
            results: [
                'User retention rate increased by 30%',
                'Daily active users doubled in 2 months',
                'App Store rating improved from 3.5 to 4.8'
            ]
        },
        'greenleaf': {
            title: 'GreenLeaf Ad Campaign',
            category: 'Digital Marketing',
            client: 'GreenLeaf Organics',
            timeline: '4 Months',
            services: 'Social Media Ads, PPC, Content Strategy',
            image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
            challenge: 'GreenLeaf, an eco-friendly brand, needed to increase brand awareness and sales in a competitive market with a limited advertising budget.',
            solution: 'We implemented a targeted multi-channel campaign focusing on eco-conscious consumers. We used compelling storytelling and data-driven audience targeting to maximize ROI.',
            results: [
                'ROI increased by 150%',
                'Cost per acquisition reduced by 40%',
                'Social media engagement grew by 200%'
            ]
        },
        'archistudio': {
            title: 'ArchiStudio Portfolio',
            category: 'Web Design',
            client: 'ArchiStudio Architects',
            timeline: '5 Weeks',
            services: 'Web Design, Frontend Development',
            image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop',
            challenge: 'ArchiStudio needed a portfolio website that reflected their minimalist architectural style. The previous site was outdated and did not showcase their high-quality imagery effectively.',
            solution: 'We designed a minimalist, image-first website with smooth transitions and a focus on typography. The layout allows the architectural photography to take center stage.',
            results: [
                'Bounce rate decreased by 35%',
                'Inquiries from new clients increased by 20%',
                'Featured in Awwwards nominees'
            ]
        },
        'urbanbrew': {
            title: 'Urban Brew Branding',
            category: 'Branding',
            client: 'Urban Brew Coffee',
            timeline: '4 Weeks',
            services: 'Logo Design, Packaging, Signage',
            image: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?q=80&w=800&auto=format&fit=crop',
            challenge: 'Urban Brew needed a distinct visual identity to stand out in a saturated coffee market. They wanted a look that was modern yet inviting.',
            solution: 'We created a bold, typographic logo and a warm color palette inspired by coffee roasts. The packaging design features unique patterns that tell the story of the coffee origin.',
            results: [
                'Store foot traffic increased by 15%',
                'Merchandise sales grew by 50%',
                'Strong social media brand recognition'
            ]
        }
    };

    // Modal Logic
    const modal = document.getElementById('caseStudyModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (modal) {
        document.addEventListener('click', function(e) {
            if (e.target.closest('.view-case-btn')) {
                e.preventDefault();
                const card = e.target.closest('.portfolio-card');
                const id = card.getAttribute('data-id');
                const data = caseStudies[id];
                
                if (data) {
                    document.getElementById('modalImage').src = data.image;
                    document.getElementById('modalCategory').textContent = data.category;
                    document.getElementById('modalTitle').textContent = data.title;
                    document.getElementById('modalClient').textContent = data.client;
                    document.getElementById('modalTimeline').textContent = data.timeline;
                    document.getElementById('modalServices').textContent = data.services;
                    document.getElementById('modalChallenge').textContent = data.challenge;
                    document.getElementById('modalSolution').textContent = data.solution;
                    
                    const resultsList = document.getElementById('modalResults');
                    resultsList.innerHTML = '';
                    data.results.forEach(result => {
                        const li = document.createElement('li');
                        li.className = 'flex items-start gap-2 text-charcoal/80';
                        li.innerHTML = `<i class="fas fa-check-circle text-cyan mt-1 shrink-0"></i><span>${result}</span>`;
                        resultsList.appendChild(li);
                    });
                    
                    modal.classList.remove('hidden');
                    setTimeout(() => {
                        modalOverlay.classList.remove('opacity-0');
                        modalContent.classList.remove('opacity-0', 'scale-95');
                        modalContent.classList.add('scale-100');
                    }, 10);
                    document.body.style.overflow = 'hidden';
                }
            }
        });

        const closeModal = () => {
            modalOverlay.classList.add('opacity-0');
            modalContent.classList.add('opacity-0', 'scale-95');
            modalContent.classList.remove('scale-100');
            setTimeout(() => {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }, 300);
        };

        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', closeModal);

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
});