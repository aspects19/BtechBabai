        const menuToggle = document.getElementById('menu-toggle');
        const closeMenu = document.getElementById('close-menu');
        const mobileMenu = document.getElementById('mobile-menu');

        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-full');
        });

        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
        });

        // Close on clicking outside menu or pressing Esc
        document.addEventListener('click', (event) => {
            if (!mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                mobileMenu.classList.add('translate-x-full');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === "Escape") {
                mobileMenu.classList.add('translate-x-full');
            }
        });