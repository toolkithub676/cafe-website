document.addEventListener("DOMContentLoaded", () => {
    const orderBtn = document.querySelector(".hero button");

    if (orderBtn) {
        orderBtn.addEventListener("click", () => {
            alert("Welcome to Brew Haven Café! ☕");
        });
    }
});
