/*
====================================
Brew Haven
Cart System
Version 1.0
====================================
*/

import { db, auth } from "../firebase.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ==========================
        ELEMENTS
========================== */

const cartContainer = document.getElementById("cartContainer");
const emptyCart = document.getElementById("emptyCart");
const loginRequired = document.getElementById("loginRequired");

const totalItems = document.getElementById("totalItems");
const subtotal = document.getElementById("subtotal");
const delivery = document.getElementById("delivery");
const grandTotal = document.getElementById("grandTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

/* ==========================
        VARIABLES
========================== */

let currentUser = null;

let cartData = null;

let DELIVERY_CHARGE = 40;

/* ==========================
        LOGIN
========================== */

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        loginRequired.style.display="block";

        document.querySelector(".cart-summary").style.display="none";

        return;

    }

    currentUser = user;

    loadCart();

});

/* ==========================
        LOAD CART
========================== */

async function loadCart(){

    try{

        const cartRef = doc(db,"carts",currentUser.uid);

        const cartSnap = await getDoc(cartRef);

        if(!cartSnap.exists()){

            cartContainer.style.display="none";

            emptyCart.style.display="block";

            document.querySelector(".cart-summary").style.display="none";

            return;

        }

        cartData = cartSnap.data();

        renderCart();

    }

    catch(error){

        console.log(error);

        alert(error.message);

    }

}

/* ==========================
      RENDER CART
========================== */

function renderCart(){

    cartContainer.innerHTML="";

    let items = cartData.items || [];

    if(items.length===0){

        emptyCart.style.display="block";

        document.querySelector(".cart-summary").style.display="none";

        return;

    }

    emptyCart.style.display="none";

    document.querySelector(".cart-summary").style.display="block";

    let itemCount=0;

    let total=0;

    items.forEach((item,index)=>{

        itemCount+=item.quantity;

        total+=item.price*item.quantity;

        cartContainer.innerHTML+=`

<div class="cart-item">

<img src="${item.image}">

<div class="item-details">

<h3>${item.name}</h3>

<p>₹${item.price}</p>

<p>⏱ ${item.preparationTime} mins</

window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeItem = removeItem;
/* ==========================
    INCREASE QUANTITY
========================== */

async function increaseQuantity(index){

    const item = cartData.items[index];

    if(item.quantity >= item.stock){

        alert("Maximum stock reached.");

        return;

    }

    item.quantity++;

    await saveCart();

}

/* ==========================
    DECREASE QUANTITY
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

    if(!confirm("Remove this product from cart?")){

        return;

    }

    cartData.items.splice(index,1);

    await saveCart();

}

/* ==========================
      SAVE CART
========================== */

async function saveCart(){

    try{

        await updateDoc(

            doc(db,"carts",currentUser.uid),

            {

                items:cartData.items,

                updatedAt:serverTimestamp()

            }

        );

        renderCart();

    }

    catch(error){

        console.log(error);

        alert(error.message);

    }

}

/* ==========================
  EXPORT FUNCTIONS
========================== */

window.increaseQuantity = increaseQuantity;

window.decreaseQuantity = decreaseQuantity;

window.removeItem = removeItem;
/* ==========================
      ADD TO CART ENGINE
========================== */

export async function addToCart(product, quantity = 1){

    if(!auth.currentUser){

        window.location.href =
        `customer-login.html?redirect=cart&id=${product.productId || ""}`;

        return;
    }

    const uid = auth.currentUser.uid;

    const cartRef = doc(db,"carts",uid);

    const cartSnap = await getDoc(cartRef);

    /* ---------- NEW CART ---------- */

    if(!cartSnap.exists()){

        await setDoc(cartRef,{

            vendorId:product.vendorId,

            items:[{

                productId:product.productId,

                name:product.name,

                image:product.image,

                price:product.price,

                quantity:quantity,

                stock:product.stock,

                preparationTime:product.preparationTime

            }],

            updatedAt:serverTimestamp()

        });

        alert("✅ Product Added To Cart");

        return;

    }

    /* ---------- EXISTING CART ---------- */

    const cart = cartSnap.data();

    /* ---------- DIFFERENT VENDOR ---------- */

    if(cart.vendorId !== product.vendorId){

        const clear = confirm(
        "Your cart contains items from another café.\n\nClear cart and add this product?");

        if(!clear) return;

        cart.vendorId = product.vendorId;

        cart.items = [];

    }

    /* ---------- SAME PRODUCT ---------- */

    const index = cart.items.findIndex(

        item => item.productId === product.productId

    );

    if(index >= 0){

        if(

            cart.items[index].quantity + quantity >

            cart.items[index].stock

        ){

            alert("Stock limit reached.");

            return;

        }

        cart.items[index].quantity += quantity;

    }

    else{

        cart.items.push({

            productId:product.productId,

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

    alert("✅ Product Added To Cart");

}

/* ==========================
      CHECKOUT
========================== */

checkoutBtn?.addEventListener("click",()=>{

    window.location.href="checkout.html";

});
