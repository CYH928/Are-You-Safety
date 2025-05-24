const passwordInput = document.getElementById('password');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const strengthFeedbackDiv = document.getElementById('strength-feedback');
const suggestionList = document.getElementById('suggestion-list');

function checkPasswordStrength() {
    const password = passwordInput.value;
    let score = 0;
    const suggestions = [];

    // Clear previous suggestions
    suggestionList.innerHTML = '';

    if (password.length === 0) {
        strengthFeedbackDiv.className = ''; // Reset class
        strengthText.textContent = '';
        strengthBar.style.width = '0%';
        return;
    }

    // Criteria for password strength
    // 1. Length
    if (password.length >= 8) {
        score++;
    } else {
        suggestions.push("Use at least 8 characters.");
    }
    if (password.length >= 12) {
        score++;
    }

    // 2. Uppercase letters
    if (/[A-Z]/.test(password)) {
        score++;
    } else {
        suggestions.push("Include at least one uppercase letter (A-Z).");
    }

    // 3. Lowercase letters
    if (/[a-z]/.test(password)) {
        score++;
    } else {
        suggestions.push("Include at least one lowercase letter (a-z).");
    }

    // 4. Numbers
    if (/[0-9]/.test(password)) {
        score++;
    } else {
        suggestions.push("Include at least one number (0-9).");
    }

    // 5. Special characters
    if (/[^A-Za-z0-9]/.test(password)) { // Matches anything not a letter or number
        score++;
    } else {
        suggestions.push("Include at least one special character (e.g., !, @, #, $).");
    }

    // Update strength display
    let strength = '';
    strengthFeedbackDiv.className = ''; // Reset class

    if (score <= 2) {
        strength = 'Weak';
        strengthFeedbackDiv.classList.add('weak');
    } else if (score <= 4) {
        strength = 'Medium';
        strengthFeedbackDiv.classList.add('medium');
    } else {
        strength = 'Strong';
        strengthFeedbackDiv.classList.add('strong');
    }

    strengthText.textContent = `Strength: ${strength}`;

    // Populate suggestions
    if (suggestions.length > 0 && strength !== 'Strong') {
        suggestions.forEach(suggestion => {
            const listItem = document.createElement('li');
            listItem.textContent = suggestion;
            suggestionList.appendChild(listItem);
        });
    } else if (strength === 'Strong') {
         const listItem = document.createElement('li');
         listItem.textContent = "Your password looks strong!";
         suggestionList.appendChild(listItem);
    }
}

// Initial check in case the field is pre-filled (e.g., by browser)
checkPasswordStrength();
