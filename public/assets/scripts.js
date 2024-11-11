// Hide and Show NavBar on Scroll
let lastScrollTop = 0;

document.body.addEventListener("scroll", function () {
  const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  const header = document.getElementById("header");
  console.log(lastScrollTop);
  if (scrollTop > window.innerHeight - 100 && scrollTop > lastScrollTop) {
    header.classList.add('off');
  } 
  else if (scrollTop < lastScrollTop - 50) {
    header.classList.remove('off');
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

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
  if (
    !hamMenu.contains(event.target) &&
    !navbarMenu.contains(event.target) &&
    navbarMenu.classList.contains("show")
  ) {
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
  if (
    !dropDownToggle.contains(event.target) &&
    !dropDownMenu.contains(event.target)
  ) {
    hideDropdown();
  }
});

//Hide scroll arrow on scroll
var scroll_arrow = document.getElementById("scroll-arrow-cont");
var container_scroll = document.getElementById("container-scroll");

document.body.addEventListener("scroll", function () {
  if (this.scrollTop > 10) {
    scroll_arrow.classList.add("hidden");
    container_scroll.classList.add("hidden");
  } else {
    scroll_arrow.classList.remove("hidden");
    container_scroll.classList.remove("hidden");
  }
});

//Show Elements when reaching them
const options = {
  root: null, // Use the viewport as the root
  rootMargin: "0px",
  threshold: 0.2, // Trigger when 10% of the element is visible
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, options);

const elements = document.querySelectorAll(".fade-in");
elements.forEach((element) => {
  observer.observe(element);
});