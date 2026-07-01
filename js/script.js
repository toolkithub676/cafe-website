import { db } from "../firebase.js";

document.getElementById("productContainer").innerHTML = `
<div class="card">
  <img src="https://picsum.photos/300/200">
  <h3>Working</h3>
  <p>JavaScript is loading.</p>
  <h4>₹100</h4>
</div>
`;

console.log(db);
