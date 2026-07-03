/*
====================================
Brew Haven
Cart System
Version 2.0
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

/* ========= ELEMENTS ========= */

const cartContainer = document.getElementById("cartContainer");
const emptyCart = document.getElementById("emptyCart");
const loginRequired = document.getElementById("loginRequired");

const totalItems = document.getElementById("totalItems");
const subtotal = document.getElementById("subtotal");
const delivery = document.getElementById("delivery");
const grandTotal = document.getElementById("grandTotal");
const checkoutBtn = document.getElementById("checkoutBtn");

/* ========= VARIABLES ========= */

let currentUser = null;
let cartData = null;
const DELIVERY_CHARGE = 40;

/* ========= LOGIN ========= */

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        loginRequired.style.display="block";

        cartContainer.style.display="none";

        document.querySelector(".cart-summary").style.display="none";

        return;

    }

    currentUser=user;

    loginRequired.style.display="none";

    await loadCart();

});

/* ========= LOAD CART ========= */

async function loadCart(){

    try{

        const cartRef=doc(db,"carts",currentUser.uid);

        const cartSnap=await getDoc(cartRef);

        if(!cartSnap.exists()){

            emptyCart.style.display="block";

            cartContainer.innerHTML="";

            document.querySelector(".cart-summary").style.display="none";

            return;

        }

        cartData=cartSnap.data();

        renderCart();

    }

    catch(error){

        console.log(error);

        alert(error.message);

    }

}
/* ========= RENDER CART ========= */

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

    let itemCount=0;
    let total=0;

    items.forEach((item,index)=>{

        itemCount += item.quantity;

        total += item.price * item.quantity;

        cartContainer.innerHTML += `

<div class="cart-item">

    <img src="${item.image}" alt="${item.name}">

    <div class="item-details">

        <h3>${item.name}</h3>

        <p class="item-price">₹${item.price}</p>

        <p>⏱ Ready in ${item.preparationTime} mins</p>

        <div class="quantity-controls">

            <button onclick="decreaseQuantity(${index})">−</button>

            <span>${item.quantity}</span>

            <button onclick="increaseQuantity(${index})">+</button>

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

    grandTotal.textContent = `₹${total + DELIVERY_CHARGE}`;

}
/* ========= QUANTITY FUNCTIONS ========= */

async function increaseQuantity(index){

    const item = cartData.items[index];

    if(item.quantity >= item.stock){

        alert("Maximum stock reached.");

        return;

    }

    item.quantity++;

    await saveCart();

}

async function decreaseQuantity(index){

    const item = cartData.items[index];

    if(item.quantity <= 1){

        return;

    }

    item.quantity--;

    await saveCart();

}

/* ========= REMOVE ITEM ========= */

async function removeItem(index){

    const ok = confirm("Remove this product from cart?");

    if(!ok) return;

    cartData.items.splice(index,1);

    await saveCart();

}

/* ========= SAVE CART ========= */

async function saveCart(){

    try{

        const cartRef = doc(db,"carts",currentUser.uid);

        if(cartData.items.length===0){

            await updateDoc(cartRef,{

                items:[],

                updatedAt:serverTimestamp()

            });

            renderCart();

            return;

        }

        await updateDoc(cartRef,{

            items:cartData.items,

            updatedAt:serverTimestamp()

        });

        renderCart();

    }

    catch(error){

        console.log(error);

        alert(error.message);

    }

}

/* ========= WINDOW FUNCTIONS ========= */

window.increaseQuantity = increaseQuantity;

window.decreaseQuantity = decreaseQuantity;

window.removeItem = removeItem;
/* ========= ADD TO CART ENGINE ========= */

async function addToCart(product, quantity = 1){

    if(!auth.currentUser){

        window.location.href =
        `customer-login.html?redirect=cart&id=${product.productId}`;

        return;

    }

    const uid = auth.currentUser.uid;

    const cartRef = doc(db,"carts",uid);

    const cartSnap = await getDoc(cartRef);

    /* ---------- CREATE NEW CART ---------- */

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

    const cart = cartSnap.data();

    /* ---------- DIFFERENT VENDOR ---------- */

    if(cart.vendorId !== product.vendorId){

        const clear = confirm(

            "Your cart contains products from another café.\n\nClear cart and add this item?"

        );

        if(!clear) return;

        cart.vendorId = product.vendorId;

        cart.items = [];

    }

    /* ---------- SAME PRODUCT ---------- */

    const existing = cart.items.find(

        item => item.productId === product.productId

    );

    if(existing){

        if(existing.quantity + quantity > existing.stock){

            alert("Maximum stock reached.");

            return;

        }

        existing.quantity += quantity;

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

/* ========= CHECKOUT ========= */

checkoutBtn?.addEventListener("click",()=>{

    window.location.href="checkout.html";

});

/* ========= GLOBAL ========= */

window.addToCart = addToCart;
