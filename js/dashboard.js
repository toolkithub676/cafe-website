import { auth } from "../firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Login check
onAuthStateChanged(auth, (user) => {

  if (!user) {
    window.location.href = "vendor-login.html";
    return;
  }

});

// Logout
document.getElementById("logout").addEventListener("click", async () => {

  const confirmLogout = confirm("Are you sure you want to logout?");

  if (!confirmLogout) return;

  try {

    await signOut(auth);

    alert("Logout Successful");

    window.location.href = "vendor-login.html";

  } catch (error) {

    alert(error.message);

  }

});
