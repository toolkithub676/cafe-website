const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", function(e){

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(email==="admin@brewhaven.com" && password==="123456"){

        alert("Login Successful");

    }else{

        message.innerHTML="Invalid Email or Password";

    }

});
