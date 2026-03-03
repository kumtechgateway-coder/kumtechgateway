/**
 * Founder Page Single-Page Application Logic
 */
function initFounderPage() {
    const founderApp = document.getElementById('founder-app');
    if (!founderApp) {
        return; // Exit if not on the founder page
    }

    const loader = document.getElementById('founder-loader');
    const layout = document.getElementById('founder-layout');
    const profileContainer = document.getElementById('founder-profile');
    const navContainer = document.getElementById('founder-nav');
    const contentContainer = document.getElementById('founder-content-container');

    let founderData = null;

    const renderers = {
        'about': renderAbout,
        'experience': renderExperience,
        'projects': renderProjects,
        'skills': renderSkills,
        'contact': renderContact
    };

    async function fetchData() {
        try {
            const response = await fetch('founder.json');
            if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
            founderData = await response.json();
            renderPage();
        } catch (error) {
            console.error('Failed to fetch founder data:', error);
            if (loader) loader.innerHTML = `<p class="text-red-500 text-center">Failed to load founder profile. Please try again later.</p>`;
        }
    }

    function renderPage() {
        if (!founderData) return;

        renderProfile();
        renderNav();

        const initialSection = window.location.hash.substring(1) || founderData.sections[0].id;
        renderContent(initialSection);

        if (loader) loader.style.display = 'none';
        if (layout) layout.classList.remove('hidden');
        founderApp.classList.remove('opacity-0');
    }

    function renderProfile() {
        const { profile } = founderData;
        if (!profile || !profileContainer) return;

        profileContainer.innerHTML = `
            <div class="text-center">
                <img src="${profile.image}" alt="${profile.name}" class="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-cyan shadow-lg">
                <h1 class="text-2xl font-bold text-white">${profile.name}</h1>
                <p class="text-cyan font-medium">${profile.title}</p>
                <p class="text-sm text-gray-400 mt-4">${profile.bio}</p>
                <div class="flex justify-center gap-4 mt-6">
                    <a href="${profile.social.linkedin}" target="_blank" class="text-gray-400 hover:text-cyan transition-colors"><i class="fab fa-linkedin fa-lg"></i></a>
                    <a href="${profile.social.github}" target="_blank" class="text-gray-400 hover:text-cyan transition-colors"><i class="fab fa-github fa-lg"></i></a>
                    <a href="${profile.social.twitter}" target="_blank" class="text-gray-400 hover:text-cyan transition-colors"><i class="fab fa-twitter fa-lg"></i></a>
                </div>
            </div>
        `;
    }

    function renderNav() {
        const { sections } = founderData;
        if (!sections || !navContainer) return;

        const navList = document.createElement('ul');
        navList.className = 'space-y-2';

        sections.forEach(section => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.innerHTML = `
                <a href="#${section.id}" class="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-200">
                    <i class="${section.icon} w-5 text-center text-cyan/70"></i>
                    <span>${section.title}</span>
                </a>
            `;
            navList.appendChild(li);
        });

        navContainer.innerHTML = '';
        navContainer.appendChild(navList);

        navContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('href').substring(1);
                window.history.pushState(null, '', `#${sectionId}`);
                renderContent(sectionId);
            });
        });
    }

    function renderContent(sectionId) {
        if (!navContainer || !contentContainer) return;

        navContainer.querySelectorAll('a').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });

        const section = founderData.sections.find(s => s.id === sectionId);
        if (!section) {
            contentContainer.innerHTML = `<h2 class="text-2xl font-bold text-white">Section not found.</h2>`;
            return;
        }

        let contentHTML = (renderers[sectionId])
            ? renderers[sectionId](section)
            : `<p>Error: No renderer found for section '${sectionId}'.</p>`;

        contentContainer.classList.add('opacity-0', 'transform', '-translate-y-2');
        setTimeout(() => {
            contentContainer.innerHTML = contentHTML;
            contentContainer.classList.remove('opacity-0', '-translate-y-2');
        }, 150);
    }

    // --- Section Specific Renderers ---

    function createSectionHeader(title, icon) {
        return `<div class="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                    <i class="${icon} text-2xl text-cyan"></i>
                    <h2 class="text-2xl font-bold text-white">${title}</h2>
                </div>`;
    }

    function renderAbout(section) {
        const { content } = section;
        return `
            ${createSectionHeader(section.title, section.icon)}
            <div class="space-y-6 prose prose-lg prose-invert max-w-none text-gray-300">
                <p>${content.introduction}</p>
                <h3 class="text-xl font-semibold text-cyan !mt-8">My Philosophy</h3>
                <p>${content.philosophy}</p>
                <h3 class="text-xl font-semibold text-cyan !mt-8">Interests & Hobbies</h3>
                <ul class="!my-0">
                    ${content.hobbies.map(hobby => `<li>${hobby}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    function renderExperience(section) {
        const { content } = section;
        return `
            ${createSectionHeader(section.title, section.icon)}
            <div class="space-y-8">
                ${content.map(job => `
                    <div class="relative pl-8 before:absolute before:left-2 before:top-2 before:w-1 before:h-full before:bg-white/10">
                        <div class="absolute left-0 top-2 w-5 h-5 bg-cyan rounded-full border-4 border-slate-800"></div>
                        <p class="text-sm text-cyan font-semibold">${job.period}</p>
                        <h3 class="text-xl font-bold text-white mt-1">${job.role}</h3>
                        <p class="text-gray-400 font-medium">${job.company}</p>
                        <p class="mt-2 text-gray-300">${job.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderProjects(section) {
        const { content } = section;
        return `
            ${createSectionHeader(section.title, section.icon)}
            <div class="space-y-6">
                ${content.map(project => `
                    <div class="bg-slate-900/50 p-6 rounded-lg border border-white/10 hover:border-cyan/50 transition-colors">
                        <a href="${project.link}" class="group">
                            <h3 class="text-xl font-bold text-white group-hover:text-cyan transition-colors">${project.title}</h3>
                        </a>
                        <p class="mt-2 text-gray-300">${project.description}</p>
                        <div class="flex flex-wrap gap-2 mt-4">
                            ${project.tech.map(t => `<span class="text-xs font-medium bg-cyan/10 text-cyan px-2 py-1 rounded-full">${t}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderSkills(section) {
        const { content } = section;
        const skillCategories = Object.keys(content);
        return `
            ${createSectionHeader(section.title, section.icon)}
            <div class="space-y-6">
                ${skillCategories.map(category => `
                    <div>
                        <h3 class="text-lg font-semibold text-cyan capitalize mb-3">${category}</h3>
                        <div class="flex flex-wrap gap-3">
                            ${content[category].map(skill => `
                                <span class="bg-slate-700 text-gray-200 px-4 py-2 rounded-md font-medium">${skill}</span>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderContact(section) {
        const { content } = section;
        return `
            ${createSectionHeader(section.title, section.icon)}
            <div class="text-center bg-slate-900/50 p-8 rounded-lg">
                <p class="text-lg text-gray-300 max-w-xl mx-auto">${content.message}</p>
                <a href="mailto:${content.email}" class="text-2xl font-bold text-cyan hover:underline my-6 inline-block">${content.email}</a>
                <div>
                    <a href="mailto:${content.email}" class="inline-flex items-center justify-center px-8 py-3 bg-tech-blue text-white rounded-lg font-medium hover:bg-cyan transition-colors shadow-lg hover:shadow-cyan/30 transform hover:-translate-y-0.5">
                        ${content.cta} <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            </div>
        `;
    }

    // --- Event Listeners ---

    window.addEventListener('popstate', () => {
        if (!founderData) return;
        const sectionId = window.location.hash.substring(1) || founderData.sections[0].id;
        renderContent(sectionId);
    });

    fetchData();

    const founderYearEl = document.getElementById('founderCurrentYear');
    if (founderYearEl) founderYearEl.textContent = new Date().getFullYear();
}

/**
 * Initialize the founder page script when the DOM is ready.
 */
document.addEventListener('DOMContentLoaded', initFounderPage);