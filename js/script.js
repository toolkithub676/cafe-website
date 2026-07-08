/*

Brew Haven
Home Script
Version 3.0

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

/* ======================
Elements
====================== */

const productContainer = document.getElementById("productContainer");

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

const accountBtn = document.getElementById("accountBtn");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const vendorLink = document.getElementById("vendorLink");
const logoutBtn = document.getElementById("logoutBtn");
const profileDropdown = document.getElementById("profileDropdown");

/* ======================
Search & Filter
====================== */

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortFilter = document.getElementById("sortFilter");

let allProducts = [];

/* ======================
Mobile Menu
====================== */

if(menuToggle && navMenu){

menuToggle.addEventListener("click",()=>{  

    navMenu.classList.toggle("active");  

});

}

/* ======================
Authentication
====================== */

onAuthStateChanged(auth,async(user)=>{

if(!user){  

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

    }  

    else{  

        vendorLink.innerHTML="🏪 Become a Vendor";  

        vendorLink.href="vendor-signup.html";  

    }  

}  

catch(error){  

    console.log(error);  

}

});

/* ======================
Profile Dropdown
====================== */

if(accountBtn && profileDropdown){

accountBtn.addEventListener("click",(e)=>{  

    if(accountBtn.getAttribute("href")==="account.html") return;  

    e.preventDefault();  

    profileDropdown.classList.toggle("show");  

});  

document.addEventListener("click",(e)=>{  

    if(  

        !profileDropdown.contains(e.target)  

        &&  

        !accountBtn.contains(e.target)  

    ){  

        profileDropdown.classList.remove("show");  

    }  

});

}

/* ======================
Logout
====================== */

if(logoutBtn){

logoutBtn.addEventListener("click",async(e)=>{  

    e.preventDefault();  

    try{  

        await signOut(auth);  

        alert("Logout Successful");  

        window.location.reload();  

    }  

    catch(error){  

        alert(error.message);  

    }  

});

}

/* ======================
Load Products
====================== */
async function loadProducts(){

if(!productContainer) return;  

productContainer.innerHTML="<h3>Loading...</h3>";  

allProducts=[];  

try{  

    const snapshot=await getDocs(collection(db,"products"));  

    if(snapshot.empty){  

        productContainer.innerHTML="<h3>No Products Found</h3>";  

        return;  

    }  

    snapshot.forEach((productDoc)=>{  

        allProducts.push({  

            id:productDoc.id,  

            ...productDoc.data()  

        });  

    });  

    filterProducts();  

}  

catch(error){  

    console.error(error);  

    productContainer.innerHTML=`

<h3 style="color:red;">  Error Loading Products

</h3>  <p>${error.message}</p>  `;

}

}

loadProducts();

/* ======================
Smart Search Engine
====================== */

function calculateSearchScore(product, keyword){

keyword = keyword.toLowerCase().trim();  

let score = 0;  

const name =  
(product.name || "").toLowerCase();  

const category =  
(product.category || "").toLowerCase();  

const shop =  
(product.shopName || "").toLowerCase();  

const description =  
(product.description || "").toLowerCase();  

/* Exact Product Name */  

if(name === keyword) score += 100;  

/* Starts With */  

if(name.startsWith(keyword)) score += 80;  

/* Product Name */  

if(name.includes(keyword)) score += 60;  

/* Category */  

if(category.includes(keyword)) score += 50;  

/* Shop */  

if(shop.includes(keyword)) score += 40;  

/* Description */  

if(description.includes(keyword)) score += 20;  

return score;

}
/* ======================
Filter Products
====================== */

function filterProducts(){

    let products = [...allProducts];

    const keyword = (searchInput?.value || "").trim().toLowerCase();

    const category = categoryFilter?.value || "all";

    const sort = sortFilter?.value || "default";

    /* ---------- SMART SEARCH ---------- */

    if(keyword){

        products = products
        .map(product=>({

            ...product,

            score: calculateSearchScore(product, keyword)

        }))
        .filter(product => product.score > 0)
        .sort((a,b)=>b.score-a.score);

    }

    /* ---------- CATEGORY ---------- */

    if(category !== "all"){

        products = products.filter(product=>

            (product.category || "").toLowerCase() ===

            category.toLowerCase()

        );

    }

    /* ---------- SORT ---------- */

    if(sort === "low"){

        products.sort((a,b)=>a.price-b.price);

    }

    else if(sort === "high"){

        products.sort((a,b)=>b.price-a.price);

    }

    else if(sort === "latest"){

        products.sort((a,b)=>{

            if(!a.createdAt || !b.createdAt) return 0;

            return b.createdAt.seconds - a.createdAt.seconds;

        });

    }

    renderProducts(products);

}

/* ======================
Render Products
====================== */

function renderProducts(products){

    productContainer.innerHTML = "";

    if(products.length === 0){

        productContainer.innerHTML = `

<h3>No Products Found</h3>

<p>Try searching another product.</p>

`;

        return;

    }

    products.forEach(product=>{

        productContainer.innerHTML += `

<div class="card"

onclick="window.location.href='product.html?id=${product.id}'">

<img
src="${product.image}"
alt="${product.name}">

<h3>${product.name}</h3>

<p>${product.description || "No Description Available"}</p>

<p>⏱ ${product.preparationTime || 10} mins</p>

<h4>₹${product.price}</h4>

<button

class="add-cart"

onclick="event.stopPropagation();"

data-id="${product.id}"

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

}
/* ======================
Search Events
====================== */

searchInput?.addEventListener(

"input",

filterProducts

);

categoryFilter?.addEventListener(

"change",

filterProducts

);

sortFilter?.addEventListener(

"change",

filterProducts

);
/* ======================
Add To Cart
====================== */

document.addEventListener("click", async (e)=>{

if(!e.target.classList.contains("add-cart")) return;  

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

});

/* ======================
Future Ready Functions
====================== */

window.reloadProducts = async ()=>{

await loadProducts();

};

window.refreshProducts = ()=>{

filterProducts();

};

window.searchProducts = (text)=>{

if(searchInput){  

    searchInput.value=text;  

    filterProducts();  

}

};

window.filterCategory = (category)=>{

if(categoryFilter){  

    categoryFilter.value=category;  

    filterProducts();  

}

};

/* ======================
End Of File
====================== */
