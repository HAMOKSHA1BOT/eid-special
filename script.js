// Get names from localStorage or initialize empty array
let names = JSON.parse(localStorage.getItem('names')) || [];

// Function to add a new name
function addName() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();
    
    if (name) {
        names.push(name);
        localStorage.setItem('names', JSON.stringify(names));
        updateNamesList();
        nameInput.value = '';
    }
}

// Function to update the names list display
function updateNamesList() {
    const namesList = document.getElementById('namesList');
    namesList.innerHTML = '';
    
    names.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        namesList.appendChild(li);
    });
}

// Update the list when the page loads
document.addEventListener('DOMContentLoaded', updateNamesList); 