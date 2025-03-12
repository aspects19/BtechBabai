// /*
//  * This file is part of BtechBabai.
//  * Copyright (C) 2025 Shafi Mohammad
//  * Licensed under the GNU General Public License v3.0
//  */

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    // apiKey: "AIzaSyAIi0Qlg3-wbuaPXUQFPl2YtpeDqPRnT-Q",
    apiKey: "import.meta.env.VITE_FIREBASE_API_KEY",
    authDomain: "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN",
    databaseURL: "https://btechbabaiii-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "import.meta.env.VITE_FIREBASE_PROJECT_ID",
    storageBucket: "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID",
    appId: "import.meta.env.VITE_FIREBASE_APP_ID",
    measurementId: "import.meta.env.VITE_FIREBASE_MEASUREMENT_ID"
  };

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

// Add this function to check and clean up orphaned database entries
async function cleanupOrphanedEntries(college, branch, semester) {
    const dbRef = database.ref(`${college}/${branch}/${semester}`);
    const snapshot = await dbRef.once('value');
    
    if (!snapshot.exists()) return;

    const entries = snapshot.val();
    for (const [key, data] of Object.entries(entries)) {
        // Check if any of the required files exist
        const filesExist = await Promise.all([
            verifyFileExists(data.pdfUrl),
            verifyFileExists(data.chap1),
            verifyFileExists(data.chap2),
            verifyFileExists(data.chap3),
            verifyFileExists(data.chap4),
            verifyFileExists(data.chap5)
        ]);

        // If none of the files exist, remove the database entry
        if (!filesExist.some(exists => exists)) {
            console.log(`Removing orphaned entry for subject: ${data.subject}`);
            await dbRef.child(key).remove();
        }
    }
}

// Modified verifyFileExists function
async function verifyFileExists(url) {
    if (!url) return false;
    if (url.includes('drive.google.com')) return true; // Google Drive links are assumed valid

    if (url.includes('firebasestorage')) {
        try {
            const fileRef = storage.refFromURL(url);
            await fileRef.getMetadata();
            return true;
        } catch (error) {
            console.warn('File not found:', url);
            return false;
        }
    }
    return true; // Other URLs are assumed valid
}

// Modified fetchData function
async function fetchData(college, semester, branch) {
  const path = `${college}/${branch}/${semester}`;
  const dbRef = database.ref(path);

    try {
        // First, clean up any orphaned entries
        await cleanupOrphanedEntries(college, branch, semester);

        // Then fetch the cleaned data
        const snapshot = await dbRef.once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            const dataArray = [];

            // Convert to array and verify files exist
            for (const [key, value] of Object.entries(data)) {
                const filesExist = await Promise.all([
                    verifyFileExists(value.pdfUrl),
                    verifyFileExists(value.chap1)
                ]);

                if (filesExist.every(exists => exists)) {
                    dataArray.push({
                        id: key,
                        ...value
                    });
                }
            }

            if (dataArray.length > 0) {
                displayResults(dataArray);
            } else {
                displayNoResults();
            }
        } else {
            displayNoResults();
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        displayError(error);
    }
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

// Modified upload form handler to check for existing entries
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

        // Clean up any orphaned entries first
        await cleanupOrphanedEntries(college, branch, semester);

        // Check for existing valid entries
        const dbRef = database.ref(`${college}/${branch}/${semester}`);
        const snapshot = await dbRef.orderByChild('subject').equalTo(subject).once('value');
        
        if (snapshot.exists()) {
            const existingData = snapshot.val();
            const existingKey = Object.keys(existingData)[0];
            const existingFiles = await Promise.all([
                verifyFileExists(existingData[existingKey].pdfUrl),
                verifyFileExists(existingData[existingKey].chap1)
            ]);

            if (existingFiles.some(exists => exists) && !user.email.endsWith('@btechbabai.com')) {
                alert('This subject already exists and has valid files. Only administrators can update existing materials.');
                return;
            }

            // If files don't exist, remove the orphaned entry
            if (!existingFiles.some(exists => exists)) {
                await dbRef.child(existingKey).remove();
            }
        }

        // Continue with upload process...
        // Your existing upload code here
    } catch (error) {
        console.error('Upload error:', error);
        alert(`Error uploading materials: ${error.message}`);
    }
}

// Add periodic cleanup
setInterval(async () => {
    if (college && semester && branch) {
        await cleanupOrphanedEntries(college, branch, semester);
    }
}, 60000); // Run every minute

// Initial cleanup and fetch when page loads
if (college && semester && branch) {
    cleanupOrphanedEntries(college, branch, semester)
        .then(() => fetchData(college, semester, branch))
        .catch(error => console.error('Initial cleanup error:', error));
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

    // Dynamically load avatars
    const avatarContainer = document.getElementById('avatar-container');
    const avatarFilenames = ['avatar-1.gif', 'avatar-2.gif', 'avatar-3.gif', 'avatar-4.jpg', 'avatar-5.jpg','avatar-6.gif','avatar-7.gif','avatar-8.gif','avatar-9.gif']; // Add more as needed

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
        img.src = `/avatars/${filename}`;
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

