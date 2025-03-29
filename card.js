// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCxILJglkVRtWfYQa37ffDCDQWrTCRLUo",
  authDomain: "eid1-12d8b.firebaseapp.com",
  projectId: "eid1-12d8b",
  storageBucket: "eid1-12d8b.firebasestorage.app",
  messagingSenderId: "833723530259",
  appId: "1:833723530259:web:81d7c6e4f7c6e4515dd3e6",
  measurementId: "G-NW953H55EQ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let isAdminMode = false;
const ADMIN_PASSWORD = '1234#';
let availableVideos = [];
let specialNames = [];

// Add this function to check login state on page load
function checkLoginState() {
    // Clear any existing login state
    localStorage.removeItem('isAdminLoggedIn');
    isAdminMode = false;
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminActions').style.display = 'none';
    document.getElementById('specialNamesWindow').style.display = 'none';
    document.querySelector('.names-list').classList.remove('admin-mode');
    
    // Load special names from Firebase
    loadSpecialNames();
    
    // Refresh the names list to remove admin controls
    database.ref('names').once('value', (snapshot) => {
        const names = [];
        snapshot.forEach((childSnapshot) => {
            names.push({
                id: childSnapshot.key,
                name: childSnapshot.val()
            });
        });
        updateNamesList(names);
    });
}

// Add function to load special names from Firebase
function loadSpecialNames() {
    database.ref('specialNames').once('value', (snapshot) => {
        specialNames = [];
        snapshot.forEach((childSnapshot) => {
            specialNames.push({
                id: childSnapshot.key,
                name: childSnapshot.val()
            });
        });
        console.log('Special names loaded:', specialNames);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    const card = document.getElementById('card');
    let isFlipped = false;

    // Click handler for card flip
    card.addEventListener('click', (e) => {
        // Don't flip if clicking on input, button, or names list
        if (e.target.tagName === 'INPUT' || 
            e.target.tagName === 'BUTTON' || 
            e.target.closest('.names-list') ||
            e.target.closest('.back-content')) {
            return;
        }
        
        isFlipped = !isFlipped;
        if (isFlipped) {
            card.style.transform = 'rotateY(180deg)';
        } else {
            card.style.transform = 'rotateY(0deg)';
        }
    });

    // Listen for changes in the names list
    database.ref('names').on('value', (snapshot) => {
        const names = [];
        snapshot.forEach((childSnapshot) => {
            names.push({
                id: childSnapshot.key,
                name: childSnapshot.val()
            });
        });
        updateNamesList(names);
    });

    loadAvailableVideos();
});

// Update the loginAdmin function
function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        isAdminMode = true;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminActions').style.display = 'block';
        document.querySelector('.names-list').classList.add('admin-mode');
        
        // Load special names from Firebase
        loadSpecialNames();
        updateSpecialNamesList();
        
        // Load regular names
        database.ref('names').once('value', (snapshot) => {
            const names = [];
            snapshot.forEach((childSnapshot) => {
                names.push({
                    id: childSnapshot.key,
                    name: childSnapshot.val()
                });
            });
            updateNamesList(names);
        });
    } else {
        alert('Incorrect password');
    }
}

function deleteAllNames() {
    if (confirm('Are you sure you want to delete all names?')) {
        database.ref('names').remove().then(() => {
            alert('All names have been deleted successfully');
        }).catch((error) => {
            alert('Error occurred while deleting names');
            console.error('Error deleting all names:', error);
        });
    }
}

function addSpecialName() {
    const specialNameInput = document.getElementById('specialNameInput');
    const name = specialNameInput.value.trim();
    
    if (name) {
        // Check if name already exists in special names
        if (!specialNames.some(item => item.name === name)) {
            // Add to Firebase
            database.ref('specialNames').push(name).then(() => {
                specialNameInput.value = '';
                loadSpecialNames(); // Reload special names
                updateSpecialNamesList();
            }).catch((error) => {
                console.error('Error adding special name:', error);
                alert('Error adding special name. Please try again.');
            });
        } else {
            alert('This name is already in the special list');
        }
    }
}

function addName() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    
    if (name) {
        // Check if name already exists
        database.ref('names').once('value', (snapshot) => {
            const names = [];
            snapshot.forEach((childSnapshot) => {
                names.push(childSnapshot.val());
            });
            
            if (!names.includes(name)) {
                database.ref('names').push(name);
                nameInput.value = '';
                
                // Play videos for all names
                console.log('Playing video for:', name); // Debug log
                playSideVideos(); // Play videos for everyone
            } else {
                alert('This name already exists');
            }
        });
    }
}

function loadAvailableVideos() {
    // Load special videos
    availableVideos = [
        'special/special1.mp4',
        'special/special2.mp4',
        'special/special3.mp4',
        'special/special4.mp4',
        'special/special5.mp4',
        'special/special6.mp4',
        'special/special7.mp4',
        'special/special8.mp4',
    ];
    console.log('Special videos loaded:', availableVideos); // Debug log
}

function getRandomVideo() {
    if (availableVideos.length === 0) {
        loadAvailableVideos();
    }
    const video = availableVideos[Math.floor(Math.random() * availableVideos.length)];
    console.log('Selected video:', video); // Debug log
    return video;
}

function playSideVideos() {
    console.log('Playing side videos'); // Debug log
    
    // Load available videos if not already loaded
    if (availableVideos.length === 0) {
        loadAvailableVideos();
    }
    
    // Get one random video to use for both positions
    const randomVideo = getRandomVideo();
    
    // Get all video elements
    const leftVideoElement = document.getElementById('leftVideo');
    const rightVideoElement = document.getElementById('rightVideo');
    const topVideoElement = document.getElementById('topVideo');
    const bottomVideoElement = document.getElementById('bottomVideo');
    
    // Function to setup and play a video
    function setupVideo(videoElement) {
        // Clear previous source
        videoElement.innerHTML = '';
        
        // Create and add new source
        const source = document.createElement('source');
        source.src = randomVideo;
        source.type = 'video/mp4';
        videoElement.appendChild(source);
        
        // Reset video
        videoElement.currentTime = 0;
        videoElement.muted = false; // Enable sound
        
        // Show video
        videoElement.classList.remove('hidden');
        
        // Load and play video
        videoElement.load();
        
        // Add error handling for video loading
        videoElement.onerror = (e) => {
            console.error('Error loading video:', e);
            alert('Error loading video. Please check if the video files exist in the correct folder.');
        };
        
        const playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Add fade-in effect
                setTimeout(() => {
                    videoElement.classList.add('fade-in');
                }, 100);
            }).catch(error => {
                console.log("Video play failed:", error);
                // Try playing with muted first (some browsers require this)
                videoElement.muted = true;
                videoElement.play().then(() => {
                    setTimeout(() => {
                        videoElement.muted = false;
                    }, 100);
                });
            });
        }
        
        // Handle video end
        videoElement.onended = () => {
            videoElement.classList.remove('fade-in');
            setTimeout(() => {
                videoElement.classList.add('hidden');
            }, 500);
        };
    }
    
    // Check if we're on mobile or desktop
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile) {
        // On mobile, show same video on top and bottom
        setupVideo(topVideoElement);
        setupVideo(bottomVideoElement);
        leftVideoElement.classList.add('hidden');
        rightVideoElement.classList.add('hidden');
    } else {
        // On desktop, show same video on left and right
        setupVideo(leftVideoElement);
        setupVideo(rightVideoElement);
        topVideoElement.classList.add('hidden');
        bottomVideoElement.classList.add('hidden');
    }
}

function updateNamesList(names) {
    const namesList = document.getElementById('namesList');
    namesList.innerHTML = '';
    
    names.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'name-item';
        
        // Create name span
        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        
        // Add name to list item
        li.appendChild(nameSpan);
        
        // Only add action buttons if in admin mode
        if (isAdminMode) {
            // Create actions container
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'name-actions';
            
            // Create edit button
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => editName(item.id, item.name);
            
            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Del';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = () => removeName(item.id);
            
            // Add buttons to actions container
            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            
            // Add actions to list item
            li.appendChild(actionsDiv);
        }
        
        namesList.appendChild(li);
    });
}

function editName(id, currentName) {
    const newName = prompt('Enter new name:', currentName);
    if (newName && newName.trim()) {
        database.ref('names').child(id).set(newName.trim());
    }
}

function removeName(id) {
    if (confirm('Are you sure you want to delete this name?')) {
        database.ref('names').child(id).remove();
    }
}

// Add event listener for page unload
window.addEventListener('beforeunload', () => {
    checkLoginState();
});

function toggleAdminLogin() {
    const adminLogin = document.getElementById('adminLogin');
    if (adminLogin.style.display === 'none') {
        adminLogin.style.display = 'block';
    } else {
        adminLogin.style.display = 'none';
    }
}

function toggleSpecialNames() {
    if (!isAdminMode) return;
    
    const specialNamesWindow = document.getElementById('specialNamesWindow');
    if (specialNamesWindow.style.display === 'none') {
        specialNamesWindow.style.display = 'block';
        updateSpecialNamesList();
    } else {
        specialNamesWindow.style.display = 'none';
    }
}

function showSpecialNames() {
    if (!isAdminMode) return;
    
    const namesList = specialNames.map(item => item.name).join(', ');
    alert('Special Names:\n' + (namesList || 'No special names added yet'));
}

// Update function to save special names to Firebase
function saveSpecialNames() {
    // Clear existing special names in Firebase
    database.ref('specialNames').remove().then(() => {
        // Add all special names back
        const updates = {};
        specialNames.forEach((item) => {
            updates[`specialNames/${item.id}`] = item.name;
        });
        return database.ref().update(updates);
    }).catch((error) => {
        console.error('Error saving special names:', error);
        alert('Error saving special names. Please try again.');
    });
}

function updateSpecialNamesList() {
    const specialNamesList = document.getElementById('specialNamesList');
    specialNamesList.innerHTML = '';
    
    specialNames.forEach((item) => {
        const li = document.createElement('li');
        
        // Create name span
        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        
        // Create actions container
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'name-actions';
        
        // Create edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editSpecialName(item.id, item.name);
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Del';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = () => deleteSpecialName(item.id);
        
        // Add buttons to actions container
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);
        
        // Add name and actions to list item
        li.appendChild(nameSpan);
        li.appendChild(actionsDiv);
        
        specialNamesList.appendChild(li);
    });
}

function editSpecialName(id, currentName) {
    const newName = prompt('Enter new special name:', currentName);
    if (newName && newName.trim()) {
        // Update in Firebase
        database.ref(`specialNames/${id}`).set(newName.trim()).then(() => {
            loadSpecialNames(); // Reload special names
            updateSpecialNamesList();
        }).catch((error) => {
            console.error('Error updating special name:', error);
            alert('Error updating special name. Please try again.');
        });
    }
}

function deleteSpecialName(id) {
    if (confirm('Are you sure you want to delete this special name?')) {
        // Remove from Firebase
        database.ref(`specialNames/${id}`).remove().then(() => {
            loadSpecialNames(); // Reload special names
            updateSpecialNamesList();
        }).catch((error) => {
            console.error('Error deleting special name:', error);
            alert('Error deleting special name. Please try again.');
        });
    }
}

// Update the special names listener
database.ref('specialNames').on('value', (snapshot) => {
    specialNames = [];
    snapshot.forEach((childSnapshot) => {
        specialNames.push({
            id: childSnapshot.key,
            name: childSnapshot.val()
        });
    });
    console.log('Special names updated:', specialNames);
    if (isAdminMode) {
        updateSpecialNamesList();
    }
}); 