async function loadProducts() {
    alert("DB Connected");

    const snapshot = await getDocs(collection(db, "products"));

    alert("Products: " + snapshot.size);
}
