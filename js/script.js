import { db } from "../firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productContainer = document.getElementById("productContainer");

// ======================
// Mobile Menu
// ======================

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {

  menuToggle.addEventListener("click", () => {

    navMenu.classList.toggle("active");

  });

}

// ======================
// Load Products
// ======================

async function loadProducts() {

  productContainer.innerHTML = "<h3>Loading...</h3>";

  try {

    const snapshot = await getDocs(collection(db, "products"));

    productContainer.innerHTML = "";

    if (snapshot.empty) {

      productContainer.innerHTML = "<h3>No Products Found</h3>";

      return;

    }

    snapshot.forEach((doc) => {

      const product = doc.data();

      productContainer.innerHTML += `

      <div class="card">

        <img src="${product.image}" alt="${product.name}">

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <h4>₹${product.price}</h4>

        <button>Add To Cart</button>

      </div>

      `;

    });

  } catch (error) {

    console.error(error);

    productContainer.innerHTML = `
      <h3 style="color:red;">Error Loading Products</h3>
      <p>${error.message}</p>
    `;

  }

}

loadProducts();
