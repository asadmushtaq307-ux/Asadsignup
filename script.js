
// DOM Elements
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const countryCodeSelect = document.getElementById('countryCode');
const phoneNumberInput = document.getElementById('phoneNumber');
const otpSection = document.getElementById('otpSection');
const otpInput = document.getElementById('otpInput');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const messageArea = document.getElementById('messageArea');

// Global variables
let generatedOtp = '';
let isOtpSent = false;
let otpTimer = null;
let remainingTime = 0;

// Utility functions
function showMessage(message, type = 'info') {
    messageArea.textContent = message;
    messageArea.className = `message-area ${type}`;
    messageArea.style.display = 'block';
}

function clearMessage() {
    messageArea.textContent = '';
    messageArea.className = 'message-area';
    messageArea.style.display = 'none';
}

function validateInputs() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const phoneNumber = phoneNumberInput.value.trim();
    
    // Clear previous validation styles
    [firstNameInput, lastNameInput, phoneNumberInput].forEach(input => {
        input.classList.remove('error', 'success');
    });
    
    let isValid = true;
    let errorMessage = '';
    
    if (!firstName) {
        firstNameInput.classList.add('error');
        errorMessage = 'First name is required';
        isValid = false;
    } else {
        firstNameInput.classList.add('success');
    }
    
    if (!lastName) {
        lastNameInput.classList.add('error');
        if (!errorMessage) errorMessage = 'Last name is required';
        isValid = false;
    } else {
        lastNameInput.classList.add('success');
    }
    
    if (!phoneNumber) {
        phoneNumberInput.classList.add('error');
        if (!errorMessage) errorMessage = 'Phone number is required';
        isValid = false;
    } else if (!/^[0-9]{7,15}$/.test(phoneNumber)) {
        phoneNumberInput.classList.add('error');
        if (!errorMessage) errorMessage = 'Please enter a valid phone number (7-15 digits)';
        isValid = false;
    } else {
        phoneNumberInput.classList.add('success');
    }
    
    if (!isValid) {
        showMessage(errorMessage, 'error');
    } else {
        clearMessage();
    }
    
    return isValid;
}

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function simulateOTPSending(phoneNumber, countryCode) {
    return new Promise((resolve) => {
        // Simulate API call delay
        setTimeout(() => {
            generatedOtp = generateOTP();
            console.log(`OTP sent to ${countryCode}${phoneNumber}: ${generatedOtp}`);
            resolve({
                success: true,
                message: `OTP sent successfully to ${countryCode}${phoneNumber}`,
                otp: generatedOtp // In real scenario, this won't be returned
            });
        }, 2000);
    });
}

function startOTPTimer() {
    remainingTime = 300; // 5 minutes
    
    function updateTimer() {
        if (remainingTime <= 0) {
            clearInterval(otpTimer);
            showMessage('OTP expired. Please request a new one.', 'error');
            resetOTPProcess();
            return;
        }
        
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (isOtpSent) {
            showMessage(`OTP sent! Time remaining: ${timeString}`, 'info');
        }
        
        remainingTime--;
    }
    
    updateTimer();
    otpTimer = setInterval(updateTimer, 1000);
}

function resetOTPProcess() {
    isOtpSent = false;
    generatedOtp = '';
    
    // Reset UI
    otpSection.style.display = 'none';
    otpSection.classList.remove('show');
    verifyOtpBtn.style.display = 'none';
    sendOtpBtn.style.display = 'block';
    sendOtpBtn.disabled = false;
    sendOtpBtn.classList.remove('loading');
    sendOtpBtn.textContent = 'Send OTP';
    
    // Clear OTP input
    otpInput.value = '';
    otpInput.classList.remove('error', 'success');
    
    // Clear timer
    if (otpTimer) {
        clearInterval(otpTimer);
        otpTimer = null;
    }
    
    // Re-enable form inputs
    [firstNameInput, lastNameInput, countryCodeSelect, phoneNumberInput].forEach(input => {
        input.disabled = false;
    });
    
    clearMessage();
}

async function handleSendOTP() {
    if (!validateInputs()) {
        return;
    }
    
    const phoneNumber = phoneNumberInput.value.trim();
    const countryCode = countryCodeSelect.value;
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    // Update button state
    sendOtpBtn.disabled = true;
    sendOtpBtn.classList.add('loading');
    sendOtpBtn.textContent = 'Sending...';
    
    // Disable form inputs
    [firstNameInput, lastNameInput, countryCodeSelect, phoneNumberInput].forEach(input => {
        input.disabled = true;
    });
    
    showMessage('Sending OTP...', 'info');
    
    try {
        const result = await simulateOTPSending(phoneNumber, countryCode);
        
        if (result.success) {
            isOtpSent = true;
            
            // Show OTP section with animation
            otpSection.style.display = 'block';
            setTimeout(() => {
                otpSection.classList.add('show');
            }, 100);
            
            // Update buttons
            sendOtpBtn.style.display = 'none';
            verifyOtpBtn.style.display = 'block';
            
            // Focus on OTP input
            setTimeout(() => {
                otpInput.focus();
            }, 300);
            
            // Start timer
            startOTPTimer();
            
            // Show the actual OTP for demo purposes (remove in production)
            setTimeout(() => {
                showMessage(`Demo: Your OTP is ${generatedOtp}. (This is for testing only)`, 'info');
            }, 3000);
            
        } else {
            throw new Error(result.message || 'Failed to send OTP');
        }
    } catch (error) {
        showMessage(`Error: ${error.message}`, 'error');
        resetOTPProcess();
    } finally {
        sendOtpBtn.classList.remove('loading');
    }
}

function handleVerifyOTP() {
    const enteredOtp = otpInput.value.trim();
    
    if (!enteredOtp) {
        showMessage('Please enter the OTP', 'error');
        otpInput.classList.add('error');
        return;
    }
    
    if (enteredOtp.length !== 6) {
        showMessage('OTP must be 6 digits', 'error');
        otpInput.classList.add('error');
        return;
    }
    
    // Update button state
    verifyOtpBtn.disabled = true;
    verifyOtpBtn.classList.add('loading');
    verifyOtpBtn.textContent = 'Verifying...';
    
    // Simulate verification delay
    setTimeout(() => {
        if (enteredOtp === generatedOtp) {
            // Success
            otpInput.classList.remove('error');
            otpInput.classList.add('success');
            
            if (otpTimer) {
                clearInterval(otpTimer);
                otpTimer = null;
            }
            
            showMessage('🎉 Signup successful! Welcome to Asad Bhatti!', 'success');
            
            // Disable all inputs and buttons
            [firstNameInput, lastNameInput, countryCodeSelect, phoneNumberInput, otpInput].forEach(input => {
                input.disabled = true;
            });
            verifyOtpBtn.style.display = 'none';
            
        } else {
            // Failed
            otpInput.classList.add('error');
            showMessage('Invalid OTP. Please try again.', 'error');
            verifyOtpBtn.disabled = false;
            verifyOtpBtn.classList.remove('loading');
            verifyOtpBtn.textContent = 'Verify OTP';
            otpInput.value = '';
            otpInput.focus();
        }
    }, 1500);
}

// Event listeners
sendOtpBtn.addEventListener('click', handleSendOTP);
verifyOtpBtn.addEventListener('click', handleVerifyOTP);

// Real-time validation
[firstNameInput, lastNameInput, phoneNumberInput].forEach(input => {
    input.addEventListener('input', () => {
        input.classList.remove('error', 'success');
        if (messageArea.classList.contains('error')) {
            clearMessage();
        }
    });
});

// OTP input formatting
otpInput.addEventListener('input', (e) => {
    // Only allow numbers
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    
    // Limit to 6 digits
    if (e.target.value.length > 6) {
        e.target.value = e.target.value.slice(0, 6);
    }
    
    // Remove error state when typing
    e.target.classList.remove('error');
    
    // Auto-verify when 6 digits are entered
    if (e.target.value.length === 6) {
        setTimeout(handleVerifyOTP, 500);
    }
});

// Phone number input formatting
phoneNumberInput.addEventListener('input', (e) => {
    // Only allow numbers
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// Enter key support
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (!isOtpSent && !sendOtpBtn.disabled) {
            handleSendOTP();
        } else if (isOtpSent && !verifyOtpBtn.disabled && otpInput.value.length === 6) {
            handleVerifyOTP();
        }
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    firstNameInput.focus();
    clearMessage();
});
