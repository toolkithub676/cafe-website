/*
====================================
Brew Haven
My Orders JS V3
PART 1 / 4
====================================
*/

import { db, auth } from "../firebase.js";

import {
collection,
query,
where,
orderBy,
getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/* ==========================
        ELEMENTS
========================== */

const ordersContainer =
document.getElementById("ordersContainer");

const emptyOrders =
document.getElementById("emptyOrders");

const loadingOverlay =
document.getElementById("loadingOverlay");

const toast =
document.getElementById("toast");

/* ==========================
        VARIABLES
========================== */

let currentUser = null;

let orders = [];

/* ==========================
      AUTH STATE
========================== */

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href="customer-login.html";

return;

}

currentUser = user;

await loadOrders();

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
      LOAD ORDERS
========================== */

async function loadOrders(){

showLoading();

try{

const q = query(

collection(db,"orders"),

where(

"customerId",

"==",

currentUser.uid

),

orderBy(

"createdAt",

"desc"

)

);

const snapshot =

await getDocs(q);

orders = [];

snapshot.forEach(doc=>{

orders.push({

id:doc.id,

...doc.data()

});

});

renderOrders();

}

catch(error){

console.error(error);

alert(error.message);

}

hideLoading();

}
/* ==========================
      RENDER ORDERS
========================== */

function renderOrders(){

ordersContainer.innerHTML = "";

if(orders.length===0){

emptyOrders.style.display="block";

ordersContainer.innerHTML="";

return;

}

emptyOrders.style.display="none";

orders.forEach(order=>{

const status =

(order.status || "Pending")

.toLowerCase();

const orderDate =

order.createdAt?.toDate

? order.createdAt.toDate().toLocaleString()

: "Just Now";

ordersContainer.innerHTML += `

<div class="order-card">

<div class="order-header">

<div class="order-id">

<h3>

Order #${order.id.slice(0,8)}

</h3>

<p>

${orderDate}

</p>

</div>

<div>

<span

class="status ${status}">

${order.status || "Pending"}

</span>

</div>

</div>

<div

class="order-products"

id="products-${order.id}">

</div>

<div class="order-total">

<span>

Grand Total

</span>

<b>

₹${order.grandTotal}

</b>

</div>

</div>

`;

const productContainer =

document.getElementById(

`products-${order.id}`

);

(order.products || []).forEach(item=>{

productContainer.innerHTML += `

<div class="order-product">

<img

src="${item.image}"

alt="${item.name}">

<div class="product-info">

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

});

}
/* ==========================
      STATUS HELPERS
========================== */

function getStatusColor(status){

switch((status || "").toLowerCase()){

case "pending":
return "#FFC107";

case "accepted":
return "#2196F3";

case "preparing":
return "#FF9800";

case "ready":
return "#4CAF50";

case "delivered":
return "#2E7D32";

case "cancelled":
return "#E53935";

default:
return "#777";

}

}

function getStatusMessage(status){

switch((status || "").toLowerCase()){

case "pending":
return "Your order is waiting for café confirmation.";

case "accepted":
return "Your order has been accepted.";

case "preparing":
return "Your food is being prepared.";

case "ready":
return "Your order is ready.";

case "delivered":
return "Order delivered successfully.";

case "cancelled":
return "Order has been cancelled.";

default:
return "";

}

}

/* ==========================
      AUTO REFRESH
========================== */

setInterval(async()=>{

if(currentUser){

await loadOrders();

}

},30000);

/* ==========================
      RELOAD
========================== */

window.reloadOrders = async()=>{

if(currentUser){

await loadOrders();

showToast("Orders Updated");

}

};

/* ==========================
      HELPERS
========================== */

window.getOrders = ()=>{

return orders;

};

window.getOrderCount = ()=>{

return orders.length;

};

window.getLatestOrder = ()=>{

if(orders.length===0){

return null;

}

return orders[0];

};
/* ==========================
      CANCEL ORDER
========================== */

window.cancelOrder = async(orderId)=>{

const order = orders.find(

item=>item.id===orderId

);

if(!order){

showToast("Order not found.");

return;

}

if(

(order.status || "").toLowerCase()!=="pending"

){

showToast(

"Only pending orders can be cancelled."

);

return;

}

const ok = confirm(

"Cancel this order?"

);

if(!ok) return;

try{

const { doc, updateDoc } = await import(

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"

);

await updateDoc(

doc(db,"orders",orderId),

{

status:"Cancelled"

}

);

showToast(

"Order Cancelled"

);

await loadOrders();

}

catch(error){

console.error(error);

alert(error.message);

}

};

/* ==========================
      GLOBAL FUNCTIONS
========================== */

window.showToast = showToast;

window.loadOrders = loadOrders;

/* ==========================
      PAGE READY
========================== */

document.addEventListener(

"visibilitychange",

async()=>{

if(

!document.hidden &&

currentUser

){

await loadOrders();

}

});

/* ==========================
      END OF FILE
========================== */
