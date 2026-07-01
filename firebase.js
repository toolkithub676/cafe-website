import { db } from "../firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

alert("Script Loaded");

const productContainer = document.getElementById("productContainer");

async function loadProducts() {

    alert("Loading Products");

    const snapshot = await getDocs(collection(db, "products"));

    alert("Total Products : " + snapshot.size);

}

loadProducts();
