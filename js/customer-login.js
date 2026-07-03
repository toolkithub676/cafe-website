/*
====================================
Brew Haven
Customer Login
Version 2.0
====================================
*/

import { auth, db } from "../firebase.js";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================
// Elements
// ======================

const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const message = document.getElementById("message");

const togglePassword = document.getElementById("togglePassword");
const forgotPassword = document.getElementById("forgotPassword");
const googleLogin = document.getElementById("googleLogin");

// ======================
// Auto Login
// ======================

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {

    const data = userSnap.data();

    if (data.isBlocked) {

      message.style.color = "red";
      message.innerHTML = "Your account has been blocked.";

      return;
    }

    window.location.href = "index.html";
  }

});

// ======================
// Login
// ======================

loginForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  message.style.color = "white";
  message.innerHTML = "Logging in...";

  try {

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email.value.trim(),
        password.value
      );

    const uid = userCredential.user.uid;

    const userRef = doc(db, "users", uid);

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {

      message.style.color = "red";
      message.innerHTML = "User profile not found.";

      return;
    }

    const userData = userSnap.data();

    if (userData.isBlocked) {

      message.style.color = "red";
      message.innerHTML = "Your account has been blocked.";

      return;

    }

    await updateDoc(userRef, {

      lastLogin: serverTimestamp()

    });

    message.style.color = "lightgreen";
    message.innerHTML = "✅ Login Successful";

    setTimeout(() => {

      window.location.href = "index.html";

    }, 1000);

  } catch (error) {

    let msg = "Login Failed.";

    switch (error.code) {

      case "auth/invalid-email":
        msg = "Invalid email address.";
        break;

      case "auth/user-not-found":
        msg = "No account found.";
        break;

      case "auth/wrong-password":
      case "auth/invalid-credential":
        msg = "Incorrect email or password.";
        break;

      case "auth/too-many-requests":
        msg = "Too many attempts. Try again later.";
        break;
    }

    message.style.color = "red";
    message.innerHTML = msg;

  }

});

// ======================
// Show / Hide Password
// ======================

togglePassword.addEventListener("click", () => {

  if (password.type === "password") {

    password.type = "text";
    togglePassword.innerHTML = "🙈";

  } else {

    password.type = "password";
    togglePassword.innerHTML = "👁️";

  }

});

// ======================
// Forgot Password
// ======================

forgotPassword.addEventListener("click", async (e) => {

  e.preventDefault();

  if (email.value.trim() === "") {

    alert("Please enter your email first.");

    return;

  }

  try {

    await sendPasswordResetEmail(auth, email.value.trim());

    alert("Password reset email sent.");

  } catch (error) {

    alert(error.message);

  }

});

// ======================
// Google Login
// ======================

googleLogin.addEventListener("click", () => {

  alert("Google Login Coming Soon");

});
