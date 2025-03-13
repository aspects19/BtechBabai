/*
 * This file is part of BtechBabai.
 * Copyright (C) 2025 Shafi Mohammad
 * Licensed under the GNU General Public License v3.0
 */



import firebaseConfig from './config.js';


// Initialize Firebase services
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

// Auth providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
const githubProvider = new firebase.auth.GithubAuthProvider();

// DOM elements
const loginSection = document.getElementById('loginSection');
const uploadSection = document.getElementById('uploadSection');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const googleLoginBtn = document.getElementById('googleLogin');
const githubLoginBtn = document.getElementById('githubLogin');
const uploadForm = document.getElementById('uploadForm');

// List of emails allowed to override existing data
const allowedEmails = ['shafimohammad5050@gmail.com', 'playboyfree.yt@gmail.com', 'btechbabai.co@gmail.com','admin@mail.com'];

// Google login
googleLoginBtn.addEventListener('click', async () => {
    try {
        await auth.signInWithPopup(googleProvider);
    } catch (error) {
        console.error('Google login error:', error);
        alert(error.message);
    }
});

// GitHub login
githubLoginBtn.addEventListener('click', async () => {
    try {
        await auth.signInWithPopup(githubProvider);
    } catch (error) {
        console.error('GitHub login error:', error);
        alert(error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', () => auth.signOut());

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        loginSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        userEmail.innerHTML = `
            <div class="flex items-center space-x-2">
                ${user.photoURL ? `<img src="${user.photoURL}" alt="Profile" class="w-8 h-8 rounded-full">` : ''}
                <span>${user.email}</span>
            </div>
        `;
    } else {
        loginSection.classList.remove('hidden');
        uploadSection.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        userEmail.innerHTML = '';
    }
});

// Handle file upload
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        alert('Please login first');
        return;
    }

    const submitButton = uploadForm.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disable the button immediately

    try {
        const college = document.getElementById('college').value;
        const branch = document.getElementById('branch').value;
        const semester = document.getElementById('semester').value;
        const subject = document.getElementById('subject').value;

        // Upload files to Storage and get URLs
        const uploadFile = async (file, path) => {
            if (!file) return null; // Skip if no file is provided
            const storageRef = storage.ref(`${college}/${branch}/${semester}/${subject}/${path}`);
            await storageRef.put(file);
            return await storageRef.getDownloadURL();
        };

        // Get all file URLs in parallel
        const filePromises = [
            uploadFile(document.getElementById('prevYearPaper').files[0], 'prev-year'),
            uploadFile(document.getElementById('chap1').files[0], 'chap1'),
            uploadFile(document.getElementById('chap2').files[0], 'chap2'),
            uploadFile(document.getElementById('chap3').files[0], 'chap3'),
            uploadFile(document.getElementById('chap4').files[0], 'chap4'),
            uploadFile(document.getElementById('chap5').files[0], 'chap5')
        ];

        const urls = await Promise.all(filePromises).then(results => ({
            pdfUrl: results[0],
            chap1: results[1],
            chap2: results[2],
            chap3: results[3],
            chap4: results[4],
            chap5: results[5],
            youtubePlaylist: document.getElementById('youtubeUrl').value
        }));

        // Save to Realtime Database
        const materialRef = database.ref(`${college}/${branch}/${semester}`);

        // Check if data already exists for this subject
        const snapshot = await materialRef.orderByChild('subject').equalTo(subject).once('value');
        
        if (snapshot.exists() && !allowedEmails.includes(user.email)) {
            alert('Material for this subject already exists. Only selected users can update existing materials.');
            return;
        }

        await materialRef.push({
            subject,
            ...urls,
            uploadedBy: user.email,
            uploadedAt: firebase.database.ServerValue.TIMESTAMP
        });

        alert('Materials uploaded successfully!');
        uploadForm.reset();

    } catch (error) {
        console.error('Upload error:', error);
        alert(`Error uploading materials: ${error.message}`);
    } finally {
        submitButton.disabled = false; // Re-enable the button after process
    }
});

async function populateExistingSubjects() {
    const college = document.getElementById('college').value;
    const branch = document.getElementById('branch').value;
    const semester = document.getElementById('semester').value;
    
    const dbRef = database.ref(`${college}/${branch}/${semester}`);
    const snapshot = await dbRef.once('value');
    const data = snapshot.val() || {};
    
    const subjectSelect = document.getElementById('subjectSelect');
    const existingSubjects = new Set();
    
    // Clear existing options except the first one
    while (subjectSelect.options.length > 1) {
        subjectSelect.remove(1);
    }
    
    // Add existing subjects to dropdown
    Object.values(data).forEach(item => {
        if (item.subject && !existingSubjects.has(item.subject)) {
            existingSubjects.add(item.subject);
            const option = new Option(item.subject, item.subject);
            subjectSelect.add(option);
        }
    });
    
    // Add "Add New Subject" option at the end
    const newOption = new Option("+ Add New Subject", "new");
    subjectSelect.add(newOption);
}

// Handle subject selection change
document.getElementById('subjectSelect').addEventListener('change', function() {
    const newSubjectInput = document.getElementById('newSubjectInput');
    const subjectInput = document.getElementById('subject');
    
    if (this.value === 'new') {
        newSubjectInput.classList.remove('hidden');
        subjectInput.required = true;
    } else {
        newSubjectInput.classList.add('hidden');
        subjectInput.required = false;
        subjectInput.value = this.value;
    }
});

// Populate subjects when college/branch/semester changes
['college', 'branch', 'semester'].forEach(id => {
    document.getElementById(id).addEventListener('change', populateExistingSubjects);
});

// Initial population
populateExistingSubjects();

let debounceTimeout;
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function checkExistingFiles() {
    const college = document.getElementById('college').value;
    const branch = document.getElementById('branch').value;
    const semester = document.getElementById('semester').value;
    const subject = document.getElementById('subject').value;

    const dbRef = database.ref(`${college}/${branch}/${semester}/${subject}`);
    const snapshot = await dbRef.once('value');
    const data = snapshot.val() || {};

    const fileInputs = [
        { id: 'prevYearPaper', path: 'prev-year' },
        { id: 'chap1', path: 'chap1' },
        { id: 'chap2', path: 'chap2' },
        { id: 'chap3', path: 'chap3' },
        { id: 'chap4', path: 'chap4' },
        { id: 'chap5', path: 'chap5' }
    ];

    fileInputs.forEach(({ id, path }) => {
        const input = document.getElementById(id);
        if (data[path]) {
            input.disabled = true;
            input.classList.add('bg-gray-700');
            input.insertAdjacentHTML('afterend', '<span class="text-gray-500 ml-2">PDF exists</span>');
        } else {
            input.disabled = false;
            input.classList.remove('bg-gray-700');
        }
    });
}

// Debounce the checkExistingFiles function
uploadForm.addEventListener('change', debounce(checkExistingFiles, 300));

AOS.init({
    duration: 1000,
    once: true
});

// Initialize Particles.js
particlesJS('particles-js', {
    particles: {
        number: { value: 80 },
        color: { value: '#ffffff' },
        opacity: { value: 0.5 },
        size: { value: 3 },
        line_linked: {
            enable: true,
            distance: 150,
            color: '#ffffff',
            opacity: 0.4,
            width: 1
        },
        move: {
            enable: true,
            speed: 2
        }
    }
});

// Counter animation
const observerOptions = {
    threshold: 0.5
};
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.counter').forEach(counter => {
    observer.observe(counter);
});
