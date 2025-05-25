const passwordInput = document.getElementById('password');

const strengthFeedbackDiv = document.getElementById('strength');
const strengthBar = document.getElementById('bar-progress');
const strengthText = document.getElementById('text');

const suggestionDiv = document.getElementById('suggestions');
const suggestionList = document.getElementById('suggestion-list');

// Hide suggestion area by default
suggestionDiv.style.display = 'none';

// Debounce utility
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// Add visual feedback for criteria
const criteriaDiv = document.getElementById('criteria');
function updateCriteria(password) {
    if (!criteriaDiv) return;
    const checks = [
        { regex: /.{8,}/, label: "At least 8 characters" },
        { regex: /[A-Z]/, label: "Uppercase letter" },
        { regex: /[a-z]/, label: "Lowercase letter" },
        { regex: /[0-9]/, label: "Number" },
        { regex: /[^A-Za-z0-9]/, label: "Special character" }
    ];
    criteriaDiv.innerHTML = '';
    checks.forEach(c => {
        const li = document.createElement('li');
        li.textContent = c.label;
        li.style.color = c.regex.test(password) ? '#4CAF50' : '#E53935';
        criteriaDiv.appendChild(li);
    });
}

// Extracted entropy/time-to-crack logic
function estimateCrackTime(password, possibleCharacters, weakpasswds) {
    let entropyBits = 0;
    if (password.length > 0 && possibleCharacters > 0) {
        entropyBits = password.length * Math.log2(possibleCharacters);
    }
    const guessesPerSecond = 100_000_000_000;
    let estimatedSeconds = 0;
    if (entropyBits > 0) {
        estimatedSeconds = Math.pow(2, entropyBits) / guessesPerSecond;
    }
    let timeToCrack = '';
    const lowerPassword = password.toLowerCase();
    if (password.length === 0) {
        timeToCrack = 'N/A';
    } else if (
        weakpasswds.some(weak => lowerPassword.includes(weak)) ||
        /(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/.test(password) ||
        /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba)/i.test(password) ||
        /(.)\1\1/.test(password)
    ) {
        timeToCrack = 'almost instant';
    }
    else if (estimatedSeconds < 1) {
        timeToCrack = 'less than 1 second';
    } else if (estimatedSeconds < 60) {
        timeToCrack = `${Math.round(estimatedSeconds)} seconds`;
    } else if (estimatedSeconds < 3600) {
        timeToCrack = `${Math.round(estimatedSeconds / 60)} minutes`;
    } else if (estimatedSeconds < 86400) {
        timeToCrack = `${Math.round(estimatedSeconds / 3600)} hours`;
    } else if (estimatedSeconds < 31536000) {
        timeToCrack = `${Math.round(estimatedSeconds / 86400)} days`;
    } else if (estimatedSeconds < 31536000000) {
        timeToCrack = `${Math.round(estimatedSeconds / 31536000)} years`;
    } else {
        timeToCrack = `over ${Math.round(estimatedSeconds / 31536000000)} thousand years`;
    }
    return timeToCrack;
}

function checkPasswordStrength() {
    const password = passwordInput.value;
    let score = 0;
    const suggestions = [];

    // Clear previous suggestions
    suggestionList.innerHTML = '';

    if (password.length === 0) {
        strengthText.textContent = '';
        strengthBar.style.width = '0%';
        suggestionDiv.style.display = 'none'; // Hide suggestions if no password
        return;
    }

    // --- Password strength criteria and scoring ---

    // 1. Length - highest weight (up to 50 points)
    if (password.length >= 20) {
        score += 50;
    } else if (password.length >= 16) {
        score += 40;
        suggestions.push("Try to use more than 20 characters for best security.");
    } else if (password.length >= 12) {
        score += 30;
        suggestions.push("Try to use at least 16 characters.");
    } else if (password.length >= 8) {
        score += 10;
        suggestions.push("Use at least 12 characters for better protection.");
    } else {
        suggestions.push("Your password is too short. Use at least 8 characters.");
    }

    // 2. Uppercase letters - medium weight (up to 10 points)
    if (/[A-Z]/.test(password)) {
        score += 10;
    } else {
        suggestions.push("Add at least one uppercase letter (A-Z).");
    }

    // 3. Lowercase letters - medium weight (up to 10 points)
    if (/[a-z]/.test(password)) {
        score += 10;
    } else {
        suggestions.push("Add at least one lowercase letter (a-z).");
    }

    // 4. Numbers - medium weight (up to 10 points)
    if (/[0-9]/.test(password)) {
        score += 10;
    } else {
        suggestions.push("Add at least one number (0-9).");
    }

    // 5. Special characters - high weight (up to 20 points)
    if (/[^A-Za-z0-9]/.test(password)) {
        score += 20;
    } else {
        suggestions.push("Add at least one special character (like !, @, #, $, etc.).");
    }

    // 6. Avoid common weak passwords - very high weight (penalty)
    const weakpasswds = [
        "123456", "password", "123456789", "12345", "12345678", "qwerty",
        "1234567", "111111", "123123", "abc123", "password1", "1234",
        "iloveyou", "1q2w3e4r", "admin", "letmein", "welcome", "monkey",
        "dragon", "football", "baseball", "starwars", "master", "hello",
        "freedom", "whatever", "qazwsx", "trustno1", "password", "123456",
        "qwerty", "admin", "111111", "iloveyou", "computer", "dragon",
        "p@ssword", "secret", "masterkey", "username", "mypassword",
        // Add more common weak passwords/patterns as needed
        "1234567890", "abcdefg", "pass123", "user123", "changer", "access",
        "root", "guest", "test"
    ];
    const lowerPassword = password.toLowerCase();
    if (weakpasswds.some(weak => lowerPassword.includes(weak))) {
        score -= 35; // Big penalty
        suggestions.push("Do not use common passwords or include them in your password (like '123456', 'password', etc.).");
    }

    // 7. Avoid sequential/repetitive characters - high weight (penalty)
    // Check for sequential numbers (e.g., 123, 321)
    if (/(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)/.test(password)) {
        score -= 15;
        suggestions.push("Avoid using sequential numbers (like 123, 321).");
    }
    // Check for sequential letters (e.g., abc, cba)
    if (/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba)/i.test(password)) {
        score -= 15;
        suggestions.push("Avoid using sequential letters (like abc, cba).");
    }
    // Check for repeated characters (e.g., aaa, 111)
    if (/(.)\1\1/.test(password)) {
        score -= 15;
        suggestions.push("Avoid using the same character more than twice in a row (like aaa, 111).");
    }


    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // --- Update strength display based on score ---
    let strengthLabel = '';
    let barColor = '';
    let textColor = '';

    if (score <= 20) {
        strengthLabel = 'Very Weak';
        barColor = '#d32f2f';    // Deeper red
        textColor = '#b71c1c';   // Even darker red for text
    } else if (score <= 40) {
        strengthLabel = 'Weak';
        barColor = '#f44336';    // Bright red
        textColor = '#c62828';   // Strong red for text
    } else if (score <= 60) {
        strengthLabel = 'Medium';
        barColor = '#ffb300';    // Deep amber
        textColor = '#ff6f00';   // Orange for text
    } else if (score <= 80) {
        strengthLabel = 'Strong';
        barColor = '#43a047';    // Strong green
        textColor = '#1b5e20';   // Dark green for text
    } else { // score > 80, including 100
        strengthLabel = 'Very Strong';
        barColor = '#1976d2';    // Vivid blue
        textColor = '#0d47a1';   // Deep blue for text
    }

    strengthBar.style.backgroundColor = barColor;
    strengthText.style.color = textColor;
    strengthBar.style.width = `${score}%`;
    strengthText.textContent = `Strength: ${strengthLabel}`;

    // --- Estimate time to crack ---
    const charactersSets = {
        lowercase: 26,
        uppercase: 26,
        numbers: 10,
        special: 33
    };

    let possibleCharacters = 0;
    if (/[a-z]/.test(password)) possibleCharacters += charactersSets.lowercase;
    if (/[A-Z]/.test(password)) possibleCharacters += charactersSets.uppercase;
    if (/[0-9]/.test(password)) possibleCharacters += charactersSets.numbers;
    if (/[^A-Za-z0-9]/.test(password)) possibleCharacters += charactersSets.special;

    // If no known character sets detected, set a small base value
    if (possibleCharacters === 0 && password.length > 0) {
        possibleCharacters = 5;
    } else if (password.length === 0) {
        possibleCharacters = 0;
    }

    const timeToCrack = estimateCrackTime(password, possibleCharacters, weakpasswds);
    // Show time to crack after strength text
    strengthText.textContent += ` (Estimated crack time: ${timeToCrack})`;


    // --- Show suggestions ---
    if (suggestions.length > 0) {
        suggestionDiv.style.display = 'block';
        suggestions.forEach(suggestion => {
            const listItem = document.createElement('li');
            listItem.textContent = suggestion;
            suggestionList.appendChild(listItem);
        });
    } else {
        suggestionDiv.style.display = 'block';
        const listItem = document.createElement('li');
        listItem.textContent = "Your password looks very strong! Don't forget to enable two-factor authentication.";
        suggestionList.appendChild(listItem);
    }
}

// Bind debounced check to input event
passwordInput.addEventListener('input', debounce(checkPasswordStrength, 200));

// Initial check in case the field is pre-filled (e.g., by browser)
checkPasswordStrength();