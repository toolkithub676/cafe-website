import { db } from "../firebase.js";

import {
collection,
getDocs,
deleteDoc,
doc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const productsDiv=document.getElementById("products");

async function loadProducts(){

productsDiv.innerHTML="Loading Products...";

const snapshot=await getDocs(collection(db,"products"));

productsDiv.innerHTML="";

snapshot.forEach((productDoc)=>{

const product=productDoc.data();

productsDiv.innerHTML+=`

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

window.deleteProduct=async(id)=>{

if(confirm("Delete this product?")){

await deleteDoc(doc(db,"products",id));

loadProducts();

}

}

loadProducts();
