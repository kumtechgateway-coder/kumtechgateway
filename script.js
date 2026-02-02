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
    window.addEventListener('scroll', function() {
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
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
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
        setInterval(nextSlide, 5000);
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
        paginationContainer.className = 'pagination-controls';
        portfolioContainer.appendChild(paginationContainer);

        const renderPagination = (totalItems) => {
            paginationContainer.innerHTML = '';
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            
            if (totalPages <= 1) return;

            const createBtn = (text, page, isDisabled = false, isActive = false) => {
                const btn = document.createElement('button');
                btn.innerText = text;
                btn.className = `px-4 py-2 border border-warm-brown/30 bg-transparent text-dark-brown rounded cursor-pointer transition-all font-medium hover:bg-warm-brown hover:text-white hover:border-warm-brown disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-warm-brown text-white border-warm-brown' : ''}`;
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
                        item.classList.remove('hide');
                        item.style.animation = 'none';
                        item.offsetHeight; /* trigger reflow */
                        item.style.animation = '';
                    } else {
                        item.classList.add('hide');
                    }
                    currentMatchIndex++;
                } else {
                    item.classList.add('hide');
                }
            });
            
            renderPagination(totalMatches);
        };
        
        // Filter button click events
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active classes (bg-warm-brown text-white border-warm-brown) and add default hover classes
                filterBtns.forEach(b => b.classList.remove('bg-warm-brown', 'text-white', 'border-warm-brown'));
                // Add active classes
                btn.classList.add('bg-warm-brown', 'text-white', 'border-warm-brown');
                currentPage = 1; // Reset to first page on filter change
                filterItems();
            });
        });
        
        // Search input event
        if (searchInput) {
            searchInput.addEventListener('keyup', () => {
                currentPage = 1; // Reset to first page on search
                filterItems();
            });
        }
        
        // Initial load
        filterItems();
    }
    
    // Back to Top Button
    const backToTopBtn = document.getElementById('backToTop');
    
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('opacity-0', 'invisible', 'translate-y-5');
                backToTopBtn.classList.add('opacity-100', 'visible', 'translate-y-0');
            } else {
                backToTopBtn.classList.add('opacity-0', 'invisible', 'translate-y-5');
                backToTopBtn.classList.remove('opacity-100', 'visible', 'translate-y-0');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Console greeting (optional, can be removed in production)
    console.log('Kumtech Gateway Portfolio Website loaded successfully.');
    console.log('Brand Colors: #FFFFFF, #E7C9A5, #A65633, #45220B, #271109');
});