import { auth, db } from "../firebase.js";

import {
createUserWithEmailAndPassword,
updateProfile
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
doc,
setDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// ========================
// Elements
// ========================

const signupForm = document.getElementById("signupForm");

const name = document.getElementById("name");
const email = document.getElementById("email");
const phone = document.getElementById("phone");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const message = document.getElementById("message");

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const googleSignup = document.getElementById("googleSignup");

// ========================
// Show Password
// ========================

togglePassword.addEventListener("click",()=>{

if(password.type==="password"){

password.type="text";
togglePassword.innerHTML="🙈";

}else{

password.type="password";
togglePassword.innerHTML="👁️";

}

});

toggleConfirmPassword.addEventListener("click",()=>{

if(confirmPassword.type==="password"){

confirmPassword.type="text";
toggleConfirmPassword.innerHTML="🙈";

}else{

confirmPassword.type="password";
toggleConfirmPassword.innerHTML="👁️";

}

});

// ========================
// Signup
// ========================

signupForm.addEventListener("submit",async(e)=>{

e.preventDefault();

message.style.color="white";
message.innerHTML="Creating account...";

if(password.value!==confirmPassword.value){

message.style.color="red";
message.innerHTML="Passwords do not match.";

return;

}

try{

const userCredential=

await createUserWithEmailAndPassword(

auth,

email.value.trim(),

password.value

);

await updateProfile(userCredential.user,{

displayName:name.value.trim()

});

await setDoc(

doc(db,"customers",userCredential.user.uid),

{

uid:userCredential.user.uid,

name:name.value.trim(),

email:email.value.trim(),

phone:phone.value.trim(),

role:"customer",

createdAt:serverTimestamp()

}

);

message.style.color="lightgreen";
message.innerHTML="✅ Account Created Successfully";

setTimeout(()=>{

window.location.href="index.html";

},1000);

}catch(error){

message.style.color="red";
message.innerHTML=error.message;

}

});

// ========================
// Google Signup
// ========================

googleSignup.addEventListener("click",()=>{

alert("Google Signup Coming Soon");

});
