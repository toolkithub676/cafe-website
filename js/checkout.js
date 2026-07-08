/*
====================================
Brew Haven
Checkout JS
Version 1.0
Part 2
====================================
*/

import { db, auth } from "../firebase.js";

import {
collection,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ==========================
        ELEMENTS
========================== */

const checkoutItems =
document.getElementById("checkoutItems");

const subtotal =
document.getElementById("subtotal");

const deliveryCharge =
document.getElementById("deliveryCharge");

const grandTotal =
document.getElementById("grandTotal");

const placeOrderBtn =
document.getElementById("placeOrderBtn");

const customerName =
document.getElementById("customerName");

const customerPhone =
document.getElementById("customerPhone");

const customerEmail =
document.getElementById("customerEmail");

const customerAddress =
document.getElementById("customerAddress");

const customerCity =
document.getElementById("customerCity");

const customerPincode =
document.getElementById("customerPincode");

const paymentMethod =
document.getElementById("paymentMethod");

/* ==========================
        VARIABLES
========================== */

let currentUser = null;

let cart = [];

let total = 0;

const DELIVERY = 40;

/* ==========================
      AUTH CHECK
========================== */

onAuthStateChanged(auth,(user)=>{

    if(!user){

        window.location.href="customer-login.html";

        return;

    }

    currentUser = user;

    loadCart();

});

/* ==========================
      LOAD CART
========================== */

function loadCart(){

    cart = JSON.parse(

        localStorage.getItem("cart") || "[]"

    );

    renderCart();

}

/* ==========================
      RENDER CART
========================== */

function renderCart(){

    checkoutItems.innerHTML = "";

    total = 0;

    if(cart.length===0){

        checkoutItems.innerHTML =

        "<p>Your cart is empty.</p>";

        placeOrderBtn.disabled = true;

        return;

    }

    cart.forEach(item=>{

        total += item.price * item.quantity;

        checkoutItems.innerHTML += `

<div class="checkout-item">

<img src="${item.image}" alt="${item.name}">

<div class="checkout-item-info">

<h4>${item.name}</h4>

<p>

Qty : ${item.quantity}

</p>

<p>

₹${item.price}

</p>

</div>

</div>

`;

    });

    subtotal.innerHTML = `₹${total}`;

    deliveryCharge.innerHTML = `₹${DELIVERY}`;

    grandTotal.innerHTML =

    `₹${total + DELIVERY}`;

}

/* ==========================
      PLACE ORDER
========================== */

placeOrderBtn.addEventListener(

"click",

async()=>{

if(

!customerName.value ||

!customerPhone.value ||

!customerEmail.value ||

!customerAddress.value ||

!customerCity.value ||

!customerPincode.value

){

alert("Please fill all details.");

return;

}

try{

await addDoc(

collection(db,"orders"),

{

customerId:currentUser.uid,

customerName:customerName.value,

customerPhone:customerPhone.value,

customerEmail:customerEmail.value,

customerAddress:customerAddress.value,

customerCity:customerCity.value,

customerPincode:customerPincode.value,

paymentMethod:paymentMethod.value,

products:cart,

subtotal:total,

deliveryCharge:DELIVERY,

grandTotal:total+DELIVERY,

status:"Pending",

createdAt:serverTimestamp()

}

);

localStorage.removeItem("cart");

alert("🎉 Order Placed Successfully");

window.location.href="index.html";

}

catch(error){

console.log(error);

alert(error.message);

}

}

);
