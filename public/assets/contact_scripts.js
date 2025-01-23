//Enable/Disable submit button + error messages from contact page
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    const submitButton = form.querySelector('button[type="submit"]');
  
    submitButton.classList.add("disabled-style");
  
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  
    function isValidPhone(phone) {
      const cleanPhone = phone.replace(/[\s()-]/g, "");
      return /^\d{7,13}$/.test(cleanPhone);
    }
  
    function showError(field, message) {
      const formGroup = field.closest(".form-group");
      const errorSpan = formGroup.querySelector(".error-message");
      if (errorSpan) {
        errorSpan.textContent = message;
      }
    }
  
    function clearError(field) {
      const formGroup = field.closest(".form-group");
      const errorSpan = formGroup.querySelector(".error-message");
      if (errorSpan) {
        errorSpan.textContent = "";
      }
    }
  
    function getErrorMessage(field) {
      if (field.id === "name") {
        return "Help us get to know you better.";
      } else if (field.id === "email") {
        return "Please, enter your e-mail so we can reach you.";
      } else if (field.id === "phone") {
        return "Please, enter your phone number so we can contact you.";
      } else if (field.id === "message") {
        return "Please briefly describe your project so we can assist you better.";
      }
      return "This field is required";
    }
  
    function validateField(field) {
      let isValid = true;
  
      if (!field.value.trim() && field.hasAttribute("required")) {
        showError(field, getErrorMessage(field));
        isValid = false;
      } else {
        if (field.type === "email" && field.value.trim()) {
          if (!isValidEmail(field.value.trim())) {
            showError(field, "Please enter a valid email address");
            isValid = false;
          } else {
            clearError(field);
          }
        } else if (field.type === "tel" && field.value.trim()) {
          if (!isValidPhone(field.value.trim())) {
            showError(field, "Please enter a valid phone number");
            isValid = false;
          } else {
            clearError(field);
          }
        } else {
          clearError(field);
        }
      }
  
      return isValid;
    }
  
    function validateForm() {
      const requiredFields = form.querySelectorAll(
        "input[required], textarea[required]"
      );
      const emailField = form.querySelector('input[type="email"]');
      const phoneField = form.querySelector('input[type="tel"]');
  
      let isValid = true;
      let isEmailValid = true;
      let isPhoneValid = true;
  
      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false;
        }
      });
  
      if (emailField && emailField.value.trim()) {
        isEmailValid = isValidEmail(emailField.value.trim());
      } else {
        isEmailValid = false;
      }
  
      if (phoneField && phoneField.value.trim()) {
        isPhoneValid = isValidPhone(phoneField.value.trim());
      } else {
        isPhoneValid = false;
      }
  
      if (isValid && isEmailValid && isPhoneValid) {
        submitButton.classList.remove("disabled-style");
      } else {
        submitButton.classList.add("disabled-style");
      }
  
      return isValid && isEmailValid && isPhoneValid;
    }
  
    form
      .querySelectorAll("input[required], textarea[required]")
      .forEach((field) => {
        field.addEventListener("blur", () => {
          validateField(field);
          validateForm();
        });
  
        field.addEventListener("input", () => {
          if (field.value.trim()) {
            validateField(field);
          }
          validateForm();
        });
      });
  
    submitButton.addEventListener("click", (e) => {
      e.preventDefault();
  
      if (submitButton.classList.contains("disabled-style")) {
        form
          .querySelectorAll("input[required], textarea[required]")
          .forEach((field) => {
            if (!field.value.trim()) {
              showError(field, getErrorMessage(field));
            } else {
              validateField(field);
            }
          });
      } else {
        form.submit();
      }
    });
  
    validateForm();
  });