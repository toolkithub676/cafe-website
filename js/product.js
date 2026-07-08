/*
====================================
Brew Haven
Product Page
Version 2.0
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

import "./cart.js";

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
      AUTH
========================== */

onAuthStateChanged(auth,(user)=>{

    currentUser = user || null;

});

/* ==========================
      PRODUCT ID
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

        currentProduct={

            id:productSnap.id,

            ...productSnap.data()

        };

        productImage.src=
        currentProduct.image ||
        "images/no-image.png";

        productImage.onerror=()=>{

            productImage.src=
            "images/no-image.png";

        };

        productName.textContent=
        currentProduct.name || "Product";

        reviewCount.textContent=
        `(${currentProduct.totalReviews || 0} Reviews)`;

        shopName.textContent=
        currentProduct.shopName || "Brew Haven";

        price.textContent=
        `₹${currentProduct.price || 0}`;

        stock.textContent=
        currentProduct.stock ?? 0;

        prepTime.textContent=
        currentProduct.preparationTime || 10;

        description.textContent=
        currentProduct.description ||
        "No Description Available";

        if(
            currentProduct.available !== false &&
            (currentProduct.stock ?? 0) > 0
        ){

            availability.textContent=
            "✅ Available";

            availability.style.background=
            "#d4edda";

            availability.style.color=
            "#0f5132";

            cartBtn.disabled=false;

            buyBtn.disabled=false;

        }

        else{

            availability.textContent=
            "❌ Out Of Stock";

            availability.style.background=
            "#f8d7da";

            availability.style.color=
            "#842029";

            cartBtn.disabled=true;

            buyBtn.disabled=true;

        }

        await loadRelatedProducts();

    }

    catch(error){

        console.error(error);

        alert("Unable To Load Product");

    }

}

loadProduct();

/* ==========================
      QUANTITY
========================== */

function updateQty(){

    quantity.textContent=qty;

}

updateQty();

plus?.addEventListener("click",()=>{

    if(!currentProduct) return;

    if(qty<(currentProduct.stock || 1)){

        qty++;

        updateQty();

    }

});

minus?.addEventListener("click",()=>{

    if(qty>1){

        qty--;

        updateQty();

    }

});

/* ==========================
      ADD TO CART
========================== */

cartBtn?.addEventListener("click",async()=>{

    if(!currentProduct) return;

    await window.addToCart({

        productId:currentProduct.id,

        vendorId:currentProduct.vendorId,

        shopName:currentProduct.shopName,

        category:currentProduct.category,

        name:currentProduct.name,

        image:currentProduct.image,

        price:Number(currentProduct.price),

        stock:Number(currentProduct.stock),

        preparationTime:Number(currentProduct.preparationTime)

    },qty);

});

/* ==========================
      BUY NOW
========================== */

buyBtn?.addEventListener("click",async()=>{

    if(!currentProduct) return;

    await window.addToCart({

        productId:currentProduct.id,

        vendorId:currentProduct.vendorId,

        shopName:currentProduct.shopName,

        category:currentProduct.category,

        name:currentProduct.name,

        image:currentProduct.image,

        price:Number(currentProduct.price),

        stock:Number(currentProduct.stock),

        preparationTime:Number(currentProduct.preparationTime)

    },qty);

    window.location.href="checkout.html";

});

/* ==========================
      WISHLIST
========================== */

wishlistBtn?.addEventListener("click",()=>{

    if(!currentUser){

        window.location.href=
        "customer-login.html";

        return;

    }

    alert("❤️ Wishlist Coming Soon");

});
/* ==========================
      RELATED PRODUCTS
========================== */

async function loadRelatedProducts(){

    if(!currentProduct || !relatedContainer) return;

    try{

        const q = query(

            collection(db,"products"),

            where("vendorId","==",currentProduct.vendorId)

        );

        const snapshot = await getDocs(q);

        relatedContainer.innerHTML = "";

        snapshot.forEach((docSnap)=>{

            if(docSnap.id===currentProduct.id) return;

            const product = docSnap.data();

            relatedContainer.innerHTML += `

<div class="card"

onclick="location.href='product.html?id=${docSnap.id}'">

<img

src="${product.image || 'images/no-image.png'}"

alt="${product.name}"

onerror="this.src='images/no-image.png'">

<h3>

${product.name}

</h3>

<p>

${product.description || "No Description Available"}

</p>

<h4>

₹${product.price}

</h4>

<button

class="related-cart"

data-id="${docSnap.id}"

data-vendor="${product.vendorId}"

data-shop="${product.shopName}"

data-category="${product.category}"

data-name="${product.name}"

data-image="${product.image}"

data-price="${product.price}"

data-stock="${product.stock}"

data-prep="${product.preparationTime}"

onclick="event.stopPropagation();">

🛒 Add To Cart

</button>

</div>

`;

        });

        if(snapshot.empty){

            relatedContainer.innerHTML =

            "<p>No Related Products</p>";

        }

    }

    catch(error){

        console.error(error);

        relatedContainer.innerHTML =

        "<p>Unable To Load Related Products</p>";

    }

}

/* ==========================
      RELATED CART
========================== */

document.addEventListener("click",async(e)=>{

    if(!e.target.classList.contains("related-cart")) return;

    try{

        await window.addToCart({

            productId:e.target.dataset.id,

            vendorId:e.target.dataset.vendor,

            shopName:e.target.dataset.shop,

            category:e.target.dataset.category,

            name:e.target.dataset.name,

            image:e.target.dataset.image,

            price:Number(e.target.dataset.price),

            stock:Number(e.target.dataset.stock),

            preparationTime:Number(e.target.dataset.prep)

        },1);

        alert("✅ Added To Cart");

    }

    catch(error){

        console.error(error);

        alert("Unable To Add Product");

    }

});

/* ==========================
      IMAGE FALLBACK
========================== */

productImage?.addEventListener("error",()=>{

    productImage.src="images/no-image.png";

});

/* ==========================
      PAGE READY
========================== */

window.reloadProduct = async()=>{

    await loadProduct();

};

/* ==========================
      END OF FILE
========================== */
