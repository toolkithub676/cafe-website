import { db, auth } from "../firebase.js";

import {
collection,
query,
where,
getDocs,
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productsDiv = document.getElementById("products");

async function loadProducts() {

if (!auth.currentUser) {

alert("Please login first.");

window.location.href = "vendor-login.html";

return;

}

productsDiv.innerHTML = "Loading Products...";

const q = query(
collection(db, "products"),
where("vendorId", "==", auth.currentUser.uid)
);

const snapshot = await getDocs(q);

productsDiv.innerHTML = "";

if (snapshot.empty) {

productsDiv.innerHTML = "<h3>No Products Added Yet</h3>";

return;

}

snapshot.forEach((productDoc) => {

const product = productDoc.data();

productsDiv.innerHTML += `

<div class="card">

<img src="${product.image}">

<h2>${product.name}</h2>

<p>${product.description}</p>

<h3>₹${product.price}</h3>

<div class="buttons">

<button class="edit">Edit</button>

<button class="delete" onclick="deleteProduct('${productDoc.id}')">Delete</button>

</div>

</div>

`;

});

}

window.deleteProduct = async (id) => {

if (confirm("Delete this product?")) {

await deleteDoc(doc(db, "products", id));

loadProducts();

}

};

loadProducts();
