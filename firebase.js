import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6HkWGQzel3Ug3uSGnLzblxV4LeR3Zvgw",
  authDomain: "cafe-project-e2e61.firebaseapp.com",
  projectId: "cafe-project-e2e61",
  storageBucket: "cafe-project-e2e61.firebasestorage.app",
  messagingSenderId: "456837960906",
  appId: "1:456837960906:web:ef3444869e6dab223b5033",
  measurementId: "G-0LVN2TNF5Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
