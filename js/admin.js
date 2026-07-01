const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "admin@brewhaven.com" && password === "123456") {
        window.location.assign("./dashboard.html");
    } else {
        message.textContent = "Invalid Email or Password";
    }
});
