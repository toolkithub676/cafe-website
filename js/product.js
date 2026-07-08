/*
====================================
Brew Haven
Product Page
Version 1.0
====================================
*/

import { db, auth } from "../firebase.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ==========================
        ELEMENTS
========================== */

const productImage = document.getElementById("productImage");
const productName = document.getElementById("productName");
const reviewCount = document.getElementById("reviewCount");
const shopName = document.getElementById("shopName");
const price = document.getElementById("price");
const stock = document.getElementById("stock");
const prepTime = document.getElementById("prepTime");
const availability = document.getElementById("availability");
const description = document.getElementById("description");

const minus = document.getElementById("minus");
const plus = document.getElementById("plus");
const quantity = document.getElementById("quantity");

const cartBtn = document.getElementById("cartBtn");
const buyBtn = document.getElementById("buyBtn");
const wishlistBtn = document.getElementById("wishlistBtn");

const relatedContainer =
document.getElementById("relatedContainer");

/* ==========================
        VARIABLES
========================== */

let currentUser = null;

let currentProduct = null;

let qty = 1;

/* ==========================
        LOGIN CHECK
========================== */

onAuthStateChanged(auth, (user)=>{

    currentUser = user;

});

/* ==========================
      GET PRODUCT ID
========================== */

const params = new URLSearchParams(window.location.search);

const productId = params.get("id");

if(!productId){

    alert("Invalid Product");

    window.location.href="index.html";

}

/* ==========================
      LOAD PRODUCT
========================== */

async function loadProduct(){

    try{

        const productRef =
        doc(db,"products",productId);

        const productSnap =
        await getDoc(productRef);

        if(!productSnap.exists()){

            alert("Product Not Found");

            window.location.href="index.html";

            return;

        }

        currentProduct = productSnap.data();

        productImage.src=currentProduct.image;

        productName.innerHTML=currentProduct.name;

        reviewCount.innerHTML=
        `(${currentProduct.totalReviews} Reviews)`;

        shopName.innerHTML=
        currentProduct.shopName;

        price.innerHTML=
        `₹${currentProduct.price}`;

        stock.innerHTML=
        currentProduct.stock;

        prepTime.innerHTML=
        currentProduct.preparationTime;

        description.innerHTML=
        currentProduct.description;

        if(
            currentProduct.available &&
            currentProduct.stock>0
        ){

            availability.innerHTML=
            "✅ Available";

            availability.style.background=
            "#d4edda";

            availability.style.color=
            "#0f5132";

        }

        else{

            availability.innerHTML=
            "❌ Out Of Stock";

            availability.style.background=
            "#f8d7da";

            availability.style.color=
            "#842029";

            cartBtn.disabled=true;

            buyBtn.disabled=true;

        }

    }

    catch(error){

        console.log(error);

        alert(error.message);

    }

}

loadProduct();

/* ==========================
      QUANTITY
========================== */

plus.addEventListener("click",()=>{

    if(
        qty < currentProduct.stock
    ){

        qty++;

        quantity.innerHTML=qty;

    }

});

minus.addEventListener("click",()=>{

    if(qty>1){

        qty--;

        quantity.innerHTML=qty;

    }

});
/* ==========================
      ADD TO CART
========================== */

cartBtn.addEventListener("click", async () => {

    await window.addToCart({

        productId: productId,

        vendorId: currentProduct.vendorId,

        shopName: currentProduct.shopName,

        category: currentProduct.category,

        name: currentProduct.name,

        image: currentProduct.image,

        price: currentProduct.price,

        stock: currentProduct.stock,

        preparationTime: currentProduct.preparationTime

    }, qty);

});

/* ==========================
        BUY NOW
========================== */

buyBtn.addEventListener("click", async () => {

    await window.addToCart({

        productId: productId,

        vendorId: currentProduct.vendorId,

        shopName: currentProduct.shopName,

        category: currentProduct.category,

        name: currentProduct.name,

        image: currentProduct.image,

        price: currentProduct.price,

        stock: currentProduct.stock,

        preparationTime: currentProduct.preparationTime

    }, qty);

    window.location.href = "checkout.html";

});

/* ==========================
      WISHLIST
========================== */

wishlistBtn.addEventListener("click", () => {

    if (!currentUser) {

        window.location.href = "customer-login.html";

        return;

    }

    alert("❤️ Wishlist Coming Soon");

});

/* ==========================
   RELATED PRODUCTS
========================== */

async function loadRelatedProducts() {

    try {

        const q = query(
            collection(db, "products"),
            where("vendorId", "==", currentProduct.vendorId)
        );

        const snapshot = await getDocs(q);

        relatedContainer.innerHTML += `

<div class="card"
onclick="location.href='product.html?id=${docSnap.id}'">

    <img src="${product.image}" alt="${product.name}">

    <h3>${product.name}</h3>

    <h4>₹${product.price}</h4>

    <button
    onclick="event.stopPropagation();window.addToCart({

        productId:'${docSnap.id}',

        vendorId:'${product.vendorId}',

        shopName:'${product.shopName}',

        category:'${product.category}',

        name:'${product.name}',

        image:'${product.image}',

        price:${product.price},

        stock:${product.stock},

        preparationTime:${product.preparationTime}

    },1);">

    🛒 Add To Cart

    </button>

</div>

`;

        });

    } catch (error) {

        console.log(error);

    }

}

loadRelatedProducts();
