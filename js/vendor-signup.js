/*
====================================
Brew Haven
Become a Vendor
Version 3.0
====================================
*/

import { auth, db } from "../firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form = document.getElementById("signupForm");
const message = document.getElementById("message");

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (!user) {

        window.location.href = "customer-login.html";
        return;

    }

    currentUser = user;

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const shopName = document.getElementById("shopName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();

    try {

        const userRef = doc(db, "users", currentUser.uid);

        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {

            message.style.color = "red";
            message.innerHTML = "User profile not found.";

            return;

        }

        await updateDoc(userRef, {

            isVendor: true

        });

        await setDoc(doc(db, "vendors", currentUser.uid), {

            uid: currentUser.uid,

            shopName,

            phone,

            address,

            category,

            description,

            email: currentUser.email,

            ownerName: userSnap.data().name,

            createdAt: serverTimestamp(),

            status: "active"

        });

        message.style.color = "lightgreen";

        message.innerHTML = "✅ Vendor Registration Successful";

        setTimeout(() => {

            window.location.href = "vendor-dashboard.html";

        }, 1000);

    } catch (error) {

        message.style.color = "red";

        message.innerHTML = error.message;

    }

});
