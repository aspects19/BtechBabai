// Fetch GitHub Repository Stats
async function fetchGitHubStats() {
  try {
    const response = await fetch('https://api.github.com/repos/ShafiMohammad09/BtechBabai');
    const data = await response.json();
    
    // Update stars count with animation
    animateCount('stars-count', data.stargazers_count);
    
    // Update forks count with animation
    animateCount('forks-count', data.forks_count);
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
  }
}

// Animate count from 0 to target
function animateCount(elementId, target) {
  const element = document.getElementById(elementId);
  const duration = 2000; // 2 seconds
  const increment = target / (duration / 16); // 60fps
  let current = 0;

  const updateCounter = () => {
    if (current < target) {
      current += increment;
      element.textContent = Math.ceil(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };
  
  updateCounter();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Fetch initial stats
  fetchGitHubStats();
  
  // Refresh stats every 5 minutes
  setInterval(fetchGitHubStats, 300000);
}); 