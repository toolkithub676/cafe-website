import { db, auth } from "../firebase.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const form = document.getElementById("productForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

  e.preventDefault();

  if (!auth.currentUser) {
    alert("Please login first.");
    window.location.href = "vendor-login.html";
    return;
  }

  message.style.color = "green";
  message.innerHTML = "Uploading Image...";

  const file = document.getElementById("image").files[0];

  if (!file) {
    message.style.color = "red";
    message.innerHTML = "Please Select Image";
    return;
  }

  const data = new FormData();

  data.append("file", file);
  data.append("upload_preset", "brewhaven");

  try {

    const upload = await fetch(
      "https://api.cloudinary.com/v1_1/gggj105m/image/upload",
      {
        method: "POST",
        body: data
      }
    );

    const imageData = await upload.json();

    if (!imageData.secure_url) {
      throw new Error(imageData.error?.message || "Image upload failed");
    }

    const product = {

      name: document.getElementById("name").value.trim(),

      description: document.getElementById("description").value.trim(),

      price: Number(document.getElementById("price").value),

      category: document.getElementById("category").value,

      image: imageData.secure_url,

      vendorId: auth.currentUser.uid,

      vendorEmail: auth.currentUser.email,

      createdAt: new Date().toISOString()

    };

    await addDoc(collection(db, "products"), product);

    message.style.color = "green";
    message.innerHTML = "✅ Product Added Successfully";

    form.reset();

  } catch (error) {

    console.error(error);

    alert(error.message);

    message.style.color = "red";
    message.innerHTML = "❌ Failed";

  }

});
