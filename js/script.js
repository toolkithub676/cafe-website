/*
====================================
Brew Haven
Home Script
Version 2.0
====================================
*/

import { db, auth } from "../firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import "./cart.js";

// ======================
// Elements
// ======================

const productContainer = document.getElementById("productContainer");

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

const accountBtn = document.getElementById("accountBtn");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const vendorLink = document.getElementById("vendorLink");
const logoutBtn = document.getElementById("logoutBtn");
const profileDropdown = document.getElementById("profileDropdown");

// ======================
// Mobile Menu
// ======================

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        navMenu.classList.toggle("active");

    });

}

// ======================
// Authentication
// ======================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        if(accountBtn){

            accountBtn.innerHTML="👤 Account";

            accountBtn.href="account.html";

        }

        return;

    }

    try{

        const userRef=doc(db,"users",user.uid);

        const userSnap=await getDoc(userRef);

        if(!userSnap.exists()) return;

        const data=userSnap.data();

        accountBtn.innerHTML=`👤 ${data.name}`;

        accountBtn.href="#";

        userName.innerHTML=data.name;

        userEmail.innerHTML=data.email;

        if(data.isVendor){

            vendorLink.innerHTML="🏪 Vendor Dashboard";

            vendorLink.href="vendor-dashboard.html";

        }else{

            vendorLink.innerHTML="🏪 Become a Vendor";

            vendorLink.href="vendor-signup.html";

        }

    }

    catch(error){

        console.log(error);

    }

});
// ======================
// Profile Dropdown
// ======================

if (accountBtn && profileDropdown) {

    accountBtn.addEventListener("click", (e) => {

        if (accountBtn.getAttribute("href") === "account.html") return;

        e.preventDefault();

        profileDropdown.classList.toggle("show");

    });

    document.addEventListener("click", (e) => {

        if (
            !profileDropdown.contains(e.target) &&
            !accountBtn.contains(e.target)
        ) {

            profileDropdown.classList.remove("show");

        }

    });

}

// ======================
// Logout
// ======================

if (logoutBtn) {

    logoutBtn.addEventListener("click", async (e) => {

        e.preventDefault();

        try {

            await signOut(auth);

            alert("Logout Successful");

            window.location.reload();

        } catch (error) {

            alert(error.message);

        }

    });

}

// ======================
// Load Products
// ======================

async function loadProducts() {

    if (!productContainer) return;

    productContainer.innerHTML = "<h3>Loading...</h3>";

    try {

        const snapshot = await getDocs(collection(db, "products"));

        productContainer.innerHTML = "";

        if (snapshot.empty) {

            productContainer.innerHTML = "<h3>No Products Found</h3>";

            return;

        }

        snapshot.forEach((productDoc) => {

            const product = productDoc.data();

            productContainer.innerHTML += `

            <div class="card">

                <img src="${product.image}" alt="${product.name}">

                <h3>${product.name}</h3>

                <p>${product.description}</p>

                <h4>₹${product.price}</h4>

                <button
class="add-cart"

data-id="${productDoc.id}"

data-vendor="${product.vendorId}"

data-shop="${product.shopName}"

data-category="${product.category}"

data-name="${product.name}"

data-image="${product.image}"

data-price="${product.price}"

data-stock="${product.stock}"

data-prep="${product.preparationTime}">

🛒 Add To Cart

</button>

            </div>

            `;

        });

    } catch (error) {

        console.error(error);

        productContainer.innerHTML = `
            <h3 style="color:red;">
                Error Loading Products
            </h3>
            <p>${error.message}</p>
        `;

    }

}

loadProducts();

// ======================
// Future Cart Placeholder
// ======================

document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("add-cart")) return;

    await window.addToCart({

        productId: e.target.dataset.id,

        vendorId: e.target.dataset.vendor,

        shopName: e.target.dataset.shop,

        category: e.target.dataset.category,

        name: e.target.dataset.name,

        image: e.target.dataset.image,

        price: Number(e.target.dataset.price),

        stock: Number(e.target.dataset.stock),

        preparationTime: Number(e.target.dataset.prep)

    },1);

});

});
