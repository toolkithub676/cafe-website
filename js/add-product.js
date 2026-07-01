import { db } from "../firebase.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form = document.getElementById("productForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const product = {
        name: document.getElementById("name").value,
        description: document.getElementById("description").value,
        price: Number(document.getElementById("price").value),
        category: document.getElementById("category").value,
        image: document.getElementById("image").value,
        createdAt: new Date()
    };

    try{

        await addDoc(collection(db,"products"), product);

        message.textContent = "✅ Product Added Successfully";

        form.reset();

    }catch(error){

        console.error(error);

        message.textContent = "❌ Failed to save product";

    }

});
