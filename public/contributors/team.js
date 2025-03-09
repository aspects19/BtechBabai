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
                <div class="relative max-w-sm mx-auto md:max-w-md mt-6 min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-xl mt-16">
                    <div class="px-6">
                        <div class="flex flex-wrap justify-center">
                            <div class="w-full flex justify-center">
                                <div class="relative">
                                    <img src="https://github.com/${dev.github}.png" class="shadow-xl rounded-full align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-[150px]"/>
                                </div>
                            </div>
                            <div class="w-full text-center mt-20">
                                <div class="flex justify-center lg:pt-4 pt-8 pb-0">
                                    <div class="p-3 text-center">
                                        <a href="${dev.twitter}" target="_blank"><i class="fab fa-twitter text-blue-400 text-2xl"></i></a>
                                    </div>
                                    <div class="p-3 text-center">
                                        <a href="${dev.linkedin}" target="_blank"><i class="fab fa-linkedin text-blue-600 text-2xl"></i></a>
                                    </div>
                                    <div class="p-3 text-center">
                                        <a href="${dev.instagram}" target="_blank"><i class="fab fa-instagram text-pink-500 text-2xl"></i></a>
                                    </div>
                                    <div class="p-3 text-center">
                                        <a href="https://github.com/${dev.github}" target="_blank"><i class="fab fa-github text-gray-700 text-2xl"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="text-center mt-2">
                            <h3 class="text-2xl text-slate-700 font-bold leading-normal mb-1">${dev.name}</h3>
                            <div class="text-xs mt-0 mb-2 text-slate-400 font-bold uppercase">
                                <i class="fas fa-map-marker-alt mr-2 text-slate-400 opacity-75"></i>${dev.city}
                            </div>
                        </div>
                        <div class="mt-6 py-6 border-t border-slate-200 text-center">
                            <div class="flex flex-wrap justify-center">
                                <div class="w-full px-4">
                                    <p class="font-light leading-relaxed text-slate-600 mb-4">${dev.bio}</p>
                                </div>
                            </div>
                        </div>
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
                <div class="max-w-xs bg-white rounded-lg shadow-md p-2">
                    <img class="w-16 h-16 rounded-full mx-auto" src="https://github.com/${user.github}.png" alt="Profile picture">
                    <h2 class="text-center text-base font-semibold mt-2">${user.name}</h2>
                    <p class="text-center text-gray-600 mt-1 text-xs">${user.city}</p>
                    <p class="text-center text-gray-500 mt-1 text-xs">${user.bio}</p>
                    <div class="flex justify-center mt-2 gap-1.5">
                        <a href="${user.twitter}" target="_blank"><i class="fab fa-twitter text-blue-400 text-sm"></i></a>
                        <a href="${user.linkedin}" target="_blank"><i class="fab fa-linkedin text-blue-600 text-sm"></i></a>
                        <a href="${user.instagram}" target="_blank"><i class="fab fa-instagram text-pink-500 text-sm"></i></a>
                        <a href="https://github.com/${user.github}" target="_blank"><i class="fab fa-github text-gray-700 text-sm"></i></a>
                    </div>
                </div>
                `;
            });
        })
        .catch(error => console.error("Error fetching contributors:", error));
});