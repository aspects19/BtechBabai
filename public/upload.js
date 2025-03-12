// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Initialize Firebase with your config
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const storage = firebase.storage();
const database = firebase.database();

// DOM elements
const loginForm = document.getElementById('loginForm');
const uploadForm = document.getElementById('uploadForm');
const loginSection = document.getElementById('loginSection');
const uploadSection = document.getElementById('uploadSection');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Admin emails list (store these securely in production)
const adminEmails = ['admin@btechbabai.com', 'another-admin@btechbabai.com'];

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
const githubProvider = new firebase.auth.GithubAuthProvider();

// Social login buttons
const googleLoginBtn = document.getElementById('googleLogin');
const githubLoginBtn = document.getElementById('githubLogin');

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        loginSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        
        // Update user info display
        const userInfoHTML = `
            <div class="flex items-center space-x-2">
                ${user.photoURL ? `<img src="${user.photoURL}" alt="Profile" class="w-8 h-8 rounded-full">` : ''}
                <span>${user.email}</span>
            </div>
        `;
        userEmail.innerHTML = userInfoHTML;
    } else {
        // User is signed out
        loginSection.classList.remove('hidden');
        uploadSection.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        userEmail.innerHTML = '';
    }
});

// Login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
});

// Logout handler
logoutBtn.addEventListener('click', () => auth.signOut());

// Upload form handler
uploadForm.addEventListener('submit', async (e) => {
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

        // Check if subject already exists
        const dbRef = database.ref(`${college}/${branch}/${semester}`);
        const snapshot = await dbRef.orderByChild('subject').equalTo(subject).once('value');
        
        if (snapshot.exists() && !user.email.endsWith('@btechbabai.com')) { // Change this to your admin domain
            alert('This subject already exists. Only administrators can update existing materials.');
            return;
        }

        // Show loading state
        const submitButton = uploadForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = 'Uploading...';

        // Upload files to Storage and get URLs
        const uploadFile = async (file, path) => {
            const storageRef = storage.ref(`${college}/${branch}/${semester}/${subject}/${path}`);
            await storageRef.put(file);
            return await storageRef.getDownloadURL();
        };

        // Get all file URLs
        const urls = {
            pdfUrl: await uploadFile(document.getElementById('prevYearPaper').files[0], 'prev-year'),
            chap1: await uploadFile(document.getElementById('chap1').files[0], 'chap1'),
            chap2: await uploadFile(document.getElementById('chap2').files[0], 'chap2'),
            chap3: await uploadFile(document.getElementById('chap3').files[0], 'chap3'),
            chap4: await uploadFile(document.getElementById('chap4').files[0], 'chap4'),
            chap5: await uploadFile(document.getElementById('chap5').files[0], 'chap5'),
            youtubePlaylist: document.getElementById('youtubeUrl').value
        };

        // Create the material object
        const materialData = {
            subject,
            ...urls,
            uploadedBy: user.email,
            uploadedAt: firebase.database.ServerValue.TIMESTAMP
        };

        // Save to Realtime Database
        const dbRef = database.ref(`${college}/${branch}/${semester}`);
        
        // Check if data already exists for this subject
        const snapshot = await dbRef.orderByChild('subject').equalTo(subject).once('value');
        
        if (snapshot.exists() && !user.email.endsWith('@btechbabai.com')) { // Change this to your admin domain
            alert('Material for this subject already exists. Only admins can update existing materials.');
            return;
        }

        // If no existing data or user is admin, save the new data
        if (snapshot.exists()) {
            // Update existing entry
            const existingKey = Object.keys(snapshot.val())[0];
            await dbRef.child(existingKey).update(materialData);
        } else {
            // Create new entry
            await dbRef.push(materialData);
        }

        alert('Materials uploaded successfully!');
        uploadForm.reset();

    } catch (error) {
        console.error('Upload error:', error);
        alert(`Error uploading materials: ${error.message}`);
    } finally {
        // Reset button state
        const submitButton = uploadForm.querySelector('button[type="submit"]');
        submitButton.disabled = false;
        submitButton.textContent = 'Upload Materials';
    }
});

// Google login handler
googleLoginBtn.addEventListener('click', async () => {
    try {
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        // Store user info in database if it's their first login
        const userRef = database.ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
            await userRef.set({
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            });
        } else {
            await userRef.update({
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            });
        }
    } catch (error) {
        console.error('Google login error:', error);
        alert(`Error signing in with Google: ${error.message}`);
    }
});

// GitHub login handler
githubLoginBtn.addEventListener('click', async () => {
    try {
        const result = await auth.signInWithPopup(githubProvider);
        const user = result.user;
        
        // Store user info in database if it's their first login
        const userRef = database.ref(`users/${user.uid}`);
        const snapshot = await userRef.once('value');
        
        if (!snapshot.exists()) {
            await userRef.set({
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            });
        } else {
            await userRef.update({
                lastLogin: firebase.database.ServerValue.TIMESTAMP
            });
        }
    } catch (error) {
        console.error('GitHub login error:', error);
        alert(`Error signing in with GitHub: ${error.message}`);
    }
}); 