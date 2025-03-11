// /*
//  * This file is part of BtechBabai.
//  * Copyright (C) 2025 Shafi Mohammad
//  * Licensed under the GNU General Public License v3.0
//  */

// Loading Screen Handler
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all features
    initLoadingScreen();
    initMobileNav();
    fetchGitHubStats();
});

// Loading Screen Functions
function initLoadingScreen() {
    setTimeout(function() {
        document.getElementById('loading-screen').style.opacity = '0';
        document.getElementById('loading-screen').style.transition = 'opacity 0.5s ease-in-out';
        document.getElementById('main-content').style.opacity = '1';
        
        setTimeout(function() {
            document.getElementById('loading-screen').style.display = 'none';
        }, 500);
    }, 2000);
}

// Handle page refresh
window.onbeforeunload = function() {
    document.getElementById('loading-screen').style.display = 'flex';
    document.getElementById('loading-screen').style.opacity = '1';
    document.getElementById('main-content').style.opacity = '0';
};

// Mobile Navigation Functions
function initMobileNav() {
    const menuToggle = document.getElementById('menu-toggle');
    const closeMenu = document.getElementById('close-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && closeMenu && mobileMenu) {
        menuToggle.addEventListener('click', function() {
            mobileMenu.classList.remove('translate-x-full');
        });

        closeMenu.addEventListener('click', function() {
            mobileMenu.classList.add('translate-x-full');
        });
    }
}

// GitHub Stats Functions
async function fetchGitHubStats() {
    try {
        const response = await fetch('https://api.github.com/repos/ShafiMohammad09/BtechBabai');
        const data = await response.json();
        
        const starsCount = document.getElementById('stars-count');
        const forksCount = document.getElementById('forks-count');
        
        if (starsCount && forksCount) {
            starsCount.textContent = data.stargazers_count;
            forksCount.textContent = data.forks_count;
        }
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
    }
}

// Any team-specific functionality can be added here
// function initTeamFeatures() { ... } 