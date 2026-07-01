const form = document.getElementById("productForm");
const message = document.getElementById("message");

form.addEventListener("submit", function(e){
    e.preventDefault();

    message.textContent = "✅ Product Saved Successfully!";
});
