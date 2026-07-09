/*
====================================
Brew Haven
Checkout System V3
PART 1 / 4
====================================
*/

import { db, auth } from "../firebase.js";

import {
doc,
getDoc,
updateDoc,
addDoc,
collection,
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

const totalItems =
document.getElementById("totalItems");

const subtotal =
document.getElementById("subtotal");

const deliveryCharge =
document.getElementById("deliveryCharge");

const grandTotal =
document.getElementById("grandTotal");

const placeOrderBtn =
document.getElementById("placeOrderBtn");

const loadingOverlay =
document.getElementById("loadingOverlay");

const toast =
document.getElementById("toast");

/* ==========================
      CUSTOMER DETAILS
========================== */

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

let cartData = null;

let total = 0;

const DELIVERY = 40;

/* ==========================
      AUTH STATE
========================== */

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href="customer-login.html";

return;

}

currentUser = user;

await loadCheckout();

});

/* ==========================
      LOADING
========================== */

function showLoading(){

loadingOverlay.style.display="flex";

}

function hideLoading(){

loadingOverlay.style.display="none";

}

/* ==========================
      TOAST
========================== */

function showToast(message){

toast.innerHTML = message;

toast.classList.add("show");

setTimeout(()=>{

toast.classList.remove("show");

},2500);

}

/* ==========================
      LOAD CART
========================== */

async function loadCheckout(){

showLoading();

try{

const cartRef = doc(

db,

"carts",

currentUser.uid

);

const cartSnap =

await getDoc(cartRef);

if(!cartSnap.exists()){

checkoutItems.innerHTML=

"<h3>Your cart is empty.</h3>";

placeOrderBtn.disabled=true;

hideLoading();

return;

}

cartData = cartSnap.data();

renderCheckout();

}

catch(error){

console.error(error);

alert(error.message);

}

hideLoading();

}
/* ==========================
      RENDER CHECKOUT
========================== */

function renderCheckout(){

checkoutItems.innerHTML = "";

const items = cartData.items || [];

if(items.length===0){

checkoutItems.innerHTML =

"<h3>Your cart is empty.</h3>";

placeOrderBtn.disabled = true;

return;

}

let itemCount = 0;

total = 0;

items.forEach(item=>{

itemCount += item.quantity;

total += item.price * item.quantity;

checkoutItems.innerHTML += `

<div class="checkout-item">

<img
src="${item.image}"
alt="${item.name}">

<div class="checkout-item-info">

<h4>

${item.name}

</h4>

<p>

Qty : ${item.quantity}

</p>

<p>

₹${item.price}

</p>

<p>

⏱ ${item.preparationTime} mins

</p>

</div>

</div>

`;

});

totalItems.textContent = itemCount;

subtotal.textContent = `₹${total}`;

deliveryCharge.textContent = `₹${DELIVERY}`;

grandTotal.textContent =

`₹${total + DELIVERY}`;

}

/* ==========================
      VALIDATE FORM
========================== */

function validateForm(){

if(

!customerName.value.trim() ||

!customerPhone.value.trim() ||

!customerEmail.value.trim() ||

!customerAddress.value.trim() ||

!customerCity.value.trim() ||

!customerPincode.value.trim()

){

showToast(

"Please fill all details."

);

return false;

}

if(customerPhone.value.length < 10){

showToast(

"Enter valid phone number."

);

return false;

}

if(customerPincode.value.length < 6){

showToast(

"Enter valid pincode."

);

return false;

}

return true;

}
/* ==========================
      PLACE ORDER
========================== */

placeOrderBtn?.addEventListener(

"click",

async()=>{

if(!validateForm()) return;

const items = cartData.items || [];

if(items.length===0){

showToast("Your cart is empty.");

return;

}

showLoading();

try{

await addDoc(

collection(db,"orders"),

{

customerId:currentUser.uid,

customerName:customerName.value.trim(),

customerPhone:customerPhone.value.trim(),

customerEmail:customerEmail.value.trim(),

customerAddress:customerAddress.value.trim(),

customerCity:customerCity.value.trim(),

customerPincode:customerPincode.value.trim(),

paymentMethod:paymentMethod.value,

vendorId:cartData.vendorId,

products:items,

totalItems:items.reduce(

(sum,item)=>sum+item.quantity,

0

),

subtotal:total,

deliveryCharge:DELIVERY,

grandTotal:total+DELIVERY,

status:"Pending",

createdAt:serverTimestamp()

}

);

/* ---------- CLEAR CART ---------- */

const cartRef = doc(

db,

"carts",

currentUser.uid

);

await updateDoc(cartRef,{

vendorId:null,

items:[],

updatedAt:serverTimestamp()

});

hideLoading();

showToast("🎉 Order Placed Successfully");

setTimeout(()=>{

window.location.href="index.html";

},1500);

}

catch(error){

hideLoading();

console.error(error);

alert(error.message);

}

});
/* ==========================
      RELOAD CHECKOUT
========================== */

window.reloadCheckout = async()=>{

    if(currentUser){

        await loadCheckout();

    }

};

/* ==========================
      ORDER SUMMARY HELPERS
========================== */

window.getCheckoutItems = ()=>{

    return cartData?.items || [];

};

window.getSubtotal = ()=>{

    return total;

};

window.getGrandTotal = ()=>{

    return total + DELIVERY;

};

/* ==========================
      PAYMENT STATUS
========================== */

window.getPaymentMethod = ()=>{

    return paymentMethod.value;

};

/* ==========================
      CUSTOMER DETAILS
========================== */

window.getCustomerDetails = ()=>{

    return {

        name:customerName.value.trim(),

        phone:customerPhone.value.trim(),

        email:customerEmail.value.trim(),

        address:customerAddress.value.trim(),

        city:customerCity.value.trim(),

        pincode:customerPincode.value.trim(),

        paymentMethod:paymentMethod.value

    };

};

/* ==========================
      RESET FORM
========================== */

function resetForm(){

customerName.value="";

customerPhone.value="";

customerEmail.value="";

customerAddress.value="";

customerCity.value="";

customerPincode.value="";

paymentMethod.value="COD";

}

/* ==========================
      SUCCESS HANDLER
========================== */

window.checkoutSuccess = ()=>{

    resetForm();

    showToast("🎉 Order Placed Successfully");

};

/* ==========================
      END OF FILE
========================== */
