/*
====================================
Brew Haven
My Orders JS V4
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

currentUser=user;

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

toast.textContent=message;

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

const q=query(

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

const snapshot=

await getDocs(q);

orders=[];

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

ordersContainer.innerHTML="";

if(orders.length===0){

emptyOrders.style.display="block";

ordersContainer.innerHTML="";

return;

}

emptyOrders.style.display="none";

orders.forEach(order=>{

const status=(order.status || "Pending").toLowerCase();

const orderDate=

order.createdAt?.toDate

? order.createdAt.toDate().toLocaleString()

: "Just Now";

let productsHTML="";

(order.products || []).forEach(product=>{

productsHTML+=`

<div class="order-product">

<span class="product-name">

• ${product.name}

</span>

<span class="product-qty">

×${product.quantity}

</span>

</div>

`;

});

ordersContainer.innerHTML+=`

<div class="order-card">

<div class="order-header">

<div>

<div class="order-id">

📦 Order #${order.id.slice(0,8)}

</div>

<div class="order-date">

${orderDate}

</div>

</div>

<span class="status ${status}">

${order.status || "Pending"}

</span>

</div>

<div class="order-products">

${productsHTML}

</div>

<div class="order-footer">

<div class="order-total">

₹${order.grandTotal}

</div>

${status==="pending"

?

`<button
class="cancel-order"
onclick="cancelOrder('${order.id}')">

❌ Cancel

</button>`

:

""

}

</div>

</div>

`;

});

}
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

(order.status || "").toLowerCase() !== "pending"

){

showToast(

"Only pending orders can be cancelled."

);

return;

}

const ok = confirm(

"Are you sure you want to cancel this order?"

);

if(!ok) return;

showLoading();

try{

const {

doc,

updateDoc

} = await import(

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"

);

await updateDoc(

doc(db,"orders",orderId),

{

status:"Cancelled"

}

);

showToast("Order Cancelled");

await loadOrders();

}

catch(error){

console.error(error);

alert(error.message);

}

hideLoading();

};

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

window.getLatestOrder = ()=>{

return orders.length ? orders[0] : null;

};

window.getOrderCount = ()=>{

return orders.length;

};
/* ==========================
      PAGE VISIBILITY
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
      PAGE FOCUS
========================== */

window.addEventListener(

"focus",

async()=>{

if(currentUser){

await loadOrders();

}

});

/* ==========================
      GLOBAL FUNCTIONS
========================== */

window.showToast = showToast;

window.loadOrders = loadOrders;

window.refreshOrders = async()=>{

if(currentUser){

await loadOrders();

showToast("Orders Refreshed");

}

};

/* ==========================
      STATUS CHECK
========================== */

window.isPending = (status)=>{

return (status || "").toLowerCase() === "pending";

};

/* ==========================
      PAGE READY
========================== */

window.addEventListener(

"load",

()=>{

console.log(

"My Orders V4 Loaded Successfully"

);

});

/* ==========================
      END OF FILE
========================== */
