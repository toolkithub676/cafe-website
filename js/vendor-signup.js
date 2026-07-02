import { auth, db } from "../firebase.js";

import {
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
doc,
setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form = document.getElementById("signupForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

e.preventDefault();

const name = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value;

try {

const userCredential = await createUserWithEmailAndPassword(
auth,
email,
password
);

await setDoc(doc(db, "vendors", userCredential.user.uid), {

name: name,
email: email,
createdAt: new Date().toISOString()

});

message.style.color = "green";
message.innerHTML = "✅ Vendor Account Created Successfully";

form.reset();

} catch (error) {

message.style.color = "red";
message.innerHTML = error.message;

}

});
