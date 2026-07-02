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
const totalOrders = document.getElementById("totalOrders");
const totalRevenue = document.getElementById("totalRevenue");

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "vendor-login.html";
    return;
  }

  // Products Count
  const productQuery = query(
    collection(db, "products"),
    where("vendorId", "==", user.uid)
  );

  const productSnapshot = await getDocs(productQuery);

  totalProducts.innerText = productSnapshot.size;

  // Orders Count
  const orderQuery = query(
    collection(db, "orders"),
    where("vendorId", "==", user.uid)
  );

  const orderSnapshot = await getDocs(orderQuery);

  totalOrders.innerText = orderSnapshot.size;

  // Revenue
  let revenue = 0;

  orderSnapshot.forEach((doc) => {
    const order = doc.data();

    if (order.totalPrice) {
      revenue += Number(order.totalPrice);
    }
  });

  totalRevenue.innerText = "₹" + revenue;

});

document.getElementById("logout").addEventListener("click", async () => {

  if (!confirm("Are you sure you want to logout?")) return;

  try {

    await signOut(auth);

    alert("Logout Successful");

    window.location.href = "vendor-login.html";

  } catch (error) {

    alert(error.message);

  }

});
