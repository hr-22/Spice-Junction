// ============================================
//   SPICE JUNCTION — CAREERS PAGE SCRIPT
//   Handles form validation + Firestore write
// ============================================

// ---- FIREBASE CONFIG ----
var firebaseConfig = {
  apiKey: "AIzaSyAUaufXZHuWCAvRgx4oFIJaJLz6192yn1E",
  authDomain: "spice-junction-c26ea.firebaseapp.com",
  projectId: "spice-junction-c26ea",
  storageBucket: "spice-junction-c26ea.firebasestorage.app",
  messagingSenderId: "418200232188",
  appId: "1:418200232188:web:47b9dfd5b9d742bf7a3779"
};

// ---- CHECK: Has the user filled in real Firebase credentials? ----
var firebaseReady = false;

try {
  // Only initialize if the config looks real (not placeholder values)
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    // Config is still placeholder — don't crash, just disable Firebase
    console.warn("Firebase config not set. Firestore writes will be skipped.");
  } else {
    firebase.initializeApp(firebaseConfig);
    firebaseReady = true;
  }
} catch (err) {
  console.error("Firebase init error:", err);
}

// Get Firestore reference only if Firebase initialized correctly
var db = firebaseReady ? firebase.firestore() : null;

// ---- DOM REFERENCES ----
var form          = document.getElementById("applicationForm");
var submitBtn     = document.getElementById("submitBtn");
var successBanner = document.getElementById("successBanner");
var errorBanner   = document.getElementById("errorBanner");

// ---- HELPER: Show inline error below a field ----
function showError(fieldId, message) {
  var errorSpan = document.getElementById(fieldId + "Error");
  var inputEl   = document.getElementById(fieldId);
  if (errorSpan) errorSpan.textContent = message;
  if (inputEl)   inputEl.classList.add("invalid");
}

// ---- HELPER: Clear inline error for a field ----
function clearError(fieldId) {
  var errorSpan = document.getElementById(fieldId + "Error");
  var inputEl   = document.getElementById(fieldId);
  if (errorSpan) errorSpan.textContent = "";
  if (inputEl)   inputEl.classList.remove("invalid");
}

// ---- VALIDATE ALL FIELDS ----
// Returns true if all fields are valid, false if anything fails
function validateForm() {
  var isValid = true;

  // Clear all previous error messages first
  clearError("fullName");
  clearError("email");
  clearError("phone");
  clearError("position");
  clearError("experience");
  clearError("reason");

  var fullName   = document.getElementById("fullName").value.trim();
  var email      = document.getElementById("email").value.trim();
  var phone      = document.getElementById("phone").value.trim();
  var position   = document.getElementById("position").value;
  var experience = document.getElementById("experience").value;
  var reason     = document.getElementById("reason").value.trim();

  // Full Name
  if (fullName === "") {
    showError("fullName", "Name is required.");
    isValid = false;
  }

  // Email — basic format check
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === "") {
    showError("email", "Email is required.");
    isValid = false;
  } else if (!emailRegex.test(email)) {
    showError("email", "Please enter a valid email address.");
    isValid = false;
  }

  // Phone — must be 10 digits
  var phoneRegex = /^[0-9]{10}$/;
  if (phone === "") {
    showError("phone", "Phone number is required.");
    isValid = false;
  } else if (!phoneRegex.test(phone)) {
    showError("phone", "Please enter a valid 10-digit phone number.");
    isValid = false;
  }

  // Position dropdown
  if (position === "") {
    showError("position", "Please select a position.");
    isValid = false;
  }

  // Experience — must be 0 or more
  if (experience === "" || Number(experience) < 0) {
    showError("experience", "Please enter a valid number of years (0 or more).");
    isValid = false;
  }

  // Reason — minimum 20 characters
  if (reason === "") {
    showError("reason", "This field is required.");
    isValid = false;
  } else if (reason.length < 20) {
    showError("reason", "Minimum 20 characters required. Currently: " + reason.length);
    isValid = false;
  }

  return isValid;
}

// ---- RESET BUTTON STATE ----
function resetButton() {
  submitBtn.disabled    = false;
  submitBtn.textContent = "Submit Application";
}

// ---- SHOW PAGE-LEVEL ERROR (for Firebase failures) ----
function showPageError(message) {
  errorBanner.textContent   = message;
  errorBanner.style.display = "block";
  errorBanner.scrollIntoView({ behavior: "smooth" });
}

// ---- FORM SUBMIT HANDLER ----
form.addEventListener("submit", function(event) {
  event.preventDefault(); // stop browser page reload

  // Hide any previous banners
  successBanner.style.display = "none";
  errorBanner.style.display   = "none";

  // Stop if validation fails
  if (!validateForm()) {
    return;
  }

  // Collect form data
  var applicationData = {
    fullName:    document.getElementById("fullName").value.trim(),
    email:       document.getElementById("email").value.trim(),
    phone:       document.getElementById("phone").value.trim(),
    position:    document.getElementById("position").value,
    experience:  Number(document.getElementById("experience").value),
    reason:      document.getElementById("reason").value.trim(),
    submittedAt: new Date().toISOString()
  };

  // ---- If Firebase is NOT set up yet, show a clear message ----
  if (!firebaseReady || !db) {
    showPageError(
      "⚠️ Firebase is not configured yet. Please open careers.js and replace " +
      "the placeholder values (YOUR_API_KEY, YOUR_PROJECT_ID, etc.) with your " +
      "real Firebase project config from console.firebase.google.com."
    );
    return;
  }

  // Disable button while writing to Firestore
  submitBtn.disabled    = true;
  submitBtn.textContent = "Submitting...";

  // ---- Set a 10-second timeout in case Firebase hangs ----
  var timeoutId = setTimeout(function() {
    resetButton();
    showPageError(
      "Request timed out. Check your Firebase config, internet connection, " +
      "and make sure Firestore is enabled in your Firebase project."
    );
  }, 10000);

  // ---- WRITE TO FIRESTORE ----
  db.collection("applications").add(applicationData)
    .then(function(docRef) {
      clearTimeout(timeoutId); // cancel the timeout — we got a response

      console.log("Application saved! Doc ID:", docRef.id);

      // Show green success banner
      successBanner.style.display = "block";
      successBanner.scrollIntoView({ behavior: "smooth" });

      // Clear the form
      form.reset();
      resetButton();
    })
    .catch(function(error) {
      clearTimeout(timeoutId); // cancel timeout — we got an error response

      console.error("Firestore write failed:", error);

      // Show error on page (no alert)
      showPageError(
        "Submission failed: " + error.message +
        " — Make sure Firestore is enabled in your Firebase project (test mode)."
      );
      resetButton();
    });
});
