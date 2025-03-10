// /*
//  * This file is part of BtechBabai.
//  * Copyright (C) 2025 Shafi Mohammad
//  * Licensed under the GNU General Public License v3.0
//  */

document.addEventListener("DOMContentLoaded", () => {
    const coreContainer = document.getElementById("core-container");
    const contributorsContainer = document.getElementById("contributors-container");

    // Fetch Core Developers
    fetch("core.json")
        .then(response => response.json())
        .then(coreDevelopers => {
            coreDevelopers.forEach(dev => {
                coreContainer.innerHTML += `
                 <div class="team-card-container">
                    <div class="card-img">
                    <img src="https://github.com/${dev.github}.png" alt="">
                    </div>
                    <div class="card-text">
                    <div class="card-social-icons">
                        <a href="${dev.twitter}" target="_blank"><i class="fab fa-twitter text-blue-400 text-2xl"></i></a>
                        <a href="${dev.linkedin}" target="_blank"><i class="fab fa-linkedin text-blue-600 text-2xl"></i></a>
                        <a href="${dev.instagram}" target="_blank"><i class="fab fa-instagram text-pink-500 text-2xl"></i></a>
                        <a href="https://github.com/${dev.github}" target="_blank"><i class="fab fa-github text-gray-700 text-2xl"></i></a>
                    </div>
                    <h3>${dev.name}</h3>
                    <p>${dev.bio}</p>
                    </div>
                </div>
                `;
            });
        })
        .catch(error => console.error("Error fetching core developers:", error));

    // Fetch Contributors
    fetch("contributors.json")
        .then(response => response.json())
        .then(contributors => {
            contributors.forEach(user => {
                contributorsContainer.innerHTML += `
                <div class="team-card-container">
                    <div class="card-img">
                    <img src="https://github.com/${user.github}.png" alt="">
                    </div>
                    <div class="card-text">
                    <div class="card-social-icons">
                        <a href="${user.twitter}" target="_blank"><i class="fab fa-twitter text-blue-400 text-2xl"></i></a>
                        <a href="${user.linkedin}" target="_blank"><i class="fab fa-linkedin text-blue-600 text-2xl"></i></a>
                        <a href="${user.instagram}" target="_blank"><i class="fab fa-instagram text-pink-500 text-2xl"></i></a>
                        <a href="https://github.com/${user.github}" target="_blank"><i class="fab fa-github text-gray-700 text-2xl"></i></a>
                    </div>
                    <h3>${user.name}</h3>
                    <p>${user.bio}</p>
                    </div>
                </div>
                `;
            });
        })
        .catch(error => console.error("Error fetching contributors:", error));
});


function animateCounter(id, min, max, duration) {
    const element = document.getElementById(id);
    const targetValue = Math.floor(Math.random() * (max - min + 1)) + min;
    let startValue = 0;
    const increment = targetValue / (duration / 16); 

    function updateCounter() {
        startValue += increment;
        if (startValue < targetValue) {
            element.textContent = Math.floor(startValue);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue; 
        }
    }

    updateCounter();
}


window.onload = function () {
    animateCounter("resources-count", 100, 500, 2000); 
    animateCounter("students-count", 500, 2000, 2500); 
    animateCounter("team-count", 10, 100, 1800); 
};
