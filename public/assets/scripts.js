// Select the hamburger menu and navbar elements
const hamMenu = document.querySelector(".ham-menu");
const navbarMenu = document.getElementById("navbarMenu");

// Function to toggle the active class on the hamburger menu and collapse the navbar
hamMenu.addEventListener("click", () => {
    hamMenu.classList.toggle("active");
    
    // Toggle the collapse class on the navbar
    navbarMenu.classList.toggle("show");
});

// Optional: Close the navbar when clicking outside of it
document.addEventListener("click", (event) => {
    if (!hamMenu.contains(event.target) && !navbarMenu.contains(event.target) && navbarMenu.classList.contains("show")) {
        hamMenu.classList.remove("active");
        navbarMenu.classList.remove("show");
    }
});

// Select dropdown elements for future functionality (if needed)
const dropDownToggle = document.querySelector(".dropdown-toggle");
const dropDownMenu = document.querySelector(".dropdown-menu");

// Function to show the dropdown
function showDropdown() {
    dropDownToggle.classList.add("show");
    dropDownMenu.classList.add("show");
}

// Function to hide the dropdown
function hideDropdown() {
    dropDownToggle.classList.remove("show");
    dropDownMenu.classList.remove("show");
}

// Event listeners for dropdown toggle
if (dropDownToggle) {
    dropDownToggle.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
        if (dropDownMenu.classList.contains("show")) {
            hideDropdown();
        } else {
            showDropdown();
        }
    });
}

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    if (!dropDownToggle.contains(event.target) && !dropDownMenu.contains(event.target)) {
        hideDropdown();
    }
});
