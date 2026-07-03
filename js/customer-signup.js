/*
====================================
Brew Haven
Customer Signup
Version 2.0
====================================
*/

import { auth, db } from "../firebase.js";

import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ======================
// Elements
// ======================

const signupForm = document.getElementById("signupForm");

const name = document.getElementById("name");
const email = document.getElementById("email");
const phone = document.getElementById("phone");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const message = document.getElementById("message");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const googleSignup = document.getElementById("googleSignup");

// ======================
// Toggle Password
// ======================

togglePassword.onclick = () => {

    password.type =
        password.type === "password" ? "text" : "password";

};

toggleConfirmPassword.onclick = () => {

    confirmPassword.type =
        confirmPassword.type === "password" ? "text" : "password";

};

// ======================
// Signup
// ======================

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.style.color = "white";
    message.innerHTML = "Creating Account...";

    if (password.value !== confirmPassword.value) {

        message.style.color = "red";
        message.innerHTML = "Passwords do not match.";

        return;

    }

    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email.value.trim(),
                password.value
            );

        await updateProfile(userCredential.user, {

            displayName: name.value.trim()

        });

        // Save User

        await setDoc(
            doc(db, "users", userCredential.user.uid),
            {

                uid: userCredential.user.uid,

                name: name.value.trim(),

                email: email.value.trim(),

                phone: phone.value.trim(),

                role: "customer",

                isVendor: false,

                photoURL: "",

                defaultAddress: "",

                isBlocked: false,

                createdAt: serverTimestamp(),

                lastLogin: serverTimestamp()

            }
        );

        message.style.color = "lightgreen";
        message.innerHTML =
            "✅ Account Created Successfully";

        setTimeout(() => {

            window.location.href = "index.html";

        }, 1000);

    } catch (error) {

        let msg = error.message;

        if (error.code === "auth/email-already-in-use") {

            msg = "This email is already registered.";

        }

        if (error.code === "auth/weak-password") {

            msg = "Password should be at least 6 characters.";

        }

        if (error.code === "auth/invalid-email") {

            msg = "Invalid email address.";

        }

        message.style.color = "red";
        message.innerHTML = msg;

    }

});

// ======================
// Google Signup
// ======================

googleSignup.addEventListener("click", () => {

    alert("Google Signup Coming Soon");

});
