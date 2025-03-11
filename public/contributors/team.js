// /*
//  * This file is part of BtechBabai.
//  * Copyright (C) 2025 Shafi Mohammad
//  * Licensed under the GNU General Public License v3.0
//  */

document.addEventListener("DOMContentLoaded", async () => {
    // Initialize AOS animation library
    AOS.init({
        duration: 1000,
        once: true
    });

    // Mobile menu handling
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.createElement('div');
    mobileMenu.id = 'mobile-menu';
    mobileMenu.className = 'fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center space-y-6 text-2xl text-gray-300 transform translate-x-full transition-transform duration-300 ease-in-out md:hidden';
    document.body.appendChild(mobileMenu);

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.style.transform = 'translateX(0)';
        });
    }

    // Close button for mobile menu
    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-6 right-6 text-gray-300';
    closeButton.innerHTML = `
        <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    `;
    closeButton.addEventListener('click', () => {
        mobileMenu.style.transform = 'translateX(100%)';
    });
    mobileMenu.appendChild(closeButton);

    // Typing effect for the team page header
    new Typewriter('#team-header', {
        strings: ['Meet Our Amazing Team', 'The Minds Behind BtechBabai', 'Our Contributors'],
        autoStart: true,
        loop: true,
        delay: 50
    });

    // Team member fetching and display code
    const coreContainer = document.getElementById("core-container");
    const contributorsContainer = document.getElementById("contributors-container");

    // Update the core container's class to use flexbox and center alignment
    if (coreContainer) {
        coreContainer.className = 'flex flex-wrap justify-center gap-8 mb-16';
    }

    // Update the card wrapper div to control individual card width
    function createTeamMemberCard(member, isCore = false) {
        const cardClass = isCore ? 'core-member' : 'contributor';
        const glowColor = isCore ? 'blue' : 'purple';
        
        return `
        <div class="group ${isCore ? 'w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] max-w-md' : 'w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)]'}" data-aos="fade-up">
            <div class="relative p-6 border ${isCore ? 'border-blue-500/30' : 'border-gray-700'} rounded-xl 
                        ${isCore ? 'bg-gradient-to-b from-gray-900/90 to-blue-900/10' : 'bg-gray-900/50'} 
                        backdrop-blur-sm 
                        ${isCore ? 'hover:border-blue-400' : 'hover:border-purple-500/50'} 
                        transition-all duration-500 
                        hover:shadow-lg ${isCore ? 'hover:shadow-blue-500/30' : 'hover:shadow-purple-500/20'} 
                        transform hover:-translate-y-2
                        ${cardClass}">
                
                ${isCore ? `
                <div class="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-xl">
                    Core Team
                </div>
                ` : ''}
                
                <div class="relative z-10">
                    <div class="w-32 h-32 rounded-full overflow-hidden mx-auto mb-6 
                               ${isCore ? 'ring-4 ring-blue-500/30 group-hover:ring-blue-400' : 'ring-2 ring-purple-500/30 group-hover:ring-purple-500'} 
                               transition-all duration-500">
                        <img src="https://github.com/${member.github}.png" 
                             alt="${member.name}" 
                             class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random'">
                    </div>
                    
                    <h3 class="text-2xl font-bold text-center mb-2 
                              ${isCore ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-purple-400 to-pink-400'} 
                              bg-clip-text text-transparent">${member.name}</h3>
                    
                    <p class="text-gray-300 text-center mb-2 font-medium 
                             ${isCore ? 'text-blue-200' : 'text-purple-200'}">
                        ${isCore ? member.role : 'Contributor'}
                    </p>
                    
                    <p class="text-gray-400 text-center mb-2">
                        <i class="fas fa-map-marker-alt mr-2 ${isCore ? 'text-blue-400' : 'text-purple-400'}"></i>
                        ${member.city}
                    </p>
                    
                    <div class="h-24 overflow-y-auto scrollbar-thin 
                               ${isCore ? 'scrollbar-thumb-blue-500' : 'scrollbar-thumb-purple-500'} 
                               scrollbar-track-gray-700 mb-4">
                        <p class="text-gray-300 text-center">
                            ${member.bio}
                        </p>
                    </div>

                    <div class="flex justify-center space-x-4">
                        ${member.github ? `
                            <a href="https://github.com/${member.github}" target="_blank" 
                               class="social-icon github ${isCore ? 'hover:bg-blue-600' : 'hover:bg-gray-800'}">
                                <i class="fab fa-github text-xl"></i>
                            </a>` : ''}
                        ${member.linkedin ? `
                            <a href="${member.linkedin}" target="_blank" 
                               class="social-icon linkedin ${isCore ? 'hover:bg-blue-600' : 'hover:bg-purple-600'}">
                                <i class="fab fa-linkedin text-xl"></i>
                            </a>` : ''}
                        ${member.twitter ? `
                            <a href="${member.twitter}" target="_blank" 
                               class="social-icon twitter ${isCore ? 'hover:bg-blue-400' : 'hover:bg-purple-400'}">
                                <i class="fab fa-twitter text-xl"></i>
                            </a>` : ''}
                        ${member.instagram ? `
                            <a href="${member.instagram}" target="_blank" 
                               class="social-icon instagram">
                                <i class="fab fa-instagram text-xl"></i>
                            </a>` : ''}
                    </div>

                    ${isCore ? `
                    <div class="mt-4 pt-4 border-t border-blue-500/30">
                        <p class="text-center text-sm text-blue-300 font-medium">
                            Core Team Member since ${member.joinedYear || '2024'}
                        </p>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>`;
    }

    // Fetch Core Team Members
    fetch("core.json")
        .then(response => response.json())
        .then(coreMembers => {
            if (coreContainer) {
                coreContainer.innerHTML = coreMembers
                    .map(member => createTeamMemberCard(member, true))
                    .join('');
            }
        })
        .catch(error => {
            console.error("Error fetching core team:", error);
            if (coreContainer) {
                coreContainer.innerHTML = `
                    <div class="col-span-full text-center text-gray-400">
                        Error loading core team members. Please try again later.
                    </div>`;
            }
        });

    // Fetch Contributors
    fetch("contributors.json")
        .then(response => response.json())
        .then(contributors => {
            if (contributorsContainer) {
                contributorsContainer.className = 'flex flex-wrap justify-center gap-4';
                contributorsContainer.innerHTML = contributors
                    .map(member => createTeamMemberCard(member, false))
                    .join('');
            }
        })
        .catch(error => {
            console.error("Error fetching contributors:", error);
            if (contributorsContainer) {
                contributorsContainer.innerHTML = `
                    <div class="col-span-full text-center text-gray-400">
                        Error loading contributors. Please try again later.
                    </div>`;
            }
        });

    // Add stats container after core team section
    if (coreContainer) {
        const statsContainer = createStatsContainer();
        coreContainer.parentNode.insertBefore(statsContainer, coreContainer.nextSibling);
        
        // Fetch and update stats
        const stats = await fetchRepoStats();
        if (stats) {
            document.getElementById('stars-count').textContent = stats.stars;
            document.getElementById('forks-count').textContent = stats.forks;
            document.getElementById('issues-count').textContent = stats.openIssues;
            document.getElementById('last-commit').textContent = stats.lastCommit;
            document.getElementById('watchers-count').textContent = stats.watchers;
            document.getElementById('total-issues').textContent = stats.totalIssues;
            
            // Add number animation
            ['stars-count', 'forks-count', 'issues-count', 'watchers-count', 'total-issues'].forEach(id => {
                const element = document.getElementById(id);
                const endValue = parseInt(element.textContent);
                if (!isNaN(endValue)) {
                    animateNumber(element, 0, endValue);
                }
            });
        }
    }
});

// Add required CSS
const style = document.createElement('style');
style.textContent = `
    .social-icon {
        @apply p-2 rounded-full transition-all duration-300 text-gray-400;
    }
    .social-icon:hover {
        @apply transform scale-110 text-white;
    }
    .core-member .social-icon:hover {
        @apply shadow-lg shadow-blue-500/30;
    }
    .contributor .social-icon:hover {
        @apply shadow-lg shadow-purple-500/30;
    }
    .instagram:hover {
        @apply bg-gradient-to-r from-purple-500 via-pink-500 to-red-500;
    }
    .stat-card {
        @apply relative p-4 border border-gray-700 rounded-lg bg-gray-900/50 backdrop-blur-sm
               hover:border-blue-500/50 transition-all duration-500
               transform hover:-translate-y-1 text-center;
    }
    
    .stat-icon {
        @apply w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center
               transition-all duration-500;
    }
    
    .stat-icon i {
        @apply text-xl;
    }
    
    .stat-value {
        @apply text-2xl font-bold text-gray-200 mb-1;
    }
    
    .stat-label {
        @apply text-sm text-gray-400;
    }
`;
document.head.appendChild(style);

window.onload = function () {
    animateCounter("resources-count", 100, 500, 2000); 
    animateCounter("students-count", 500, 2000, 2500); 
    animateCounter("team-count", 10, 100, 1800); 
};

// Add this function to fetch repository stats
async function fetchRepoStats() {
    const owner = 'shafimohammad09'; // Replace with your GitHub username/org
    const repo = 'btechbabai'; // Replace with your repository name
    
    try {
        // Fetch repository data
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        const repoData = await repoResponse.json();
        
        // Fetch commit data
        const commitsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`);
        const lastCommit = await commitsResponse.json();
        
        // Fetch open issues and PRs
        const issuesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open`);
        const issues = await issuesResponse.json();
        
        return {
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            openIssues: repoData.open_issues_count,
            lastCommit: new Date(lastCommit[0]?.commit?.author?.date).toLocaleDateString(),
            watchers: repoData.subscribers_count,
            totalIssues: issues.length
        };
    } catch (error) {
        console.error('Error fetching repo stats:', error);
        return null;
    }
}

// Add this function to create and update the stats container
function createStatsContainer() {
    const statsHtml = `
    <div class="my-16 px-4" data-aos="fade-up">
        <h2 class="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Project Statistics
        </h2>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div class="stat-card group" data-aos="fade-up" data-aos-delay="100">
                <div class="stat-icon bg-blue-500/10 group-hover:bg-blue-500/20">
                    <i class="fas fa-star text-blue-400"></i>
                </div>
                <div class="stat-value" id="stars-count">-</div>
                <div class="stat-label">Stars</div>
            </div>
            
            <div class="stat-card group" data-aos="fade-up" data-aos-delay="200">
                <div class="stat-icon bg-purple-500/10 group-hover:bg-purple-500/20">
                    <i class="fas fa-code-branch text-purple-400"></i>
                </div>
                <div class="stat-value" id="forks-count">-</div>
                <div class="stat-label">Forks</div>
            </div>
            
            <div class="stat-card group" data-aos="fade-up" data-aos-delay="300">
                <div class="stat-icon bg-green-500/10 group-hover:bg-green-500/20">
                    <i class="fas fa-exclamation-circle text-green-400"></i>
                </div>
                <div class="stat-value" id="issues-count">-</div>
                <div class="stat-label">Open Issues</div>
            </div>
            
            <div class="stat-card group" data-aos="fade-up" data-aos-delay="400">
                <div class="stat-icon bg-pink-500/10 group-hover:bg-pink-500/20">
                    <i class="fas fa-clock text-pink-400"></i>
                </div>
                <div class="stat-value text-sm" id="last-commit">-</div>
                <div class="stat-label">Last Update</div>
            </div>
            
            <div class="stat-card group" data-aos="fade-up" data-aos-delay="500">
                <div class="stat-icon bg-cyan-500/10 group-hover:bg-cyan-500/20">
                    <i class="fas fa-eye text-cyan-400"></i>
                </div>
                <div class="stat-value" id="watchers-count">-</div>
                <div class="stat-label">Watchers</div>
            </div>
            
            <div class="stat-card group" data-aos="fade-up" data-aos-delay="600">
                <div class="stat-icon bg-amber-500/10 group-hover:bg-amber-500/20">
                    <i class="fas fa-tasks text-amber-400"></i>
                </div>
                <div class="stat-value" id="total-issues">-</div>
                <div class="stat-label">Total Issues</div>
            </div>
        </div>
    </div>`;

    const statsContainer = document.createElement('div');
    statsContainer.innerHTML = statsHtml;
    return statsContainer;
}

// Add number animation function
function animateNumber(element, start, end) {
    const duration = 2000;
    const frames = 60;
    const increment = (end - start) / frames;
    let current = start;
    
    const animate = () => {
        current += increment;
        element.textContent = Math.floor(current);
        
        if (current < end) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = end;
        }
    };
    
    animate();
}
