import { db, auth } from "../firebase.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const totalProducts = document.getElementById("totalProducts");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "vendor-login.html";
    return;
  }

  const q = query(
    collection(db, "products"),
    where("vendorId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  totalProducts.innerText = snapshot.size;

});

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
