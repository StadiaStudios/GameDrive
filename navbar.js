/**
 * GameDrive Navigation Component
 * A professional, dark-themed navigation bar for the GameDrive application.
 * Features:
 * - Sleek #111 background with backdrop blur
 * - Responsive layout with Red accents
 * - Mobile Hamburger Menu
 * - Integrated Settings modal triggers
 */

(function() {
    // Theme: Dark #111 background, Red accents, responsive mobile menu
    const navbarHTML = `
    <nav class="fixed top-0 left-0 right-0 z-50 bg-[#111111]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div class="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
            
            <!-- Brand / Logo Section -->
            <a href="index.html" class="flex items-center gap-3 group text-white decoration-0 outline-none">
                    <img src="resources/icons/favicon.png" style="border-radius:100%;" class="w-8 h-8 object-contain" alt="Logo">
                <div class="flex flex-col">
                    <span class="text-lg font-bold tracking-tight leading-none group-hover:text-red-500 transition-colors">GameDrive</span>
                    <span class="text-[10px] uppercase tracking-widest text-gray-500 font-semibold leading-none mt-1">Cloud Storage</span>
                </div>
            </a>

            <!-- Desktop Center Navigation Links -->
            <div class="hidden md:flex items-center bg-[#1a1a1a] rounded-full px-2 py-1 border border-white/5">
                <a href="index.html#save-directory" class="px-5 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">My Drive</a>
                <a href="index.html#upload-form" class="px-5 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">Upload</a>
                <a href="guide.html" class="px-5 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">Guide</a>
            </div>

            <!-- Right Actions (Desktop Settings) -->
            <div class="hidden md:flex items-center">
                <button id="openSettingsBtn" class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200 group" title="Settings" aria-label="Open Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.5.342 1.107.452 1.636.326z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            <!-- Mobile Hamburger Button -->
            <button id="mobileMenuBtn" class="md:hidden p-2 text-gray-400 hover:text-white transition-colors">
                <svg id="hamburgerIcon" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg id="closeIcon" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <!-- Mobile Menu Dropdown -->
        <div id="mobileMenu" class="hidden md:hidden bg-[#111111] border-b border-white/10 px-6 py-4 space-y-4">
            <a href="index.html#save-directory" class="block text-gray-400 hover:text-red-500 font-medium transition-colors">My Drive</a>
            <a href="index.html#upload-form" class="block text-gray-400 hover:text-red-500 font-medium transition-colors">Upload</a>
            <a href="guide.html" class="block text-gray-400 hover:text-red-500 font-medium transition-colors">Guide</a>
            <hr class="border-white/5">
            <button id="openSettingsBtnMobile" class="flex items-center gap-2 text-gray-400 hover:text-red-500 font-medium transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.5.342 1.107.452 1.636.326z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
            </button>
        </div>
    </nav>
    <div class="h-16"></div> <!-- Spacer -->
    `;

    function initNavbar() {
        if (document.querySelector('nav.fixed')) return;

        const body = document.body;
        const navContainer = document.createElement('div');
        navContainer.innerHTML = navbarHTML;
        body.insertBefore(navContainer, body.firstChild);

        // Elements
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const hamburgerIcon = document.getElementById('hamburgerIcon');
        const closeIcon = document.getElementById('closeIcon');
        
        const openBtn = document.getElementById('openSettingsBtn');
        const openBtnMobile = document.getElementById('openSettingsBtnMobile');
        const modal = document.getElementById('settingsModal');
        const closeBtn = document.getElementById('closeSettingsBtn');

        // Toggle Mobile Menu
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.onclick = () => {
                const isHidden = mobileMenu.classList.contains('hidden');
                if (isHidden) {
                    mobileMenu.classList.remove('hidden');
                    hamburgerIcon.classList.add('hidden');
                    closeIcon.classList.remove('hidden');
                } else {
                    mobileMenu.classList.add('hidden');
                    hamburgerIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                }
            };

            // Close mobile menu when clicking a link
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.onclick = () => {
                    mobileMenu.classList.add('hidden');
                    hamburgerIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                };
            });
        }

        // Settings Modal Logic
        if (modal) {
            const openModal = () => {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                // Close mobile menu if open
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                    hamburgerIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                }
            };

            const closeModal = () => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            };

            if (openBtn) openBtn.onclick = openModal;
            if (openBtnMobile) openBtnMobile.onclick = openModal;
            if (closeBtn) closeBtn.onclick = closeModal;
            
            modal.onclick = (e) => { if (e.target === modal) closeModal(); };
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavbar);
    } else {
        initNavbar();
    }
})();