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
    
    // Portfolio Filtering and Search
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-card:not(.no-filter)');
    const searchInput = document.getElementById('portfolioSearch');
    const itemsPerPage = 20;
    let currentPage = 1;
	let allItems = []; // Store all portfolio items after filtering
    
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
            
            // FLIP Animation: Record start positions
            const startPositions = new Map();
            portfolioItems.forEach(item => {
                if (!item.classList.contains('hidden')) {
                    startPositions.set(item, item.getBoundingClientRect());
                }
            });

            let totalMatches = 0;
            let currentMatchIndex = 0;
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

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
                    if (currentMatchIndex >= startIndex && currentMatchIndex < endIndex) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                    currentMatchIndex++;
                } else {
                    item.classList.add('hidden');
                }
            });
            
            renderPagination(totalMatches);

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

		// "Load More" button functionality
		const loadMoreBtn = document.getElementById('loadMoreBtn');
		if (loadMoreBtn) {
			loadMoreBtn.addEventListener('click', () => {
				currentPage++;
				filterItems(); // Re-apply the filter to show more items
				// Hide "Load More" button if all items are displayed
				const activeBtn = document.querySelector('.filter-btn.active');
				const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter').toLowerCase().trim() : 'all';
				const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
				let totalMatches = 0;

				filterItems();

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
    }
    
    // Testimonial Slider Logic
    const testimonialTrack = document.getElementById('testimonialTrack');
    const prevTestimonialBtn = document.getElementById('prevTestimonial');
    const nextTestimonialBtn = document.getElementById('nextTestimonial');

    if (testimonialTrack && prevTestimonialBtn && nextTestimonialBtn) {
        prevTestimonialBtn.addEventListener('click', () => {
            const cardWidth = testimonialTrack.firstElementChild.offsetWidth + 32; // width + gap (2rem = 32px)
            testimonialTrack.scrollBy({ left: -cardWidth, behavior: 'smooth' });
        });
        nextTestimonialBtn.addEventListener('click', () => {
            const cardWidth = testimonialTrack.firstElementChild.offsetWidth + 32;
            testimonialTrack.scrollBy({ left: cardWidth, behavior: 'smooth' });
        });
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
    let caseStudies = {};

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            caseStudies = data;
        })
        .catch(error => console.error('Error loading case studies:', error));

    // Modal Logic
    const modal = document.getElementById('caseStudyModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalContent = document.getElementById('modalContent');
    const body = document.body;

    function openModal(id) {
        const study = caseStudies[id];
        if (!study) return;

        document.getElementById('modalCategory').textContent = study.category;
        document.getElementById('modalTitle').textContent = study.title;
        document.getElementById('modalClient').textContent = study.client;
        document.getElementById('modalTimeline').textContent = study.timeline;
        document.getElementById('modalServices').textContent = study.services;
        document.getElementById('modalChallenge').textContent = study.challenge;
        document.getElementById('modalSolution').textContent = study.solution;
        
        const img = document.getElementById('modalImage');
        if (img) {
            const baseUrl = study.image.split('?')[0];
            img.src = `${baseUrl}?q=80&w=800&auto=format&fit=crop`;
            img.alt = study.title;
            img.srcset = `${baseUrl}?q=80&w=400&auto=format&fit=crop 400w, 
                          ${baseUrl}?q=80&w=800&auto=format&fit=crop 800w, 
                          ${baseUrl}?q=80&w=1200&auto=format&fit=crop 1200w`;
            img.sizes = "(max-width: 768px) 90vw, 450px";
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

        // Related Projects Logic
        const relatedContainer = document.getElementById('modalRelated');
        const relatedGrid = document.getElementById('relatedProjectsGrid');
        
        if (relatedContainer && relatedGrid) {
            relatedGrid.innerHTML = '';
            
            // Filter related projects: same category (or partial match), not current project
            const related = Object.entries(caseStudies)
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
            const btn = e.target.closest('.view-case-btn');
            const card = e.target.closest('.portfolio-card');
            
            if (btn && card) {
                e.preventDefault();
                const id = card.getAttribute('data-id');
                if (id) openModal(id);
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
});