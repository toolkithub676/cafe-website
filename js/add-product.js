/*
====================================
Brew Haven
Add Product
Version 2.0
====================================
*/

import { db, auth } from "../firebase.js";

import {
    collection,
    addDoc,
    doc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const form = document.getElementById("productForm");
const message = document.getElementById("message");

let currentUser = null;
let vendorData = null;

/* ==========================
   AUTH CHECK
========================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        alert("Please login as Vendor.");

        window.location.href = "vendor-login.html";

        return;

    }

    currentUser = user;

    try {

        const vendorRef = doc(db, "vendors", user.uid);

        const vendorSnap = await getDoc(vendorRef);

        if (!vendorSnap.exists()) {

            alert("Become a Vendor first.");

            window.location.href = "vendor-signup.html";

            return;

        }

        vendorData = vendorSnap.data();

    }

    catch (error) {

        console.error(error);

    }

});

/* ==========================
   ADD PRODUCT
========================== */

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!currentUser || !vendorData) {

        alert("Vendor information not loaded.");

        return;

    }

    const name = document.getElementById("name").value.trim();

    const description = document.getElementById("description").value.trim();

    const category = document.getElementById("category").value;

    const price = Number(document.getElementById("price").value);

    const stock = Number(document.getElementById("stock").value);

    const preparationTime = Number(
        document.getElementById("preparationTime").value
    );

    const available =
        document.getElementById("available").value === "true";

    const file =
        document.getElementById("image").files[0];

    /* ========= Validation ========= */

    if (!file) {

        message.style.color = "red";

        message.innerHTML = "Please select product image.";

        return;

    }

    if (price <= 0) {

        message.style.color = "red";

        message.innerHTML = "Invalid price.";

        return;

    }

    if (stock < 0) {

        message.style.color = "red";

        message.innerHTML = "Invalid stock.";

        return;

    }

    message.style.color = "lightgreen";

    message.innerHTML = "Uploading Image...";

    const data = new FormData();

    data.append("file", file);

    data.append("upload_preset", "brewhaven");

    try {

        const upload = await fetch(

            "https://api.cloudinary.com/v1_1/gggj105m/image/upload",

            {

                method: "POST",

                body: data

            }

        );

        const imageData = await upload.json();

        if (!imageData.secure_url) {

            throw new Error(
                imageData.error?.message ||
                "Image Upload Failed"
            );

        }
              const product = {

            // Vendor Information
            vendorId: currentUser.uid,
            vendorEmail: currentUser.email,
            vendorName: vendorData.ownerName,
            shopName: vendorData.shopName,

            // Product Information
            name,
            description,
            category,

            // Pricing
            price,

            // Inventory
            stock,
            available,
            preparationTime,

            // Image
            image: imageData.secure_url,

            // Statistics
            rating: 0,
            totalReviews: 0,
            totalOrders: 0,

            // Metadata
            createdAt: serverTimestamp()

        };

        await addDoc(
            collection(db, "products"),
            product
        );

        message.style.color = "lightgreen";

        message.innerHTML =
            "✅ Product Added Successfully";

        form.reset();

    }

    catch (error) {

        console.error(error);

        message.style.color = "red";

        message.innerHTML =
            error.message || "Failed to add product.";

    }

});
