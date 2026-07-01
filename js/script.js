import { db } from "../firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productContainer = document.getElementById("productContainer");

async function loadProducts() {
  productContainer.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "products"));

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
    productContainer.innerHTML = "<h3>Error loading products.</h3>";
  }
}

loadProducts();
alert("Script Loaded");
