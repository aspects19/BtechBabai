// /*
//  * This file is part of BtechBabai.
//  * Copyright (C) 2025 Shafi Mohammad
//  * Licensed under the GNU General Public License v3.0
//  */

import firebaseConfig from './config.js';

// Initialize Firebase services
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Retrieve URL parameters
const urlParams = new URLSearchParams(window.location.search);
const college = urlParams.get('college');
const semester = urlParams.get('semester');
const branch = urlParams.get('branch');

// Add cache management
const cache = {
    data: new Map(),
    timestamp: new Map(),
    maxAge: 5 * 60 * 1000, // 5 minutes cache

    isValid(key) {
        if (!this.timestamp.has(key)) return false;
        return (Date.now() - this.timestamp.get(key)) < this.maxAge;
    },

    set(key, data) {
        this.data.set(key, data);
        this.timestamp.set(key, Date.now());
    },

    get(key) {
        return this.isValid(key) ? this.data.get(key) : null;
    }
};

// Modified fetchData function with caching
async function fetchData(college, semester, branch) {
    const path = `${college}/${branch}/${semester}`;
    const cacheKey = path;
    const resultsContainer = document.getElementById('resultsContainer');

    try {
        // Check cache first
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            displayResults(cachedData);
            return;
        }

        // Show loading spinner
        resultsContainer.innerHTML = '<div class="spinner"></div>';

        const dbRef = database.ref(path);
        const snapshot = await dbRef.once('value');
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Group by subject and keep only the latest entry
            const subjectMap = new Map();
            Object.entries(data).forEach(([key, value]) => {
                const subject = value.subject;
                const existingEntry = subjectMap.get(subject);
                
                if (!existingEntry || value.uploadedAt > existingEntry.uploadedAt) {
                    subjectMap.set(subject, { id: key, ...value });
                }
            });

            // Convert map to array
            const dataArray = Array.from(subjectMap.values());
            
            // Cache the results
            cache.set(cacheKey, dataArray);
            displayResults(dataArray);
        } else {
            displayNoResults();
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        displayError(error);
    }
}

// Modify cleanupOrphanedEntries to run less frequently
let lastCleanup = 0;
const CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 minutes

async function cleanupOrphanedEntries(college, branch, semester) {
    // Only run cleanup if enough time has passed
    if (Date.now() - lastCleanup < CLEANUP_INTERVAL) {
        return;
    }

    const dbRef = database.ref(`${college}/${branch}/${semester}`);
    const snapshot = await dbRef.once('value');
    
    if (!snapshot.exists()) return;

    lastCleanup = Date.now();
    // ... rest of cleanup logic ...
}

// Remove the periodic cleanup interval
// setInterval(() => {...}, 60000); // Remove this

// Modify verifyFileExists to cache results
const fileExistsCache = new Map();
const FILE_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function verifyFileExists(url) {
    if (!url) return false;
    if (url.includes('drive.google.com')) return true;

    // Check cache
    const cachedResult = fileExistsCache.get(url);
    if (cachedResult && (Date.now() - cachedResult.timestamp < FILE_CACHE_DURATION)) {
        return cachedResult.exists;
    }

    if (url.includes('firebasestorage')) {
        try {
            const fileRef = storage.refFromURL(url);
            await fileRef.getMetadata();
            fileExistsCache.set(url, { exists: true, timestamp: Date.now() });
            return true;
        } catch (error) {
            fileExistsCache.set(url, { exists: false, timestamp: Date.now() });
            return false;
        }
    }
    return true;
}

// Function to display results
function displayResults(dataArray) {
  const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    dataArray.forEach(item => {
        const isAdmin = auth.currentUser?.email?.endsWith('@btechbabai.com') || false;
        const uploadDate = item.uploadedAt ? new Date(item.uploadedAt).toLocaleDateString() : 'N/A';

    const resultHTML = `
            <div class="rounded-lg border border-gray-700 bg-gray-900 text-white p-6 shadow-sm mb-4">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-2xl font-bold text-blue-400">${item.subject}</h3>
                    ${isAdmin ? `
                        <button onclick="deleteSubjectMaterials('${college}', '${branch}', '${semester}', '${item.id}')"
                                class="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-400 hover:bg-red-400/10">
                            Delete
                        </button>
                    ` : ''}
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <p class="font-semibold text-gray-300">Study Materials:</p>
                        ${['chap1', 'chap2', 'chap3', 'chap4', 'chap5'].map(chap => 
                            item[chap] ? `
                                <p class="text-sm">
                                    <a href="${item[chap]}" 
                                       class="text-blue-400 hover:text-blue-300 transition-colors" 
                                       target="_blank">
                                        Chapter ${chap.slice(-1)} 📚
                                    </a>
                                </p>
                            ` : ''
                        ).join('')}
                    </div>

                    <div class="space-y-4">
                        ${item.pdfUrl ? `
                            <div>
                                <p class="font-semibold text-gray-300 mb-2">Previous Year Papers:</p>
                                <a href="${item.pdfUrl}" 
                                   class="text-blue-400 hover:text-blue-300 transition-colors" 
                                   target="_blank">
                                    Download 📄
                                </a>
                            </div>
                        ` : ''}

                        ${item.youtubePlaylist ? `
                            <div>
                                <p class="font-semibold text-gray-300 mb-2">Video Lectures:</p>
                                <a href="${item.youtubePlaylist}" 
                                   class="text-red-400 hover:text-red-300 transition-colors" 
                                   target="_blank">
                                    Watch 🎥
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${item.uploadedBy ? `
                    <div class="mt-4 text-right text-sm text-gray-400">
                        Uploaded by: ${item.uploadedBy}<br>
                        <span class="text-gray-500">${uploadDate}</span>
                    </div>
                ` : ''}
              </div>`;

    resultsContainer.innerHTML += resultHTML;
  });
}

// Function to display no results
function displayNoResults() {
  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = `
    <div class="text-center py-12">
      <h3 class="text-xl font-semibold text-gray-200">No results found</h3>
      <p class="mt-2 text-gray-400">No materials available for the selected options.</p>
      <a href="index.html" class="mt-4 inline-block text-blue-400 hover:text-blue-300">← Back to search</a>
    </div>`;
}

// Function to display errors
function displayError(error) {
  const resultsContainer = document.getElementById('resultsContainer');
  resultsContainer.innerHTML = `
    <div class="text-center py-12">
      <h3 class="text-xl font-semibold text-gray-200">Error loading results</h3>
      <p class="mt-2 text-gray-400">${error.message}</p>
      <button onclick="fetchData('${college}', '${semester}', '${branch}')" 
              class="mt-4 text-blue-400 hover:text-blue-300">
        Try again
      </button>
    </div>`;
}

// Initialize auth state observer
auth.onAuthStateChanged(user => {
    if (college && semester && branch) {
        fetchData(college, semester, branch);
    }
});

// Add this function to handle file deletions
async function deleteSubjectMaterials(college, branch, semester, subjectId) {
    try {
        const user = auth.currentUser;
        if (!user || !user.email.endsWith('@btechbabai.com')) {
            alert('Only administrators can delete materials');
            return;
        }

        if (!confirm('Are you sure you want to delete this subject and all its materials?')) {
            return;
        }

        // Get the subject data first
        const dbRef = database.ref(`${college}/${branch}/${semester}/${subjectId}`);
        const snapshot = await dbRef.once('value');
        const subjectData = snapshot.val();

        if (!subjectData) {
            alert('Subject not found');
            return;
        }

        // Delete files from Storage
        const deletePromises = [
            'pdfUrl', 'chap1', 'chap2', 'chap3', 'chap4', 'chap5'
        ].map(async (field) => {
            if (subjectData[field] && subjectData[field].includes('firebasestorage')) {
                try {
                    const fileRef = storage.refFromURL(subjectData[field]);
                    await fileRef.delete();
                } catch (error) {
                    console.warn(`File ${field} already deleted or not found`);
                }
            }
        });

        // Wait for all storage deletions to complete
        await Promise.all(deletePromises);

        // Delete from Realtime Database
        await dbRef.remove();

        alert('Subject and all materials deleted successfully');
        location.reload(); // Refresh the page to update the list

    } catch (error) {
        console.error('Delete error:', error);
        alert(`Error deleting materials: ${error.message}`);
    }
}

// Modified handleUpload function to handle duplicates
async function handleUpload(e) {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        alert('Please login first');
        return;
    }

    try {
        const college = document.getElementById('college').value;
        const branch = document.getElementById('branch').value;
        const semester = document.getElementById('semester').value;
        const subject = document.getElementById('subject').value;

        // Show loading indicator
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');

        // Check for existing subject entry
        const dbRef = database.ref(`${college}/${branch}/${semester}`);
        const snapshot = await dbRef.orderByChild('subject').equalTo(subject).once('value');
        
        let existingKey = null;
        if (snapshot.exists()) {
            // Get the first matching entry's key
            existingKey = Object.keys(snapshot.val())[0];

            // If not admin, prevent overwriting
            if (!user.email.endsWith('@btechbabai.com')) {
                alert('This subject already exists. Only administrators can update existing materials.');
                if (loadingSpinner) loadingSpinner.classList.add('hidden');
                return;
            }

            // Delete old files from storage if they exist
            const oldData = snapshot.val()[existingKey];
            await deleteOldFiles(oldData);
        }

        // Upload new files and get their URLs
        const newData = await uploadFiles(college, branch, semester, subject);

        // Update or create database entry
        if (existingKey) {
            // Update existing entry
            await dbRef.child(existingKey).update({
                ...newData,
                uploadedAt: Date.now(),
                uploadedBy: user.email
            });
        } else {
            // Create new entry
            await dbRef.push({
                ...newData,
                subject: subject,
                uploadedAt: Date.now(),
                uploadedBy: user.email
            });
        }

        // Hide loading indicator and show success message
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        alert('Materials uploaded successfully!');
        window.location.href = `results.html?college=${college}&branch=${branch}&semester=${semester}`;

    } catch (error) {
        console.error('Upload error:', error);
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        alert(`Error uploading materials: ${error.message}`);
    }
}

// Helper function to delete old files from storage
async function deleteOldFiles(oldData) {
    const fieldsToDelete = ['pdfUrl', 'chap1', 'chap2', 'chap3', 'chap4', 'chap5'];
    
    for (const field of fieldsToDelete) {
        if (oldData[field] && oldData[field].includes('firebasestorage')) {
            try {
                const fileRef = storage.refFromURL(oldData[field]);
                await fileRef.delete();
            } catch (error) {
                console.warn(`Failed to delete old file ${field}:`, error);
                // Continue with other deletions even if one fails
            }
        }
    }
}

// Helper function to upload new files
async function uploadFiles(college, branch, semester, subject) {
    const newData = {};
    const fileFields = [
        { id: 'prevYear', key: 'pdfUrl', path: 'prev-year' },
        { id: 'chap1', key: 'chap1', path: 'chap1' },
        { id: 'chap2', key: 'chap2', path: 'chap2' },
        { id: 'chap3', key: 'chap3', path: 'chap3' },
        { id: 'chap4', key: 'chap4', path: 'chap4' },
        { id: 'chap5', key: 'chap5', path: 'chap5' }
    ];

    for (const field of fileFields) {
        const fileInput = document.getElementById(field.id);
        if (fileInput && fileInput.files[0]) {
            const file = fileInput.files[0];
            const storageRef = storage.ref(`${college}/${branch}/${semester}/${subject}/${field.path}`);
            await storageRef.put(file);
            newData[field.key] = await storageRef.getDownloadURL();
        }
    }

    // Add YouTube playlist if provided
    const youtubeInput = document.getElementById('youtubePlaylist');
    if (youtubeInput && youtubeInput.value) {
        newData.youtubePlaylist = youtubeInput.value;
    }

    return newData;
}

// Auth State Management
const authUI = {
    init() {
        this.authButtonsDesktop = document.getElementById('auth-buttons-desktop');
        this.authButtonsMobile = document.getElementById('auth-buttons-mobile');
        this.userMenuDesktop = document.getElementById('user-menu-desktop');
        this.userMenuMobile = document.getElementById('user-menu-mobile');
        this.userAvatar = document.getElementById('user-avatar');
        this.userAvatarMobile = document.getElementById('user-avatar-mobile');
        this.userName = document.getElementById('user-name');
        this.userNameMobile = document.getElementById('user-name-mobile');

        // Initialize auth state observer
        auth.onAuthStateChanged(user => this.updateUI(user));

        // Add user menu toggle functionality
        this.userMenuButton = document.getElementById('user-menu-button');
        this.userDropdown = document.getElementById('user-dropdown');
        
        if (this.userMenuButton && this.userDropdown) {
            this.setupUserMenuListeners();
        }

        // Add mobile menu toggle functionality
        this.mobileUserMenuButton = document.getElementById('mobile-user-menu-button');
        this.mobileUserDropdown = document.getElementById('mobile-user-dropdown');
        
        if (this.mobileUserMenuButton && this.mobileUserDropdown) {
            this.setupMobileUserMenuListeners();
        }
    },

    setupUserMenuListeners() {
        // Toggle menu on button click
        this.userMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.userDropdown.classList.toggle('hidden');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.userMenuButton.contains(e.target)) {
                this.userDropdown.classList.add('hidden');
            }
        });

        // Prevent menu from closing when clicking inside dropdown
        this.userDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    },

    setupMobileUserMenuListeners() {
        this.mobileUserMenuButton.addEventListener('click', () => {
            this.mobileUserDropdown.classList.toggle('hidden');
        });
    },

    updateUI(user) {
        if (user) {
            // User is signed in
            this.authButtonsDesktop?.classList.add('hidden');
            this.authButtonsMobile?.classList.add('hidden');
            this.userMenuDesktop?.classList.remove('hidden');
            this.userMenuMobile?.classList.remove('hidden');

            // Update user info
            if (this.userName) this.userName.textContent = user.displayName || user.email;
            if (this.userNameMobile) this.userNameMobile.textContent = user.displayName || user.email;
            if (this.userAvatar) this.userAvatar.src = user.photoURL || '../assets/founder.jpeg';
            if (this.userAvatarMobile) this.userAvatarMobile.src = user.photoURL || '../assets/founder.jpeg';

            // Check if user is admin
            const isAdmin = user.email.endsWith('@btechbabai.com');
            document.body.classList.toggle('is-admin', isAdmin);

            // Add this to your existing user signed in code
            this.userMenuButton?.classList.remove('hidden');
            this.userDropdown?.classList.add('hidden'); // Ensure dropdown is hidden initially
        } else {
            // User is signed out
            this.authButtonsDesktop?.classList.remove('hidden');
            this.authButtonsMobile?.classList.remove('hidden');
            this.userMenuDesktop?.classList.add('hidden');
            this.userMenuMobile?.classList.add('hidden');
            document.body.classList.remove('is-admin');

            // Add this to your existing user signed out code
            this.userMenuButton?.classList.add('hidden');
            this.userDropdown?.classList.add('hidden');
        }
    }
};

function getReturnUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('returnUrl') || 'index.html';
}


// Authentication Functions
const authFunctions = {
    async signUp(email, password, displayName) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({
                displayName: displayName
            });
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    },

    async signIn(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const returnUrl = getReturnUrl();
            window.location.href = returnUrl;
            return userCredential.user;
        } catch (error) {
            throw error;
        }
    },

    async signOut() {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    },

    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
        } catch (error) {
            throw error;
        }
    },

    // Google Sign In
    async signInWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await auth.signInWithPopup(provider);
            const returnUrl = getReturnUrl();
            window.location.href = returnUrl;
            return result.user;
        } catch (error) {
            throw error;
        }
    }
};

// Form Handlers
const formHandlers = {
    async handleSignUp(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const displayName = document.getElementById('displayName').value;
        const selectedAvatar = document.querySelector('input[name="avatar"]:checked').value;

        try {
            // Create user account
            const user = await authFunctions.signUp(email, password, displayName);
            
            // Update user profile with selected avatar
            await user.updateProfile({
                photoURL: `/avatars/${selectedAvatar}`
            });

            // Store user data in database
            const userRef = database.ref(`users/${user.uid}`);
            await userRef.set({
                displayName: displayName,
                email: email,
                avatar: selectedAvatar,
                createdAt: new Date().toISOString()
            });

            // Redirect to home page
            window.location.href = 'index.html';
        } catch (error) {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
            } else {
                alert(error.message);
            }
        }
    },

    async handlePasswordReset(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;

        try {
            await authFunctions.resetPassword(email);
            alert('Password reset email sent!');
        } catch (error) {
            alert(error.message);
        }
    },

    // Add handleSignIn function
    async handleSignIn(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await authFunctions.signIn(email, password);
        } catch (error) {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
                // Hide the error message after 5 seconds
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 5000);
            } else {
                alert(error.message);
            }
        }
    }
};

// Navigation Menu
const navMenu = {
    init() {
        this.menuToggle = document.getElementById('menu-toggle');
        this.closeMenu = document.getElementById('close-menu');
        this.mobileMenu = document.getElementById('mobile-menu');

        if (this.menuToggle && this.closeMenu && this.mobileMenu) {
            this.setupEventListeners();
        }
    },

    setupEventListeners() {
        this.menuToggle.addEventListener('click', () => {
            this.mobileMenu.classList.remove('translate-x-full');
        });

        this.closeMenu.addEventListener('click', () => {
            this.mobileMenu.classList.add('translate-x-full');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.mobileMenu.contains(e.target) && !this.menuToggle.contains(e.target)) {
                this.mobileMenu.classList.add('translate-x-full');
            }
        });
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    authUI.init();
    navMenu.init();

    // Add global logout handler
    window.handleLogout = () => authFunctions.signOut();
    const avatarInputs = document.querySelectorAll('input[name="avatar"]');
    avatarInputs.forEach(input => {
        // Add click handler to the label
        const label = input.parentElement.querySelector('label');
        label.addEventListener('click', (e) => {
            e.preventDefault();
            input.checked = true;
            
            // Remove selected class from all labels
            document.querySelectorAll('input[name="avatar"]').forEach(radio => {
                radio.parentElement.querySelector('img').classList.remove('border-blue-500');
            });

            // Add selected class to the chosen avatar
            input.parentElement.querySelector('img').classList.add('border-blue-500');
        });
    });

    // Hardcoded avatar paths
    const avatarFilenames = [
        'avatar-1.gif',
        'avatar-2.gif',
        'avatar-3.gif',
        'avatar-4.jpg',
        'avatar-5.jpg',
        'avatar-6.gif',
        'avatar-7.gif',
        'avatar-8.gif',
        'avatar-9.gif'
    ];

    // Assuming the avatars are now in the public/avatars directory
    const avatarContainer = document.getElementById('avatar-container');
    avatarFilenames.forEach((filename, index) => {
        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('relative');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'avatar';
        input.value = filename;
        input.classList.add('sr-only');
        if (index === 0) input.checked = true; // Check the first avatar by default

        const label = document.createElement('label');
        label.classList.add('cursor-pointer', 'block');

        const img = document.createElement('img');
        img.src = `/avatars/${filename}`; // Ensure this path matches the location in the public directory
        img.alt = `Avatar ${index + 1}`;
        img.classList.add('w-20', 'h-20', 'rounded-full', 'border-2', 'border-transparent', 'hover:border-blue-500', 'transition-all', 'duration-300');

        label.appendChild(img);
        avatarDiv.appendChild(input);
        avatarDiv.appendChild(label);
        avatarContainer.appendChild(avatarDiv);

        // Add click handler to the label
        label.addEventListener('click', (e) => {
            e.preventDefault();
            input.checked = true;

            // Remove selected class from all labels
            document.querySelectorAll('input[name="avatar"]').forEach(radio => {
                radio.parentElement.querySelector('img').classList.remove('border-blue-500');
            });

            // Add selected class to the chosen avatar
            img.classList.add('border-blue-500');
        });
    });
});

// Export functions for use in HTML
window.authFunctions = authFunctions;
window.formHandlers = formHandlers;

