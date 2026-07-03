import { auth, db } from "../firebase.js";

import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  getDoc
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

    const customerRef = doc(db, "customers", user.uid);
    const customerSnap = await getDoc(customerRef);

    if (customerSnap.exists()) {

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

        const userCredential = await signInWithEmailAndPassword(
            auth,
            email.value.trim(),
            password.value
        );

        const customerRef = doc(db, "customers", userCredential.user.uid);

        const customerSnap = await getDoc(customerRef);

        if (!customerSnap.exists()) {

            message.style.color = "red";
            message.innerHTML = "Customer account not found.";

            return;

        }

        message.style.color = "lightgreen";
        message.innerHTML = "✅ Login Successful";

        setTimeout(() => {

            window.location.href = "index.html";

        },1000);

    }

    catch(error){

        message.style.color="red";

        message.innerHTML=error.message;

    }

});

// ======================
// Show Password
// ======================

togglePassword.addEventListener("click",()=>{

    if(password.type==="password"){

        password.type="text";

        togglePassword.innerHTML="🙈";

    }

    else{

        password.type="password";

        togglePassword.innerHTML="👁️";

    }

});

// ======================
// Forgot Password
// ======================

forgotPassword.addEventListener("click",async(e)=>{

    e.preventDefault();

    if(email.value.trim()===""){

        alert("Enter your email first.");

        return;

    }

    try{

        await sendPasswordResetEmail(auth,email.value.trim());

        alert("Password reset email sent.");

    }

    catch(error){

        alert(error.message);

    }

});

// ======================
// Google Login
// ======================

googleLogin.addEventListener("click",()=>{

    alert("Google Login will be enabled soon.");

});
