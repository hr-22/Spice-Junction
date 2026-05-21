// ============================================
//   SPICE JUNCTION — ADMIN PANEL SCRIPT
//
//   TEST CREDENTIALS (pre-created in Firebase Auth):
//   Email:    admin@spicejunction.in
//   Password: Admin@1234
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

// ---- SAFE FIREBASE INIT ----
var firebaseReady = false;

try {
  if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("Firebase config not set. Admin panel will not work until configured.");
  } else {
    firebase.initializeApp(firebaseConfig);
    firebaseReady = true;
  }
} catch (err) {
  console.error("Firebase init error:", err);
}

var db   = firebaseReady ? firebase.firestore() : null;
var auth = firebaseReady ? firebase.auth()      : null;

// ---- DOM REFERENCES ----
var loginSection     = document.getElementById("loginSection");
var dashboardSection = document.getElementById("dashboardSection");
var loginError       = document.getElementById("loginError");
var loginBtn         = document.getElementById("loginBtn");
var loadingMsg       = document.getElementById("loadingMsg");
var emptyMsg         = document.getElementById("emptyMsg");
var tableWrapper     = document.getElementById("tableWrapper");
var applicationsBody = document.getElementById("applicationsBody");
var welcomeMsg       = document.getElementById("welcomeMsg");

// ============================================================
//   ON PAGE LOAD: Check if user is already logged in
//   onAuthStateChanged fires immediately on load with current state
// ============================================================
if (auth) {
  auth.onAuthStateChanged(function(user) {
    if (user) {
      showDashboard(user);
    } else {
      showLoginForm();
    }
  });
} else {
  // Firebase not configured — shows a helpful message on the login form
  showLoginForm();
  showLoginError(
    "⚠️ Firebase is not configured. Open admin.js and replace the " +
    "placeholder config values with your real Firebase project credentials."
  );
}

// ============================================================
//   SHOW / HIDE SECTIONS
// ============================================================
function showLoginForm() {
  loginSection.style.display     = "flex";
  dashboardSection.style.display = "none";
}

function showLoginError(message) {
  loginError.textContent   = message;
  loginError.style.display = "block";
}

// ============================================================
//   HANDLE LOGIN BUTTON CLICK
// ============================================================
function handleLogin() {
  // Guard: Firebase not ready
  if (!auth) {
    showLoginError("Firebase is not configured. Cannot log in.");
    return;
  }

  var email    = document.getElementById("adminEmail").value.trim();
  var password = document.getElementById("adminPassword").value;

  // Basic empty check
  if (!email || !password) {
    showLoginError("Please enter both email and password.");
    return;
  }

  // Disable button during auth request
  loginBtn.disabled    = true;
  loginBtn.textContent = "Logging in...";
  loginError.style.display = "none";

  // Firebase Email/Password sign-in
  auth.signInWithEmailAndPassword(email, password)
    .then(function() {
      // onAuthStateChanged fires → showDashboard() called automatically
      loginBtn.disabled    = false;
      loginBtn.textContent = "Login";
    })
    .catch(function(error) {
      console.error("Login failed:", error.code);

      // Map Firebase error codes to friendly messages
      var msg = "Invalid email or password. Please try again.";
      if (error.code === "auth/user-not-found")     msg = "No account found with this email.";
      if (error.code === "auth/wrong-password")     msg = "Incorrect password. Please try again.";
      if (error.code === "auth/invalid-email")      msg = "Please enter a valid email address.";
      if (error.code === "auth/too-many-requests")  msg = "Too many attempts. Please try again later.";
      if (error.code === "auth/network-request-failed") msg = "Network error. Check your internet connection.";

      showLoginError(msg);
      loginBtn.disabled    = false;
      loginBtn.textContent = "Login";
    });
}

// ============================================================
//   SHOW DASHBOARD after successful login
// ============================================================
function showDashboard(user) {
  loginSection.style.display     = "none";
  dashboardSection.style.display = "block";
  welcomeMsg.textContent         = "Logged in as: " + user.email;
  fetchApplications();
}

// ============================================================
//   FETCH ALL APPLICATIONS FROM FIRESTORE
//   Sorted by submittedAt descending (newest first)
// ============================================================
function fetchApplications() {
  // Show loading state, hide others
  loadingMsg.style.display   = "block";
  emptyMsg.style.display     = "none";
  tableWrapper.style.display = "none";
  applicationsBody.innerHTML = "";

  if (!db) {
    loadingMsg.textContent = "Firebase not configured. Cannot fetch applications.";
    return;
  }

  db.collection("applications")
    .orderBy("submittedAt", "desc")
    .get()
    .then(function(querySnapshot) {
      loadingMsg.style.display = "none";

      if (querySnapshot.empty) {
        emptyMsg.style.display = "block";
        return;
      }

      var serialNo = 1;

      querySnapshot.forEach(function(doc) {
        var data = doc.data();
        var row  = document.createElement("tr");

        row.innerHTML =
          "<td>" + serialNo + "</td>" +
          "<td>" + escapeHtml(data.fullName   || "—") + "</td>" +
          "<td>" + escapeHtml(data.email      || "—") + "</td>" +
          "<td>" + escapeHtml(data.phone      || "—") + "</td>" +
          "<td>" + escapeHtml(data.position   || "—") + "</td>" +
          "<td>" + (data.experience !== undefined ? data.experience : "—") + "</td>" +
          "<td>" + escapeHtml(data.reason     || "—") + "</td>" +
          "<td>" + formatDate(data.submittedAt) + "</td>";

        applicationsBody.appendChild(row);
        serialNo++;
      });

      tableWrapper.style.display = "block";
    })
    .catch(function(error) {
      console.error("Firestore fetch error:", error);
      loadingMsg.textContent =
        "Failed to load applications. Error: " + error.message;
    });
}

// ============================================================
//   HANDLE LOGOUT
// ============================================================
function handleLogout() {
  if (!auth) return;

  auth.signOut()
    .then(function() {
      console.log("Logged out.");
      // onAuthStateChanged fires → showLoginForm() called automatically
    })
    .catch(function(error) {
      console.error("Logout error:", error);
    });
}

// ============================================================
//   HELPER: Format ISO timestamp into readable local date
// ============================================================
function formatDate(isoString) {
  if (!isoString) return "—";
  try {
    var date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    });
  } catch (e) {
    return isoString;
  }
}

// ============================================================
//   HELPER: Escape HTML to prevent XSS from user-submitted data
// ============================================================
function escapeHtml(text) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}

// ---- Allow Enter key to trigger login ----
document.getElementById("adminPassword").addEventListener("keydown", function(e) {
  if (e.key === "Enter") handleLogin();
});
