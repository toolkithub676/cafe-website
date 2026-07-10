/*
====================================
Brew Haven
Vendor Orders JS V1
PART 1 / 5
====================================
*/

import { db, auth } from "../firebase.js";

import {
collection,
query,
where,
orderBy,
getDocs,
doc,
updateDoc
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
      AUTH CHECK
========================== */

onAuthStateChanged(auth,async(user)=>{

if(!user){

window.location.href="vendor-login.html";

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

toast.textContent = message;

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

"vendorId",

"==",

currentUser.uid

),

orderBy(

"createdAt",

"desc"

)

);

const snapshot = await getDocs(q);

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

let actionButtons="";

switch(status){

case "pending":

actionButtons=`

<button

class="accept-btn"

onclick="updateStatus('${order.id}','Accepted')">

✅ Accept

</button>

<button

class="reject-btn"

onclick="updateStatus('${order.id}','Cancelled')">

❌ Reject

</button>

`;

break;

case "accepted":

actionButtons=`

<button

class="prepare-btn"

onclick="updateStatus('${order.id}','Preparing')">

👨‍🍳 Preparing

</button>

`;

break;

case "preparing":

actionButtons=`

<button

class="ready-btn"

onclick="updateStatus('${order.id}','Ready')">

🍽 Ready

</button>

`;

break;

case "ready":

actionButtons=`

<button

class="deliver-btn"

onclick="updateStatus('${order.id}','Delivered')">

🚚 Delivered

</button>

`;

break;

default:

actionButtons="";

}

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

<div class="customer-details">

<b>${order.customerName}</b><br>

📞 ${order.customerPhone}<br>

📍 ${order.customerAddress},

${order.customerCity}

-

${order.customerPincode}<br>

💳 ${order.paymentMethod}

</div>

<div class="order-products">

${productsHTML}

</div>

<div class="order-footer">

<div class="order-total">

₹${order.grandTotal}

</div>

<div class="order-actions">

${actionButtons}

</div>

</div>

</div>

`;

});

}
/* ==========================
      UPDATE STATUS
========================== */

window.updateStatus = async(

orderId,

newStatus

)=>{

const order = orders.find(

item=>item.id===orderId

);

if(!order){

showToast(

"Order not found."

);

return;

}

const ok = confirm(

`Change order status to "${newStatus}"?`

);

if(!ok) return;

showLoading();

try{

const orderRef = doc(

db,

"orders",

orderId

);

await updateDoc(

orderRef,

{

status:newStatus

}

);

showToast(

`Order ${newStatus}`

);

/* ---------- UPDATE LOCAL ---------- */

const index = orders.findIndex(

item=>item.id===orderId

);

if(index!==-1){

orders[index].status=newStatus;

}

/* ---------- RELOAD ---------- */

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

window.reloadVendorOrders = async()=>{

if(currentUser){

await loadOrders();

showToast(

"Orders Updated"

);

}

};
/* ==========================
      HELPER FUNCTIONS
========================== */

window.getOrders = ()=>{

return orders;

};

window.getOrderCount = ()=>{

return orders.length;

};

window.getPendingOrders = ()=>{

return orders.filter(

order=>

(order.status || "").toLowerCase()==="pending"

);

};

window.getAcceptedOrders = ()=>{

return orders.filter(

order=>

(order.status || "").toLowerCase()==="accepted"

);

};

window.getPreparingOrders = ()=>{

return orders.filter(

order=>

(order.status || "").toLowerCase()==="preparing"

);

};

window.getReadyOrders = ()=>{

return orders.filter(

order=>

(order.status || "").toLowerCase()==="ready"

);

};

window.getDeliveredOrders = ()=>{

return orders.filter(

order=>

(order.status || "").toLowerCase()==="delivered"

);

};

window.getCancelledOrders = ()=>{

return orders.filter(

order=>

(order.status || "").toLowerCase()==="cancelled"

);

};

/* ==========================
      LATEST ORDER
========================== */

window.getLatestOrder = ()=>{

if(orders.length===0){

return null;

}

return orders[0];

};

/* ==========================
      STATUS CHECK
========================== */

window.isPending = status =>

(status || "").toLowerCase()==="pending";

window.isAccepted = status =>

(status || "").toLowerCase()==="accepted";

window.isPreparing = status =>

(status || "").toLowerCase()==="preparing";

window.isReady = status =>

(status || "").toLowerCase()==="ready";

window.isDelivered = status =>

(status || "").toLowerCase()==="delivered";

window.isCancelled = status =>

(status || "").toLowerCase()==="cancelled";

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
      WINDOW FOCUS
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

window.refreshVendorOrders = async()=>{

if(currentUser){

await loadOrders();

showToast(

"Orders Refreshed"

);

}

};

/* ==========================
      DASHBOARD COUNTS
========================== */

window.getDashboardCounts = ()=>{

return{

total:orders.length,

pending:orders.filter(

o=>(o.status||"").toLowerCase()==="pending"

).length,

accepted:orders.filter(

o=>(o.status||"").toLowerCase()==="accepted"

).length,

preparing:orders.filter(

o=>(o.status||"").toLowerCase()==="preparing"

).length,

ready:orders.filter(

o=>(o.status||"").toLowerCase()==="ready"

).length,

delivered:orders.filter(

o=>(o.status||"").toLowerCase()==="delivered"

).length,

cancelled:orders.filter(

o=>(o.status||"").toLowerCase()==="cancelled"

).length

};

};

/* ==========================
      PAGE READY
========================== */

window.addEventListener(

"load",

()=>{

console.log(

"Vendor Orders V1 Loaded Successfully"

);

});

/* ==========================
      END OF FILE
========================== */
