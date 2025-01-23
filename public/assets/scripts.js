// Hide and Show NavBar on Scroll
let lastScrollTop = 0;

document.body.addEventListener("scroll", function () {
  const scrollTop =
    document.body.scrollTop || document.documentElement.scrollTop;
  const header = document.getElementById("header");
  if (scrollTop > window.innerHeight - 100 && scrollTop > lastScrollTop) {
    header.classList.add("off");
  } else if (scrollTop < lastScrollTop - 50) {
    header.classList.remove("off");
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

const dropDownToggle = document.querySelector(".dropdown-toggle");
const dropDownMenu = document.querySelector(".dropdown-menu");

if (dropDownToggle && dropDownMenu) {
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
  dropDownToggle.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default link behavior
    if (dropDownMenu.classList.contains("show")) {
      hideDropdown();
    } else {
      showDropdown();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !dropDownToggle.contains(event.target) &&
      !dropDownMenu.contains(event.target)
    ) {
      hideDropdown();
    }
  });
}

//Hide scroll arrow on scroll
var scroll_arrow = document.getElementById("scroll-arrow-cont");
var container_scroll = document.getElementById("container-scroll");

if (scroll_arrow && container_scroll) {
  document.body.addEventListener("scroll", function () {
    if (this.scrollTop > 10) {
      scroll_arrow.classList.add("hidden");
      container_scroll.classList.add("hidden");
    } else {
      scroll_arrow.classList.remove("hidden");
      container_scroll.classList.remove("hidden");
    }
  });
}

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

// height of mobile screen - browser bar
function setRealHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

setRealHeight();

// form submission
document.addEventListener("DOMContentLoaded", function () {
  const popup = document.querySelector(".popup-message");
  const overlay = document.querySelector(".message-overlay");
  const closeButton = document.querySelector(".close-button");

  if (popup && overlay) {
    const timeoutId = setTimeout(() => {
      popup.style.display = "none";
      overlay.style.display = "none";
    }, 10000);

    closeButton.addEventListener("click", () => {
      popup.style.display = "none";
      overlay.style.display = "none";
      clearTimeout(timeoutId);
    });

    overlay.addEventListener("click", () => {
      popup.style.display = "none";
      overlay.style.display = "none";
      clearTimeout(timeoutId);
    });
  }
});

// char count message field
document.addEventListener("DOMContentLoaded", function () {
  const messageTextarea = document.getElementById("message");

  if (messageTextarea) {
    const charCounter =
      messageTextarea.parentElement.querySelector(".char-counter");
    const errorMessage =
      messageTextarea.parentElement.querySelector(".error-message");
    const maxLength = messageTextarea.getAttribute("maxlength");

    function updateCharCount() {
      const currentLength = messageTextarea.value.length;
      charCounter.textContent = `${currentLength} / ${maxLength}`;

      if (currentLength >= maxLength * 0.9) {
        charCounter.style.color = "#ff4444";
      } else {
        charCounter.style.color = "#666";
      }

      // Adjust counter position based on error message height
      if (errorMessage.textContent.trim() !== "") {
        const errorHeight = errorMessage.offsetHeight;
        charCounter.style.bottom = `${errorHeight + 15}px`; // 10px padding
      } else {
        charCounter.style.bottom = "10px";
      }
    }

    // Update counter position when error message changes
    const observer = new MutationObserver(updateCharCount);
    observer.observe(errorMessage, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    messageTextarea.addEventListener("input", updateCharCount);
    messageTextarea.addEventListener("keyup", updateCharCount);

    messageTextarea.addEventListener("focus", () => {
      charCounter.style.opacity = "1";
      charCounter.style.visibility = "visible";
      updateCharCount(); // Update position on focus
    });

    messageTextarea.addEventListener("blur", () => {
      charCounter.style.opacity = "0";
      charCounter.style.visibility = "hidden";
    });
  }
});
