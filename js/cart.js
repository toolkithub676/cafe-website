/*
====================================
Brew Haven
Cart System V3
PART 1 / 4
====================================
*/

import { db, auth } from "../firebase.js";

import {
doc,
getDoc,
setDoc,
updateDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ==========================
        ELEMENTS
========================== */

const cartContainer =
document.getElementById("cartContainer");

const emptyCart =
document.getElementById("emptyCart");

const loginRequired =
document.getElementById("loginRequired");

const loadingOverlay =
document.getElementById("loadingOverlay");

const toast =
document.getElementById("toast");

const totalItems =
document.getElementById("totalItems");

const subtotal =
document.getElementById("subtotal");

const delivery =
document.getElementById("delivery");

const grandTotal =
document.getElementById("grandTotal");

const checkoutBtn =
document.getElementById("checkoutBtn");

/* ==========================
        VARIABLES
========================== */

let currentUser = null;

let cartData = {

vendorId:null,

items:[]

};

const DELIVERY_CHARGE = 40;

/* ==========================
      AUTH STATE
========================== */

onAuthStateChanged(auth,async(user)=>{

if(!user){

loginRequired.style.display="block";

emptyCart.style.display="none";

cartContainer.innerHTML="";

document.querySelector(".cart-summary").style.display="none";

return;

}

currentUser=user;

loginRequired.style.display="none";

await loadCart();

});

/* ==========================
      LOADING
========================== */

function showLoading(){

if(loadingOverlay){

loadingOverlay.style.display="flex";

}

}

function hideLoading(){

if(loadingOverlay){

loadingOverlay.style.display="none";

}

}

/* ==========================
      TOAST
========================== */

function showToast(message){

if(!toast) return;

toast.innerHTML=message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}

/* ==========================
      LOAD CART
========================== */

async function loadCart(){

showLoading();

try{

const cartRef=doc(

db,

"carts",

currentUser.uid

);

const cartSnap=

await getDoc(cartRef);

if(!cartSnap.exists()){

cartData={

vendorId:null,

items:[]

};

renderCart();

hideLoading();

return;

}

cartData=cartSnap.data();

renderCart();

}

catch(error){

console.error(error);

alert(error.message);

}

hideLoading();

}
/* ==========================
      RENDER CART
========================== */

function renderCart(){

cartContainer.innerHTML="";

const items = cartData.items || [];

if(items.length===0){

emptyCart.style.display="block";

cartContainer.innerHTML="";

document.querySelector(".cart-summary").style.display="none";

return;

}

emptyCart.style.display="none";

document.querySelector(".cart-summary").style.display="block";

let itemCount = 0;

let total = 0;

items.forEach((item,index)=>{

itemCount += item.quantity;

total += item.price * item.quantity;

cartContainer.innerHTML += `

<div class="cart-item">

<img
src="${item.image}"
alt="${item.name}">

<div class="item-details">

<h3>

${item.name}

</h3>

<p class="item-price">

₹${item.price}

</p>

<p>

⏱ Ready in ${item.preparationTime} mins

</p>

<div class="quantity-controls">

<button
onclick="decreaseQuantity(${index})">

−

</button>

<span>

${item.quantity}

</span>

<button
onclick="increaseQuantity(${index})">

+

</button>

</div>

<button

class="remove-btn"

onclick="removeItem(${index})">

🗑 Remove

</button>

</div>

</div>

`;

});

totalItems.textContent = itemCount;

subtotal.textContent = `₹${total}`;

delivery.textContent = `₹${DELIVERY_CHARGE}`;

grandTotal.textContent =

`₹${total + DELIVERY_CHARGE}`;

}

/* ==========================
      QUANTITY +
========================== */

async function increaseQuantity(index){

const item = cartData.items[index];

if(item.quantity >= item.stock){

showToast("Maximum stock reached");

return;

}

item.quantity++;

await saveCart();

}

/* ==========================
      QUANTITY -
========================== */

async function decreaseQuantity(index){

const item = cartData.items[index];

if(item.quantity <= 1){

return;

}

item.quantity--;

await saveCart();

}
/* ==========================
      REMOVE ITEM
========================== */

async function removeItem(index){

const ok = confirm(

"Remove this product from cart?"

);

if(!ok) return;

cartData.items.splice(index,1);

await saveCart();

}

/* ==========================
      SAVE CART
========================== */

async function saveCart(){

showLoading();

try{

const cartRef = doc(

db,

"carts",

currentUser.uid

);

if(cartData.items.length===0){

await updateDoc(cartRef,{

vendorId:null,

items:[],

updatedAt:serverTimestamp()

});

renderCart();

hideLoading();

showToast("Cart Updated");

return;

}

await updateDoc(cartRef,{

vendorId:cartData.vendorId,

items:cartData.items,

updatedAt:serverTimestamp()

});

renderCart();

showToast("Cart Updated");

}

catch(error){

console.error(error);

alert(error.message);

}

hideLoading();

}

/* ==========================
      ADD TO CART ENGINE
========================== */

async function addToCart(product,quantity=1){

if(!auth.currentUser){

window.location.href=

`customer-login.html?redirect=cart&id=${product.productId}`;

return;

}

const uid = auth.currentUser.uid;

const cartRef = doc(

db,

"carts",

uid

);

const cartSnap =

await getDoc(cartRef);

/* ---------- NEW CART ---------- */

if(!cartSnap.exists()){

await setDoc(cartRef,{

vendorId:product.vendorId,

items:[{

productId:product.productId,

vendorId:product.vendorId,

shopName:product.shopName,

category:product.category,

name:product.name,

image:product.image,

price:product.price,

quantity:quantity,

stock:product.stock,

preparationTime:product.preparationTime

}],

updatedAt:serverTimestamp()

});

showToast("Product Added");

return;

}

const cart = cartSnap.data();

/* ---------- SINGLE VENDOR ---------- */

if(cart.vendorId!==product.vendorId){

const clear = confirm(

"Your cart contains products from another café.\n\nClear cart and add this item?"

);

if(!clear) return;

cart.vendorId = product.vendorId;

cart.items = [];

}

const existing = cart.items.find(

item=>item.productId===product.productId

);

if(existing){

if(existing.quantity+quantity>existing.stock){

showToast("Maximum stock reached");

return;

}

existing.quantity += quantity;

}

else{

cart.items.push({

productId:product.productId,

vendorId:product.vendorId,

shopName:product.shopName,

category:product.category,

name:product.name,

image:product.image,

price:product.price,

quantity:quantity,

stock:product.stock,

preparationTime:product.preparationTime

});

}
        await updateDoc(cartRef,{

        vendorId:cart.vendorId,

        items:cart.items,

        updatedAt:serverTimestamp()

    });

    showToast("✅ Product Added To Cart");

}

/* ==========================
      CHECKOUT
========================== */

checkoutBtn?.addEventListener("click",()=>{

    if(!cartData.items || cartData.items.length===0){

        showToast("Your cart is empty");

        return;

    }

    window.location.href="checkout.html";

});

/* ==========================
      GLOBAL FUNCTIONS
========================== */

window.increaseQuantity = increaseQuantity;

window.decreaseQuantity = decreaseQuantity;

window.removeItem = removeItem;

window.addToCart = addToCart;

/* ==========================
      RELOAD CART
========================== */

window.reloadCart = async()=>{

    if(currentUser){

        await loadCart();

    }

};

/* ==========================
      CLEAR CART
========================== */

window.clearCart = async()=>{

    if(!currentUser) return;

    cartData = {

        vendorId:null,

        items:[]

    };

    await saveCart();

};

/* ==========================
      CART COUNT
========================== */

window.getCartCount = ()=>{

    if(!cartData.items) return 0;

    return cartData.items.reduce(

        (total,item)=>total+item.quantity,

        0

    );

};

/* ==========================
      CART TOTAL
========================== */

window.getCartTotal = ()=>{

    if(!cartData.items) return 0;

    return cartData.items.reduce(

        (total,item)=>

            total + (item.price * item.quantity),

        0

    );

};

/* ==========================
      END OF FILE
========================== */
