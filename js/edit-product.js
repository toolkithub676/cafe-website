import { db, auth } from "../firebase.js";

import {
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const form = document.getElementById("editForm");
const message = document.getElementById("message");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let currentImage = "";

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "vendor-login.html";
        return;
    }

    const ref = doc(db, "products", productId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        alert("Product not found");
        return;
    }

    const product = snap.data();

    if (product.vendorId !== user.uid) {
        alert("Unauthorized");
        window.location.href = "manage-products.html";
        return;
    }

    currentImage = product.image;

    document.getElementById("name").value = product.name;
    document.getElementById("description").value = product.description;
    document.getElementById("price").value = product.price;
    document.getElementById("category").value = product.category;

});

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    message.innerHTML = "Updating Product...";

    let imageUrl = currentImage;

    const file = document.getElementById("image").files[0];

    if (file) {

        const data = new FormData();

        data.append("file", file);
        data.append("upload_preset", "brewhaven");

        const upload = await fetch(
            "https://api.cloudinary.com/v1_1/gggj105m/image/upload",
            {
                method: "POST",
                body: data
            }
        );

        const imageData = await upload.json();

        imageUrl = imageData.secure_url;
    }

    await updateDoc(doc(db, "products", productId), {

        name: document.getElementById("name").value.trim(),

        description: document.getElementById("description").value.trim(),

        price: Number(document.getElementById("price").value),

        category: document.getElementById("category").value,

        image: imageUrl

    });

    message.style.color = "green";
    message.innerHTML = "✅ Product Updated";

    setTimeout(() => {

        window.location.href = "manage-products.html";

    },1000);

});
